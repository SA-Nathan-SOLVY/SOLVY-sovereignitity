## ✅ Kimi Prompt – SOLVY Welcome / Landing Page

Copy and paste this directly into Kimi Code (VS Codium) or the Kimi chat interface.

---

```text
Kimi, I need a beautiful, conversion-focused welcome/landing page for my SOLVY Ecosystem™ cooperative neobank. This is the first page prospective members see. It must explain what SOLVY is, why it matters, and how to join — while linking existing members to the MAN portal.

Create a single, self-contained HTML file called `index.html` (or `welcome.html`) with the following sections:

## 1. Hero Section

- Large headline: "SOLVY Ecosystem™ — Banking Built for Us"
- Subheadline: "A cooperative neobank where your spending builds generational wealth. No shareholders. Just members."
- Two call-to-action buttons:
  - Primary: "Join the Cooperative" (links to onboarding)
  - Secondary: "Member Login →" (links to MAN portal / banking dashboard)
- Background: Dark blue (#0f172a) with subtle gradient or pattern
- Include the SOLVY crown logo (👑 SOLVY)

## 2. What Is SOLVY? (3-Column Feature Grid)

Explain the cooperative in three simple cards:

**Card 1: Member Owned**
- Icon: 👑
- "SOLVY is a cooperative, not a corporation. Every member is an owner. You vote. You profit. You decide."

**Card 2: Wealth Building**
- Icon: 📈
- "Every swipe of your SOLVY Card generates interchange revenue. 70% goes back to members as patronage dividends. Your spending builds collective wealth."

**Card 3: Data Sovereignty**
- Icon: 🔒
- "Your transaction history stays on your device — not our servers. We built a system where we cannot access your individual data, even if we wanted to."

## 3. The 70/20/10 Model (Visual Breakdown)

Show how interchange revenue is distributed:

```
70% → Member Pool (patronage dividends)
20% → Community Development (cooperative projects)
10% → Sovereign Fund (emergency reserve & generational wealth)
```

Use a simple visual (progress bars, pie chart, or three colored blocks) to make this intuitive.

## 4. How It Works (4-Step Process)

1. **Join** — Complete member onboarding and identity verification
2. **Spend** — Use your SOLVY Card anywhere Visa is accepted
3. **Earn** — Interchange revenue funds the member pool
4. **Profit** — Receive quarterly patronage dividends based on your usage

## 5. Data Sovereignty Promise (Trust Section)

A prominent section that says:

> "Data sovereignty is not a promise. It is enforced by our architecture."

Bullet points:
- Your transactions live on your device (IndexedDB)
- Only aggregated, anonymized totals leave your device
- No central database stores your individual spending history
- We cannot see your data. No one can. Only you.

Include a link to `/privacy-sovereignty.html` for the full explanation.

## 6. Member Testimonials (Optional, Placeholder)

Three placeholder testimonial cards:
- "I finally have a card that works for my community." — Member, Chicago
- "The 70/20/10 split means my spending actually matters." — Member, Atlanta
- "Knowing my data stays on my device gives me real peace of mind." — Member, Houston

Mark these as "Coming from real members at launch" so it's clear they're placeholders.

## 7. Call to Action (Bottom)

Large section repeating the main CTA:
- Headline: "Ready to bank differently?"
- Button: "Join SOLVY Today"
- Small text: "Membership requires identity verification. Deposits are FDIC-insured through Thread Bank."

## 8. Footer

- Links: Privacy & Sovereignty, MAN Portal, Support, Contact
- Legal: "SOLVY Ecosystem™ — Product of SA Nathan LLC. All rights reserved."
- Note: "Member deposits are FDIC-insured up to $250,000 through Thread Bank, N.A."

## 9. Navigation Bar (Sticky)

- Logo: 👑 SOLVY
- Links: How It Works, 70/20/10, Data Sovereignty, Join
- Right side: "Member Login →" button
- Background: sticky, blurred backdrop

## 10. Design Requirements

- Dark theme (background: #0f172a, cards: #1e293b, accents: #22c55e)
- Responsive (mobile-first)
- Smooth scroll behavior
- Subtle animations on scroll (fade-in cards)
- Use system fonts (no external font dependencies)
- Include the AI chat widget (`<script src="/js/components/ai-chat-widget.js"></script>`)

## 11. SEO / Meta Tags

- Title: "SOLVY Ecosystem™ — Cooperative Neobank for Generational Wealth"
- Description: "Join the SOLVY cooperative. Member-owned banking where your spending builds wealth. Data sovereignty by design."
- Open Graph tags for social sharing

## After generating the code, provide:

1. The complete HTML file.
2. Instructions on where to place it (project root or `public/` folder).
3. Notes on which links need to be updated when pages are deployed (e.g., onboarding URL, MAN portal URL).
4. A reminder to replace placeholder testimonials with real ones post-launch.

This landing page is the front door of the SOLVY Ecosystem. It must feel trustworthy, revolutionary, and inviting.
```

---

## ✅ What Kimi Will Generate

A single, self-contained `index.html` file with:

| Section | Purpose |
| :--- | :--- |
| Hero | Grab attention, explain the core promise |
| 3-Column Features | What, Why, How in 30 seconds |
| 70/20/10 Visual | Make the economic model tangible |
| 4-Step Process | Show how easy it is to join |
| Data Sovereignty | Build trust through architecture |
| Testimonials | Social proof (placeholders) |
| Final CTA | Convert visitors to members |
| Footer | Legal, links, FDIC disclosure |

---

## ✅ How to Use

| Step | Action |
| :--- | :--- |
| **1** | Save as `solvy-platform/index.html` (overwrites or replaces the existing EBL homepage) |
| **2** | Update link URLs to match your deployed pages |
| **3** | Add the AI chat widget script tag before `</body>` |
| **4** | Deploy to your web server (Nginx, Cloudflare Pages, etc.) |
| **5** | Replace placeholder testimonials with real member quotes post-launch |

---

## ✅ Key Links on the Page

| Link Text | Destination | Status |
| :--- | :--- | :--- |
| "Join the Cooperative" | `/onboarding.html` | 🔗 Update when ready |
| "Member Login →" | `/banking/index.html` | ✅ Exists |
| "MAN Portal" | `/internal/man-portal.html` | ✅ Exists |
| "Privacy & Sovereignty" | `/privacy-sovereignty.html` | ✅ Exists |
| "Support" | AI chat widget + email | ✅ Exists |
| "Contact" | `support@ebl.beauty` | ✅ Exists |

---

*Paste the prompt above into Kimi Code to generate the complete landing page.*
