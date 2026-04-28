#!/usr/bin/env node

/**
 * SOLVY PWA - Migration Script
 * Phase 1: Export existing data to local-first architecture
 * Phase 7: Retire central SQL storage
 * 
 * This script:
 * 1. Exports each member's transaction history to JSON
 * 2. Marks data for deletion after confirmation
 * 3. Archives central data before deletion
 * 4. Retires central transaction tables
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'solvy',
    user: process.env.DB_USER || 'solvy',
    password: process.env.DB_PASSWORD,
  },
  
  // Export settings
  export: {
    batchSize: 100, // Members per batch
    outputDir: process.env.EXPORT_DIR || './migrations/exports',
    archiveDir: process.env.ARCHIVE_DIR || './migrations/archive',
  },
  
  // Migration settings
  migration: {
    dryRun: process.env.DRY_RUN === 'true',
    skipArchive: process.env.SKIP_ARCHIVE === 'true',
    confirmBeforeDelete: process.env.CONFIRM_BEFORE_DELETE !== 'false',
  }
};

// ============================================================================
// DATABASE SETUP
// ============================================================================

const pool = new Pool(CONFIG.database);

// ============================================================================
// LOGGER
// ============================================================================

const Logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  success: (message, meta = {}) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ✓ ${message}`, meta);
  }
};

// ============================================================================
// PHASE 1: DATA EXPORT & MIGRATION
// ============================================================================

/**
 * Get all members with transaction data
 */
async function getMembersWithTransactions() {
  const result = await pool.query(`
    SELECT DISTINCT m.id, m.email, m.created_at as member_since
    FROM members m
    INNER JOIN transactions t ON t.member_id = m.id
    WHERE t.migrated = false OR t.migrated IS NULL
    ORDER BY m.created_at ASC
  `);
  
  return result.rows;
}

/**
 * Get transactions for a specific member
 */
async function getMemberTransactions(memberId) {
  const result = await pool.query(`
    SELECT 
      id,
      amount,
      merchant_name,
      merchant_category,
      transaction_date,
      status,
      created_at
    FROM transactions
    WHERE member_id = $1
    ORDER BY transaction_date DESC
  `, [memberId]);
  
  return result.rows;
}

/**
 * Export member data to JSON file
 */
async function exportMemberData(member, transactions) {
  const exportData = {
    exportMetadata: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      memberId: member.id,
      memberSince: member.member_since,
      transactionCount: transactions.length
    },
    transactions: transactions.map(tx => ({
      id: tx.id,
      amount: parseFloat(tx.amount),
      merchant: tx.merchant_name,
      category: tx.merchant_category,
      date: tx.transaction_date,
      status: tx.status,
      createdAt: tx.created_at
    })),
    aggregatedMetrics: {
      totalVolume: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      transactionCount: transactions.length,
      categorySums: transactions.reduce((acc, tx) => {
        const cat = tx.merchant_category || 'uncategorized';
        acc[cat] = (acc[cat] || 0) + parseFloat(tx.amount);
        return acc;
      }, {}),
      firstTransaction: transactions[transactions.length - 1]?.transaction_date,
      lastTransaction: transactions[0]?.transaction_date
    },
    migrationInstructions: {
      steps: [
        'Login to SOLVY PWA',
        'Go to Settings > Data Migration',
        'Upload this JSON file',
        'Verify imported data',
        'Confirm deletion from central storage'
      ],
      importUrl: '/onboarding.html?import=true',
      supportEmail: 'support@solvy.coop'
    }
  };
  
  // Create export filename
  const hash = crypto.createHash('sha256').update(member.id).digest('hex').substring(0, 8);
  const filename = `member_${hash}_export_${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(CONFIG.export.outputDir, filename);
  
  // Write file
  await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
  
  return { filename, filepath, transactionCount: transactions.length };
}

/**
 * Mark transactions as migrated
 */
async function markAsMigrated(memberId) {
  if (CONFIG.migration.dryRun) {
    Logger.info(`[DRY RUN] Would mark transactions as migrated for member ${memberId}`);
    return;
  }
  
  await pool.query(`
    UPDATE transactions
    SET migrated = true, migrated_at = NOW()
    WHERE member_id = $1
  `, [memberId]);
}

/**
 * Run Phase 1: Export all member data
 */
async function runPhase1Export() {
  Logger.info('Starting Phase 1: Data Export Migration');
  Logger.info(`Mode: ${CONFIG.migration.dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  // Ensure output directory exists
  await fs.mkdir(CONFIG.export.outputDir, { recursive: true });
  
  // Get members with transactions
  const members = await getMembersWithTransactions();
  Logger.info(`Found ${members.length} members with transaction data to migrate`);
  
  const results = {
    successful: [],
    failed: [],
    totalTransactions: 0
  };
  
  // Process in batches
  for (let i = 0; i < members.length; i += CONFIG.export.batchSize) {
    const batch = members.slice(i, i + CONFIG.export.batchSize);
    Logger.info(`Processing batch ${Math.floor(i / CONFIG.export.batchSize) + 1}/${Math.ceil(members.length / CONFIG.export.batchSize)}`);
    
    for (const member of batch) {
      try {
        // Get transactions
        const transactions = await getMemberTransactions(member.id);
        
        if (transactions.length === 0) {
          Logger.warn(`No transactions found for member ${member.id}`);
          continue;
        }
        
        // Export to JSON
        const exportResult = await exportMemberData(member, transactions);
        
        // Mark as migrated
        await markAsMigrated(member.id);
        
        results.successful.push({
          memberId: member.id,
          filename: exportResult.filename,
          transactionCount: exportResult.transactionCount
        });
        
        results.totalTransactions += exportResult.transactionCount;
        
        Logger.success(`Exported ${exportResult.transactionCount} transactions for member ${member.id.substring(0, 8)}...`);
        
      } catch (error) {
        Logger.error(`Failed to export member ${member.id}`, { error: error.message });
        results.failed.push({
          memberId: member.id,
          error: error.message
        });
      }
    }
  }
  
  // Write summary report
  const reportPath = path.join(CONFIG.export.outputDir, 'migration_report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    exportedAt: new Date().toISOString(),
    mode: CONFIG.migration.dryRun ? 'dry-run' : 'live',
    summary: {
      totalMembers: members.length,
      successfulExports: results.successful.length,
      failedExports: results.failed.length,
      totalTransactions: results.totalTransactions
    },
    results
  }, null, 2));
  
  Logger.success(`Phase 1 complete. Report saved to ${reportPath}`);
  Logger.info(`Summary: ${results.successful.length} successful, ${results.failed.length} failed, ${results.totalTransactions} total transactions`);
  
  return results;
}

