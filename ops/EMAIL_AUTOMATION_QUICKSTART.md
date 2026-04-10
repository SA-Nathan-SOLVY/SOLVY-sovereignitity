# Email Automation Quick Start
## Kimi + MailCow + Huginn Setup Checklist

**Goal:** Automated email handling for SOLVY within 2 weeks  
**Approach:** Semi-automated (human reviews Kimi drafts)  

---

## WEEK 1: Infrastructure Setup

### Day 1-2: MailCow Email Server
- [ ] Deploy MailCow on VPS (follow `MAILCOW-SETUP-GUIDE.md`)
- [ ] Configure DNS (MX, SPF, DKIM, DMARC)
- [ ] Create accounts:
  - `support@solvy.coop`
  - `automation@solvy.coop`
  - `grants@solvy.coop`
  - `noreply@solvy.coop`
- [ ] Generate app passwords for each

### Day 3-4: Huginn Automation
- [ ] Deploy Huginn on VPS or Pi 5 (follow `HUGINN-SETUP-GUIDE.md`)
- [ ] Connect to MailCow SMTP
- [ ] Create basic "Email Receiver" agent
- [ ] Test email logging

### Day 5-7: Integration Testing
- [ ] Send test email to support@solvy.coop
- [ ] Verify Huginn captures it
- [ ] Test auto-response
- [ ] Document any issues

---

## WEEK 2: Kimi Content & Workflows

### Day 8-10: Generate Email Templates with Kimi

**Use Kimi to create:**

1. **Welcome Sequence (5 emails)**
2. **Support Responses (10 templates)**
3. **Grant Outreach (3 templates)**

**Store in:** `ops/email-templates/`

### Day 11-14: Testing & Go-Live
- [ ] Test complete workflow
- [ ] Monitor first 50 emails
- [ ] Adjust templates

---

## IMMEDIATE ACTION

**Are MailCow and Huginn already deployed?**

Check:
```bash
curl https://mail.solvy.coop
curl https://automation.solvy.coop
```

**If NO:** Follow setup guides first  
**If YES:** Start generating templates with Kimi

---

**Full Guide:** `KIMI_MAILCOW_HUGINN_INTEGRATION.md`
