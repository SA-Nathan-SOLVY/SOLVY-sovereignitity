#!/usr/bin/env node

/**
 * Data Pool Cleanup Script
 * 
 * Runs as a scheduled cron job to:
 * - Delete expired data pool contributions
 * - Log deletions to immutable audit trail
 * - Send notifications to members
 * 
 * Schedule: Daily at 2:00 AM
 * Cron: 0 2 * * *
 */

const cron = require('node-cron');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Database connection
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'solvy',
    user: process.env.DB_USER || 'solvy',
    password: process.env.DB_PASSWORD,
  },
  
  // Email configuration for notifications
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    },
    from: process.env.EMAIL_FROM || 'SOLVY <noreply@solvy.coop>',
  },
  
  // Notification queue configuration
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    queueTable: 'notification_queue',
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// ============================================================================
// DATABASE SETUP
// ============================================================================

const pool = new Pool(CONFIG.database);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// ============================================================================
// LOGGER
// ============================================================================

const Logger = {
  info: (message, meta = {}) => {
    if (CONFIG.logLevel === 'info' || CONFIG.logLevel === 'debug') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
    }
  },
  
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  debug: (message, meta = {}) => {
    if (CONFIG.logLevel === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
    }
  }
};

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Find and delete expired data pool contributions
 */
