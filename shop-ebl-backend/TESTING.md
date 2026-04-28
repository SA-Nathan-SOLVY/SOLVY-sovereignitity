# Testing Guide for EBL Shop Payment Flow

## Overview

This guide covers testing the complete payment and contact flow for shop.ebl.beauty.

## Prerequisites

Before testing:

1. ✅ Backend API deployed to Hetzner VPS
2. ✅ MailCow configured with `noreply@ebl.beauty` and `eva@ebl.beauty`
3. ✅ Stripe account with test keys
4. ✅ Frontend deployed to shop.ebl.beauty
5. ✅ DNS configured for api.ebl.beauty

## Test Scenarios

### 1. Backend Health Check

**Test**: Verify backend API is running

```bash
curl https://api.ebl.beauty/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "EBL Backend API is running"
}
```

### 2. Contact Eva Endpoint

**Test**: Send contact request

```bash
curl -X POST https://api.ebl.beauty/api/contact-eva \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(929) 429-5994",
    "service": "Hair Services",
    "message": "Test contact request"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Contact request sent to Eva"
}
```

**Verify**: Check eva@ebl.beauty inbox for email

### 3. Create Payment Intent

**Test**: Create Stripe payment intent

```bash
curl -X POST https://api.ebl.beauty/api/create-payment-intent \
  -H "Content-Type": "application/json" \
  -d '{
    "amount": 50.00,
    "service": "Nail Services",
    "phone": "(929) 429-5994"
  }'
```

**Expected Response**:
```json
{
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx"
}
```

### 4. Frontend Form Validation

**Test**: Open shop.ebl.beauty and test form validation

**Steps**:
1. Navigate to https://shop.ebl.beauty
2. Scroll to payment section
3. Click "Tap SOLVY Card to Pay" without filling form
4. Verify error messages appear

**Expected**:
- ⚠️ "Please enter your phone number"
- ⚠️ "Please select a service"
- ⚠️ "Please enter a valid amount"

### 5. SOLVY Card Payment Flow (Primary)

**Test**: Complete payment using SOLVY Card button

**Steps**:
1. Fill in form:
   - Phone: (555) 123-4567
   - Service: Hair Services
   - Amount: 75.00
2. Click "📱 Tap SOLVY Card to Pay"
3. Wait for processing

**Expected**:
- Button shows "🔄 Processing..."
- Success message: "✅ Payment request sent! Eva will contact you at (555) 123-4567..."
- Form resets
- Email sent to eva@ebl.beauty

**Verify**:
- Check eva@ebl.beauty inbox for:
  * Contact request email
  * Payment success email

### 6. Alternative Card Payment Flow

**Test**: Pay with other card (Stripe)

**Steps**:
1. Fill in form (phone, service, amount)
2. Click "💳 Pay with Other Card"
3. Card input field appears
4. Enter test card: 4242 4242 4242 4242
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Submit payment

**Expected**:
- Payment processes through Stripe
- Success message appears
- Email sent to Eva
- Form resets

### 7. Appointment Booking

**Test**: Book appointment endpoint

```bash
curl -X POST https://api.ebl.beauty/api/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(929) 429-5994",
    "service": "Beauty Services",
    "preferredDate": "2025-11-25",
    "preferredTime": "2:00 PM"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Appointment request sent"
}
```

**Verify**: Check eva@ebl.beauty for appointment email

### 8. Error Handling

**Test**: Backend errors are handled gracefully

**Steps**:
1. Stop backend: `systemctl stop ebl-api`
2. Try to submit payment on frontend
3. Verify error message appears

**Expected**:
- "⚠️ Payment processing error. Please call (929) 429-5994..."

**Cleanup**:
- Restart backend: `systemctl start ebl-api`

### 9. CORS Security

**Test**: API only accepts requests from shop.ebl.beauty

```bash
curl -X POST https://api.ebl.beauty/api/contact-eva \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{"phone":"123","service":"test"}'
```

**Expected**: CORS error (request blocked)

### 10. Email Delivery

**Test**: All email types are delivered

**Checklist**:
- [ ] Contact request emails arrive at eva@ebl.beauty
- [ ] Appointment booking emails arrive
- [ ] Payment success emails arrive
- [ ] Emails are not in spam folder
- [ ] Emails have correct formatting

### 11. Stripe Integration

**Test**: Stripe dashboard shows transactions

**Steps**:
1. Complete test payment
2. Log into Stripe dashboard
3. Navigate to Payments

**Verify**:
- Payment intent created
- Metadata includes: service, phone, business name
- Amount is correct

### 12. Mobile Responsiveness

**Test**: Payment form works on mobile devices

**Steps**:
1. Open shop.ebl.beauty on mobile browser
2. Test form filling
3. Test payment buttons
4. Verify layout is responsive

**Expected**:
- All elements visible and clickable
- Form inputs work on mobile keyboard
- No horizontal scrolling

### 13. Load Testing

**Test**: API handles multiple concurrent requests

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Content-Type: application/json" \
  -p test-payload.json \
  https://api.ebl.beauty/api/health
```

**Expected**:
- All requests succeed
- Average response time < 500ms
- No 500 errors

### 14. SSL/HTTPS

**Test**: All connections are encrypted

**Steps**:
1. Visit https://shop.ebl.beauty
2. Check browser padlock icon
3. Verify SSL certificate is valid

**Expected**:
- Valid Let's Encrypt certificate
- No mixed content warnings
- HTTPS enforced

### 15. End-to-End User Journey

**Test**: Complete customer journey

**Steps**:
1. Customer visits shop.ebl.beauty
2. Browses services
3. Clicks "Pay Now" button
4. Fills in phone, service, amount
5. Taps SOLVY Card to pay
6. Receives confirmation
7. Eva receives email notification
8. Eva calls customer to confirm

**Expected**:
- Smooth user experience
- Clear messaging at each step
- Eva has all info needed to follow up

## Automated Testing (Future)

For continuous testing, consider:

1. **Postman Collection**: Import API endpoints
2. **Jest/Mocha**: Unit tests for backend
3. **Cypress**: E2E tests for frontend
4. **GitHub Actions**: CI/CD pipeline

## Troubleshooting

### Payment Not Processing

**Check**:
1. Backend logs: `journalctl -u ebl-api -f`
2. Nginx logs: `tail -f /var/log/nginx/api.ebl.beauty.error.log`
3. Stripe dashboard for errors
4. Browser console for JavaScript errors

### Emails Not Arriving

**Check**:
1. MailCow queue: `docker exec mailcowdockerized_postfix-mailcow_1 postqueue -p`
2. Spam folder
3. SMTP credentials in .env file
4. MailCow logs

### CORS Errors

**Check**:
1. Allowed origins in backend server.js
2. Nginx CORS headers
3. Browser console for specific error

## Success Criteria

All tests pass when:

- ✅ Backend API responds to health checks
- ✅ Payment intents created successfully
- ✅ Emails delivered to Eva
- ✅ Frontend form validation works
- ✅ SOLVY Card payment flow completes
- ✅ Alternative card payment works
- ✅ Error handling is graceful
- ✅ Mobile experience is smooth
- ✅ SSL certificates valid
- ✅ No console errors

## Support

For testing issues:
- Backend logs: `journalctl -u ebl-api -f`
- Contact: eva@ebl.beauty
