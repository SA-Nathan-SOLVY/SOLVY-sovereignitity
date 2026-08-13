import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { initDatabase } from '../index';
import {
  app,
  pool,
  ROSTER_EMAIL,
  OUTSIDER_EMAIL,
  addRosterMember,
  createOpenProposal,
  cleanupTestData,
  verifiedAgent,
} from './helpers';

// Exercises the trust-critical governance + data-pool enforcement in
// server/index.ts: verification gating (401), roster eligibility (403),
// one-vote-per-member, and masked vote history.

let proposalId: number;

beforeAll(async () => {
  await initDatabase();
  await cleanupTestData();
  await addRosterMember(ROSTER_EMAIL);
  proposalId = await createOpenProposal();
});

afterAll(async () => {
  await cleanupTestData();
  await pool.end();
});

describe('verification gating (401 when unverified)', () => {
  it('POST /api/governance/proposals/:id/vote requires a verified member', async () => {
    const res = await supertest(app)
      .post(`/api/governance/proposals/${proposalId}/vote`)
      .send({ choice: 'yes' });
    expect(res.status).toBe(401);
  });

  it('GET /api/data-pools/my-optins requires a verified member', async () => {
    const res = await supertest(app).get('/api/data-pools/my-optins');
    expect(res.status).toBe(401);
  });

  it('POST /api/data-pools/optin requires a verified member', async () => {
    const res = await supertest(app)
      .post('/api/data-pools/optin')
      .send({ poolId: 'spending-patterns' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/data-pools/optin requires a verified member', async () => {
    const res = await supertest(app)
      .delete('/api/data-pools/optin')
      .send({ poolId: 'spending-patterns' });
    expect(res.status).toBe(401);
  });
});

describe('roster eligibility (403 for verified non-members)', () => {
  it('rejects a verified email that is not on any member roster', async () => {
    const agent = await verifiedAgent(OUTSIDER_EMAIL);
    const res = await agent
      .post(`/api/governance/proposals/${proposalId}/vote`)
      .send({ choice: 'yes' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/member roster|only members/i);
  });
});

describe('one-vote-per-member enforcement', () => {
  it('voting twice updates the single vote row instead of duplicating it', async () => {
    const agent = await verifiedAgent(ROSTER_EMAIL);

    const first = await agent
      .post(`/api/governance/proposals/${proposalId}/vote`)
      .send({ choice: 'yes' });
    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);

    const second = await agent
      .post(`/api/governance/proposals/${proposalId}/vote`)
      .send({ choice: 'no' });
    expect(second.status).toBe(200);

    // Exactly one row exists for this member/proposal, and it holds the latest choice.
    const rows = await pool.query(
      `SELECT choice FROM data_use_votes WHERE proposal_id = $1 AND LOWER(voter_email) = $2`,
      [proposalId, ROSTER_EMAIL]
    );
    expect(rows.rowCount).toBe(1);
    expect(rows.rows[0].choice).toBe('no');
  });
});

describe('vote history masking', () => {
  it('masks the voter email in GET /api/governance/proposals/:id/votes', async () => {
    const agent = await verifiedAgent(ROSTER_EMAIL);
    await agent.post(`/api/governance/proposals/${proposalId}/vote`).send({ choice: 'yes' });

    const res = await supertest(app).get(`/api/governance/proposals/${proposalId}/votes`);
    expect(res.status).toBe(200);
    const voters: string[] = res.body.votes.map((v: any) => v.voter);

    // voter@vitest.test -> v***r@vitest.test, and the raw address is never exposed.
    expect(voters).toContain('v***r@vitest.test');
    expect(voters).not.toContain(ROSTER_EMAIL);
    expect(JSON.stringify(res.body)).not.toContain(ROSTER_EMAIL);
  });
});
