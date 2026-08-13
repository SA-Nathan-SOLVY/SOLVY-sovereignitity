# TASK-105: Del — Launch-Week Infrastructure (MailCow, DNS, PM2, Lithic Send)

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | Critical |
| **Status** | In Progress |
| **Assignee** | @del (Abdelazziz) |
| **SCRUM Master** | @sean |
| **Sprint** | Resumption Sprint — July 2026 |
| **Story Points** | 8 |
| **Estimated Hours** | 8–12 hours |
| **Due Date** | 2026-07-16 |

---

## 📝 Description

Onboard Abdelazziz ("Del") as launch-week infrastructure contractor and complete critical infrastructure tasks blocking the Juneteenth launch. Del reports to Sean (SCRUM Master) and SA Nathan (Tech Lead).

Primary deliverables:
1. Fix `ebl.beauty` MailCow DNS (MX, DKIM, SPF, DMARC).
2. Verify `partnerships@ebl.beauty` mailbox and send Lithic production-key request.
3. Audit VPS health (PM2, Docker, disk, memory).
4. Deploy Huginn if time permits.
5. Document all changes and blockers.

---

## ✅ Acceptance Criteria

- [ ] `partnerships@ebl.beauty` mailbox created and tested (send + receive)
- [ ] Cloudflare Email Routing MX records removed
- [ ] `ebl.beauty` MX points to `mail.ebl.beauty` priority 10
- [ ] MailCow DKIM added at `default._domainkey.ebl.beauty`
- [ ] SPF (`v=spf1 mx ~all`) and DMARC records verified
- [x] Lithic production-key email draft refreshed July 15
- [ ] Lithic production-key email sent from `partnerships@ebl.beauty`
- [ ] PM2 status checked and any crashed processes restarted
- [ ] MailCow containers healthy (`docker compose ps`)
- [ ] VPS disk/memory checked and reported
- [ ] Huginn deployed and Lithic scenario imported (stretch goal)
- [ ] Gitea task updated with status notes

**Definition of Done:**
- [ ] Infrastructure changes tested
- [ ] Documentation updated (DNS records, passwords in secure location)
- [ ] Sean/SA Nathan briefed on completion
- [ ] No launch-blocking infrastructure issues remaining

---

## 🔧 Technical Notes

### Required Reading
- `team/DEL_ONBOARDING.md`
- `ops/mailcow/MAILCOW-SETUP-GUIDE.md`
- `ops/mailcow/SOLVY.CARDS-DOMAIN-ADD.md` (blocked on Replit, read for context)
- `ops/huginn/README.md`
- `drafts/lithic-production-key-request-ebl-fallback.md`
- `VENDOR_OUTREACH_STATUS.md`

### Access Required
- SSH to Hetzner VPS `46.62.235.95` (non-root user `del` with sudo)
- Cloudflare DNS Administrator for `ebl.beauty`
- MailCow domain admin for `ebl.beauty`
- Gitea read access to `smayone/solvy-platform` or `sovereignitity-solvy`

### DNS Changes to Make

**Delete these Cloudflare Email Routing records:**
- `ebl.beauty` MX `route1.mx.cloudflare.net` priority 1
- `ebl.beauty` MX `route2.mx.cloudflare.net` priority 3
- `ebl.beauty` MX `route3.mx.cloudflare.net` priority 4
- `cf2024-1._domainkey.ebl.beauty` TXT

**Add/update:**
- `ebl.beauty` MX → `mail.ebl.beauty` priority 10
- `default._domainkey.ebl.beauty` TXT → MailCow DKIM value
- `ebl.beauty` TXT → `v=spf1 mx ~all`
- `_dmarc.ebl.beauty` TXT → `v=DMARC1; p=quarantine; rua=mailto:dmarc@ebl.beauty`

### Send Lithic Email

Option A — Node script:
```bash
cd /Users/smayone/Sovereignitity-Stack  # or /opt/solvy on VPS
export PARTNERSHIPS_EBL_PASS='your-mailcow-password'
node ops/mailcow/send-from-ebl.beauty.js
```

Option B — SOGo webmail:
- `https://mail.ebl.beauty/SOGo`
- Login as `partnerships@ebl.beauty`
- Copy draft from `drafts/lithic-production-key-request-ebl-fallback.md`

### Dependencies
- `solvy.cards` DNS recovery is blocked on Replit support — do not attempt.

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Wrong DNS change breaks existing email | High | Screenshot Cloudflare before changes; change MX only after mailbox verified |
| MailCow cert/DKIM mismatch | Medium | Verify in MailCow admin before adding DKIM TXT |
| Lithic no response by launch | High | Send today; Day 3 and Day 7 follow-ups already drafted |

---

## 📎 Related

- **Parent Epic:** EPIC-007 Sovereign Email
- **Related Tasks:** TASK-100 (Mailcow provisioning), TASK-102 (Lithic production key)
- **Onboarding:** `team/DEL_ONBOARDING.md`
- **Email Draft:** `drafts/lithic-production-key-request-ebl-fallback.md`
- **Follow-ups:** `drafts/lithic-follow-up-day3.md`, `drafts/lithic-follow-up-day7.md`

---

## 💬 Discussion Log

### 2026-06-12 - @sa-nathan
Task created for Del. Sean to assign and grant access.

---

## 🏷️ Labels

```
Type: chore
Priority: critical
Status: ready
Component: devops
Sprint: pre-launch
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-06-12 | Created | @sa-nathan |
| 2026-07-15 | Resumed after relocation; draft refreshed; sandbox re-tested | @sa-nathan |
| 2026-08-10 | Full Replit site mirrored to solvy.cards root (51 routes, staged in `solvy-cards-fullsite/`); read-only `/trust-portal-demo` built + live for prospect presentations; nginx `/ebl` alias + `/app` prefix-match bugs fixed; card PWA staged at `/var/www/app.solvy.cards` pending Cloudflare `app` A record | @kimi (agent) |
