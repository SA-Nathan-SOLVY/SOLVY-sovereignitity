# SOLVY SCRUM Board

**Current Sprint:** Pre-Launch Sprint — Foundation First 🚀  
**Sprint Dates:** June 3 - June 18, 2026  
**Launch Target:** June 19, 2026 (Juneteenth)  
**Last Updated:** June 9, 2026  

---

## 🎯 Sprint Goal

> Finalize SOLVY PWA deployment, banking integration, and sovereign email infrastructure for Juneteenth launch. EBL pilot ready for Eva.

---

## 📊 Sprint Status

```
Sprint Progress: ██████████████░░░░░░ 72%

Tasks: 11 Committed | 3 In Progress | 4 To Do | 4 Done
Points: 55 Committed | 13 In Progress | 16 To Do | 26 Done
```

---

## 🏃 Board Columns

### 🔴 To Do

| ID | Task | Assignee | Points | Priority | Epic |
|----|------|----------|--------|----------|------|
| TASK-101 | Stripe production key activation | @sa-nathan | 5 | Critical | EPIC-003 Revenue Infrastructure |
| TASK-102 | Lithic production key + live card issuing | @sa-nathan | 8 | Critical | EPIC-002 Card Issuing |
| TASK-103 | End-to-end EBL pilot onboarding flow | @sa-nathan | 5 | High | EPIC-004 EBL Pilot |
| TASK-104 | iOS/Android app store submissions | @frontend-dev | 5 | Medium | EPIC-005 Mobile Apps |

**Subtotal:** 4 tasks | 23 points

---

### 🟡 In Progress

| ID | Task | Assignee | Points | Status | Epic |
|----|------|----------|--------|--------|------|
| TASK-098 | Gitea Projects/Kanban integration with SCRUM board | @sean | 3 | Day 2/3 | EPIC-001 DevOps & Coordination |
| TASK-099 | Final brand consistency audit (purple theme, SolvyLogo-1024) | @frontend-dev | 5 | Day 1/2 | EPIC-006 Brand & UX |
| TASK-100 | Mailcow mailbox proper provisioning (move from SQL workaround) | @devops | 5 | Day 2/3 | EPIC-007 Sovereign Email |

**Details:**
- ✅ TASK-098: Gitea repo sync completed (main branch pushed via SSH)
- 🔄 TASK-099: Most pages updated, checking for residual green/crown assets
- ⏳ TASK-100: `team@`, `support@`, `noreply@` aliases functional; needs UI-based creation

**Blockers:** None

**Subtotal:** 3 tasks | 13 points

---

### 🟠 Review

| ID | Task | Assignee | Points | Reviewer | Epic |
|----|------|----------|--------|----------|------|
| TASK-096 | React PWA deployment from Replit to solvy.cards | @sa-nathan | 8 | @sean | EPIC-002 Platform Deployment |
| TASK-097 | Missing card asset verification (SOV-personal-*, crown-transparent) | @frontend-dev | 3 | @sa-nathan | EPIC-006 Brand & UX |

**Subtotal:** 2 tasks | 11 points

---

### 🟢 Done

| ID | Task | Assignee | Points | Completed | Epic |
|----|------|----------|--------|-----------|------|
| TASK-090 | Lithic sandbox integration + card lifecycle | @sa-nathan | 8 | Jun 7 | EPIC-002 Card Issuing |
| TASK-091 | Vendor switch default to Lithic (Unit/Treasury Prime paused) | @sa-nathan | 3 | Jun 7 | EPIC-002 Card Issuing |
| TASK-092 | AgentMail → Mailcow migration | @sa-nathan | 5 | Jun 7 | EPIC-007 Sovereign Email |
| TASK-093 | Brand update green → purple across public pages | @frontend-dev | 5 | Jun 8 | EPIC-006 Brand & UX |
| TASK-094 | Logo fix: crown → SolvyLogo-1024.png | @frontend-dev | 2 | Jun 8 | EPIC-006 Brand & UX |
| TASK-095 | Repo consolidation + Gitea sync | @sa-nathan | 3 | Jun 9 | EPIC-001 DevOps & Coordination |

**Subtotal:** 6 tasks | 26 points

---

## ⚠️ Blocked

| ID | Task | Blocked By | Blocker Owner | Escalation |
|----|------|------------|---------------|------------|
| TASK-102 | Lithic production key | API key pending from Lithic dashboard | @sa-nathan | Contact Lithic support if not received by Jun 12 |
| TASK-101 | Stripe production key | `sk_live_...` required from Stripe dashboard | @sa-nathan | Stripe account admin access needed |

---

## 🔥 Critical Issues

| Issue | Impact | Owner | Status |
|-------|--------|-------|--------|
| Juneteenth launch date | Hard deadline for IBC community pilot | @sa-nathan | 🟡 On Track |
| EBL pilot readiness | Eva's first partner launch | @sa-nathan | 🟡 On Track |
| Production payment processing | Cannot take live deposits without Stripe/Lithic prod | @sa-nathan | 🔴 Blocked by keys |

---

## 📅 Sprint Calendar

