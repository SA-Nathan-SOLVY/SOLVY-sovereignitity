# SOLVY Customer Service Bot Architecture
## Kimi API + MailCow + Huginn Integration

**Status:** Design Complete | **Implementation Priority:** After MAN Core Stable

---

## Overview

Automated customer service system that:
1. **Receives** emails via MailCow
2. **Routes** via Huginn automation agents
3. **Processes** via Kimi API for intelligent responses
4. **Sends** replies through MailCow
5. **Learns** from feedback to improve accuracy

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER EMAIL                           │
│              (hello@ebl.beauty or support@ebl.beauty)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MAILCOW                                │
│  • Receives email                                               │
│  • Triggers webhook to Huginn                                   │
│  • Stores original message                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Webhook POST)
┌─────────────────────────────────────────────────────────────────┐
│                          HUGINN                                 │
│  • Email Agent: Parses incoming email                           │
│  • Classification Agent: Determines intent                      │
│     ├─ Simple FAQ → Immediate answer (Kimi API)                │
│     ├─ Account Issue → Query MAN API for context               │
│     ├─ Complex/Complaint → Human escalation queue              │
│     └─ Spam → Discard                                          │
│  • Response Agent: Sends to Kimi API                            │
│  • Delivery Agent: Sends reply via MailCow                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (API Call)
┌─────────────────────────────────────────────────────────────────┐
│                        KIMI API                                 │
│  • Receives: Email content + Context (if account issue)         │
│  • System Prompt: SOLVY customer service persona               │
│  • Returns: Draft response                                      │
│  • Confidence Score: 0-100 (below 70 → human review)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MAILCOW                                │
│  • Sends reply email                                            │
│  • From: support@ebl.beauty                                     │
│  • Includes: "Reply STOP for human" option                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. MailCow Configuration

**Email Addresses:**
- `hello@ebl.beauty` — General inquiries
- `support@ebl.beauty` — Technical support
- `members@ebl.beauty` — Member-specific issues

**Webhook Trigger:**
```bash
# POST to Huginn webhook URL on new email
URL: https://huginn.ebl.beauty/users/1/web_requests/15/solvy-email
Payload: {
  "from": "sender@example.com",
  "to": "support@ebl.beauty",
  "subject": "Email subject",
  "body": "Email body text",
  "timestamp": "2026-04-10T14:30:00Z"
}
```

---

### 2. Huginn Agents

#### Agent 1: Email Receiver
```json
{
  "type": "WebRequestAgent",
  "name": "SOLVY Email Inbound",
  "options": {
    "secret": "solvy-email-webhook",
    "expected_receive_period_in_days": 1
  }
}
```

#### Agent 2: Intent Classifier
```json
{
  "type": "TriggerAgent",
  "name": "Classify Email Intent",
  "options": {
    "rules": [
      {
        "path": "{{subject}}",
        "value": "(?i)(password|login|account|card|balance)",
        "action": "account_issue"
      },
      {
        "path": "{{subject}}",
        "value": "(?i)(fee|charge|cost|price|how much)",
        "action": "pricing_faq"
      },
      {
        "path": "{{subject}}",
        "value": "(?i)(cooperative|vote|proposal|member)",
        "action": "governance_faq"
      },
      {
        "path": "{{body}}",
        "value": "(?i)(dispute|fraud|unauthorized|angry|lawyer)",
        "action": "human_escalation"
      }
    ]
  }
}
```

#### Agent 3: Kimi API Caller
```json
{
  "type": "PostAgent",
  "name": "Call Kimi API",
  "options": {
    "post_url": "https://api.kimi.ai/v1/chat/completions",
    "headers": {
      "Authorization": "Bearer {% credential KIMI_API_KEY %}",
      "Content-Type": "application/json"
    },
    "payload": {
      "model": "kimi-latest",
      "messages": [
        {
          "role": "system",
          "content": "You are SOLVY Support, a helpful assistant for SOLVY Ecosystem™..."
        },
        {
          "role": "user", 
          "content": "Subject: {{subject}}\n\nBody: {{body}}"
        }
      ],
      "temperature": 0.7
    }
  }
}
```

#### Agent 4: Response Sender
```json
{
  "type": "MailAgent",
  "name": "Send Reply",
  "options": {
    "smtp_server": "mail.ebl.beauty",
    "smtp_port": 587,
    "username": "{% credential MAILCOW_USER %}",
    "password": "{% credential MAILCOW_PASS %}",
    "from": "support@ebl.beauty",
    "to": "{{from}}",
    "subject": "Re: {{subject}}",
    "body": "{{kimi_response}}\n\n---\nSOLVY Ecosystem™ Support\nNeed human help? Reply HUMAN"
  }
}
```

---

### 3. Kimi API Integration

**API Endpoint:** `https://api.kimi.ai/v1/chat/completions`

**System Prompt:**
```
You are SOLVY Support, the customer service AI for SOLVY Ecosystem™.

ABOUT SOLVY:
- Cooperative financial platform (members own 70% of revenue)
- SOLVY Card™: Member-owned debit card
- 70/20/10 Model: 70% member pool, 20% operations, 10% sovereign fund
- MAN Portal: Mandatory Audit Network for transparency
- Launch: June 19, 2026 (Juneteenth)

TONE:
- Warm, professional, empowering
- Use "we" and "our cooperative" 
- Reference the Sheila Mandate when appropriate

BOUNDARIES:
- Never promise specific launch dates beyond what's public
- Never share other members' data
- Never provide legal advice
- Always suggest human escalation for disputes/fraud

SIGN-OFF:
Always end with: "Own your spend. Own your future. — SOLVY Ecosystem™"
```

