# SOLVY Card™ — Production Readiness Checklist

> Target: Unit.co underwriting approval → Card issuance (virtual + physical)  
> Launch: June 19, 2026 (Juneteenth)

---

## ✅ COMPLETED

| Item | Status | Notes |
|------|--------|-------|
| Apple Developer Account | ✅ Renewed | $99/year, active |
| Underwriting page | ✅ Live | https://solvy.cards/underwriting |
| iOS app landing | ✅ Live | https://solvy.cards/card-ios-app |
| Android app landing | ✅ Live | https://solvy.cards/card-android-app |
| Unit.co integration scaffold | ✅ Ready | JWT token generation, webhooks |
| Native app builds | ✅ Ready | Android Studio + Xcode projects |

---

## 🔴 CRITICAL — Must Complete Before Production

### 1. Google Play Developer Account

| | |
|---|---|
| **Cost** | $25 one-time fee |
| **URL** | https://play.google.com/console/signup |
| **Required for** | Publishing Android APK/AAB |
| **Time** | Instant approval (usually) |

**Action:** Sign up with SA Nathan LLC business account. Use `hello@ebl.beauty` as contact.

---

### 2. App Store Connect (iOS)

With your renewed Apple Developer account:

| Step | Action |
|------|--------|
| 1 | Log into https://appstoreconnect.apple.com |
| 2 | Create new app: **SOLVY Card** |
| 3 | Bundle ID: `com.solvy.card` |
| 4 | Primary language: English |
| 5 | SKU: `solvy-card-2026` |
| 6 | Category: Finance → Banking |

**Required assets:**
- App icon (1024×1024 PNG)
- Screenshots (iPhone + iPad)
- App description
- Keywords
- Support URL: https://ebl.beauty
- Marketing URL: https://solvy.cards

---

### 3. Google Play Console (Android)

| Step | Action |
|------|--------|
| 1 | Log into https://play.google.com/console |
| 2 | Create app: **SOLVY Card** |
| 3 | Default language: English |
| 4 | App type: App |
| 5 | Category: Finance |
| 6 | Set pricing: Free |

**Required assets:**
- App icon (512×512 PNG)
- Feature graphic (1024×500)
- Screenshots (phone + tablet)
- Short description (80 chars)
- Full description (4000 chars)
- Privacy policy URL: https://ebl.beauty/privacy

---

### 4. Card Designs (Submit to Unit.co)

Unit.co requires card artwork for both virtual and physical cards.

#### Virtual Card
| Spec | Requirement |
|------|-------------|
| Format | PNG or SVG |
| Size | 1200×760 px (recommended) |
| Safe zone | Keep text/logo within center 60% |
| Background | Can be gradient/image |

#### Physical Card
| Spec | Requirement |
|------|-------------|
| Format | AI or EPS (vector) |
| Size | Standard credit card (85.60×53.98 mm) |
| Bleed | 3mm on all sides |
| Embossing | Name + number + expiry (Unit.co handles) |
| Chip | EMV chip position (standard location) |
| Magstripe | Back of card (standard location) |

**SOLVY Card design elements:**
- Purple/blue/green gradient (brand colors)
- SOLVY logo
- Visa or Mastercard logo (Unit.co provides)
- EMV chip
- Contactless symbol (NFC)

**Action:** Create designs → submit to Unit.co partner dashboard → wait for approval.

---

### 5. Unit.co Card Program Configuration

Once underwriting is approved, configure in Unit.co dashboard:

| Setting | Value |
|---------|-------|
| Program name | SOLVY Card |
| Card network | Visa (or Mastercard) |
| Card types | Debit |
| Virtual cards | ✅ Enabled |
| Physical cards | ✅ Enabled |
| Instant issuance | ✅ Enabled (virtual) |
| PIN management | Unit.co handles |
| Fraud rules | Default + custom |
| Spending limits | Configurable per member |

---

### 6. Physical Card Fulfillment

Unit.co partners with card manufacturers for physical card production:

| Step | Action |
|------|--------|
| 1 | Unit.co provides card manufacturer options |
| 2 | Select manufacturer (based on cost/quality) |
| 3 | Submit physical card artwork |
| 4 | Order initial card stock (blank cards with EMV chips) |
| 5 | Configure shipping methods |
| 6 | Set member shipping address collection flow |

**Shipping options to offer members:**
- Standard mail (5-7 business days, free)
- Expedited (2-3 business days, $X fee)
- Express (1-2 business days, $X fee)

---

### 7. BSA/AML Compliance Documentation

Unit.co requires formal compliance docs:

| Document | Status | Action |
|----------|--------|--------|
| AML Policy | ⬜ | Draft or adopt Unit.co template |
| KYC Procedures | ⬜ | Document identity verification flow |
| Suspicious Activity Monitoring | ⬜ | Describe how you monitor transactions |
| OFAC Screening | ⬜ | Confirm you screen against sanctions lists |
| Record Retention Policy | ⬜ | 5-year retention standard |

**Shortcut:** Unit.co provides compliance templates for partners. Ask your partner success rep.

---

### 8. Privacy Policy & Terms of Service

Must be live before app store submission:

| Page | URL | Status |
|------|-----|--------|
| Privacy Policy | https://ebl.beauty/privacy | ⬜ Create |
| Terms of Service | https://ebl.beauty/terms | ⬜ Create |
| Cardholder Agreement | https://ebl.beauty/cardholder | ⬜ Create |

**Required content:**
- Data collection practices
- How member data is used
- Third-party sharing (Unit.co, Thread Bank)
- Member rights
- Cookie policy
- Contact information

---

### 9. Customer Support Setup

| Channel | Status | Setup |
|---------|--------|-------|
| Email | ✅ | support@ebl.beauty → team@ebl.beauty |
| Phone | ⬜ | Consider Google Voice or business line |
| In-app chat | ⬜ | Add to native app later |
| Help center | ⬜ | Create FAQ page |

**Required for Unit.co:**
- Support phone number (required for cardholder agreement)
- Support email (required)
- Hours of operation
- Escalation process for disputes/fraud

---

### 10. Dispute & Chargeback Handling

| Step | Action |
|------|--------|
| 1 | Member contacts support@ebl.beauty |
| 2 | Support team logs dispute in internal system |
| 3 | Submit dispute via Unit.co dashboard |
| 4 | Unit.co / Thread Bank handles arbitration |
| 5 | Notify member of outcome |

**Required:** Documented process + trained support staff.

---

## 🟡 NICE TO HAVE (Post-Launch)

| Item | Description |
|------|-------------|
| Apple Wallet support | Add virtual card to Apple Pay |
| Google Pay support | Add virtual card to Google Pay |
| Card freezing | Instant freeze/unfreeze in app |
| Transaction notifications | Push notifications for purchases |
| Spending insights | Monthly spending reports |
| Referral program | Member-get-member bonuses |

---

## 📋 SUMMARY: What to Do This Week

### Day 1-2: Accounts
- [ ] Create Google Play Developer account ($25)
- [ ] Set up App Store Connect app listing
- [ ] Set up Google Play Console app listing

### Day 3-4: Legal & Compliance
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Create Cardholder Agreement
- [ ] Request Unit.co compliance templates

### Day 5-7: Card & App Prep
- [ ] Design virtual card artwork
- [ ] Design physical card artwork
- [ ] Submit card designs to Unit.co
- [ ] Build release APK (Android)
- [ ] Build release IPA (iOS — requires Apple Developer)
- [ ] Submit apps for review (can be done before underwriting approval)

---

*SOLVY Ecosystem™ — Product of SA Nathan LLC*
