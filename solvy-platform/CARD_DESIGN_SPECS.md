# SOLVY Card™ — Design Specifications

> For: Unit.co Card Program + Card Manufacturer  
> Card Networks: Visa (primary), Mastercard (secondary)  
> Card Types: Virtual + Physical

---

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| SOLVY Purple | `#a855f7` | Primary brand accent |
| SOLVY Blue | `#3b82f6` | Secondary gradient |
| SOLVY Green | `#22c55e` | CTA, highlights, dividends |
| Dark Background | `#0f172a` | App background, card base |
| Light Text | `#ffffff` | Primary text on dark |

**Gradient (Signature):** `linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)`

---

## Virtual Card

### Dimensions
- **Width:** 1200px
- **Height:** 760px
- **Aspect Ratio:** 1.579:1 (standard card ratio)
- **Format:** PNG (transparent background optional) or SVG

### Layout Zones

```
┌─────────────────────────────────────────┐
│  [SOLVY Logo]              [Contactless] │  ← Top 15%
│                                         │
│                                         │
│  •••• •••• •••• [LAST4]                │  ← Middle 40%
│                                         │
│  CARDHOLDER NAME          MM/YY        │  ← Bottom 25%
│                                         │
│  [Visa Logo]            [SOLVY Badge]  │  ← Bottom 10%
└─────────────────────────────────────────┘
```

### Design Elements

| Element | Spec |
|---------|------|
| Background | Gradient (purple → blue → green) or dark solid with subtle pattern |
| Card Number | White, monospace font, masked as `•••• •••• •••• [LAST4]` |
| Cardholder Name | White, sans-serif, UPPERCASE |
| Expiry | White, sans-serif, `MM/YY` format |
| SOLVY Logo | Top-left, white or light version, ~80px height |
| Visa/Mastercard Logo | Bottom-right, full color, ~60px height |
| Contactless Symbol | Top-right, white, ~40px |
| Chip | Not applicable (virtual card) |
| SOLVY Badge | Bottom-left, "Cooperative Member" or member ID |

### Typography
- **Card Number:** `font-family: monospace; font-size: 48px; letter-spacing: 4px;`
- **Name:** `font-family: system-ui; font-size: 28px; text-transform: uppercase;`
- **Expiry:** `font-family: system-ui; font-size: 24px;`

---

## Physical Card

### Dimensions (Standard CR80)
- **Width:** 85.60mm (3.370")
- **Height:** 53.98mm (2.125")
- **Corner Radius:** 3.18mm (0.125")
- **Thickness:** 0.76mm (30mil standard)

### Bleed Area
- **Bleed:** 3mm on all sides
- **Safe Zone:** Keep all text/logos 3mm inside the cut line
- **Trim Size:** 85.60mm × 53.98mm

### Front Layout

```
┌─────────────────────────────────────────┐  ← 3mm bleed top
│  [SOLVY Logo]              [Contactless] │
│  ┌─────┐                                │
│  │ EMV │                                │
│  │ CHIP│                                │
│  └─────┘                                │
│                                         │
│  •••• •••• •••• ••••                    │
│                                         │
│  CARDHOLDER NAME          MM/YY        │
│                                         │
│  [Visa Logo]            [SOLVY Badge]  │
└─────────────────────────────────────────┘  ← 3mm bleed bottom
```

### Back Layout

```
┌─────────────────────────────────────────┐
│  [Magstripe] ← black stripe, 12.7mm     │
│                                         │
│  Authorize  Signature: _______________  │
│                                         │
│  Customer Service: [PHONE]              │
│  support@ebl.beauty                     │
│                                         │
│  Issued by Thread Bank, Member FDIC     │
│  solvy.cards | Not valid unless signed  │
│  [CVV]                                  │
└─────────────────────────────────────────┘
```

### Required Elements (Physical)

| Element | Position | Notes |
|---------|----------|-------|
| EMV Chip | Front, left side | Standard ISO 7816 position |
| Magstripe | Back, top | ISO 7811 Track 1 + 2 |
| Card Number (embossed) | Front, center | Raised, OCR-B font |
| Name (embossed) | Front, bottom-left | Raised, UPPERCASE |
| Expiry (embossed) | Front, bottom-right | Raised, `MM/YY` |
| CVV2 | Back, signature panel | Printed, not embossed |
| Contactless | Front, top-right | NFC symbol |
| Visa/Mastercard Hologram | Front, bottom-right | Provided by network |
| Issuer Text | Back, bottom | "Issued by Thread Bank, Member FDIC" |

### Card Material
- **Base:** PVC core, 30mil
- **Finish:** Matte or satin (recommended — premium feel, reduces fingerprint smudging)
- **Optional:** Metallic foil accent on logo

---

## Card Artwork Checklist

### For Unit.co Submission
- [ ] Virtual card PNG (1200×760px, transparent or gradient background)
- [ ] Physical card front PDF/X-1a (with 3mm bleed)
- [ ] Physical card back PDF/X-1a (with 3mm bleed)
- [ ] All fonts outlined or embedded
- [ ] Color mode: CMYK for physical, RGB for virtual
- [ ] Minimum 300 DPI for physical

### Branding Compliance
- [ ] Visa Brand Guidelines followed (if Visa)
- [ ] Mastercard Brand Guidelines followed (if Mastercard)
- [ ] SOLVY™ trademark symbol present
- [ ] "Cooperative Member" or membership language included
- [ ] Thread Bank attribution on physical card

---

## Delivery Packaging

### Card Mailer Envelope
- **Size:** Standard #10 or custom card mailer
- **Design:** SOLVY branded, minimal, secure
- **Contents:**
  - Physical card in sealed pouch
  - Activation instructions
  - Cardholder agreement summary
  - Support contact info

### Digital Card Delivery
- In-app notification: "Your virtual card is ready!"
- Card displayed with "Tap to reveal" for security
- Instant activation button

---

## Reference Assets

| Asset | Location |
|-------|----------|
| SOLVY Logo | `/SolvyLogo-1024.png` |
| SOV Card Image | `/SOV-visa.png`, `/SOV.png` |
| Brand Colors | `#22c55e`, `#a855f7`, `#3b82f6`, `#0f172a` |

---

*SOLVY Ecosystem™ — Product of SA Nathan LLC*
