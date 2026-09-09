/**
 * MAFO AABO Trust™ — Postgres pool + schema init
 * Applies schema.sql with CREATE TABLE IF NOT EXISTS on startup.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initSchema() {
  const ddl = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(ddl);
  console.log('[MafoDB] Schema ready');
}

/**
 * Write an audit_log row. Pass a client inside a transaction so the audit
 * entry commits or rolls back with the mutation it describes.
 */
export async function audit(client, actorId, action, entity, detail = {}) {
  await client.query(
    'INSERT INTO audit_log (actor_id, action, entity, detail) VALUES ($1, $2, $3, $4)',
    [actorId, action, entity, JSON.stringify(detail)]
  );
}

export default pool;
