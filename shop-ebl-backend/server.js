require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.ALLOWED_ORIGINS || 'https://shop.ebl.beauty').split(',').map(o => o.trim());
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
});
app.use('/api/', apiLimiter);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// MailCow SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAILCOW_HOST || '46.62.235.95', // Direct VPS IP — mail.ebl.beauty is Cloudflare-proxied (SMTP blocked)
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILCOW_USER,
    pass: process.env.MAILCOW_PASS
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

// HTML escape helper to prevent XSS in emails
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EBL Backend API is running' });
});

// Create Stripe Payment Intent
app.post('/api/create-payment-intent', strictLimiter, async (req, res) => {
  try {
    const { amount, service, phone } = req.body;

    // Input validation
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > 10000) {
      return res.status(400).json({ error: 'Invalid amount (must be between $0.01 and $10,000)' });
    }
    if (!service || typeof service !== 'string' || service.length > 200) {
      return res.status(400).json({ error: 'Invalid service' });
    }
    if (phone && (typeof phone !== 'string' || phone.length > 50)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        service: escapeHtml(service),
        phone: phone ? escapeHtml(phone) : '',
        business: 'Evergreen Beauty Lounge'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Contact Eva - Send phone number via email
app.post('/api/contact-eva', strictLimiter, async (req, res) => {
  try {
    const { phone, service, message } = req.body;

    // Validation
    if (!phone || typeof phone !== 'string' || phone.length > 50) {
      return res.status(400).json({ error: 'Phone number is required (max 50 chars)' });
    }
    if (!service || typeof service !== 'string' || service.length > 200) {
      return res.status(400).json({ error: 'Service is required (max 200 chars)' });
    }
    if (message && (typeof message !== 'string' || message.length > 2000)) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: process.env.EVA_EMAIL || 'eva@ebl.beauty',
      subject: `New Contact Request - ${escapeHtml(service).substring(0, 200)}`,
      html: `
        <h2>New Contact Request from shop.ebl.beauty</h2>
        <p><strong>Phone Number:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service Requested:</strong> ${escapeHtml(service)}</p>
        ${message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
        <hr>
        <p><em>Sent from EBL Payment App</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Contact request sent to Eva' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send contact request' });
  }
});

// Appointment booking notification
app.post('/api/book-appointment', strictLimiter, async (req, res) => {
  try {
    const { phone, service, preferredDate, preferredTime } = req.body;

    // Validation
    if (!phone || typeof phone !== 'string' || phone.length > 50) {
      return res.status(400).json({ error: 'Phone number is required (max 50 chars)' });
    }
    if (!service || typeof service !== 'string' || service.length > 200) {
      return res.status(400).json({ error: 'Service is required (max 200 chars)' });
    }
    if (preferredDate && (typeof preferredDate !== 'string' || preferredDate.length > 50)) {
      return res.status(400).json({ error: 'Invalid preferred date' });
    }
    if (preferredTime && (typeof preferredTime !== 'string' || preferredTime.length > 50)) {
      return res.status(400).json({ error: 'Invalid preferred time' });
    }

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: process.env.EVA_EMAIL || 'eva@ebl.beauty',
      subject: `New Appointment Request - ${escapeHtml(service).substring(0, 200)}`,
      html: `
        <h2>New Appointment Booking Request</h2>
        <p><strong>Phone Number:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Preferred Date:</strong> ${escapeHtml(preferredDate || 'Flexible')}</p>
        <p><strong>Preferred Time:</strong> ${escapeHtml(preferredTime || 'Flexible')}</p>
        <hr>
        <p><em>Please contact customer to confirm appointment.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Appointment request sent' });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: 'Failed to send appointment request' });
  }
});

// Payment success notification
app.post('/api/payment-success', strictLimiter, async (req, res) => {
  try {
    const { phone, service, amount, paymentIntentId } = req.body;

    // Validation
    if (!phone || typeof phone !== 'string' || phone.length > 50) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!service || typeof service !== 'string' || service.length > 200) {
      return res.status(400).json({ error: 'Service is required' });
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0 || amount > 10000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || paymentIntentId.length > 100) {
      return res.status(400).json({ error: 'Invalid payment intent ID' });
    }

    const mailOptions = {
      from: process.env.MAILCOW_USER,
      to: process.env.EVA_EMAIL || 'eva@ebl.beauty',
      subject: `Payment Received - ${escapeHtml(service).substring(0, 200)}`,
      html: `
        <h2>Payment Successfully Processed</h2>
        <p><strong>Customer Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Payment ID:</strong> ${escapeHtml(paymentIntentId)}</p>
        <hr>
        <p><em>Customer has completed payment via SOLVY Card payment app.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Payment notification sent' });
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({ error: 'Failed to send payment notification' });
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