```
Week 1 (Jun 3 - Jun 8):
Mon Jun  3 ████████████████████ Sprint Planning
Tue Jun  4 ████████████████████ React PWA deploy
Wed Jun  5 ████████████████████ Lithic sandbox verification
Thu Jun  6 ████████████████████ Mailcow integration
Fri Jun  7 ████████████████████ Brand audit + asset fix
Sat Jun  8 ████████████████████ Gitea sync (SSH bypass)

Week 2 (Jun 9 - Jun 15):
Mon Jun  9 ████████████████████ SCRUM board update, asset verification
Tue Jun 10 ░░░░░░░░░░░░░░░░░░░░ Production key procurement
Wed Jun 11 ░░░░░░░░░░░░░░░░░░░░ EBL pilot flow testing
Thu Jun 12 ░░░░░░░░░░░░░░░░░░░░ Production environment testing
Fri Jun 13 ░░░░░░░░░░░░░░░░░░░░ QA / partner acceptance
Sat Jun 14 ░░░░░░░░░░░░░░░░░░░░ Bug fixes
Sun Jun 15 ░░░░░░░░░░░░░░░░░░░░ Final integration testing

Week 3 (Jun 16 - Jun 19):
Mon Jun 16 ░░░░░░░░░░░░░░░░░░░░ Launch prep
Tue Jun 17 ░░░░░░░░░░░░░░░░░░░░ Soft launch / EBL
Wed Jun 18 ░░░░░░░░░░░░░░░░░░░░ Go/No-Go decision
Thu Jun 19 ████████████████████ JUNETEENTH LAUNCH 🚀
```

---

## 👥 Team Availability

| Team Member | Today | This Week | Notes |
|-------------|-------|-----------|-------|
| @sa-nathan | ✅ | 100% | Architecture + vendor coordination |
| @frontend-dev | ✅ | 100% | Brand/UX finalization |
| @sean | ✅ | 100% | SCRUM Master — Gitea Kanban sync |
| @devops | 50% | 50% | Mailcow + infrastructure |
| @qa-tester | ✅ | 80% | Pre-launch testing prep |

---

## 📝 Daily Standup (June 9)

### @sa-nathan
- **Yesterday:** Deployed React PWA to VPS root, fixed nginx index priority, added missing card assets
- **Today:** Verify all image assets load 200, update SCRUM board, procure production keys
- **Blockers:** Stripe `sk_live_...` and Lithic production key pending

### @frontend-dev
- **Yesterday:** Verified React app renders correctly, checked asset references in JS bundle
- **Today:** Final brand consistency sweep (remove residual green/crown where not intended)
- **Blockers:** None

### @sean
- **Yesterday:** Reviewed Gitea repo sync status
- **Today:** Update SCRUM board, coordinate Gitea Projects/Kanban integration
- **Blockers:** Gitea API access blocked by Cloudflare challenge (use SSH git for code, browser for issues)

### @devops
- **Yesterday:** Mailcow aliases verified functional
- **Today:** Proper mailbox creation via Mailcow UI (remove SQL workaround)
- **Blockers:** None

---

## 🎯 Upcoming Milestones

| Date | Milestone | Owner | Status |
|------|-----------|-------|--------|
| Jun 10 | Production key procurement complete | @sa-nathan | 🟡 In Progress |
| Jun 12 | EBL pilot onboarding flow ready | @sa-nathan | 🟡 On Track |
| Jun 15 | Feature freeze / QA start | @sean | 🔴 Not Started |
| Jun 17 | Soft launch with EBL | Team | 🔴 Not Started |
| Jun 19 | **Juneteenth Public Launch** | Team | 🔴 Not Started |

---

## 📋 Action Items

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| Get Stripe `sk_live_...` from dashboard | @sa-nathan | Jun 10 | 🔴 To Do |
| Get Lithic production API key | @sa-nathan | Jun 10 | 🔴 To Do |
| Schedule EBL pilot test with Eva | @sa-nathan | Jun 11 | 🔴 To Do |
| Update Gitea Projects/Kanban from this board | @sean | Jun 10 | 🟡 In Progress |
| Verify PWA on iOS Safari + Android Chrome | @qa-tester | Jun 12 | 🔴 To Do |
| Create launch runbook | @sean | Jun 15 | 🔴 To Do |

---

## 🔗 Quick Links

- [Sprint Backlog](./sprints/SPRINT-3.md)
- [Team Info](./team/TEAM.md)
- [Velocity Tracking](./sprints/VELOCITY.md)
- [Task Templates](./tasks/TEMPLATE.md)
- [Gitea Repo](https://git.ebl.beauty/smayone/sovereignitity-solvy)
- [Live Site](https://solvy.cards/)

---

**Next Update:** June 10, 2026 (Daily Standup)  
**Board Owner:** @sean (SCRUM Master)  

---

## 🔄 Update Instructions

To update this board:
1. Edit this file directly
2. Update task files in `tasks/{status}/`
3. Commit changes: `git add SCRUM-BOARD.md tasks/ && git commit -m "scrum: update board"`
4. Push: `git push gitea-sovereignitity main`
5. Mirror updates to [Gitea Projects/Kanban](https://git.ebl.beauty/smayone/sovereignitity-solvy/projects)

---

## 📝 Notes for Sean / SCRUM Master

- Gitea Projects/Kanban is the source of truth for epics; this file is the daily standup snapshot.
- Cloudflare challenge blocks API access to Gitea from automated tools. Use SSH (`git@46.62.235.95:...`) for git operations.
- React PWA deployment is **live** at https://solvy.cards/ — verify in browser before standup.
- All 15 deployed image assets return HTTP 200.
