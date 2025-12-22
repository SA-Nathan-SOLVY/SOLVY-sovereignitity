import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { email, name, physicalCard } = req.body;

    // If physical card is not selected, we don't need payment
    if (!physicalCard) {
      return res.json({ url: null }); // Handle free signup on frontend
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SOLVY Physical Card',
              description: 'NFC-enabled contactless debit card',
              images: ['https://nitty.ebl.beauty/SOV-visa.png'], // Use absolute URL
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/request-card?success=true`,
      cancel_url: `${req.headers.origin}/request-card?canceled=true`,
      customer_email: email,
      metadata: {
        customer_name: name,
        type: 'physical_card_request'
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
