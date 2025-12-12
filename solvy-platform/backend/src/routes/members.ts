import { Router, Request, Response } from 'express'
import { memberStore, CreateMemberInput } from '../models/Member'
import Stripe from 'stripe'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

// Create a new member (signup)
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, firstName, lastName, phoneNumber, businessName, businessType } = req.body

    // Validate required fields
    if (!clerkId || !email || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clerkId', 'email', 'firstName', 'lastName']
      })
    }

    // Check if member already exists
    const existingMember = await memberStore.findByClerkId(clerkId)
    if (existingMember) {
      return res.status(409).json({
        error: 'Member already exists',
        member: existingMember
      })
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      phone: phoneNumber,
      metadata: {
        clerkId,
        businessName: businessName || '',
        businessType: businessType || 'personal'
      }
    })

    // Create member in database
    const memberInput: CreateMemberInput = {
      clerkId,
      email,
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessType
    }

    const member = await memberStore.create(memberInput)

    // Update member with Stripe customer ID
    await memberStore.update(member.id, {
      stripeCustomerId: stripeCustomer.id
    })

    const updatedMember = await memberStore.findById(member.id)

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      member: updatedMember
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    res.status(500).json({
      error: 'Signup failed',
      message: error.message
    })
  }
})

// Get member by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const member = await memberStore.findById(id)

    if (!member) {
      return res.status(404).json({
        error: 'Member not found'
      })
    }

    res.json({ member })
  } catch (error: any) {
    console.error('Get member error:', error)
    res.status(500).json({
      error: 'Failed to get member',
      message: error.message
    })
  }
})

// Get member by Clerk ID
router.get('/clerk/:clerkId', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params
    const member = await memberStore.findByClerkId(clerkId)

    if (!member) {
      return res.status(404).json({
        error: 'Member not found'
      })
    }

    res.json({ member })
  } catch (error: any) {
    console.error('Get member by Clerk ID error:', error)
    res.status(500).json({
      error: 'Failed to get member',
      message: error.message
    })
  }
})

// Update member
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const member = await memberStore.update(id, updates)

    if (!member) {
      return res.status(404).json({
        error: 'Member not found'
      })
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      member
    })
  } catch (error: any) {
    console.error('Update member error:', error)
    res.status(500).json({
      error: 'Failed to update member',
      message: error.message
    })
  }
})

// List all members (admin only - add auth middleware later)
router.get('/', async (req: Request, res: Response) => {
  try {
    const members = await memberStore.list()
    res.json({
      count: members.length,
      members
    })
  } catch (error: any) {
    console.error('List members error:', error)
    res.status(500).json({
      error: 'Failed to list members',
      message: error.message
    })
  }
})

export default router
