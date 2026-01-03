# EBL Shop Frontend - Payment App

Static HTML payment application for Evergreen Beauty Lounge with SOLVY Card integration.

## Features

- **SOLVY Card NFC Payment**: Tap-to-pay functionality for cooperative members
- **Service Booking**: Hair, Nail, Beauty services and Reign products
- **Phone Capture**: Connect customers with Eva for personalized service
- **Stripe Integration**: Secure alternative payment method
- **Responsive Design**: Mobile-optimized payment experience
- **Pilot Partnership**: EBL is the first SOLVY Card pilot partner

## Files

- `index.html` - Main payment page with integrated JavaScript
- `ebl-logo.png` - Evergreen Beauty Lounge logo
- `solvy-card.png` - SOLVY Card virtual card image
- `reign-pillars.png` - Reign Graphene technology benefits
- `reign-products.png` - Reign product demonstrations

## Deployment

### To Hetzner VPS

```bash
scp -i ~/.ssh/hetzner_key index.html root@46.62.235.95:/var/www/shop.ebl.beauty/
scp -i ~/.ssh/hetzner_key *.png root@46.62.235.95:/var/www/shop.ebl.beauty/
```

### To Vercel

```bash
vercel --prod
```

## Configuration

Update these values in `index.html`:

```javascript
const API_URL = 'https://api.ebl.beauty';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_your_key_here';
```

## API Integration

The frontend connects to backend API at `api.ebl.beauty`:

- `POST /api/create-payment-intent` - Create Stripe payment
- `POST /api/contact-eva` - Send customer phone to Eva
- `POST /api/payment-success` - Notify successful payment

## User Flow

1. Customer visits shop.ebl.beauty
2. Scrolls to payment section
3. Enters phone number, selects service, enters amount
4. Clicks "Tap SOLVY Card to Pay" (primary) or "Pay with Other Card" (alternative)
5. Payment processed via backend API
6. Eva receives email notification with customer info
7. Eva contacts customer to confirm appointment

## Design

- **Color Scheme**: Evergreen (#3a7a63) background with purple SOLVY branding
- **Logo Bookending**: EBL logos on both sides of header
- **Card Display**: SOLVY Card prominently shown in payment section
- **Stacked Images**: Reign product images displayed vertically for easy viewing
- **Video Links**: YouTube demonstrations linked (not embedded for performance)

## Security

- HTTPS enforced
- No sensitive data stored locally
- Stripe handles all payment card information
- CORS protection via backend API
- Form validation before submission

## Support

For issues or questions:
- Email: eva@ebl.beauty
- Phone/Text: (929) 429-5994
