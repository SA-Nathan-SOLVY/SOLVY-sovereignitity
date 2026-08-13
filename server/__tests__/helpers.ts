import supertest from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import { expect } from 'vitest';
import { app, pool } from '../index';

// All test rows live under a dedicated email domain and proposal-title prefix so
// they can be created and torn down without touching real cooperative data.
export const TEST_DOMAIN = 'vitest.test';
export const ROSTER_EMAIL = `voter@${TEST_DOMAIN}`;
export const OUTSIDER_EMAIL = `outsider@${TEST_DOMAIN}`;
export const PROPOSAL_TITLE_PREFIX = 'VITEST ';

export { app, pool };

// Remove every row this test suite could have written. Safe to run repeatedly.
export async function cleanupTestData(): Promise<void> {
  await pool.query(`DELETE FROM data_use_votes WHERE LOWER(voter_email) LIKE $1`, [`%@${TEST_DOMAIN}`]);
  await pool.query(`DELETE FROM data_use_proposals WHERE title LIKE $1`, [`${PROPOSAL_TITLE_PREFIX}%`]);
  await pool.query(`DELETE FROM data_pool_optins WHERE LOWER(member_email) LIKE $1`, [`%@${TEST_DOMAIN}`]);
  await pool.query(`DELETE FROM founding_members WHERE LOWER(email) LIKE $1`, [`%@${TEST_DOMAIN}`]);
  await pool.query(`DELETE FROM members WHERE LOWER(email) LIKE $1`, [`%@${TEST_DOMAIN}`]);
}

// Put an email on the member roster (founding_members) so it is eligible to vote.
export async function addRosterMember(email: string): Promise<void> {
  await pool.query(
    `INSERT INTO founding_members (email, first_name, last_name)
     VALUES ($1, 'Vitest', 'Voter') ON CONFLICT (email) DO NOTHING`,
    [email]
  );
}

// Create an open governance proposal. A high threshold keeps it 'open' even after
// a single 'yes' vote, so the one-vote-per-member behaviour can be exercised.
export async function createOpenProposal(
  title = `${PROPOSAL_TITLE_PREFIX}One-Vote Enforcement Proposal`,
  threshold = 999
): Promise<number> {
  const res = await pool.query(
    `INSERT INTO data_use_proposals (title, description, threshold, status)
     VALUES ($1, $2, $3, 'open') RETURNING id`,
    [title, 'A proposal created by the automated test suite to verify voting rules.', threshold]
  );
  return res.rows[0].id;
}

// Drive the full email-verification flow and return a cookie-bearing agent whose
// session is verified as `email`. Relies on the dev branch returning devCode.
export async function verifiedAgent(email: string): Promise<TestAgent> {
  const agent = supertest.agent(app);

  const request = await agent.post('/api/member-auth/request-code').send({ email });
  expect(request.status).toBe(200);
  const devCode = request.body.devCode;
  expect(devCode).toMatch(/^\d{6}$/);

  const verify = await agent.post('/api/member-auth/verify-code').send({ code: devCode });
  expect(verify.status).toBe(200);
  expect(verify.body.success).toBe(true);

  return agent;
}
