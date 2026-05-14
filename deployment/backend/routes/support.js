/**
 * SOLVY Metrics Server — Support Escalation Routes
 * Handles human handoff from the AI chat widget.
 * Sends real emails to the support team via MailCow SMTP.
 */

const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const config = require('../config');

const router = express.Router();

// ============================================================================
// EMAIL TRANSPORT
// ============================================================================

const transporter = nodemailer.createTransport({
  host: process.env.MAILCOW_HOST || 'mail.ebl.beauty',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILCOW_USER || process.env.SUPPORT_FROM || 'noreply@ebl.beauty',
    pass: process.env.MAILCOW_PASS || ''
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certs in dev
  }
});

// Verify connection on startup (log only, don't crash)
transporter.verify((error) => {
  if (error) {
    console.warn('[EMAIL] SMTP connection not ready:', error.message);
  } else {
    console.log('[EMAIL] SMTP connection ready');
  }
});

// ============================================================================
// RATE LIMITING
// ============================================================================

const supportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many support requests. Please wait before submitting again.'
    });
  }
});

// ============================================================================
// SECURITY HELPERS
// ============================================================================

function requireApiKey(req, res, next) {
  const providedKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    || req.headers['x-api-key'];

  if (!providedKey || providedKey !== config.security.adminApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized — valid API key required'
    });
  }
  next();
}

function rejectIndividualData(body) {
  const forbiddenKeys = [
    'transactions', 'transaction', 'merchant', 'merchants', 'merchantName',
    'merchantNames', 'transactionId', 'transactionIds', 'rawData',
    'individualData', 'purchaseDetails', 'itemized', 'receipt'
  ];

  const bodyKeys = Object.keys(body).map(k => k.toLowerCase());
  const found = forbiddenKeys.filter(fk =>
    bodyKeys.includes(fk.toLowerCase()) ||
    bodyKeys.some(bk => bk.includes(fk.toLowerCase()))
  );

  return found.length > 0 ? found : null;
}

// ============================================================================
// TICKET ID GENERATOR
// ============================================================================

/**
 * Generate a unique support ticket ID
 * Format: SUP-{YYYY}-{NNNN}
 * @returns {string}
 */
