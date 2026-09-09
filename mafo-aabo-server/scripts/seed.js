/**
 * MAFO AABO Trust™ — one-time seed (spec §8 step 4).
 *
 * Creates the three role users (bcrypt-hashed codes read from env vars —
 * never hardcoded, never committed) and inserts the trust_settings row
 * ($225,000.00 initial funding, effective 2026-07-01).
 *
 * Usage:
 *   SEED_CODE_TRUSTEE=... SEED_CODE_GRANTOR=... SEED_CODE_BENEFICIARY=... \
 *   DATABASE_URL=postgresql://... node scripts/seed.js
 *
 * Re-running updates the codes (upsert by role) and leaves history intact.
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool, { initSchema } from '../db.js';

const USERS = [
  { role: 'trustee',     fullName: 'Sean Marlon II McDaniel',      env: 'SEED_CODE_TRUSTEE' },
  { role: 'grantor',     fullName: 'Sheila Ann McDaniel',          env: 'SEED_CODE_GRANTOR' },
  { role: 'beneficiary', fullName: 'Sean Maurice Mayo (MAFO AABO)', env: 'SEED_CODE_BENEFICIARY' },
];

const INITIAL_FUNDING_CENTS = 22500000; // $225,000.00
const EFFECTIVE_DATE = '2026-07-01';

async function seed() {
  await initSchema();

  for (const u of USERS) {
    const code = process.env[u.env];
    if (!code || code.length < 8) {
      throw new Error(`${u.env} must be set (min 8 chars) — codes come from env, never hardcoded`);
    }
    const hash = await bcrypt.hash(code, 12);
    await pool.query(
      `INSERT INTO users (role, full_name, access_code_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (role) DO UPDATE SET access_code_hash = EXCLUDED.access_code_hash,
                                        full_name = EXCLUDED.full_name,
                                        active = TRUE`,
      [u.role, u.fullName, hash]
    );
    console.log(`✓ Seeded ${u.role}: ${u.fullName} (code from ${u.env}, bcrypt-hashed)`);
  }

  await pool.query(
    `INSERT INTO trust_settings (id, initial_funding_cents, effective_date)
     VALUES (1, $1, $2)
     ON CONFLICT (id) DO UPDATE SET initial_funding_cents = EXCLUDED.initial_funding_cents,
                                    effective_date = EXCLUDED.effective_date`,
    [INITIAL_FUNDING_CENTS, EFFECTIVE_DATE]
  );
  console.log(`✓ trust_settings: $${(INITIAL_FUNDING_CENTS / 100).toFixed(2)} effective ${EFFECTIVE_DATE}`);

  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
