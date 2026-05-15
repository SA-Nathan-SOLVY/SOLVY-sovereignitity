/**
 * MOLI Policy Service Request API
 * SOLVY Ecosystem™
 * 
 * Endpoint: POST /api/moli/submit
 * Receives form data, generates PDF, emails via Mailcow SMTP
 */

const express = require('express');
const router = express.Router();
const { generateMoliPDF } = require('./pdf-generator');
const { sendMoliRequestEmail } = require('./email-service');

// ============================================================
// VALIDATION
// ============================================================

const VALID_REQUEST_TYPES = [
  'Policy Loan',
  'Dividend Disbursement', 
  'Beneficiary Change',
  'Address Change',
  'Online Payment'
];

function validateSubmission(data) {
  const errors = [];
  
  if (!data.policyHolder || typeof data.policyHolder !== 'string') {
    errors.push('Policy holder is required');
  }
  
  if (!data.policyNumber || typeof data.policyNumber !== 'string') {
    errors.push('Policy number is required');
  }
  
  if (!data.requestType || !VALID_REQUEST_TYPES.includes(data.requestType)) {
    errors.push(`Request type must be one of: ${VALID_REQUEST_TYPES.join(', ')}`);
  }
  
  // Amount required for loan, dividend, payment
  const amountRequired = ['Policy Loan', 'Dividend Disbursement', 'Online Payment'].includes(data.requestType);
  if (amountRequired && (!data.amount || parseFloat(data.amount) <= 0)) {
    errors.push('Valid amount is required for this request type');
  }
  
  // Banking info required for loan, dividend, payment
  const bankingRequired = ['Policy Loan', 'Dividend Disbursement', 'Online Payment'].includes(data.requestType);
  if (bankingRequired) {
    if (!data.bankRoutingNumber || !/^\d{9}$/.test(data.bankRoutingNumber)) {
      errors.push('Valid 9-digit routing number is required');
    }
    if (!data.bankAccountNumber || data.bankAccountNumber.length < 4) {
      errors.push('Valid account number is required');
    }
    if (data.bankAccountNumber !== data.confirmAccountNumber) {
      errors.push('Account numbers do not match');
    }
  }
  
  // MEC acknowledgment required for policy loans
  if (data.requestType === 'Policy Loan' && !data.mecAcknowledged) {
    errors.push('MEC tax disclosure must be acknowledged for policy loans');
  }
  
  // ESIGN required
  if (!data.signatureName || typeof data.signatureName !== 'string' || data.signatureName.trim().length < 2) {
    errors.push('Electronic signature name is required');
  }
  if (!data.esignConsent) {
    errors.push('ESIGN consent is required');
  }
  
  return errors;
}

// ============================================================
// ROUTES
// ============================================================

/**
 * POST /api/moli/submit
 * Submit a policy service request
 * 
 * Body: {
 *   policyHolder: string,
 *   policyNumber: string,
 *   availableBalance: string (optional),
 *   requestType: string,
 *   amount: string (optional),
 *   bankRoutingNumber: string (optional),
 *   bankAccountNumber: string (optional),
 *   confirmAccountNumber: string (optional),
 *   mecAcknowledged: boolean (optional),
 *   signatureName: string,
 *   signatureDate: string (optional),
 *   esignConsent: boolean,
 *   recipientEmail: string (optional)
 * }
 */
router.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('[MOLI API] Received submission:', {
      policyHolder: data.policyHolder,
      policyNumber: data.policyNumber,
      requestType: data.requestType,
    });
    
    // Validate
    const errors = validateSubmission(data);
    if (errors.length > 0) {
      console.log('[MOLI API] Validation failed:', errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
    }
    
    // Generate PDF
    console.log('[MOLI API] Generating PDF...');
    const pdfBuffer = await generateMoliPDF(data);
    console.log('[MOLI API] PDF generated:', pdfBuffer.length, 'bytes');
    
    // Send email
    console.log('[MOLI API] Sending email...');
    const emailInfo = await sendMoliRequestEmail({
      pdfBuffer,
      policyHolder: data.policyHolder,
      policyNumber: data.policyNumber,
      requestType: data.requestType,
      recipientEmail: data.recipientEmail,
    });
    
    // Generate reference number
    const reference = `${data.policyNumber}-${data.requestType.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString(36).slice(-4)}`;
    
    console.log('[MOLI API] Submission complete:', reference);
    
    res.json({
      success: true,
      reference,
      message: 'Policy service request submitted successfully',
      pdfGenerated: pdfBuffer.length,
      emailSent: !!emailInfo.messageId,
      emailId: emailInfo.messageId,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[MOLI API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      message: error.message,
    });
  }
});

/**
 * GET /api/moli/status
 * Health check for MOLI service
 */
router.get('/status', (req, res) => {
  res.json({
    service: 'MOLI Policy Service Request API',
    status: 'operational',
    version: '1.0.0',
    validRequestTypes: VALID_REQUEST_TYPES,
    smtpConfigured: !!(process.env.MAILCOW_SMTP_PASS || process.env.MAILCOW_PASS),
    smtpHost: process.env.MAILCOW_SMTP_HOST || process.env.MAILCOW_HOST || '46.62.235.95', // Direct VPS IP — mail.ebl.beauty is Cloudflare-proxied (SMTP blocked)
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/moli/test-pdf
 * Generate a test PDF without sending email (for testing)
 */
router.post('/test-pdf', async (req, res) => {
  try {
    const testData = {
      policyHolder: 'Sean Mayo',
      policyNumber: 'MOLI-12345678',
      availableBalance: '$12,450.00',
      requestType: 'Policy Loan',
      amount: '5000.00',
      bankRoutingNumber: '123456789',
      bankAccountNumber: '9876543210',
      confirmAccountNumber: '9876543210',
      mecAcknowledged: true,
      signatureName: 'Sean Mayo',
      signatureDate: new Date().toLocaleDateString('en-US'),
      esignConsent: true,
    };
    
    const pdfBuffer = await generateMoliPDF(testData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="moli-test.pdf"');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('[MOLI API] Test PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
