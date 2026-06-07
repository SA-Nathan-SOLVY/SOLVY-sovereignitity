# SOLVY Ecosystem™ — Juneteenth Launch Readiness
## June 19, 2026 | Countdown: 14 days

---

## 🎯 Launch Decision Matrix

| Scenario | Action |
|----------|--------|
| **Full Launch** (all systems ready by June 19) | Deploy production branch, open card applications |
| **Prelaunch** (card issuance not ready) | Deploy production branch, open waitlist + prelaunch commitments |
| **Soft Launch** (pilot-only) | Deploy production, invite Evergreen + IBC partners only |

**Current recommendation:** Prepare for **Prelaunch** on June 19. Full card issuance requires Unit.co or Treasury Prime production keys.

---

## ✅ Production Branch Status (`production`)

| Item | Status | Notes |
|------|--------|-------|
| Baseline commit | ✅ `b54a7a42d` + reorg | EBL moved to `/pilots/evergreen/` |
| Homepage | ✅ SOLVY Card as jumpoff | `index.html` = cooperative neobank landing |
| Pilot partner page | ✅ Evergreen Beauty Lounge | `/pilots/evergreen/index.html` |
| Navigation | ✅ Pilots section added | Links across main pages |
| Deployment script | ✅ `deploy-production.sh` | Ready for Hetzner VPS |

---

## 🔧 Dev Branch Status (`main`)

| Item | Status | Blocker |
|------|--------|---------|
| **Lithic sandbox** | ✅ API connected, cards issuing | None — demo ready |
| **Lithic demo page** | ✅ Built in `replit-app-current/.../demo/` | Move to proper dev location |
| **Treasury Prime** | ⚠️ Sandbox invite expired May 13 | Need to re-request |
| **Unit.co** | ⏳ Production access pending since April 13 | Escalation email drafted |
| **Tavonia Evans outreach** | ✅ Email + one-pager + architecture | Ready to send |
| **Sheila portal** | ✅ Built (SMM trust, expenses, loans) | Not for public launch |

---

## 🚀 Prelaunch Checklist (June 19)

### Week 1 (June 3–9)
- [ ] Deploy production branch to Hetzner VPS
- [ ] Verify solvy.cards loads, /pilots/evergreen/ loads
- [ ] Send Tavonia Evans reconnection email
- [ ] Re-request Treasury Prime sandbox
- [ ] Send Unit.co escalation email
- [ ] Finalize Lithic demo for partner presentations
- [ ] Create prelaunch commitment page (if not on production)

### Week 2 (June 10–16)
- [ ] Test all navigation links on production
- [ ] Mobile responsiveness check
- [ ] SSL certificate verification
- [ ] Analytics/monitoring configured
- [ ] Social media announcement drafted
- [ ] Email list prepared for launch notification
- [ ] Pilot partner content finalized (Evergreen)

### Launch Week (June 17–19)
- [ ] Final deployment push
- [ ] DNS verification
- [ ] Launch announcement (Juneteenth)
- [ ] Monitor for issues
- [ ] Collect prelaunch commitments

---

## 🏦 Banking Partner Status

| Partner | Sandbox | Production | Integration | Next Action |
|---------|---------|------------|-------------|-------------|
| **Unit.co** | ⚠️ Placeholder token | ⏳ Pending 45+ days | Partial | Send escalation email |
| **Treasury Prime** | 🔴 Expired May 13 | ❌ Not requested | Built | Re-request sandbox |
| **Lithic** | ✅ Active | ❌ N/A (dev only) | Complete | Demo ready |
| **Mercury** | ❌ Unknown | ❌ Unknown | N/A | Open business account |

**Fallback plan:** If no production card issuer by June 12, launch as **prelaunch** with waitlist + Lithic demo for partners.

---

## 📧 Outreach Pipeline

| Contact | Status | Materials | Send Date |
|---------|--------|-----------|-----------|
| **Tavonia Evans** (Guapcoin) | Ready | Reconnection email, one-pager, architecture | June 5–6 |
| **IBC Partners** | Pending | Pitch deck, Lithic demo | June 10–12 |
| **Evergreen Beauty Lounge** (Eva) | Ready | Pilot partner page live | Already deployed |

---

## 🎨 Brand Consistency Audit

| Element | Live Site | Production Branch | Status |
|---------|-----------|-------------------|--------|
| Logo (crown) | ✅ | ✅ | Match |
| Primary color (purple) | `#9333ea` | `#9333ea` | Match |
| Dark gradient bg | `#0f172a` → `#1e293b` | Same | Match |
| Button styles | Purple/white/orange | Updated | Match |
| Navigation | Unified navbar | Updated | Match |
| EBL integration | Separate domain | Now `/pilots/evergreen/` | Fixed |

---

## 🛠️ Technical Debt (Post-Launch)

| Item | Priority | Estimate |
|------|----------|----------|
| Complete Unit.co/Treasury Prime production integration | Critical | 2–4 weeks |
| Migrate Replit-deployed React app to VPS | High | 1 week |
| Sheila portal security review | High | 3 days |
| Budget AI (DeepSeek) testing | Medium | 1 week |
| Guapcoin bridge architecture | Medium | 4–6 weeks |

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Founder | Sean Mayo | s.a.nathanllc@gmail.com / (775) 636-3656 |
| Technical Lead | AI Dev Partners | via Gitea |
| VPS Admin | Sean Mayo | ssh root@46.62.235.95 |
| Banking Partner (Unit) | TBD | partners@unit.co |
| Banking Partner (TP) | TBD | support@treasuryprime.com |

---

## 🎯 The Sheila Mandate

> *"Leave them better than I received."*

**Juneteenth is not just a date. It is a statement.**
We launch on the day the last enslaved people learned they were free — because economic freedom is still the fight.

**Foundation first. The iron fist, digital.** 🛡️

---

*Last updated: June 3, 2026*
*Maintained by: SOLVY Technical Team*
