/**
 * MAFO AABO Trust™ — API test suite (vitest + supertest).
 *
 * Runs against a dedicated test database (mafo_aabo_test). Covers:
 *   - auth rejection of bad codes
 *   - role enforcement per the spec §5 matrix
 *   - the full replenishment request lifecycle (submit → approve → pay)
 *   - loan ratio / trust balance math in the ledger summary
 *   - audit_log entries written per mutation
 *
 * Run: npm test   (requires the local Docker Postgres: solvy-pg)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://solvy:devpass@localhost:5432/mafo_aabo_test';
process.env.SESSION_SECRET = 'test-secret';

const { default: app } = await import('../server.js');
const { default: pool, initSchema } = await import('../db.js');

const CODES = { trustee: 'test-trustee-code', grantor: 'test-grantor-code', beneficiary: 'test-beneficiary-code' };
const INITIAL = 22500000; // $225,000.00 in cents

async function login(role) {
  const agent = request.agent(app);
  const res = await agent.post('/api/mafo/auth/login').send({ role, code: CODES[role] });
  expect(res.status).toBe(200);
  return agent;
}

beforeAll(async () => {
  await initSchema();
  await pool.query('TRUNCATE audit_log, loan_repayments, loans, requests, users, trust_settings RESTART IDENTITY CASCADE');
  for (const [role, fullName] of [
    ['trustee', 'Sean Marlon II McDaniel'],
    ['grantor', 'Sheila Ann McDaniel'],
    ['beneficiary', 'Sean Maurice Mayo (MAFO AABO)'],
  ]) {
    await pool.query(
      'INSERT INTO users (role, full_name, access_code_hash) VALUES ($1, $2, $3)',
      [role, fullName, await bcrypt.hash(CODES[role], 4)] // low rounds for test speed
    );
  }
  await pool.query(
    'INSERT INTO trust_settings (id, initial_funding_cents, effective_date) VALUES (1, $1, $2)',
    [INITIAL, '2026-07-01']
  );
});

afterAll(async () => {
  await pool.end();
});

describe('auth', () => {
  it('rejects a bad access code with 401', async () => {
    const res = await request(app).post('/api/mafo/auth/login')
      .send({ role: 'beneficiary', code: 'not-the-code' });
    expect(res.status).toBe(401);
  });

  it('rejects a valid code under the wrong role with 401', async () => {
    const res = await request(app).post('/api/mafo/auth/login')
      .send({ role: 'trustee', code: CODES.beneficiary });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/mafo/auth/login').send({ role: 'trustee' });
    expect(res.status).toBe(400);
  });

  it('returns user + permissions from /auth/me after login', async () => {
    const agent = await login('grantor');
    const res = await agent.get('/api/mafo/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('grantor');
    expect(res.body.user.permissions).toMatchObject({ canApprove: false, viewLoans: true, viewLoanRatios: true });
  });

  it('returns 401 for /auth/me without a session', async () => {
    const res = await request(app).get('/api/mafo/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('role enforcement (spec §5 matrix)', () => {
  it('beneficiary cannot approve requests (403)', async () => {
    const ben = await login('beneficiary');
    const res = await ben.post('/api/mafo/requests/1/approve').send({ note: 'self-approve' });
    expect(res.status).toBe(403);
  });

  it('trustee cannot submit replenishment requests (403)', async () => {
    const tru = await login('trustee');
    const res = await tru.post('/api/mafo/requests')
      .send({ vendor: 'X', amount_cents: 100, category: 'Other', method: 'ach' });
    expect(res.status).toBe(403);
  });

  it('beneficiary cannot view loans or audit (403)', async () => {
    const ben = await login('beneficiary');
    expect((await ben.get('/api/mafo/loans')).status).toBe(403);
    expect((await ben.get('/api/mafo/audit')).status).toBe(403);
  });

  it('grantor is read-only: can view loans/ledger, cannot approve or audit', async () => {
    const gra = await login('grantor');
    expect((await gra.get('/api/mafo/loans')).status).toBe(200);
    expect((await gra.get('/api/mafo/ledger/summary')).status).toBe(200);
    expect((await gra.post('/api/mafo/requests/1/approve').send({ note: 'x' })).status).toBe(403);
    expect((await gra.get('/api/mafo/audit')).status).toBe(403);
  });

  it('beneficiary sees only their own requests', async () => {
    const ben = await login('beneficiary');
    const res = await ben.get('/api/mafo/requests');
    expect(res.status).toBe(200);
    for (const r of res.body.requests) {
      expect(r.requested_by_name).toBe('Sean Maurice Mayo (MAFO AABO)');
    }
  });
});

describe('replenishment request lifecycle', () => {
  it('submit → approve → pay, with validation along the way', async () => {
    const ben = await login('beneficiary');
    const tru = await login('trustee');

    // submit
    const created = await ben.post('/api/mafo/requests').send({
      vendor: 'Houston Neurology Associates',
      amount_cents: 45000,
      category: 'replenishment',
      method: 'ach',
      description: 'Specialist consultation not covered by VA benefits',
    });
    expect(created.status).toBe(201);
    const id = created.body.request.id;
    expect(created.body.request.status).toBe('pending');

    // reject requires a note
    expect((await tru.post(`/api/mafo/requests/${id}/reject`).send({})).status).toBe(400);

    // pay before approve is a state conflict
    expect((await tru.post(`/api/mafo/requests/${id}/pay`).send({ payment_ref: 'X' })).status).toBe(409);

    // approve
    const approved = await tru.post(`/api/mafo/requests/${id}/approve`)
      .send({ note: 'Approved — medical necessity' });
    expect(approved.status).toBe(200);
    expect(approved.body.request.status).toBe('approved');

    // double-approve is a state conflict
    expect((await tru.post(`/api/mafo/requests/${id}/approve`).send({ note: 'again' })).status).toBe(409);

    // pay
    const paid = await tru.post(`/api/mafo/requests/${id}/pay`)
      .send({ payment_ref: 'ACH-2026-0001', paid_at: '2026-08-05' });
    expect(paid.status).toBe(200);
    expect(paid.body.request.status).toBe('paid');
    expect(paid.body.request.payment_ref).toBe('ACH-2026-0001');
  });

  it('rejects non-integer or non-positive amounts', async () => {
    const ben = await login('beneficiary');
    expect((await ben.post('/api/mafo/requests')
      .send({ vendor: 'X', amount_cents: 10.5, category: 'Other', method: 'ach' })).status).toBe(400);
    expect((await ben.post('/api/mafo/requests')
      .send({ vendor: 'X', amount_cents: -100, category: 'Other', method: 'ach' })).status).toBe(400);
  });
});

describe('ledger summary math', () => {
  it('computes trust balance and loan ratio per spec §4', async () => {
    const tru = await login('trustee');

    // $1,000 loan @ 5.00% (500 bp), then a $250 repayment
    const loan = await tru.post('/api/mafo/loans').send({
      borrower: 'Evergreen Beauty Lounge', amount_cents: 100000, rate_bp: 500, term_months: 24, purpose: 'Salon equipment',
    });
    expect(loan.status).toBe(201);
    const loanId = loan.body.loan.id;
    expect(loan.body.loan.status).toBe('active');

    const rep = await tru.post(`/api/mafo/loans/${loanId}/repayments`).send({ amount_cents: 25000 });
    expect(rep.status).toBe(200);
    expect(rep.body.loan.outstanding_cents).toBe(75000);

    const res = await tru.get('/api/mafo/ledger/summary');
    const s = res.body.summary;
    // From lifecycle test: one paid request of 45,000 cents
    // balance = 22,500,000 − 45,000 − 100,000 + 25,000 = 22,380,000
    expect(s.paid_cents).toBe(45000);
    expect(s.active_loan_principal_cents).toBe(100000);
    expect(s.repayments_cents).toBe(25000);
    expect(s.trust_balance_cents).toBe(INITIAL - 45000 - 100000 + 25000);
    expect(s.loan_ratio).toBeCloseTo(100000 / INITIAL, 10);
  });

  it('hides loan figures from the beneficiary but shows their own totals', async () => {
    const ben = await login('beneficiary');
    const s = (await ben.get('/api/mafo/ledger/summary')).body.summary;
    expect(s.loan_ratio).toBeUndefined();
    expect(s.active_loan_principal_cents).toBeUndefined();
    expect(s.my_paid_cents).toBe(45000);
    expect(s.trust_balance_cents).toBe(INITIAL - 45000 - 100000 + 25000);
  });

  it('marks a fully repaid loan as repaid', async () => {
    const tru = await login('trustee');
    const res = await tru.post('/api/mafo/loans/1/repayments').send({ amount_cents: 75000 });
    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('repaid');
    expect(res.body.loan.outstanding_cents).toBe(0);
    // over-repayment is rejected
    expect((await tru.post('/api/mafo/loans/1/repayments').send({ amount_cents: 1 })).status).toBe(409);
  });
});

describe('audit trail', () => {
  it('writes an audit_log row for every mutation', async () => {
    const tru = await login('trustee');
    const res = await tru.get('/api/mafo/audit');
    expect(res.status).toBe(200);
    const actions = res.body.audit.map(a => `${a.action}:${a.entity}`);

    expect(actions).toContain('request.submitted:request:1');
    expect(actions).toContain('request.approved:request:1');
    expect(actions).toContain('request.paid:request:1');
    expect(actions).toContain('loan.created:loan:1');
    expect(actions.filter(a => a.startsWith('loan.repayment:loan:1')).length).toBe(2);
    expect(actions.some(a => a.startsWith('auth.login:'))).toBe(true);
  });

  it('audit CSV export works for trustee', async () => {
    const tru = await login('trustee');
    const res = await tru.get('/api/mafo/audit/export.csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('request.submitted');
  });

  it('ledger CSV export respects beneficiary scoping', async () => {
    const ben = await login('beneficiary');
    const res = await ben.get('/api/mafo/ledger/export.csv');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Houston Neurology Associates');
    expect(res.text).toContain('45000');
  });
});
