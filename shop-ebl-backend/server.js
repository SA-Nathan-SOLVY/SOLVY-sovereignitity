const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://shop.ebl.beauty', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// MailCow SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAILCOW_HOST || 'mail.ebl.beauty',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILCOW_USER,
    pass: process.env.MAILCOW_PASS
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EBL Backend API is running' });
});

// Create Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, service, phone } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        service: service,
        phone: phone,
        business: 'Evergreen Beauty Lounge'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Contact Eva - Send phone number via email
app.post('/api/contact-eva', async (req, res) => {
  try {
    const { phone, service, message } = req.body;

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: 'eva@ebl.beauty',
      subject: `New Contact Request - ${service}`,
      html: `
        <h2>New Contact Request from shop.ebl.beauty</h2>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Service Requested:</strong> ${service}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <hr>
        <p><em>Sent from EBL Payment App</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Contact request sent to Eva' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Appointment booking notification
app.post('/api/book-appointment', async (req, res) => {
  try {
    const { phone, service, preferredDate, preferredTime } = req.body;

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: 'eva@ebl.beauty',
      subject: `New Appointment Request - ${service}`,
      html: `
        <h2>New Appointment Booking Request</h2>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate || 'Flexible'}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime || 'Flexible'}</p>
        <hr>
        <p><em>Please contact customer to confirm appointment.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Appointment request sent' });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payment success notification
app.post('/api/payment-success', async (req, res) => {
  try {
    const { phone, service, amount, paymentIntentId } = req.body;

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: 'eva@ebl.beauty',
      subject: `Payment Received - ${service}`,
      html: `
        <h2>Payment Successfully Processed</h2>
        <p><strong>Customer Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
        <hr>
        <p><em>Customer has completed payment via SOLVY Card payment app.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Payment notification sent' });
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`EBL Backend API running on port ${PORT}`);
});
