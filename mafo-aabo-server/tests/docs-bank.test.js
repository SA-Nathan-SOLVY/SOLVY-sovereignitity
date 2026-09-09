/**
 * MAFO AABO Trust™ — document vault + NFCU bank ledger tests (vitest + supertest).
 *
 * Covers:
 *   - upload/download round-trip (AES-256-GCM decrypts to identical bytes, sha256 matches)
 *   - category + mime enforcement
 *   - beneficiary receipt scoping (can't see trustee docs, receipt on own request only)
 *   - bank entries + running balance
 *   - reconcile match / mismatch / duplicate-match rejection / unreconcile
 *   - drift math in the ledger summary
 *   - audit rows per mutation
 *
 * Shares the mafo_aabo_test database with mafo.test.js (fileParallelism: false).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://solvy:devpass@localhost:5432/mafo_aabo_test';
process.env.SESSION_SECRET = 'test-secret';
process.env.DOC_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mafo-test-uploads-'));

const { default: app } = await import('../server.js');
const { default: pool, initSchema } = await import('../db.js');

const CODES = { trustee: 'test-trustee-code', grantor: 'test-grantor-code', beneficiary: 'test-beneficiary-code' };
const INITIAL = 22500000;

// A tiny valid PDF
const PDF_BYTES = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n', 'utf8'
);

async function login(role) {
  const agent = request.agent(app);
  const res = await agent.post('/api/mafo/auth/login').send({ role, code: CODES[role] });
  expect(res.status).toBe(200);
  return agent;
}

let benId, trusteeDocId, paidRequestId, otherRequestId;

beforeAll(async () => {
  await initSchema();
  await pool.query(`TRUNCATE audit_log, documents, bank_transactions, loan_repayments,
                    loans, requests, users, trust_settings RESTART IDENTITY CASCADE`);
  for (const [role, fullName] of [
    ['trustee', 'Sean Marlon II McDaniel'],
    ['grantor', 'Sheila Ann McDaniel'],
    ['beneficiary', 'Sean Maurice Mayo (MAFO AABO)'],
  ]) {
    await pool.query(
      'INSERT INTO users (role, full_name, access_code_hash) VALUES ($1, $2, $3)',
      [role, fullName, await bcrypt.hash(CODES[role], 4)]
    );
  }
  benId = (await pool.query(`SELECT id FROM users WHERE role = 'beneficiary'`)).rows[0].id;
  await pool.query(
    'INSERT INTO trust_settings (id, initial_funding_cents, effective_date) VALUES (1, $1, $2)',
    [INITIAL, '2026-07-01']
  );

  // A paid request from the beneficiary (submit → approve → pay)
  const ben = await login('beneficiary');
  const tru = await login('trustee');
  const created = await ben.post('/api/mafo/requests').send({
    vendor: 'Houston Neurology Associates', amount_cents: 45000,
    category: 'Medical/Dental', method: 'ach', description: 'Consult',
  });
  paidRequestId = created.body.request.id;
  await tru.post(`/api/mafo/requests/${paidRequestId}/approve`).send({ note: 'ok' });
  await tru.post(`/api/mafo/requests/${paidRequestId}/pay`)
    .send({ payment_ref: 'ACH-1', paid_at: '2026-08-01' });

  // A request owned by someone else (inserted directly — the API only lets
  // the beneficiary create requests, and there is one beneficiary)
  const trusteeId = (await pool.query(`SELECT id FROM users WHERE role = 'trustee'`)).rows[0].id;
  otherRequestId = (await pool.query(
    `INSERT INTO requests (requested_by, vendor, amount_cents, category, method, status)
     VALUES ($1, 'Other Person Vendor', 9900, 'Other', 'ach', 'paid') RETURNING id`,
    [trusteeId]
  )).rows[0].id;
});

afterAll(async () => {
  await pool.end();
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

describe('document vault', () => {
  it('trustee uploads a PDF — stored encrypted, sha256 recorded, audited', async () => {
    const tru = await login('trustee');
    const res = await tru.post('/api/mafo/documents')
      .attach('file', PDF_BYTES, { filename: 'ma-snt-a.pdf', contentType: 'application/pdf' })
      .field('category', 'trust_document')
      .field('label', 'Executed trust instrument');
    expect(res.status).toBe(201);
    const doc = res.body.document;
    trusteeDocId = doc.id;
    expect(doc.sha256).toBe(crypto.createHash('sha256').update(PDF_BYTES).digest('hex'));
    expect(doc.size_bytes).toBe(PDF_BYTES.length);

    // On-disk blob is NOT the plaintext (iv||tag||ciphertext)
    const stored = (await pool.query('SELECT storage_path FROM documents WHERE id = $1', [doc.id])).rows[0];
    const blob = fs.readFileSync(stored.storage_path);
    expect(blob.subarray(28).equals(PDF_BYTES)).toBe(false);
    expect(blob.length).toBe(PDF_BYTES.length + 28); // 12-byte IV + 16-byte GCM tag
    // stored under UPLOAD_DIR — outside the web root (solvy-platform/mafo-aabo)
    expect(stored.storage_path.startsWith(path.resolve(process.env.UPLOAD_DIR))).toBe(true);
    expect(stored.storage_path.includes('solvy-platform')).toBe(false);
  });

  it('download round-trips to identical bytes with correct Content-Type', async () => {
    const tru = await login('trustee');
    const res = await tru.get(`/api/mafo/documents/${trusteeDocId}/file`).buffer(true)
      .parse((r, cb) => { const chunks = []; r.on('data', c => chunks.push(c)); r.on('end', () => cb(null, Buffer.concat(chunks))); });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(Buffer.compare(res.body, PDF_BYTES)).toBe(0);
  });

  it('rejects disallowed mime types and categories', async () => {
    const tru = await login('trustee');
    const badMime = await tru.post('/api/mafo/documents')
      .attach('file', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' })
      .field('category', 'other');
    expect(badMime.status).toBe(400);
    const badCat = await tru.post('/api/mafo/documents')
      .attach('file', PDF_BYTES, { filename: 'x.pdf', contentType: 'application/pdf' })
      .field('category', 'secrets');
    expect(badCat.status).toBe(400);
  });

  it('beneficiary cannot upload non-receipt categories', async () => {
    const ben = await login('beneficiary');
    const res = await ben.post('/api/mafo/documents')
      .attach('file', PDF_BYTES, { filename: 'x.pdf', contentType: 'application/pdf' })
      .field('category', 'trust_document');
    expect(res.status).toBe(403);
  });

  it('beneficiary uploads a receipt to their own paid request', async () => {
    const ben = await login('beneficiary');
    const res = await ben.post('/api/mafo/documents')
      .attach('file', PDF_BYTES, { filename: 'receipt.pdf', contentType: 'application/pdf' })
      .field('category', 'receipt')
      .field('request_id', String(paidRequestId))
      .field('label', 'Neurology receipt');
    expect(res.status).toBe(201);
    expect(res.body.document.request_id).toBe(paidRequestId);
  });

  it("beneficiary cannot attach a receipt to someone else's request", async () => {
    const ben = await login('beneficiary');
    const res = await ben.post('/api/mafo/documents')
      .attach('file', PDF_BYTES, { filename: 'receipt.pdf', contentType: 'application/pdf' })
      .field('category', 'receipt')
      .field('request_id', String(otherRequestId));
    expect(res.status).toBe(403);
  });

  it('beneficiary sees only own receipts; cannot download trustee documents', async () => {
    const ben = await login('beneficiary');
    const list = await ben.get('/api/mafo/documents');
    expect(list.status).toBe(200);
    expect(list.body.documents.length).toBe(1);
    expect(list.body.documents[0].category).toBe('receipt');

    const dl = await ben.get(`/api/mafo/documents/${trusteeDocId}/file`);
    expect(dl.status).toBe(403);
  });

  it('grantor sees all documents but cannot upload or delete', async () => {
    const gra = await login('grantor');
    const list = await gra.get('/api/mafo/documents');
    expect(list.status).toBe(200);
    expect(list.body.documents.length).toBe(2);

    const del = await gra.delete(`/api/mafo/documents/${trusteeDocId}`);
    expect(del.status).toBe(403);
  });

  it('trustee deletes a document (audited, file removed)', async () => {
    const tru = await login('trustee');
    const pathRow = (await pool.query('SELECT storage_path FROM documents WHERE id = $1', [trusteeDocId])).rows[0];
    const res = await tru.delete(`/api/mafo/documents/${trusteeDocId}`);
    expect(res.status).toBe(200);
    expect(fs.existsSync(pathRow.storage_path)).toBe(false);
  });
});

describe('NFCU bank ledger', () => {
  it('trustee records entries; running balance computed in SQL', async () => {
    const tru = await login('trustee');
    const dep = await tru.post('/api/mafo/bank-transactions').send({
      posted_on: '2026-07-01', description: 'Initial VCF funding deposit', amount_cents: INITIAL,
    });
    expect(dep.status).toBe(201);
    const wd = await tru.post('/api/mafo/bank-transactions').send({
      posted_on: '2026-08-01', description: 'ACH to Houston Neurology Associates', amount_cents: -45000,
    });
    expect(wd.status).toBe(201);

    const list = await tru.get('/api/mafo/bank-transactions');
    expect(list.status).toBe(200);
    const txns = list.body.transactions; // DESC by posted_on
    expect(txns.length).toBe(2);
    const withdrawal = txns.find(t => t.amount_cents === -45000);
    const deposit = txns.find(t => t.amount_cents === INITIAL);
    expect(Number(deposit.running_balance_cents)).toBe(INITIAL);
    expect(Number(withdrawal.running_balance_cents)).toBe(INITIAL - 45000);
  });

  it('rejects zero / non-integer amounts and missing fields', async () => {
    const tru = await login('trustee');
    expect((await tru.post('/api/mafo/bank-transactions')
      .send({ posted_on: '2026-08-01', description: 'x', amount_cents: 0 })).status).toBe(400);
    expect((await tru.post('/api/mafo/bank-transactions')
      .send({ posted_on: '2026-08-01', description: 'x', amount_cents: 10.5 })).status).toBe(400);
    expect((await tru.post('/api/mafo/bank-transactions')
      .send({ description: 'x', amount_cents: 100 })).status).toBe(400);
  });

  it('beneficiary and grantor write access denied; grantor read allowed', async () => {
    const ben = await login('beneficiary');
    const gra = await login('grantor');
    expect((await ben.get('/api/mafo/bank-transactions')).status).toBe(403);
    expect((await gra.post('/api/mafo/bank-transactions')
      .send({ posted_on: '2026-08-01', description: 'x', amount_cents: 100 })).status).toBe(403);
    expect((await gra.get('/api/mafo/bank-transactions')).status).toBe(200);
    expect((await gra.get('/api/mafo/bank-transactions/export.csv')).status).toBe(200);
  });

  it('reconcile: match, duplicate-match rejection, mismatch flag, unreconcile', async () => {
    const tru = await login('trustee');
    const txns = (await tru.get('/api/mafo/bank-transactions')).body.transactions;
    const withdrawal = txns.find(t => t.amount_cents === -45000);

    // clean match
    const rec = await tru.post(`/api/mafo/bank-transactions/${withdrawal.id}/reconcile`)
      .send({ request_id: paidRequestId });
    expect(rec.status).toBe(200);
    expect(rec.body.amount_mismatch).toBe(false);
    expect(rec.body.transaction.reconciled).toBe(true);

    // already reconciled
    expect((await tru.post(`/api/mafo/bank-transactions/${withdrawal.id}/reconcile`)
      .send({ request_id: paidRequestId })).status).toBe(409);

    // mismatch: a withdrawal whose |amount| != request amount still reconciles, flagged
    const wd2 = await tru.post('/api/mafo/bank-transactions').send({
      posted_on: '2026-08-02', description: 'Partial payment', amount_cents: -44000,
    });
    const rec2 = await tru.post(`/api/mafo/bank-transactions/${wd2.body.transaction.id}/reconcile`)
      .send({ request_id: otherRequestId }); // paid, 9900 cents
    expect(rec2.status).toBe(200);
    expect(rec2.body.amount_mismatch).toBe(true);

    // duplicate match: same request, different bank transaction → 409
    const wd3 = await tru.post('/api/mafo/bank-transactions').send({
      posted_on: '2026-08-03', description: 'Duplicate attempt', amount_cents: -9900,
    });
    expect((await tru.post(`/api/mafo/bank-transactions/${wd3.body.transaction.id}/reconcile`)
      .send({ request_id: otherRequestId })).status).toBe(409);

    // cannot reconcile a deposit
    const dep = txns.find(t => t.amount_cents === INITIAL);
    expect((await tru.post(`/api/mafo/bank-transactions/${dep.id}/reconcile`)
      .send({ request_id: paidRequestId })).status).toBe(400);

    // unreconcile the clean match
    const un = await tru.post(`/api/mafo/bank-transactions/${withdrawal.id}/unreconcile`);
    expect(un.status).toBe(200);
    expect(un.body.transaction.reconciled).toBe(false);
    expect(un.body.transaction.matched_request_id).toBeNull();
    // unreconciling again → 409
    expect((await tru.post(`/api/mafo/bank-transactions/${withdrawal.id}/unreconcile`)).status).toBe(409);
  });

  it('ledger summary exposes bank balance, unmatched counts and drift', async () => {
    const tru = await login('trustee');
    const s = (await tru.get('/api/mafo/ledger/summary')).body.summary;

    // Bank: +22,500,000 − 45,000 − 44,000 − 9,900 = 22,401,100
    expect(s.bank_balance_cents).toBe(INITIAL - 45000 - 44000 - 9900);
    // Books: initial − paid requests (45,000 + 9,900) − 0 loans
    expect(s.trust_balance_cents).toBe(INITIAL - 45000 - 9900);
    expect(s.drift_cents).toBe(s.bank_balance_cents - s.trust_balance_cents);
    // unreconciled withdrawals: the −45,000 (unmatched again) and −9,900; −44,000 is reconciled
    expect(s.unreconciled_withdrawals).toBe(2);
    // paid requests with no bank match: request 1 (45,000) after unreconcile
    expect(s.paid_requests_unmatched).toBe(1);

    // beneficiary gets no bank fields
    const ben = await login('beneficiary');
    const bs = (await ben.get('/api/mafo/ledger/summary')).body.summary;
    expect(bs.bank_balance_cents).toBeUndefined();
    expect(bs.drift_cents).toBeUndefined();
  });
});

describe('audit rows for new mutations', () => {
  it('document + bank actions are all in the audit trail', async () => {
    const tru = await login('trustee');
    const actions = (await tru.get('/api/mafo/audit')).body.audit.map(a => a.action);
    for (const a of [
      'document.uploaded', 'document.downloaded', 'document.deleted',
      'bank.entry', 'bank.reconciled', 'bank.unreconciled',
    ]) {
      expect(actions).toContain(a);
    }
    // mismatch detail is recorded
    const rec = (await tru.get('/api/mafo/audit')).body.audit
      .find(a => a.action === 'bank.reconciled' && a.detail?.amount_mismatch === true);
    expect(rec).toBeTruthy();
  });
});
