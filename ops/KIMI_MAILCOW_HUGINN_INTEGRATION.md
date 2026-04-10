# Kimi + MailCow + Huginn Integration Guide
## AI-Powered Email Automation for SOLVY

**Purpose:** Automate email inquiries and communications using Kimi Code AI + MailCow + Huginn  
**Status:** Implementation Guide  
**Last Updated:** March 31, 2026

---

## 🎯 OVERVIEW

This integration creates an AI-powered email automation system:

```
Incoming Email → Huginn → Kimi (Content Gen) → MailCow → Outgoing Email
     ↑                                                    ↓
     └─────────────── Member/Lead Database ←──────────────┘
```

**Components:**
- **MailCow:** Email server (inbound/outbound)
- **Huginn:** Automation workflows (triggers, parsing, scheduling)
- **Kimi Code:** Content generation (responses, templates, analysis)

---

## 🏗️ ARCHITECTURE

### Option 1: Semi-Automated (Recommended for Launch)
**Human-in-the-loop approach**

```
1. Huginn receives email → Creates ticket
2. Human reviews → Opens Kimi session
3. Kimi drafts response
4. Human approves → Huginn sends via MailCow
```

### Option 2: Fully Automated (Phase 2)
**AI handles routine inquiries**

```
1. Huginn receives email → Classifies intent
2. Rules engine determines auto vs. human
3. Kimi API generates response (when available)
4. Huginn sends via MailCow
5. Escalates complex issues to human
```

---

## 📧 EMAIL USE CASES

### 1. Member Onboarding Sequence

**Trigger:** New member signs up

**Huginn Workflow:**
```
Day 0: Welcome email (Huginn template)
Day 1: SOLVY 101 guide (Kimi-generated)
Day 3: First Circle intro (Kimi-personalized)
Day 7: Card activation tips (Kimi FAQ)
Day 14: Community invitation (Huginn)
Day 30: Feedback request (Kimi survey)
```

**Kimi Prompt for Day 1:**
```
Create a welcome guide for new SOLVY members. Include:
- What SOLVY Ecosystem™ is (70/20/10 model)
- How to activate SOLVY Card™
- First Circle benefits
- Community resources
Tone: Warm, empowering, cooperative
Length: 500 words
```

### 2. Support Inquiry Handling

**Trigger:** Email to support@solvy.coop

**Huginn Workflow:**
```
1. Parse email (subject, body, sender)
2. Check knowledge base for answer
3. If match found → Send auto-response
4. If complex → Create ticket + notify team
5. Log in CRM (Airtable/Notion)
```

**Kimi Content Templates:**
- Password reset instructions
- Card activation help
- Fee structure explanation
- Dividend FAQ
- Technical troubleshooting

### 3. Grant/Partnership Outreach

**Trigger:** Scheduled (weekly) or manual

**Huginn Workflow:**
```
1. Pull grant opportunity from research
2. Kimi drafts personalized letter
3. Human reviews & customizes
4. Send via MailCow with tracking
5. Follow-up sequence if no response
```

**Kimi Prompt for Grant Letter:**
```
Draft a partnership inquiry email to [ORGANIZATION] for SOLVY Ecosystem™.

Context:
- Cooperative neobank for ADOS/Global South communities
- 70/20/10 revenue model
- First Circle: 100 beauty contractors
- Launch: June 19, 2026

Include:
- Mission alignment
- Specific ask (funding/partnership/advisory)
- Next steps (call/meeting)
- Contact info

Tone: Professional, mission-driven, collaborative
Length: 300-400 words
```

### 4. Newsletter/Updates

**Trigger:** Monthly (last Friday)

**Huginn Workflow:**
```
1. Gather metrics (member count, transactions, dividends)
2. Kimi drafts newsletter content
3. Pull template from repository
4. Assemble in MailCow/Sendy
5. Send to member list
6. Track opens/clicks
```

**Kimi Prompt for Newsletter:**
```
Create SOLVY Monthly Update for [MONTH] 2026.

Sections:
1. Welcome new members (count)
2. This month's milestones
3. Upcoming events (First Circle, Juneteenth)
4. Member spotlight (if available)
5. Call to action (referrals, engagement)

Include placeholders for:
- [MEMBER_COUNT]
- [TRANSACTION_VOLUME]
- [UPCOMING_DATE]

Tone: Community-focused, celebratory, informative
Length: 600-800 words
```

---

## 🔧 TECHNICAL SETUP

### Step 1: MailCow Configuration

**Already documented in:** `ops/mailcow/MAILCOW-SETUP-GUIDE.md`

**Additional for Kimi Integration:**

```bash
# Create service accounts in MailCow admin
1. automation@solvy.coop (Huginn sender)
2. support@solvy.coop (Support inbox)
3. noreply@solvy.coop (System messages)
4. grants@solvy.coop (Partnership outreach)

# Enable IMAP for Huginn access
MailCow Admin → Configuration → Protocols → Enable IMAP

# Generate app passwords for Huginn
Each account → Edit → App Passwords → Generate
```