// ============================================================================
// PHASE 7: RETIRE CENTRAL STORAGE
// ============================================================================

/**
 * Archive central transaction data before deletion
 */
async function archiveCentralData() {
  Logger.info('Starting data archive process...');
  
  if (CONFIG.migration.skipArchive) {
    Logger.warn('Skipping archive - SKIP_ARCHIVE is set');
    return null;
  }
  
  await fs.mkdir(CONFIG.export.archiveDir, { recursive: true });
  
  // Export all transactions to encrypted archive
  const archiveFilename = `transactions_archive_${new Date().toISOString().split('T')[0]}.json.enc`;
  const archivePath = path.join(CONFIG.export.archiveDir, archiveFilename);
  
  // Get all transactions
  const result = await pool.query(`
    SELECT t.*, m.email as member_email
    FROM transactions t
    LEFT JOIN members m ON m.id = t.member_id
    ORDER BY t.created_at DESC
  `);
  
  // Encrypt data before writing
  const data = JSON.stringify(result.rows);
  const encrypted = encryptForArchive(data);
  
  await fs.writeFile(archivePath, encrypted);
  
  Logger.success(`Archived ${result.rows.length} transactions to ${archivePath}`);
  
  return archivePath;
}

/**
 * Encrypt data for archive (simple encryption - use proper KMS in production)
 */
