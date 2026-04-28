/**
 * Unit.co Webhook Handler
 * Processes all Unit webhook events
 */

const crypto = require('crypto');

// Import your database module (replace with actual implementation)
const db = {
  members: {
    update: async (query, update) => {
      console.log('Updating member:', query, update);
      // TODO: Implement actual database update
    },
    findByUnitId: async (unitId) => {
      // TODO: Implement database query
      return { email: 'member@example.com' };
    }
  },
  distributions: {
    create: async (data) => {
      console.log('Creating distribution record:', data);
      // TODO: Implement database insert
    }
  }
};

/**
 * Verify webhook signature from Unit
 * @param {Object} req - Express request object
 * @returns {boolean} Signature valid
 */
const verifySignature = (req) => {
  const signature = req.headers['x-unit-signature'];
  const secret = process.env.SOLVY_WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    console.warn('Missing signature or secret');
    return false;
  }
  
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (e) {
    return false;
  }
};

/**
 * Handle application.approved webhook
 * Creates account and card for approved member
 */
const handleApplicationApproved = async (application) => {
  console.log('✅ Application approved:', application.id);
  
  // TODO: Implement account and card creation
  // This would call your account.js and card.js functions
  
  // Update member record
  await db.members.update(
    { unitApplicationId: application.id },
    {
      status: 'approved',
      approvedAt: new Date(),
      unitCustomerId: application.relationships?.customer?.data?.id
    }
  );
  
  // Send welcome email via AgentMail
  try {
    const { sendWelcomeEmail } = require('../email/agentmail-service');
    const member = await db.members.findByUnitId(application.relationships?.customer?.data?.id);
    if (member?.email) {
      await sendWelcomeEmail(member.email, { firstName: member.firstName });
      console.log('📧 Welcome email sent via AgentMail to:', member.email);
    }
  } catch (emailError) {
    console.error('📧 Welcome email failed:', emailError.message);
    // Don't fail the webhook for email errors
  }
};

/**
 * Handle application.denied webhook
 */
const handleApplicationDenied = async (application) => {
  console.log('❌ Application denied:', application.id);
  
  await db.members.update(
    { unitApplicationId: application.id },
    { status: 'denied', deniedAt: new Date() }
  );
  
  // TODO: Send denial notification with alternative options
};

/**
 * Handle account.created webhook
 */
const handleAccountCreated = async (account) => {
  console.log('💰 Account created:', account.id);
  
  await db.members.update(
    { unitCustomerId: account.relationships?.customer?.data?.id },
    { unitAccountId: account.id }
  );
};

/**
 * Handle card.activated webhook
 */
const handleCardActivated = async (card) => {
  console.log('💳 Card activated:', card.id);
  
  await db.members.update(
    { unitAccountId: card.relationships?.account?.data?.id },
    {
      unitCardId: card.id,
      cardLastFour: card.attributes?.lastFourDigits,
      cardStatus: 'active',
      cardActivatedAt: new Date()
    }
  );
};

/**
 * Handle transaction.created webhook
 * This is where the 70/20/10 magic happens!
 */
const handleTransactionCreated = async (transaction) => {
  // Only process card transactions
  if (transaction.type !== 'cardTransaction') {
    return;
  }
  
  const amount = transaction.attributes?.amount;
  const interchange = transaction.attributes?.interchange || 0;
  
  console.log('💳 Transaction:', transaction.id, `$${amount}`, `Interchange: $${interchange}`);
  
  if (interchange > 0) {
    // Calculate 70/20/10 distribution
    const distribution = {
      transactionId: transaction.id,
      accountId: transaction.relationships?.account?.data?.id,
      grossAmount: amount,
      interchangeAmount: interchange,
      memberDividend: Math.round(interchange * 0.70 * 100) / 100,  // 70%
      communityPool: Math.round(interchange * 0.20 * 100) / 100,    // 20%
      operations: Math.round(interchange * 0.10 * 100) / 100,       // 10%
      processedAt: new Date()
    };
    
    await db.distributions.create(distribution);
    
    console.log('💰 Interchange captured:', distribution);
  }
};

/**
 * Main webhook handler
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const handleWebhook = async (req, res) => {
  // Verify signature
  if (!verifySignature(req)) {
    console.error('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { data, type } = req.body;
  
  console.log('📨 Webhook received:', type, data?.id);
  
  try {
    switch (type) {
      case 'application.approved':
        await handleApplicationApproved(data);
        break;
        
      case 'application.denied':
        await handleApplicationDenied(data);
        break;
        
      case 'account.created':
        await handleAccountCreated(data);
        break;
        
      case 'card.activated':
        await handleCardActivated(data);
        break;
        
      case 'transaction.created':
        await handleTransactionCreated(data);
        break;
        
      default:
        console.log('ℹ️ Unhandled webhook type:', type);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};

module.exports = {
  handleWebhook,
  verifySignature
};