### Step 2: Huginn Agent Configuration

**Install Huginn:** See `ops/huginn/HUGINN-SETUP-GUIDE.md`

**Create Email Agents:**

#### Agent 1: Email Receiver (IMAP)
```json
{
  "type": "Agents::ImapFolderAgent",
  "name": "SOLVY Support Inbox",
  "options": {
    "host": "mail.solvy.coop",
    "port": "993",
    "ssl": "true",
    "username": "support@solvy.coop",
    "password": "{% credential MAILCOW_SUPPORT_PASSWORD %}",
    "folder": "INBOX",
    "unread_only": "true",
    "mark_as_read": "true"
  },
  "schedule": "every_10m"
}
```

#### Agent 2: Intent Classifier
```json
{
  "type": "Agents::TriggerAgent",
  "name": "Classify Support Intent",
  "options": {
    "rules": [
      {
        "path": "subject",
        "regex": "(?i)(password|reset|login)",
        "value": "account_access"
      },
      {
        "path": "subject",
        "regex": "(?i)(card|activate|transaction)",
        "value": "card_support"
      },
      {
        "path": "subject",
        "regex": "(?i)(grant|partnership|funding)",
        "value": "business_dev"
      },
      {
        "path": "subject",
        "regex": "(?i)(dividend|payment|fee)",
        "value": "financial"
      }
    ]
  }
}
```

#### Agent 3: Knowledge Base Responder
```json
{
  "type": "Agents::HttpStatusAgent",
  "name": "KB Lookup",
  "options": {
    "url": "https://api.solvy.coop/kb/search?q={{message}}",
    "headers": {
      "Authorization": "Bearer {% credential SOLVY_API_KEY %}"
    }
  }
}
```

#### Agent 4: Email Sender (SMTP via MailCow)
```json
{
  "type": "Agents::EmailAgent",
  "name": "Send SOLVY Response",
  "options": {
    "smtp_host": "mail.solvy.coop",
    "smtp_port": "587",
    "smtp_user": "automation@solvy.coop",
    "smtp_password": "{% credential MAILCOW_AUTOMATION_PASSWORD %}",
    "from": "SOLVY Support <support@solvy.coop>",
    "subject": "Re: {{original_subject}}",
    "body": "{{response_body}}"
  }
}
```

### Step 3: Kimi Integration Points

Since Kimi doesn't have a public API, use these approaches:

#### Method A: Content Repository (Recommended)

**Workflow:**
1. Kimi generates templates/content in advance
2. Store in Gitea repository (`ops/email-templates/`)
3. Huginn pulls templates from Git
4. Huginn personalizes with variables
5. Sends via MailCow

**Template Structure:**
```
ops/email-templates/
├── onboarding/
│   ├── welcome.html
│   ├── day-1-guide.md (Kimi-generated)
│   ├── day-3-community.md (Kimi-generated)
│   └── day-7-activation.md (Kimi-generated)
├── support/
│   ├── password-reset.md
│   ├── card-activation.md
│   └── dividend-faq.md
└── grants/
    ├── partnership-intro.md (Kimi-generated)
    ├── follow-up-template.md
    └── thank-you.md
```

**Kimi Content Generation Schedule:**
- Weekly: Generate 5-10 email templates
- Monthly: Review and refresh templates
- Ad-hoc: Custom content for specific campaigns

#### Method B: Manual Review Queue

**Workflow:**
1. Huginn receives email → Creates ticket in Airtable/Notion
2. Human opens Kimi session
3. Pastes email content + context
4. Kimi drafts response
5. Human copies response → Huginn sends

**Kimi Prompt Template:**
```
Draft a response to this SOLVY member inquiry:

SENDER: {{sender_email}}
SUBJECT: {{subject}}
BODY: {{body}}

CONTEXT:
- Member since: {{member_since}}
- Card status: {{card_status}}
- Previous tickets: {{ticket_history}}

TONE: Helpful, cooperative, professional
INCLUDE: Specific next steps, relevant links
ESCALATE: If technical issue beyond standard FAQ
```

#### Method C: Webhook Integration (Future)

When Kimi API becomes available:

```json
{
  "type": "Agents::WebhookAgent",
  "name": "Kimi Content Generation",
  "options": {
    "url": "https://api.kimi.ai/v1/generate",
    "method": "post",
    "headers": {
      "Authorization": "Bearer {% credential KIMI_API_KEY %}",
      "Content-Type": "application/json"
    },
    "payload": {
      "prompt": "Draft response to: {{message_body}}",
      "context": "SOLVY support inquiry",
      "max_tokens": 500
    }
  }
}
```

---

## 📋 KIMI SERVICE REQUIREMENTS

### Current Allegretto Plan Usage

**For Email Automation, you need:**

