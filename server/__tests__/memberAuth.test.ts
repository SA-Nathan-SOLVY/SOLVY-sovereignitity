import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { app, initDatabase, pool } from '../index';
import { cleanupTestData } from './helpers';

// Exercises the one-time email verification flow in server/memberAuth.ts:
// requesting a code, rejecting wrong codes, the max-attempt and TTL limits, and
// accepting the correct code. Each scenario uses its own cookie-bearing agent so
// the per-session pending state never leaks between cases.

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await cleanupTestData();
  await pool.end();
});

async function requestCode(agent: ReturnType<typeof supertest.agent>, email: string) {
  return agent.post('/api/member-auth/request-code').send({ email });
}

describe('POST /api/member-auth/request-code', () => {
  it('rejects an invalid email with 400', async () => {
    const agent = supertest.agent(app);
    const res = await requestCode(agent, 'not-an-email');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/i);
  });

  it('rejects a missing email with 400', async () => {
    const agent = supertest.agent(app);
    const res = await agent.post('/api/member-auth/request-code').send({});
    expect(res.status).toBe(400);
  });

  it('returns a six-digit code in dev for a valid email', async () => {
    const agent = supertest.agent(app);
    const res = await requestCode(agent, 'request@vitest.test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.devCode).toMatch(/^\d{6}$/);
  });
});

describe('POST /api/member-auth/verify-code', () => {
  it('returns 400 when no verification is in progress', async () => {
    const agent = supertest.agent(app);
    const res = await agent.post('/api/member-auth/verify-code').send({ code: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no verification/i);
  });

  it('rejects a wrong code with 400', async () => {
    const agent = supertest.agent(app);
    const requested = await requestCode(agent, 'wrong@vitest.test');
    const devCode: string = requested.body.devCode;
    const wrongCode = devCode === '000000' ? '111111' : '000000';

    const res = await agent.post('/api/member-auth/verify-code').send({ code: wrongCode });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  it('enforces the max-attempt limit (429 after 5 wrong tries)', async () => {
    const agent = supertest.agent(app);
    const requested = await requestCode(agent, 'attempts@vitest.test');
    const devCode: string = requested.body.devCode;
    const wrongCode = devCode === '000000' ? '111111' : '000000';

    // Attempts 1-5 are wrong codes and should each be rejected as incorrect.
    for (let i = 1; i <= 5; i++) {
      const res = await agent.post('/api/member-auth/verify-code').send({ code: wrongCode });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/incorrect/i);
    }

    // The 6th attempt crosses MAX_ATTEMPTS and is locked out with 429.
    const locked = await agent.post('/api/member-auth/verify-code').send({ code: wrongCode });
    expect(locked.status).toBe(429);
    expect(locked.body.error).toMatch(/too many/i);

    // Pending state is cleared, so even the correct code can no longer be used.
    const afterLock = await agent.post('/api/member-auth/verify-code').send({ code: devCode });
    expect(afterLock.status).toBe(400);
    expect(afterLock.body.error).toMatch(/no verification/i);
  });

  it('rejects an expired code (TTL) with 400', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(new Date('2026-06-09T12:00:00Z'));
      const agent = supertest.agent(app);
      const requested = await requestCode(agent, 'ttl@vitest.test');
      const devCode: string = requested.body.devCode;
      expect(devCode).toMatch(/^\d{6}$/);

      // Jump past the 10-minute code lifetime before verifying.
      vi.setSystemTime(new Date('2026-06-09T12:11:00Z'));
      const res = await agent.post('/api/member-auth/verify-code').send({ code: devCode });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/expired/i);
    } finally {
      vi.useRealTimers();
    }
  });

  it('accepts the correct code and establishes the verified identity', async () => {
    const agent = supertest.agent(app);
    const requested = await requestCode(agent, 'correct@vitest.test');
    const devCode: string = requested.body.devCode;

    const res = await agent.post('/api/member-auth/verify-code').send({ code: devCode });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.email).toBe('correct@vitest.test');

    // The session now reports the verified member.
    const me = await agent.get('/api/member-auth/me');
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('correct@vitest.test');
  });

  it('abandons a verified identity when a fresh code is requested', async () => {
    const agent = supertest.agent(app);
    const first = await requestCode(agent, 'reset@vitest.test');
    await agent.post('/api/member-auth/verify-code').send({ code: first.body.devCode });

    // Requesting a new code clears verifiedEmail until the new code is confirmed.
    await requestCode(agent, 'reset@vitest.test');
    const me = await agent.get('/api/member-auth/me');
    expect(me.body.email).toBeNull();
  });
});

describe('durable member records', () => {
  async function verify(email: string) {
    const agent = supertest.agent(app);
    const requested = await requestCode(agent, email);
    await agent.post('/api/member-auth/verify-code').send({ code: requested.body.devCode });
    return agent;
  }

  it('records a verified member with first/last verified timestamps', async () => {
    const email = 'durable@vitest.test';
    await verify(email);

    const row = await pool.query(
      'SELECT email, first_verified_at, last_verified_at FROM members WHERE email = $1',
      [email]
    );
    expect(row.rows).toHaveLength(1);
    expect(row.rows[0].email).toBe(email);
    expect(row.rows[0].first_verified_at).toBeTruthy();
    expect(row.rows[0].last_verified_at).toBeTruthy();
  });

  it('upserts rather than duplicates on a second verification, refreshing last_verified_at', async () => {
    const email = 'upsert@vitest.test';
    await verify(email);
    const after1 = await pool.query(
      'SELECT id, first_verified_at, last_verified_at FROM members WHERE email = $1',
      [email]
    );
    expect(after1.rows).toHaveLength(1);

    // Second verification (e.g. a new device) must reuse the same row.
    await verify(email);
    const after2 = await pool.query(
      'SELECT id, first_verified_at, last_verified_at FROM members WHERE email = $1',
      [email]
    );
    expect(after2.rows).toHaveLength(1);
    expect(after2.rows[0].id).toBe(after1.rows[0].id);
    // first_verified_at is preserved; last_verified_at advances (or stays equal).
    expect(new Date(after2.rows[0].first_verified_at).getTime()).toBe(
      new Date(after1.rows[0].first_verified_at).getTime()
    );
    expect(new Date(after2.rows[0].last_verified_at).getTime()).toBeGreaterThanOrEqual(
      new Date(after1.rows[0].last_verified_at).getTime()
    );
  });
});