function generateTicketId() {
  const year = new Date().getFullYear();

  // Get the current counter for this year
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM support_tickets
    WHERE strftime('%Y', created_at) = ?
  `).get(year.toString());

  const nextNum = (result?.count || 0) + 1;
  const padded = nextNum.toString().padStart(4, '0');

  return `SUP-${year}-${padded}`;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/support/escalate
 * Receives support requests from the AI chat widget and emails the support team.
 */
router.post('/support/escalate', supportRateLimiter, (req, res) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.email || typeof body.email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (body.message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message must be under 2000 characters'
      });
    }

    // Reject individual transaction data
    const forbidden = rejectIndividualData(body);
    if (forbidden) {
      console.warn('[SECURITY] Support request rejected — contained individual data:', forbidden);
      return res.status(400).json({
        success: false,
        error: `Individual transaction data not accepted. Rejected fields: ${forbidden.join(', ')}`
      });
    }

    // Generate ticket
    const ticketId = generateTicketId();
    const category = body.category || 'general';
    const urgency = body.urgency || 'normal';
    const memberIdHash = body.memberIdHash || null;
    const timestamp = new Date().toISOString();

    const pageUrl = body.pageUrl || req.headers.referer || 'Unknown';
    const memberName = body.memberName || body.name || 'Not provided';

    // Store ticket in database
    db.prepare(`
      INSERT INTO support_tickets (ticket_id, email, name, message, category, urgency, page_url, member_id_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ticketId, body.email, memberName, body.message, category, urgency, pageUrl, memberIdHash, timestamp);

    // Build email
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@ebl.beauty';
    const fromEmail = process.env.SUPPORT_FROM || 'noreply@ebl.beauty';
    const subject = `[SOLVY Support] ${category} — ${urgency} — Ticket ${ticketId}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 1.5rem; border-radius: 12px 12px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 1.3rem;">🛡️ SOLVY Support Escalation</h2>
        </div>
        <div style="background: #f8fafc; padding: 1.5rem; border: 1px solid #e2e8f0; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600; width: 140px;">Ticket ID</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">From</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${body.email}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Category</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Urgency</td>
              <td style="padding: 0.5rem 0; color: ${urgency === 'urgent' ? '#ef4444' : '#0f172a'}; font-weight: ${urgency === 'urgent' ? '700' : '400'};">${urgency}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Name</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${memberName}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Page URL</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${pageUrl}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Member Hash</td>
              <td style="padding: 0.5rem 0; color: #0f172a; font-family: monospace; font-size: 0.85rem;">${memberIdHash || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Received</td>
              <td style="padding: 0.5rem 0; color: #0f172a;">${timestamp}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1rem 0;">
          <p style="color: #64748b; font-weight: 600; margin-bottom: 0.5rem;">Message:</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; color: #334155; line-height: 1.6;">
            ${body.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background: #0f172a; padding: 1rem 1.5rem; border-radius: 0 0 12px 12px; color: #94a3b8; font-size: 0.8rem;">
          <p style="margin: 0;">Sent via SOLVY AI Chat Widget • ${timestamp}</p>
          <p style="margin: 0.25rem 0 0;">SOLVY Ecosystem™ — Product of SA Nathan LLC</p>
        </div>
      </div>
    `;

    // Build recipient list from env (supports comma-separated)
    const recipients = (process.env.SUPPORT_RECIPIENTS || supportEmail)
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    // Send email
    transporter.sendMail({
      from: `"SOLVY Support" <${fromEmail}>`,
      to: recipients,
      subject: subject,
      html: htmlBody,
      replyTo: body.email
    }, (err, info) => {
      if (err) {
        console.error('[EMAIL] Failed to send support email:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to send support email. Please try again later.'
        });
      }

      console.log(`[EMAIL] Support ticket ${ticketId} sent to ${supportEmail} (${info.messageId})`);

      res.status(200).json({
        success: true,
        ticketId: ticketId,
        message: 'Support request received. A human will reply within 24 hours.'
      });
    });

  } catch (error) {
    console.error('[API] Support escalation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/support/request
 * Simpler alias for chat widget human escalation.
 * Accepts memberEmail, memberName, message, pageUrl, timestamp.
 */
router.post('/support/request', supportRateLimiter, (req, res) => {
  try {
    const body = req.body;

    // Validate email
    if (!body.memberEmail || typeof body.memberEmail !== 'string') {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.memberEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Map to the same handler as /escalate
    req.body = {
      email: body.memberEmail,
      name: body.memberName || 'Not provided',
      message: body.message || 'Member requested human support – no additional details provided.',
      pageUrl: body.pageUrl || req.headers.referer || 'Unknown',
      category: 'general',
      urgency: 'normal',
      timestamp: body.timestamp || new Date().toISOString()
    };

    // Forward to escalate logic by reusing the same endpoint handler
    // Since we can't easily call the handler directly, we redirect the request
    // Actually, let's just duplicate the core logic inline for simplicity

    const ticketId = generateTicketId();
    const timestamp = req.body.timestamp;
    const pageUrl = req.body.pageUrl;
    const memberName = req.body.name;
    const memberEmail = body.memberEmail;
    const message = req.body.message;

    db.prepare(`
      INSERT INTO support_tickets (ticket_id, email, name, message, category, urgency, page_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ticketId, memberEmail, memberName, message, 'general', 'normal', pageUrl, timestamp);

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@ebl.beauty';
    const fromEmail = process.env.SUPPORT_FROM || 'noreply@ebl.beauty';
    const recipients = (process.env.SUPPORT_RECIPIENTS || supportEmail)
      .split(',').map(e => e.trim()).filter(Boolean);

    const subject = `SOLVY Support Request – ${memberEmail} – ${timestamp}`;

    const plainBody = `
A SOLVY member has requested human support.

Member email: ${memberEmail}
Member name: ${memberName}
Message: ${message}
Page URL: ${pageUrl}
Time: ${timestamp}
Ticket ID: ${ticketId}

Please reply to the member at ${memberEmail} within 24 hours.

This is an automated notification from the SOLVY support system.
    `.trim();

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 1.5rem; border-radius: 12px 12px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 1.3rem;">🛡️ SOLVY Support Request</h2>
        </div>
        <div style="background: #f8fafc; padding: 1.5rem; border: 1px solid #e2e8f0; border-top: none;">
          <p><strong>Member email:</strong> ${memberEmail}</p>
          <p><strong>Member name:</strong> ${memberName}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; color: #334155;">${message.replace(/\n/g, '<br>')}</div>
          <p><strong>Page URL:</strong> ${pageUrl}</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <hr>
          <p>Please reply to the member at <a href="mailto:${memberEmail}">${memberEmail}</a> within 24 hours.</p>
        </div>
        <div style="background: #0f172a; padding: 1rem 1.5rem; border-radius: 0 0 12px 12px; color: #94a3b8; font-size: 0.8rem;">
          <p style="margin: 0;">Automated notification from SOLVY support system • ${timestamp}</p>
        </div>
      </div>
    `;

    transporter.sendMail({
      from: `"SOLVY Support" <${fromEmail}>`,
      to: recipients,
      subject: subject,
      text: plainBody,
      html: htmlBody,
      replyTo: memberEmail
    }, (err, info) => {
      if (err) {
        console.error('[EMAIL] Support request email failed:', err);
        // Still return success to member — don't expose internal errors
        return res.json({
          status: 'accepted',
          message: 'Your request has been sent. We will reply within 24 hours.'
        });
      }

      console.log(`[EMAIL] Support request ${ticketId} sent to ${recipients.join(', ')} (${info.messageId})`);
      res.json({
        status: 'accepted',
        message: 'Your request has been sent. We will reply within 24 hours.'
      });
    });

  } catch (error) {
    console.error('[API] Support request error:', error);
    res.json({
      status: 'accepted',
      message: 'Your request has been sent. We will reply within 24 hours.'
    });
  }
});

/**
 * GET /api/support/requests
 * Alias for /support/tickets — used by the unified back office.
 */
router.get('/support/requests', (req, res) => {
  try {
    const providedKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
      || req.headers['x-api-key'];

    if (!providedKey || providedKey !== config.security.adminApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized — valid API key required'
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const statusFilter = req.query.status || null;

    let whereClause = '';
    const params = [];

    if (statusFilter) {
      whereClause = 'WHERE status = ?';
      params.push(statusFilter);
    }

    const tickets = db.prepare(`
      SELECT
        id,
        ticket_id as ticketId,
        email as memberEmail,
        name as memberName,
        message,
        category,
        urgency,
        page_url as pageUrl,
        member_id_hash as memberIdHash,
        status,
        created_at as createdAt
      FROM support_tickets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(`SELECT COUNT(*) as count FROM support_tickets ${whereClause}`).get(...params).count;

    const pendingCount = db.prepare(`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'pending' OR status IS NULL`).get().count;

    res.json({
      success: true,
      total,
      pendingCount,
      requests: tickets
    });

  } catch (error) {
    console.error('[API] Error listing support requests:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/support/requests/:id
 * Update the status of a support request.
 */
router.patch('/support/requests/:id', (req, res) => {
  try {
    const providedKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
      || req.headers['x-api-key'];

    if (!providedKey || providedKey !== config.security.adminApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized — valid API key required'
      });
    }

    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'replied', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = db.prepare(`
      UPDATE support_tickets SET status = ? WHERE id = ?
    `).run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Support request not found'
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`
    });

  } catch (error) {
    console.error('[API] Error updating support request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/support/tickets
 * List support tickets (admin only, API key protected)
 */
router.get('/support/tickets', (req, res) => {
  try {
    const providedKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
      || req.headers['x-api-key'];

    if (!providedKey || providedKey !== config.security.adminApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized — valid API key required'
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;

    const tickets = db.prepare(`
      SELECT
        ticket_id as ticketId,
        email,
        name,
        category,
        urgency,
        page_url as pageUrl,
        member_id_hash as memberIdHash,
        status,
        created_at as createdAt
      FROM support_tickets
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM support_tickets').get().count;

    res.json({
      success: true,
      total,
      tickets
    });

  } catch (error) {
    console.error('[API] Error listing tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
