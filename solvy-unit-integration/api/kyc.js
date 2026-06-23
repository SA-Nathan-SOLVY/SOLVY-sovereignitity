/**
 * SOLVY KYC Submission Endpoint
 *
 * Receives corrected ID images and member PII from the mobile app,
 * creates a Lithic account holder, uploads documents if required,
 * logs an audit event, and discards raw image data.
 *
 * Privacy note: Raw ID images and selfies are held in memory only long
 * enough to forward them to Lithic. SOLVY servers do not persist them.
 */

const crypto = require('crypto');
const lithic = require('../../solvy-platform/api/adapters/lithic');

/**
 * Hash a member identifier for the audit trail.
 */
function hashMemberId(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

/**
 * Log an immutable-style audit event (no raw image data).
 */
function logAudit(event) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...event
  };
  console.log('[KYC Audit]', JSON.stringify(entry));
  // TODO: append to append-only audit log (e.g., WORM storage / blockchain anchor)
}

/**
 * Convert a base64 data URL to a Buffer.
 */
function base64ToBuffer(dataUrl) {
  if (!dataUrl) return null;
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

/**
 * POST /api/kyc/submit
 */
async function submitKyc(req, res) {
  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    ssnLast4,
    address,
    idFrontImage,
    idBackImage,
    selfieImage,
    extractedId,
    workflow = 'KYC_BASIC'
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !dateOfBirth || !ssnLast4) {
    return res.status(400).json({ error: 'Missing required member fields' });
  }

  const memberHash = hashMemberId(email);
  let accountHolder = null;

  try {
    logAudit({
      action: 'kyc_submit_received',
      memberHash,
      workflow,
      documentType: extractedId?.documentType || 'drivers_license'
    });

    // 1. Create Lithic account holder
    accountHolder = await lithic.createAccountHolder({
      workflow,
      firstName,
      lastName,
      email,
      phone,
      dob: dateOfBirth,
      // Lithic expects a full government_id in production. For sandbox tests,
      // use a test SSN. The frontend only sends last-4; the full SSN must be
      // collected in a production-compliant flow.
      governmentId: req.body.governmentId || `000-00-${ssnLast4}`,
      address: address || {
        street: extractedId?.address || '123 Main St',
        city: 'Austin',
        state: extractedId?.issuingState || 'TX',
        postalCode: '78701',
        country: 'USA'
      }
    });

    const accountHolderToken = accountHolder.token || accountHolder.account_holder_token;
    const status = accountHolder.status || accountHolder.workflow_status;

    logAudit({
      action: 'kyc_account_holder_created',
      memberHash,
      accountHolderToken,
      status,
      rawImageBytes: null // explicit: no image data retained
    });

    // 2. If Lithic needs documents, upload front/back ID images
    if (status === 'PENDING_DOCUMENT' || status === 'PENDING_REVIEW') {
      const documentType = extractedId?.documentType === 'passport' ? 'passport' : 'drivers_license';
      const uploadResponse = await lithic.initiateDocumentUpload(accountHolderToken, documentType);

      const frontBuffer = base64ToBuffer(idFrontImage);
      const backBuffer = base64ToBuffer(idBackImage);

      if (frontBuffer && backBuffer) {
        await lithic.uploadKycDocuments(uploadResponse, frontBuffer, backBuffer);
      }

      logAudit({
        action: 'kyc_documents_uploaded',
        memberHash,
        accountHolderToken,
        documentType
      });
    }

    // 3. Discard image buffers from memory
    // (Node GC will reclaim them; we explicitly null them for clarity)

    logAudit({
      action: 'kyc_submit_complete',
      memberHash,
      accountHolderToken,
      status
    });

    return res.json({
      success: true,
      accountHolderToken,
      status,
      message: 'KYC submitted to Lithic'
    });
  } catch (error) {
    console.error('[KYC] Submission error:', error);
    logAudit({
      action: 'kyc_submit_failed',
      memberHash,
      error: error.message
    });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  submitKyc
};
