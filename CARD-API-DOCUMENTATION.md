# SOLVY Card API Documentation

**Version:** 1.0  
**Last Updated:** December 6, 2025

---

## Overview

The SOLVY Card API allows members to programmatically generate customized payment card designs with their business branding while maintaining SOLVY's cooperative infrastructure.

---

## Card Customization Parameters

### **Required Parameters**

```json
{
  "businessName": "string (max 30 characters)",
  "holderName": "string (max 25 characters)",
  "memberLogo": "string (URL or base64)",
  "network": "mastercard | visa"
}
```

### **Optional Parameters**

```json
{
  "backgroundColor": "string (gradient CSS or hex)",
  "layout": "horizontal | vertical",
  "cardNumber": "string (last 4 digits)",
  "customWatermark": "boolean (default: false)"
}
```

---

## Background Color Options

### **Predefined Gradients**

```javascript
const SOLVY_COLOR_PALETTES = {
  purple: "linear-gradient(135deg, #a855f7, #7c3aed, #6d28d9)",
  blue: "linear-gradient(135deg, #3b82f6, #2563eb, #1e40af)",
  green: "linear-gradient(135deg, #10b981, #059669, #047857)",
  orange: "linear-gradient(135deg, #f97316, #ea580c, #c2410c)",
  pink: "linear-gradient(135deg, #ec4899, #db2777, #be185d)",
  black: "linear-gradient(135deg, #1f2937, #111827, #000000)",
  teal: "linear-gradient(135deg, #14b8a6, #0d9488, #0f766e)",
  red: "linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
};
```

### **Custom Gradients**

Members can provide custom CSS gradients:

```javascript
{
  "backgroundColor": "linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2, #YOUR_COLOR_3)"
}
```

**Requirements:**
- Must be a valid CSS gradient
- Minimum 2 colors, maximum 5 colors
- Must maintain sufficient contrast for white text (WCAG AA)

---

## Layout Specifications

### **Horizontal Layout (Default)**

```javascript
{
  "layout": "horizontal",
  "dimensions": {
    "width": "420px",
    "height": "265px",
    "aspectRatio": "1.586:1"
  }
}
```

**Use Cases:**
- Traditional wallet storage
- POS terminal compatibility
- Physical card printing
- Standard credit card format

### **Vertical Layout**

```javascript
{
  "layout": "vertical",
  "dimensions": {
    "width": "265px",
    "height": "420px",
    "aspectRatio": "1:1.586"
  }
}
```

**Use Cases:**
- Mobile wallet display
- Digital-first applications
- Modern aesthetic
- App integration

---

## API Endpoints

### **1. Generate Card Design**

**Endpoint:** `POST /api/v1/card/generate`

**Request:**
```json
{
  "businessName": "Evergreen Beauty Lounge",
  "holderName": "Evergreen Nathan",
  "memberLogo": "https://example.com/logo.png",
  "network": "mastercard",
  "backgroundColor": "purple",
  "layout": "horizontal"
}
```

**Response:**
```json
{
  "success": true,
  "cardId": "card_abc123xyz",
  "imageUrl": "https://cdn.solvy.card/cards/card_abc123xyz.png",
  "thumbnailUrl": "https://cdn.solvy.card/cards/card_abc123xyz_thumb.png",
  "config": {
    "businessName": "Evergreen Beauty Lounge",
    "holderName": "Evergreen Nathan",
    "network": "mastercard",
    "layout": "horizontal",
    "color": "purple"
  },
  "createdAt": "2025-12-06T22:00:00Z"
}
```

---

### **2. Get Card Variations**

**Endpoint:** `GET /api/v1/card/{cardId}/variations`

**Query Parameters:**
- `layout` - Filter by layout (horizontal/vertical)
- `network` - Filter by network (mastercard/visa)
- `color` - Filter by color palette

**Response:**
```json
{
  "success": true,
  "cardId": "card_abc123xyz",
  "variations": [
    {
      "variationId": "var_001",
      "layout": "horizontal",
      "network": "mastercard",
      "color": "purple",
      "imageUrl": "https://cdn.solvy.card/cards/var_001.png"
    },
    {
      "variationId": "var_002",
      "layout": "horizontal",
      "network": "visa",
      "color": "purple",
      "imageUrl": "https://cdn.solvy.card/cards/var_002.png"
    },
    {
      "variationId": "var_003",
      "layout": "vertical",
      "network": "mastercard",
      "color": "purple",
      "imageUrl": "https://cdn.solvy.card/cards/var_003.png"
    }
  ]
}
```

---

### **3. Update Card Design**

**Endpoint:** `PATCH /api/v1/card/{cardId}`

**Request:**
```json
{
  "backgroundColor": "blue",
  "layout": "vertical"
}
```

**Response:**
```json
{
  "success": true,
  "cardId": "card_abc123xyz",
  "imageUrl": "https://cdn.solvy.card/cards/card_abc123xyz_v2.png",
  "updatedAt": "2025-12-06T22:30:00Z"
}
```

---

## Code Examples

### **JavaScript/Node.js**

```javascript
const SOLVY = require('solvy-card-sdk');

const client = new SOLVY.CardClient({
  apiKey: process.env.SOLVY_API_KEY
});

// Generate card
const card = await client.cards.create({
  businessName: 'Evergreen Beauty Lounge',
  holderName: 'Evergreen Nathan',
  memberLogo: 'https://example.com/ebl-logo.png',
  network: 'mastercard',
  backgroundColor: 'purple',
  layout: 'horizontal'
});

console.log('Card generated:', card.imageUrl);

// Get all variations
const variations = await client.cards.getVariations(card.id);
console.log('Variations:', variations.length);

// Update card
const updated = await client.cards.update(card.id, {
  backgroundColor: 'blue',
  layout: 'vertical'
});
```

