/**
 * SOLVY Database Layer
 * Lightweight SQLite for prelaunch commitments and lightweight persistence
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'solvy.sqlite');
const db = new Database(DB_PATH);

// WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Initialize Schema ─────────────────────────────────────────────────────

function initSchema() {
  // Prelaunch commitments
  db.exec(`
    CREATE TABLE IF NOT EXISTS prelaunch_commitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      monthly_pledge REAL NOT NULL,
      committed_at DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'committed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial commitments (idempotent)
  const count = db.prepare('SELECT COUNT(*) as count FROM prelaunch_commitments').get();
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO prelaunch_commitments (name, email, monthly_pledge, committed_at, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const seeds = [
      ['Sean Marlon II McDaniel', 'sean@solvy.cards', 20000, '2025-06-19', 'committed'],
      ['Eva Mayo', 'eva@solvy.cards', 10000, '2025-06-19', 'committed'],
      ['Sheila McDaniel', 'sheila.mcdaniel@ebl.beauty', 100000, '2025-06-19', 'committed'],
    ];
    const seedTxn = db.transaction((rows) => {
      for (const row of rows) insert.run(row);
    });
    seedTxn(seeds);
    console.log('[DB] Seeded prelaunch commitments:', seeds.length);
  }
}

initSchema();

// ─── Prelaunch Commitment Operations ────────────────────────────────────────

function addCommitment({ name, email, pledge }) {
  const stmt = db.prepare(`
    INSERT INTO prelaunch_commitments (name, email, monthly_pledge, committed_at, status)
    VALUES (?, ?, ?, DATE('now'), 'committed')
  `);
  const result = stmt.run(name, email, pledge);
  return { id: result.lastInsertRowid, name, email, pledge };
}

function getCommitments() {
  return db.prepare(`
    SELECT id, name, email, monthly_pledge, committed_at, status, created_at
    FROM prelaunch_commitments
    ORDER BY created_at DESC
  `).all();
}

function getCommitmentStats() {
  const row = db.prepare(`
    SELECT COUNT(*) as total, COALESCE(SUM(monthly_pledge), 0) as monthly_total
    FROM prelaunch_commitments
    WHERE status = 'committed'
  `).get();
  return {
    total: row.total,
    monthlyTotal: row.monthly_total,
    annualProjected: row.monthly_total * 12,
  };
}

module.exports = {
  db,
  addCommitment,
  getCommitments,
  getCommitmentStats,
};
