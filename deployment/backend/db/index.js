/**
 * SOLVY Metrics Server — Database Layer
 * Uses better-sqlite3 for zero-config, synchronous SQLite.
 * Includes migration runner for schema versioning.
 *
 * To switch to PostgreSQL in production, replace this file
 * with a pg/Pool setup and update models to use async/await.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Extract file path from DATABASE_URL (e.g., "sqlite:./data/solvy.sqlite")
const dbPath = config.database.url.replace(/^sqlite:/, '');

// Ensure the data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open (or create) the database
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('[DB] Connected to SQLite:', dbPath);

// ============================================================================
// MIGRATIONS
// ============================================================================

const MIGRATIONS = [
  {
    version: 1,
    name: 'create_member_aggregates',
    sql: `
      CREATE TABLE IF NOT EXISTS member_aggregates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id_hash TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        total_volume REAL NOT NULL DEFAULT 0,
        transaction_count INTEGER NOT NULL DEFAULT 0,
        category_sums TEXT NOT NULL DEFAULT '{}',
        total_interchange REAL NOT NULL DEFAULT 0,
        member_pool_share REAL NOT NULL DEFAULT 0,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        client_version TEXT,
        received_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_member_hash ON member_aggregates(member_id_hash);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON member_aggregates(timestamp);
      CREATE INDEX IF NOT EXISTS idx_period_start ON member_aggregates(period_start);
      CREATE INDEX IF NOT EXISTS idx_period_end ON member_aggregates(period_end);
    `
  },
  {
    version: 2,
    name: 'create_support_tickets',
    sql: `
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        name TEXT,
        message TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        urgency TEXT DEFAULT 'normal',
        page_url TEXT,
        member_id_hash TEXT,
        status TEXT DEFAULT 'sent',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_ticket_email ON support_tickets(email);
      CREATE INDEX IF NOT EXISTS idx_ticket_created ON support_tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_status ON support_tickets(status);
    `
  }
];

/**
 * Run all pending migrations
 */
function runMigrations() {
  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const appliedVersions = db.prepare('SELECT version FROM schema_migrations').all()
    .map(row => row.version);

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.includes(migration.version)) {
      console.log(`[DB] Running migration ${migration.version}: ${migration.name}`);
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)')
        .run(migration.version, migration.name);
      console.log(`[DB] Migration ${migration.version} applied`);
    }
  }

  console.log('[DB] All migrations up to date');
}

// Run migrations on startup
runMigrations();

module.exports = db;