---

### **Python**

```python
from solvy_card import CardClient

client = CardClient(api_key=os.environ['SOLVY_API_KEY'])

# Generate card
card = client.cards.create(
    business_name='Evergreen Beauty Lounge',
    holder_name='Evergreen Nathan',
    member_logo='https://example.com/ebl-logo.png',
    network='mastercard',
    background_color='purple',
    layout='horizontal'
)

print(f'Card generated: {card.image_url}')

# Get variations
variations = client.cards.get_variations(card.id)
print(f'Variations: {len(variations)}')

# Update card
updated = client.cards.update(
    card.id,
    background_color='blue',
    layout='vertical'
)
```

---

### **cURL**

```bash
# Generate card
curl -X POST https://api.solvy.card/v1/card/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Evergreen Beauty Lounge",
    "holderName": "Evergreen Nathan",
    "memberLogo": "https://example.com/logo.png",
    "network": "mastercard",
    "backgroundColor": "purple",
    "layout": "horizontal"
  }'

# Get variations
curl -X GET https://api.solvy.card/v1/card/CARD_ID/variations \
  -H "Authorization: Bearer YOUR_API_KEY"

# Update card
curl -X PATCH https://api.solvy.card/v1/card/CARD_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "backgroundColor": "blue",
    "layout": "vertical"
  }'
```

---

## CSS Implementation

### **Horizontal Card**

```css
.solvy-card-horizontal {
  width: 420px;
  height: 265px;
  background: linear-gradient(135deg, #a855f7, #7c3aed, #6d28d9);
  border-radius: 16px;
  position: relative;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.card-logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 60px;
  height: 60px;
}

.card-nfc {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
}

.card-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8rem;
  opacity: 0.15;
}

.card-business-name {
  position: absolute;
  bottom: 5.5rem;
  left: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.card-holder-name {
  position: absolute;
  bottom: 3.5rem;
  left: 1.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.card-network-logo {
  position: absolute;
  bottom: 3.5rem;
  right: 1.5rem;
}

.card-tagline {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.card-number {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
```

### **Vertical Card**

```css
.solvy-card-vertical {
  width: 265px;
  height: 420px;
  background: linear-gradient(135deg, #a855f7, #7c3aed, #6d28d9);
  border-radius: 16px;
  position: relative;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

/* Same positioning rules, adjusted for vertical layout */
.card-business-name {
  bottom: 8rem;
  font-size: 1.3rem;
}

.card-holder-name {
  bottom: 5.5rem;
}

.card-network-logo {
  bottom: 3.5rem;
  right: 1.5rem;
}
```

---

## Member Logo Requirements

### **Technical Specifications**

```javascript
{
  "format": "PNG (preferred) or JPG",
  "resolution": {
    "minimum": "500x500px",
    "recommended": "1000x1000px"
  },
  "fileSize": "< 2MB",
  "background": "Transparent (PNG) or solid color",
  "aspectRatio": "1:1 (square) preferred"
}
```

### **Design Guidelines**

- Simple, recognizable logo
- High contrast with card background
- Avoid overly detailed designs
- Test at small sizes (60x60px display)

---

## Validation Rules

### **Business Name**
```javascript
{
  "maxLength": 30,
  "minLength": 3,
  "allowedCharacters": "A-Z, a-z, 0-9, spaces, &, -, .",
  "example": "Evergreen Beauty Lounge"
}
```

### **Cardholder Name**
```javascript
{
  "maxLength": 25,
  "minLength": 3,
  "allowedCharacters": "A-Z, a-z, spaces, -, .",
  "example": "Evergreen Nathan"
}
```

### **Card Number**
```javascript
{
  "format": "•••• XXXX",
  "lastFourDigits": "0000-9999",
  "display": "Masked for privacy"
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid parameters | Required fields missing or invalid |
| 401 | Unauthorized | Invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Card not found | Card ID does not exist |
| 413 | File too large | Logo file exceeds 2MB |
| 422 | Validation failed | Parameters don't meet requirements |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Server error | Internal server error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Generate Card | 10 requests | 1 minute |
| Get Variations | 100 requests | 1 minute |
| Update Card | 20 requests | 1 minute |

---

## Webhooks

### **Card Generated**

```json
{
  "event": "card.generated",
  "cardId": "card_abc123xyz",
  "memberId": "member_123",
  "timestamp": "2025-12-06T22:00:00Z",
  "data": {
    "imageUrl": "https://cdn.solvy.card/cards/card_abc123xyz.png",
    "config": { ... }
  }
}
```

### **Card Updated**

```json
{
  "event": "card.updated",
  "cardId": "card_abc123xyz",
  "memberId": "member_123",
  "timestamp": "2025-12-06T22:30:00Z",
  "changes": {
    "backgroundColor": "blue",
    "layout": "vertical"
  }
}
```

---

## Best Practices

### **1. Caching**
- Cache generated card images
- Use CDN for distribution
- Set appropriate cache headers

### **2. Optimization**
- Compress logo images before upload
- Use WebP format when possible
- Lazy load card images

### **3. Accessibility**
- Provide alt text for card images
- Ensure sufficient color contrast
- Support screen readers

### **4. Security**
- Never expose full card numbers
- Use HTTPS for all API calls
- Validate all user inputs
- Sanitize member-provided data

---

## Support

**API Documentation:** https://docs.solvy.card/api  
**SDK Repository:** https://github.com/SOLVY-card/sdk  
**Support Email:** api@solvy.card  
**Status Page:** https://status.solvy.card

---

**🎉 Build amazing member experiences with SOLVY Card API!**

*Your members, your brand, our infrastructure.*