async function cleanupExpiredData() {
  const client = await pool.connect();
  const deletedRecords = [];
  
  try {
    await client.query('BEGIN');
    
    // Find all expired records
    Logger.debug('Querying for expired records...');
    const expiredQuery = await client.query(
      `SELECT id, proposal_id, member_hash, contributed_at, expires_at
       FROM data_pool_contributions
       WHERE expires_at < NOW()
       ORDER BY expires_at ASC`
    );
    
    Logger.info(`Found ${expiredQuery.rows.length} expired records`);
    
    for (const record of expiredQuery.rows) {
      try {
        // Delete the record
        await client.query(
          'DELETE FROM data_pool_contributions WHERE id = $1',
          [record.id]
        );
        
        // Log to immutable audit trail
        await client.query(
          `INSERT INTO data_pool_audit_log 
           (event_type, proposal_id, member_hash, details, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            'DATA_POOL_DELETION',
            record.proposal_id,
            record.member_hash,
            JSON.stringify({
              contributionId: record.id,
              deletedAt: new Date().toISOString(),
              reason: 'Expiration (30 days)',
              contributedAt: record.contributed_at,
              expiredAt: record.expires_at
            })
          ]
        );
        
        deletedRecords.push(record);
        
        // Queue notification for member
        if (CONFIG.notifications.enabled) {
          await queueNotification(client, {
            type: 'data_deleted',
            memberHash: record.member_hash,
            proposalId: record.proposal_id,
            message: 'Your contributed data has been deleted as scheduled after 30 days.',
            contributedAt: record.contributed_at,
            deletedAt: new Date()
          });
        }
        
        Logger.debug(`Deleted record ${record.id}`, { 
          proposalId: record.proposal_id,
          memberHash: record.member_hash.substring(0, 8) + '...'
        });
        
      } catch (recordError) {
        Logger.error(`Error processing record ${record.id}`, { 
          error: recordError.message 
        });
        // Continue with next record
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      deletedCount: deletedRecords.length,
      records: deletedRecords
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    Logger.error('Cleanup transaction failed', { error: error.message });
    throw error;
    
  } finally {
    client.release();
  }
}

/**
 * Clean up old audit logs (optional - keep for compliance)
 * By default, keeps audit logs indefinitely for compliance
 */
async function archiveOldAuditLogs() {
  // Only archive if explicitly configured
  if (process.env.ARCHIVE_AUDIT_LOGS !== 'true') {
    Logger.debug('Audit log archiving disabled');
    return { archivedCount: 0 };
  }
  
  const archiveBefore = new Date();
  archiveBefore.setFullYear(archiveBefore.getFullYear() - 1); // 1 year old
  
  const client = await pool.connect();
  
  try {
    // Insert into archive table
    const archiveResult = await client.query(
      `INSERT INTO data_pool_audit_log_archive
       SELECT * FROM data_pool_audit_log
       WHERE created_at < $1
       RETURNING id`,
      [archiveBefore]
    );
    
    // Delete from main table
    const deleteResult = await client.query(
      `DELETE FROM data_pool_audit_log
       WHERE created_at < $1`,
      [archiveBefore]
    );
    
    Logger.info(`Archived ${archiveResult.rows.length} audit log entries`);
    
    return {
      archivedCount: archiveResult.rows.length,
      deletedCount: deleteResult.rowCount
    };
    
  } finally {
    client.release();
  }
}

/**
 * Queue notification for member
 */
async function queueNotification(client, notification) {
  try {
    await client.query(
      `INSERT INTO ${CONFIG.notifications.queueTable}
       (type, member_hash, proposal_id, message, data, created_at, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'pending')`,
      [
        notification.type,
        notification.memberHash,
        notification.proposalId,
        notification.message,
        JSON.stringify({
          contributedAt: notification.contributedAt,
          deletedAt: notification.deletedAt
        })
      ]
    );
    
    Logger.debug('Notification queued', { 
      type: notification.type,
      memberHash: notification.memberHash.substring(0, 8) + '...'
    });
    
  } catch (error) {
    Logger.error('Failed to queue notification', { error: error.message });
    // Don't throw - notification failure shouldn't stop cleanup
  }
}

/**
 * Send pending notifications
 */
async function sendPendingNotifications() {
  if (!CONFIG.email.enabled) {
    Logger.debug('Email notifications disabled');
    return { sentCount: 0 };
  }
  
  const transporter = nodemailer.createTransport(CONFIG.email.smtp);
  const client = await pool.connect();
  
  try {
    // Get pending notifications
    const pending = await client.query(
      `SELECT id, member_hash, type, message, data, proposal_id
       FROM ${CONFIG.notifications.queueTable}
       WHERE status = 'pending' AND type = 'data_deleted'
       LIMIT 100`
    );
    
    Logger.info(`Processing ${pending.rows.length} pending notifications`);
    
    let sentCount = 0;
    
    for (const notification of pending.rows) {
      try {
        // Get member email (you'd need to join with members table)
        // This is a simplified example
        const memberResult = await client.query(
          `SELECT email FROM members 
           WHERE member_hash = $1`,
          [notification.member_hash]
        );
        
        if (memberResult.rows.length === 0) {
          Logger.warn(`Member not found for hash ${notification.member_hash}`);
          continue;
        }
        
        const email = memberResult.rows[0].email;
        const data = JSON.parse(notification.data);
        
        // Send email
        await transporter.sendMail({
          from: CONFIG.email.from,
          to: email,
          subject: 'SOLVY: Your Data Has Been Deleted',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #22c55e;">Data Deletion Confirmation</h2>
              <p>Hello,</p>
              <p>${notification.message}</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Contributed:</strong> ${new Date(data.contributedAt).toLocaleDateString()}</p>
                <p style="margin: 10px 0 0;"><strong>Deleted:</strong> ${new Date(data.deletedAt).toLocaleDateString()}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                As promised, your data has been automatically deleted according to our 
                30-day retention policy. No action is required on your part.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px;">
                SOLVY Cooperative | Data Sovereignty Platform
              </p>
            </div>
          `
        });
        
        // Mark as sent
        await client.query(
          `UPDATE ${CONFIG.notifications.queueTable}
           SET status = 'sent', sent_at = NOW()
           WHERE id = $1`,
          [notification.id]
        );
        
        sentCount++;
        
      } catch (sendError) {
        Logger.error(`Failed to send notification ${notification.id}`, { 
          error: sendError.message 
        });
        
        // Mark as failed
        await client.query(
          `UPDATE ${CONFIG.notifications.queueTable}
           SET status = 'failed', error = $2
           WHERE id = $1`,
          [notification.id, sendError.message]
        );
      }
    }
    
    return { sentCount };
    
  } finally {
    client.release();
  }
}

/**
 * Generate cleanup report
 */