| Feature | Usage | Current Plan |
|---------|-------|--------------|
| **Content Generation** | Daily/Weekly templates | ✅ Kimi Code 5x |
| **Template Storage** | Gitea repository | ✅ Unlimited repos |
| **Response Drafting** | Manual queue | ✅ Agent Swarm (if parallel) |
| **Slides** | Email design mockups | ✅ Unlimited Slides |
| **Deployment** | Template publishing | ✅ Kimi Claw |

**Recommendation:** Current Allegretto plan is sufficient for email automation needs.

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Basic Automation (Week 1-2)

**Setup:**
- [ ] Deploy MailCow (if not done)
- [ ] Deploy Huginn (if not done)
- [ ] Configure email accounts
- [ ] Create Huginn "Email Receiver" agent
- [ ] Set up ticket logging (Airtable/Notion)

**Kimi Content:**
- [ ] Generate 5 welcome sequence emails
- [ ] Generate 10 FAQ responses
- [ ] Generate 3 grant inquiry templates
- [ ] Store in `ops/email-templates/`

### Phase 2: Semi-Automated (Week 3-4)

**Workflow:**
- [ ] Huginn auto-responds to simple queries
- [ ] Complex queries → Ticket system
- [ ] Human uses Kimi to draft responses
- [ ] Track response times

**Metrics:**
- Average response time
- Auto-resolution rate
- Member satisfaction

### Phase 3: Full Automation (Month 3+)

**Advanced Features:**
- [ ] Intent classification (Huginn ML)
- [ ] Dynamic content personalization
- [ ] A/B testing email variants
- [ ] Automated follow-up sequences

---

## 💡 EXAMPLE WORKFLOWS

### Workflow 1: New Member Welcome

```haskell
-- Huginn Scenario
member_signs_up → 
  create_ticket →
  delay(1_hour) →
  send_welcome_email (Kimi template) →
  delay(1_day) →
  send_onboarding_guide (Kimi template) →
  delay(3_days) →
  check_card_activation →
  if not activated:
    send_activation_tips (Kimi template)
  else:
    send_congratulations
```

### Workflow 2: Grant Partnership Inquiry

```haskell
grant_opportunity_identified →
  kimi_draft_letter (prompt + org details) →
  human_review_and_edit →
  huginn_send_email →
  log_in_crm →
  schedule_follow_up(7_days) →
  if no_response:
    kimi_draft_follow_up →
    human_approve →
    huginn_send
```

### Workflow 3: Monthly Newsletter

```haskell
first_friday_of_month →
  gather_metrics (members, transactions, dividends) →
  kimi_draft_newsletter (metrics + events) →
  human_review →
  huginn_send_to_list →
  track_opens_clicks →
  report_analytics
```

---

## 🔐 SECURITY CONSIDERATIONS

### Email Security
- ✅ Use MailCow's built-in DKIM/SPF/DMARC
- ✅ Enable TLS for all connections
- ✅ Use app passwords (not main passwords)
- ✅ Store credentials in Huginn's encrypted credential store

### Data Privacy
- ⚠️ Never store sensitive member data in Kimi logs
- ⚠️ Use placeholders in templates ({{member_name}}, not real names)
- ✅ Log only metadata (timestamp, category, resolution)
- ✅ GDPR-compliant unsubscribe links

### Access Control
- Limit MailCow admin access
- Use Huginn's invitation code system
- Rotate credentials quarterly
- Monitor for unauthorized access

---

## 📊 MONITORING & METRICS

### Key Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Average Response Time | < 4 hours | Huginn logs |
| Auto-Resolution Rate | > 40% | Ticket system |
| Email Deliverability | > 95% | MailCow stats |
| Open Rate (Newsletter) | > 25% | MailCow analytics |
| Member Satisfaction | > 4.0/5 | Post-resolution survey |

### Huginn Monitoring Agents

Create agents to alert on:
- Failed email sends
- Unusually high support volume
- Negative sentiment in emails
- System downtime

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**1. Huginn can't connect to MailCow**
- Check firewall rules (port 993 IMAP, 587 SMTP)
- Verify TLS/SSL settings
- Test credentials manually

**2. Emails marked as spam**
- Verify SPF/DKIM/DMARC records
- Check IP reputation
- Use consistent "From" addresses

**3. Kimi content feels generic**
- Add more context to prompts
- Use member-specific variables
- Review and refine templates weekly

---

## 🎯 SUCCESS CRITERIA

**30 Days:**
- 5 automated email sequences active
- < 24 hour average response time
- 50+ templates in repository

**90 Days:**
- 60% auto-resolution rate
- < 4 hour response time
- 1000+ automated emails sent

**6 Months:**
- Full AI-assisted support
- < 1 hour response time for routine queries
- Human escalation only for complex issues

---

**Document ID:** SOLVY-KIMI-EMAIL-INT-2026-001  
**Next Steps:** Deploy Phase 1 (Basic Automation)  
**Support:** Check Huginn/MailCow setup guides in `ops/` folder
