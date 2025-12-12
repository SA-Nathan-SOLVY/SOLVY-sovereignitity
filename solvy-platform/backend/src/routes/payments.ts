import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { memberStore } from '../models/Member'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

// Create payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd', memberId, description } = req.body

    // Validate required fields
    if (!amount || !memberId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'memberId']
      })
    }

    // Get member to find Stripe customer ID
    const member = await memberStore.findById(memberId)
    if (!member) {
      return res.status(404).json({
        error: 'Member not found'
      })
    }

    if (!member.stripeCustomerId) {
      return res.status(400).json({
        error: 'Member does not have a Stripe customer ID'
      })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: member.stripeCustomerId,
      description: description || 'SOLVY Card payment',
      metadata: {
        memberId: member.id,
        memberEmail: member.email,
        memberName: `${member.firstName} ${member.lastName}`
      }
    })

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency
    })
  } catch (error: any) {
    console.error('Create payment intent error:', error)
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    })
  }
})

// Get payment intent status
router.get('/payment-intent/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const paymentIntent = await stripe.paymentIntents.retrieve(id)

    res.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000),
      metadata: paymentIntent.metadata
    })
  } catch (error: any) {
    console.error('Get payment intent error:', error)
    res.status(500).json({
      error: 'Failed to get payment intent',
      message: error.message
    })
  }
})

// List payments for a member
router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params
    const member = await memberStore.findById(memberId)

    if (!member) {
      return res.status(404).json({
        error: 'Member not found'
      })
    }

    if (!member.stripeCustomerId) {
      return res.json({
        payments: []
      })
    }

    // Get payment intents for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: member.stripeCustomerId,
      limit: 100
    })

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      created: new Date(pi.created * 1000),
      description: pi.description,
      metadata: pi.metadata
    }))

    res.json({
      count: payments.length,
      payments
    })
  } catch (error: any) {
    console.error('List payments error:', error)
    res.status(500).json({
      error: 'Failed to list payments',
      message: error.message
    })
  }
})

// Refund a payment
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Missing required field: paymentIntentId'
      })
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId
    }

    // If partial refund amount specified
    if (amount) {
      refundParams.amount = Math.round(amount * 100)
    }

    const refund = await stripe.refunds.create(refundParams)

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        created: new Date(refund.created * 1000)
      }
    })
  } catch (error: any) {
    console.error('Refund error:', error)
    res.status(500).json({
      error: 'Failed to process refund',
      message: error.message
    })
  }
})

export default router
