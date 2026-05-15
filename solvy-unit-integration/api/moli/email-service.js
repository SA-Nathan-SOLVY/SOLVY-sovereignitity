/**
 * MOLI Email Service — Mailcow SMTP
 * SOLVY Ecosystem™
 * 
 * Sends MOLI policy service request PDFs via Mailcow SMTP
 * Falls back to console logging if SMTP is not configured
 */

const nodemailer = require('nodemailer');

// Mailcow SMTP configuration from environment
const SMTP_HOST = process.env.MAILCOW_SMTP_HOST || process.env.MAILCOW_HOST || '46.62.235.95'; // Direct VPS IP — mail.ebl.beauty is Cloudflare-proxied (SMTP blocked)
const SMTP_USER = process.env.MAILCOW_SMTP_USER || process.env.MAILCOW_USER || 'support@ebl.beauty';
const SMTP_PASS = process.env.MAILCOW_SMTP_PASS || process.env.MAILCOW_PASS || '';
const SMTP_PORT = parseInt(process.env.MAILCOW_SMTP_PORT || '587', 10);

/**
 * Create SMTP transporter (lazy init)
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  if (!SMTP_PASS) {
    console.warn('[MOLI Email] MAILCOW_SMTP_PASS not set — emails will be logged but not sent');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587 (STARTTLS)
    requireTLS: SMTP_PORT === 587,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs if needed
    },
  });
  
  // Verify connection on first use
  transporter.verify((error, success) => {
    if (error) {
      console.error('[MOLI Email] SMTP verification failed:', error.message);
    } else {
      console.log('[MOLI Email] SMTP server ready:', SMTP_HOST);
    }
  });
  
  return transporter;
}

/**
 * Send MOLI policy service request email with PDF attachment
 * @param {Object} options
 * @param {Buffer} options.pdfBuffer - The generated PDF
 * @param {string} options.policyHolder - Name of policy holder
 * @param {string} options.policyNumber - Policy number
 * @param {string} options.requestType - Type of request
 * @param {string} options.recipientEmail - Where to send (default: support@ebl.beauty)
 * @returns {Promise<Object>} nodemailer info or console log object
 */
async function sendMoliRequestEmail({ pdfBuffer, policyHolder, policyNumber, requestType, recipientEmail }) {
  const to = recipientEmail || 'support@ebl.beauty';
  const from = SMTP_USER;
  const subject = `MOLI Policy Service Request — ${policyNumber} — ${requestType}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f172a; color: #22c55e; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; }
    .detail-row { margin: 12px 0; }
    .detail-label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 16px; color: #0f172a; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ SOLVY Ecosystem™</h1>
    <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Policy Service Request Received</p>
  </div>
  <div class="content">
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge">${requestType}</span>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Policy Holder</div>
      <div class="detail-value">${policyHolder}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Policy Number</div>
      <div class="detail-value">${policyNumber}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Reference</div>
      <div class="detail-value">${policyNumber}-${requestType.replace(/\s+/g, '-').toUpperCase()}</div>
    </div>
    
    <div class="detail-row">
      <div class="detail-label">Submitted</div>
      <div class="detail-value">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
    </div>
    
    <p style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 6px; color: #92400e; font-size: 13px;">
      <strong>Action Required:</strong> Please review the attached PDF and submit to Mutual of Omaha via their policy service portal or fax. The signed electronic document is legally binding under ESIGN and UETA.
    </p>
    
    <div class="footer">
      <p>Product of SA Nathan LLC | SOLVY Ecosystem™</p>
      <p>This request was submitted electronically and is valid without physical signature.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  const mailOptions = {
    from: `"SOLVY Ecosystem™" <${from}>`,
    to,
    subject,
    html: htmlBody,
    attachments: [
      {
        filename: `MOLI-Request-${policyNumber}-${Date.now()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };
  
  const tp = getTransporter();
  
  if (!tp) {
    // Development mode: log instead of send
    console.log('══════════════════════════════════════════════════');
    console.log('[MOLI Email] DEVELOPMENT MODE — Email not sent');
    console.log('══════════════════════════════════════════════════');
    console.log('To:', to);
    console.log('From:', from);
    console.log('Subject:', subject);
    console.log('Attachment:', `${pdfBuffer.length} bytes PDF`);
    console.log('══════════════════════════════════════════════════');
    return { 
      messageId: 'dev-mode', 
      preview: true,
      to, 
      subject,
      pdfSize: pdfBuffer.length 
    };
  }
  
  try {
    const info = await tp.sendMail(mailOptions);
    console.log('[MOLI Email] Sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MOLI Email] Failed:', error.message);
    throw error;
  }
}

module.exports = { sendMoliRequestEmail };
