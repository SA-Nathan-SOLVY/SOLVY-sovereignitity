## ✅ Kimi Prompt – Backend Email Handler (Support Escalation)

Copy and paste this directly into Kimi Code (VS Codium) or the Kimi chat interface.

---

```text
Kimi, I need a backend email handler for my SOLVY app. When a member clicks "Contact Human" in the AI chat widget, their email and message must actually be sent to our support team — not just simulated.

Create a Node.js + Express endpoint that handles support escalation emails.

## 1. Endpoint: POST /api/support/escalate

Request body (JSON):
{
  "email": "member@example.com",
  "message": "I lost my SOLVY Card and need help freezing it.",
  "category": "lost_card",  // optional: lost_card, dispute, fraud, general, technical
  "urgency": "normal",      // optional: normal, urgent
  "memberIdHash": "a1b2c3..." // optional: anonymized member hash if available
}

Validation rules:
- `email` must be a valid email format (reject if missing or invalid)
- `message` must be a non-empty string (max 2000 characters)
- Reject any request that contains individual transaction data fields (merchant, transactionId, rawData)

Response:
- Success (200): { "success": true, "ticketId": "SUP-2026-001", "message": "Support request received. Reply within 24 hours." }
- Error (400): { "success": false, "error": "Invalid email address" }
- Error (500): { "success": false, "error": "Failed to send email" }

## 2. Email Content

Send an email to the support inbox with this structure:

**To:** support@ebl.beauty
**From:** noreply@ebl.beauty
**Subject:** [SOLVY Support] {category} — {urgency} — Ticket {ticketId}

Body (HTML):
```
<h2>SOLVY Support Escalation</h2>
<p><strong>Ticket ID:</strong> {ticketId}</p>
<p><strong>From:</strong> {email}</p>
<p><strong>Category:</strong> {category}</p>
<p><strong>Urgency:</strong> {urgency}</p>
<p><strong>Member Hash:</strong> {memberIdHash || 'Not provided'}</p>
<hr>
<p><strong>Message:</strong></p>
<blockquote>{message}</blockquote>
<hr>
<p><em>Sent via SOLVY AI Chat Widget • {timestamp}</em></p>
```

## 3. Email Transport

Use nodemailer (already installed in the project). The project uses MailCow SMTP:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.MAILCOW_HOST || 'mail.ebl.beauty',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILCOW_USER,      // e.g., noreply@ebl.beauty
    pass: process.env.MAILCOW_PASS
  }
});
```

## 4. Ticket ID Generation

Generate a unique ticket ID for each request:
Format: `SUP-{YYYY}-{NNNN}` where NNNN is a zero-padded incrementing number.
Store the counter in a simple JSON file or SQLite table.

## 5. Rate Limiting

Add rate limiting: max 3 support requests per email address per hour.
Use express-rate-limit with a custom key generator based on the email field.

## 6. Security

- Add API key middleware (same as /api/metrics endpoint)
- CORS restricted to allowed origins
- Log all support requests (without message content) for audit: timestamp, email domain, category, ticketId
- Never log the full message content or memberIdHash in plain text logs

## 7. Environment Variables

Add to .env:
- `MAILCOW_HOST` — SMTP server hostname
- `MAILCOW_USER` — SMTP username (e.g., noreply@ebl.beauty)
- `MAILCOW_PASS` — SMTP password
- `SUPPORT_EMAIL` — Where support requests go (default: support@ebl.beauty)
- `SUPPORT_FROM` — Sender address (default: noreply@ebl.beauty)

## 8. Testing

Include a curl example:
```bash
curl -X POST http://localhost:3000/api/support/escalate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "email": "test@example.com",
    "message": "I need help with my card",
    "category": "general",
    "urgency": "normal"
  }'
```

## Constraints

- Keep it simple — this is a support ticket endpoint, not a full helpdesk
- Use the existing server structure (Express, nodemailer, SQLite for ticket counter)
- All functions must have JSDoc comments
- Include error handling for SMTP failures
```

---

## ✅ What Kimi Will Generate

| File | Purpose |
| :--- | :--- |
| `routes/support.js` | POST /api/support/escalate endpoint |
| Updated `db/index.js` | Ticket counter table in SQLite |
| Updated `.env.example` | MAILCOW_* variables |

---

## ✅ Complete Support Loop

```
Member types "HUMAN" in AI chat widget
        ↓
Widget shows email + message form
        ↓
POST /api/support/escalate
        ↓
Server generates ticket ID, stores in SQLite
        ↓
Nodemailer sends email via MailCow
        ↓
support@ebl.beauty receives:
        "[SOLVY Support] lost_card — urgent — Ticket SUP-2026-0042"
        ↓
You or Evergreen replies within 24 hours
```

---

## ✅ Privacy Notes

- The AI chat widget never sends conversation history — only the email and message the member explicitly types into the human form
- Ticket IDs are anonymous (not tied to member identity unless memberIdHash is provided)
- Support emails contain no individual transaction data
- Rate limiting prevents spam/abuse

---

*Paste the prompt above into Kimi Code to generate the complete email handler.*