async function generateReport(deletedCount) {
  const stats = await pool.query(
    `SELECT 
      COUNT(*) as total_contributions,
      COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_contributions,
      MIN(expires_at) as next_expiration,
      COUNT(DISTINCT proposal_id) as active_proposals
     FROM data_pool_contributions`
  );
  
  const auditStats = await pool.query(
    `SELECT 
      COUNT(*) as total_audit_events,
      COUNT(CASE WHEN event_type = 'DATA_POOL_DELETION' THEN 1 END) as total_deletions
     FROM data_pool_audit_log`
  );
  
  return {
    timestamp: new Date().toISOString(),
    cleanup: {
      deletedToday: deletedCount,
      totalContributions: parseInt(stats.rows[0].total_contributions),
      activeContributions: parseInt(stats.rows[0].active_contributions),
      activeProposals: parseInt(stats.rows[0].active_proposals),
      nextExpiration: stats.rows[0].next_expiration
    },
    audit: {
      totalEvents: parseInt(auditStats.rows[0].total_audit_events),
      totalDeletions: parseInt(auditStats.rows[0].total_deletions)
    }
  };
}

// ============================================================================
// MAIN CLEANUP JOB
// ============================================================================

async function runCleanup() {
  Logger.info('Starting data pool cleanup job...');
  
  const startTime = Date.now();
  
  try {
    // 1. Clean up expired data
    const cleanupResult = await cleanupExpiredData();
    
    // 2. Archive old audit logs (optional)
    const archiveResult = await archiveOldAuditLogs();
    
    // 3. Send pending notifications
    const notificationResult = await sendPendingNotifications();
    
    // 4. Generate report
    const report = await generateReport(cleanupResult.deletedCount);
    
    const duration = Date.now() - startTime;
    
    Logger.info('Cleanup job completed', {
      duration: `${duration}ms`,
      deleted: cleanupResult.deletedCount,
      notificationsSent: notificationResult.sentCount,
      archived: archiveResult.archivedCount
    });
    
    return {
      success: true,
      duration,
      report
    };
    
  } catch (error) {
    Logger.error('Cleanup job failed', { error: error.message });
    throw error;
  }
}

// ============================================================================
// CRON SCHEDULING
// ============================================================================

// Schedule: Daily at 2:00 AM
const scheduledJob = cron.schedule('0 2 * * *', async () => {
  try {
    await runCleanup();
  } catch (error) {
    // Log to external monitoring if configured
    if (process.env.SENTRY_DSN) {
      // Sentry.captureException(error);
    }
  }
}, {
  scheduled: process.env.DISABLE_CRON !== 'true',
  timezone: process.env.TZ || 'UTC'
});

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'run':
      // Run immediately (for manual execution)
      try {
        const result = await runCleanup();
        console.log('\nCleanup Report:');
        console.log(JSON.stringify(result.report, null, 2));
        process.exit(0);
      } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
      }
      break;
      
    case 'dry-run':
      // Show what would be deleted without actually deleting
      try {
        const client = await pool.connect();
        const expired = await client.query(
          `SELECT COUNT(*) as count FROM data_pool_contributions WHERE expires_at < NOW()`
        );
        console.log(`Would delete ${expired.rows[0].count} expired records`);
        client.release();
        process.exit(0);
      } catch (error) {
        console.error('Dry run failed:', error);
        process.exit(1);
      }
      break;
      
    case 'start':
      // Start the cron scheduler
      console.log('Starting scheduled cleanup job (runs daily at 2:00 AM)...');
      scheduledJob.start();
      break;
      
    case 'stats':
      // Show current statistics
      try {
        const report = await generateReport(0);
        console.log('\nData Pool Statistics:');
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      } catch (error) {
        console.error('Failed to get stats:', error);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
Data Pool Cleanup Script

Usage: node cleanup-data-pool.js [command]

Commands:
  run       Run cleanup immediately
  dry-run   Show what would be deleted without deleting
  start     Start the cron scheduler
  stats     Show current statistics

Environment Variables:
  DB_HOST           Database host (default: localhost)
  DB_PORT           Database port (default: 5432)
  DB_NAME           Database name (default: solvy)
  DB_USER           Database user
  DB_PASSWORD       Database password
  EMAIL_ENABLED     Enable email notifications (default: false)
  DISABLE_CRON      Disable scheduled execution (default: false)
  LOG_LEVEL         Logging level (debug|info|warn|error)
      `);
      process.exit(0);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', async () => {
  Logger.info('Received SIGINT, shutting down gracefully...');
  scheduledJob.stop();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('Received SIGTERM, shutting down gracefully...');
  scheduledJob.stop();
  await pool.end();
  process.exit(0);
});

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  runCleanup,
  cleanupExpiredData,
  generateReport
};