function encryptForArchive(data) {
  // In production, use AWS KMS, HashiCorp Vault, etc.
  // This is a placeholder using AES-256
  const key = process.env.ARCHIVE_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ARCHIVE_ENCRYPTION_KEY not set');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Verify all members have been migrated
 */
async function verifyMigrationComplete() {
  Logger.info('Verifying migration completeness...');
  
  const result = await pool.query(`
    SELECT COUNT(*) as unmigrated_count
    FROM transactions
    WHERE migrated = false OR migrated IS NULL
  `);
  
  const unmigratedCount = parseInt(result.rows[0].unmigrated_count);
  
  if (unmigratedCount > 0) {
    throw new Error(`Migration incomplete: ${unmigratedCount} unmigrated transactions remain`);
  }
  
  Logger.success('All transactions have been migrated');
  return true;
}

/**
 * Drop central transaction tables (Phase 7)
 */
async function retireCentralStorage() {
  Logger.info('Starting Phase 7: Retiring Central Storage');
  Logger.info(`Mode: ${CONFIG.migration.dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  if (CONFIG.migration.dryRun) {
    Logger.info('[DRY RUN] Would execute the following:');
    Logger.info('  1. Archive transactions table');
    Logger.info('  2. Drop transactions table');
    Logger.info('  3. Drop related indexes and triggers');
    Logger.info('  4. Update schema to remove transaction columns from members');
    return;
  }
  
  // Confirm before destructive action
  if (CONFIG.migration.confirmBeforeDelete) {
    console.log('\n⚠️  WARNING: This will permanently delete central transaction data!');
    console.log('This action cannot be undone.\n');
    // In actual implementation, would prompt for confirmation
    // For now, we require explicit confirmation via environment variable
    if (process.env.CONFIRM_RETIREMENT !== 'yes') {
      throw new Error('Retirement not confirmed. Set CONFIRM_RETIREMENT=yes to proceed');
    }
  }
  
  // Archive first
  const archivePath = await archiveCentralData();
  
  // Verify migration is complete
  await verifyMigrationComplete();
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create backup table reference
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions_legacy (
        LIKE transactions INCLUDING ALL
      )
    `);
    
    // 2. Move migrated data to legacy table (instead of deleting immediately)
    await client.query(`
      INSERT INTO transactions_legacy
      SELECT * FROM transactions
      WHERE migrated = true
    `);
    
    // 3. Truncate main transactions table
    await client.query('TRUNCATE TABLE transactions');
    
    // 4. Drop triggers related to transactions
    await client.query(`
      DROP TRIGGER IF EXISTS update_transaction_timestamp ON transactions
    `);
    
    // 5. Remove transaction-related columns from members (if any)
    // This would be customized based on your schema
    
    await client.query('COMMIT');
    
    Logger.success('Central transaction storage retired successfully');
    Logger.info(`Legacy data preserved in transactions_legacy table`);
    if (archivePath) {
      Logger.info(`Encrypted archive saved to ${archivePath}`);
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Final cleanup - drop legacy table after confirmation period
 */
async function finalCleanup() {
  Logger.info('Starting final cleanup...');
  
  if (CONFIG.migration.dryRun) {
    Logger.info('[DRY RUN] Would drop transactions_legacy table');
    return;
  }
  
  // Check if enough time has passed since retirement
  const result = await pool.query(`
    SELECT created_at 
    FROM information_schema.tables 
    WHERE table_name = 'transactions_legacy'
  `);
  
  if (result.rows.length === 0) {
    Logger.info('No legacy table found - cleanup already complete');
    return;
  }
  
  // In production, implement a waiting period (e.g., 30 days)
  // before final deletion
  
  await pool.query('DROP TABLE IF EXISTS transactions_legacy');
  Logger.success('Legacy table dropped - cleanup complete');
}

// ============================================================================
// MAIN CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'export':
      // Phase 1: Export all data
      await runPhase1Export();
      break;
      
    case 'status':
      // Check migration status
      const members = await getMembersWithTransactions();
      console.log(`\nMigration Status:`);
      console.log(`  Members with unmigrated data: ${members.length}`);
      
      const unmigrated = await pool.query(`
        SELECT COUNT(*) as count FROM transactions WHERE migrated = false
      `);
      console.log(`  Unmigrated transactions: ${unmigrated.rows[0].count}`);
      
      const total = await pool.query(`
        SELECT COUNT(*) as count FROM transactions
      `);
      console.log(`  Total transactions: ${total.rows[0].count}`);
      break;
      
    case 'retire':
      // Phase 7: Retire central storage
      await retireCentralStorage();
      break;
      
    case 'cleanup':
      // Final cleanup
      await finalCleanup();
      break;
      
    case 'full':
      // Run full migration pipeline
      Logger.info('Starting full migration pipeline...');
      await runPhase1Export();
      await retireCentralStorage();
      Logger.success('Full migration complete!');
      break;
      
    default:
      console.log(`
SOLVY PWA - Local-First Migration Tool

This script migrates from centralized SQL storage to local-first architecture.

Usage: node migrate-to-local-first.js [command]

Commands:
  export    Phase 1: Export all member transaction data to JSON files
  status    Check migration status
  retire    Phase 7: Retire central storage (after all exports complete)
  cleanup   Final cleanup after confirmation period
  full      Run full pipeline (export + retire)

Environment Variables:
  DB_HOST                      Database host
  DB_PORT                      Database port
  DB_NAME                      Database name
  DB_USER                      Database user
  DB_PASSWORD                  Database password
  EXPORT_DIR                   Output directory for exports (default: ./migrations/exports)
  ARCHIVE_DIR                  Directory for encrypted archives (default: ./migrations/archive)
  DRY_RUN=true                 Run in dry-run mode (no changes)
  SKIP_ARCHIVE=true            Skip archive creation
  CONFIRM_BEFORE_DELETE=false  Skip confirmation prompts
  CONFIRM_RETIREMENT=yes       Confirm retirement (required for retire command)
  ARCHIVE_ENCRYPTION_KEY       Key for archive encryption

Examples:
  # Dry run export
  DRY_RUN=true node migrate-to-local-first.js export

  # Live export
  node migrate-to-local-first.js export

  # Check status
  node migrate-to-local-first.js status

  # Retire central storage (after confirming all exports)
  CONFIRM_RETIREMENT=yes node migrate-to-local-first.js retire
      `);
  }
  
  await pool.end();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    Logger.error('Migration failed', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  runPhase1Export,
  retireCentralStorage,
  getMembersWithTransactions
};
