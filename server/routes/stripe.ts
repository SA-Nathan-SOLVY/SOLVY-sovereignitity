import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Make Stripe optional - only initialize if key exists
const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeKey && stripeKey !== 'sk_test_YOUR_KEY_HERE') {
  stripe = new Stripe(stripeKey);
}

router.post('/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment processing not configured' });
  }
  
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