**Response Format:**
```json
{
  "response": "Draft reply text",
  "confidence": 85,
  "category": "account_issue",
  "suggested_escalation": false,
  "citations": ["From SOLVY knowledge base"]
}
```

---

### 4. MAN API Context Integration

For account-specific questions, Huginn queries MAN API:

```javascript
// Pre-process before Kimi API
if (intent === 'account_issue') {
  const memberData = await fetch('https://api.ebl.beauty/member/context', {
    headers: { 'X-Member-Email': email.from }
  });
  
  // Add to Kimi prompt
  context = `
    Member since: ${memberData.joinDate}
    Last transaction: ${memberData.lastTransaction}
    Member pool balance: ${memberData.memberPool}
    (Do not share specific numbers unless asked)
  `;
}
```

---

## Escalation Rules

### Auto-Escalate to Human If:
| Condition | Action |
|-----------|--------|
| Kimi confidence < 70% | Queue for human review |
| Keywords: dispute, fraud, lawyer, sue | Immediate human |
| 3+ emails same issue | Human takes over |
| Member requests human (reply "HUMAN") | Human assigned |
| Technical bug report | Engineering queue |
| Partner/media inquiry | Executive queue |

### Human Review Dashboard
- `/ops/support-dashboard.html`
- Shows AI-drafted responses pending approval
- One-click approve/edit/escalate
- Tracks AI accuracy metrics

---

## Training & Improvement

### Feedback Loop
1. Human reviews AI responses
2. Marks: ✅ Accurate / ⚠️ Needs edit / ❌ Wrong
3. Weekly training data export
4. Fine-tune Kimi prompts based on errors

### Knowledge Base
Location: `/ops/support/knowledge-base/`
- `faq-general.md`
- `faq-account.md`  
- `faq-governance.md`
- `troubleshooting.md`
- `response-templates.md`

---

## Security & Privacy

| Requirement | Implementation |
|-------------|----------------|
| No PII in Kimi logs | Hash member IDs before API call |
| Email retention | 30 days then archive |
| Encryption | TLS 1.3 for all communications |
| Access control | Huginn credentials in environment vars |
| Audit trail | All AI responses logged in MAN |

---

## Implementation Checklist

### Phase 1: Basic Setup
- [ ] Configure MailCow webhooks
- [ ] Set up Huginn agents (receiver, classifier)
- [ ] Create Kimi API account & test calls
- [ ] Implement simple FAQ responses

### Phase 2: Context Awareness
- [ ] Connect MAN API for member context
- [ ] Implement account-specific responses
- [ ] Add confidence scoring
- [ ] Build human escalation queue

### Phase 3: Intelligence
- [ ] Train on historical emails
- [ ] Implement feedback loop
- [ ] Add proactive notifications
- [ ] Create support analytics dashboard

---

## Cost Estimate

| Component | Monthly Cost |
|-----------|--------------|
| Kimi API (~1000 requests/day) | $50-100 |
| MailCow (self-hosted) | $0 (on Hetzner) |
| Huginn (self-hosted) | $0 (on Hetzner) |
| **Total** | **~$75/month** |

---

## Sample Conversations

### Example 1: Simple FAQ
**Customer:** "What is the 70/20/10 model?"

**Kimi Response:**
> Great question! The 70/20/10 model is how SOLVY distributes interchange revenue (the fees merchants pay when you use your card):
>
> • **70%** → Member Pool (distributed back to members like you)
> • **20%** → Operations (running the cooperative)
> • **10%** → Sovereign Fund (emergency reserve)
>
> This means when you spend with your SOLVY Card, you're not just a customer—you're an owner earning a share.
>
> Own your spend. Own your future. — SOLVY Ecosystem™

---

### Example 2: Account Issue (with context)
**Customer:** "I don't see my last purchase in the app"

**System Context:** Last transaction 2 hours ago at Walmart for $47.32

**Kimi Response:**
> I can see you made a purchase at Walmart recently. Sometimes transactions take a few hours to appear in the MAN Portal dashboard.
>
> Your transaction history is stored locally on your device for privacy—try refreshing the page or checking your connection.
>
> If it still doesn't appear after 24 hours, reply HUMAN and our team will investigate.
>
> Own your spend. Own your future. — SOLVY Ecosystem™

---

### Example 3: Escalation
**Customer:** "Someone stole my card and made fraudulent charges!"

**Kimi Action:** Confidence 45% → Auto-escalate

**Human Response:** (Within 15 minutes)
> This is [Human Agent]. I'm immediately freezing your card and reviewing the transactions. You'll receive a provisional credit within 24 hours while we investigate...

---

## Integration Files

| File | Purpose | Status |
|------|---------|--------|
| `huginn-agents.json` | Full agent configuration export | ⏳ To create |
| `kimi-system-prompt.txt` | Complete system prompt | ⏳ To create |
| `mailcow-webhook-setup.sh` | Automated MailCow config | ⏳ To create |
| `support-dashboard.html` | Human review interface | ⏳ To create |

---

*Document ID: SOLVY-OPS-CS-BOT-2026-001*  
*For: Operations team implementation*  
*Dependencies: MAN Core, MailCow running, Kimi API key*
