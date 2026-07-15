# SOLVY SCRUM Board

**Current Sprint:** Resumption Sprint — July 2026 🚀  
**Sprint Dates:** July 15 - July 29, 2026  
**Launch Target:** TBD — pending Lithic production API key  
**Last Updated:** July 15, 2026  

---

## 🎯 Sprint Goal

> Resume launch operations after relocation. Secure Lithic production API access, open Navy Federal Credit Union operational accounts, and reset the public launch timeline with trust account funding now in place.

---

## 📊 Sprint Status

```
Sprint Progress: ██████░░░░░░░░░░░░░░ 30%

Tasks: 3 To Do | 1 In Progress | 0 Review | 0 Done
Points: 16 To Do | 8 In Progress | 0 Review | 0 Done
```

---

## 🏃 Board Columns

### 🔴 To Do

| ID | Task | Assignee | Points | Priority | Epic |
|----|------|----------|--------|----------|------|
| TASK-102 | Lithic production key + live card issuing | @sa-nathan | 8 | Critical | EPIC-002 Card Issuing |
| TASK-108 | Open Navy Federal Credit Union accounts | @sa-nathan | 5 | High | EPIC-008 Operational Banking |
| TASK-109 | Reset launch milestone + communications | @sean | 3 | High | EPIC-009 Launch Planning |

**Subtotal:** 3 tasks | 16 points

---

### 🟡 In Progress

| ID | Task | Assignee | Points | Status | Epic |
|----|------|----------|--------|--------|------|
| TASK-105 | Del — launch-week infrastructure (Lithic send, MailCow, DNS) | @del | 8 | Resumed July 15 | EPIC-007 Sovereign Email |

**Details:**
- ✅ Lithic sandbox re-tested successfully July 15
- 🔄 Lithic production key request email refreshed and ready to send
- ⏳ `partnerships@ebl.beauty` mailbox verification before send

**Blockers:** None

**Subtotal:** 1 task | 8 points

---

### 🟠 Review

*No items in review.*

**Subtotal:** 0 tasks | 0 points

---

### 🟢 Done (Carried from Previous Sprints)

| ID | Task | Assignee | Points | Completed | Epic |
|----|------|----------|--------|-----------|------|
| TASK-090 | Lithic sandbox integration + card lifecycle | @sa-nathan | 8 | Jun 7 | EPIC-002 Card Issuing |
| TASK-091 | Vendor switch default to Lithic (Unit/Treasury Prime paused) | @sa-nathan | 3 | Jun 7 | EPIC-002 Card Issuing |
| TASK-092 | AgentMail → Mailcow migration | @sa-nathan | 5 | Jun 7 | EPIC-007 Sovereign Email |
| TASK-093 | Brand update green → purple across public pages | @frontend-dev | 5 | Jun 8 | EPIC-006 Brand & UX |
| TASK-094 | Logo fix: crown → SolvyLogo-1024.png | @frontend-dev | 2 | Jun 8 | EPIC-006 Brand & UX |
| TASK-095 | Repo consolidation + Gitea sync | @sa-nathan | 3 | Jun 9 | EPIC-001 DevOps & Coordination |
| TASK-106 | Receipt scanning POC with on-device YOLO | @sa-nathan | 5 | Jun 22 | EPIC-001 Local-First Architecture |
| TASK-107 | Lithic KYC document capture with on-device vision + liveness/face-match | @sa-nathan | 8 | Jun 24 | EPIC-002 Card Issuing |

**Subtotal:** 8 tasks | 39 points

---

## ⚠️ Blocked

| ID | Task | Blocked By | Blocker Owner | Escalation |
|----|------|------------|---------------|------------|
| TASK-102 | Lithic production key + live card issuing | API key pending from Lithic | @sa-nathan | Production key request email refreshed July 15; send today. Escalate July 22 if no response. |

---

## 🔥 Critical Issues

| Issue | Impact | Owner | Status |
|-------|--------|-------|--------|
| Lithic production API key | Blocks live card issuing | @sa-nathan | 🔴 Blocked — email ready |
| Navy Federal accounts | Operational banking + funding rails | @sa-nathan | 🟡 In Progress |
| Launch date reset | External communications + member expectations | @sean | 🟡 Pending |

---

## 📅 Sprint Calendar

```
Week 1 (Jul 15 - Jul 19):
Tue Jul 15 ████████████████████ Resume: Lithic sandbox retest + draft refresh
Wed Jul 16 ████████████████████ Send Lithic production key request
Thu Jul 17 ████████████████████ Navy Federal account opening
Fri Jul 18 ████████████████████ Update launch communications + member timeline
Sat Jul 19 ████████████████████ Infrastructure audit (PM2, MailCow, VPS)

Week 2 (Jul 22 - Jul 26):
Tue Jul 22 ████████████████████ Lithic escalation decision day
Wed Jul 23 ████████████████████ Treasury Prime fallback re-request (if needed)
Thu Jul 24 ████████████████████ Production environment prep
Fri Jul 25 ███████████████████─ QA / partner acceptance
Sat Jul 26 ██████████████████░░ Bug fixes / vendor response handling

Week 3 (Jul 29):
Tue Jul 29 ████████████████████ Sprint Review + new launch date commitment
```

---

## 👥 Team Availability

| Team Member | Today | This Week | Notes |
|-------------|-------|-----------|-------|
| @sa-nathan | ✅ | 100% | Architecture + vendor coordination |
| @frontend-dev | ✅ | 100% | Brand/UX finalization |
| @sean | ✅ | 100% | SCRUM Master — board + communications |
| @devops | 50% | 50% | Mailcow + infrastructure |
| @qa-tester | ✅ | 80% | Pre-launch testing prep |
| @del (Abdelazziz) | ✅ | 100% | Launch-week infrastructure contractor — MailCow/DNS/PM2 |

---

## 📝 Daily Standup (July 15)

### @sa-nathan
- **Yesterday:** N/A — resuming after relocation
- **Today:** Re-test Lithic sandbox, refresh production key request, open Navy Federal accounts
- **Blockers:** Lithic production key pending

### @sean
- **Yesterday:** N/A — resuming after relocation
- **Today:** Update SCRUM board, VENDOR_OUTREACH_STATUS, reset launch milestone task
- **Blockers:** None

### @del
- **Yesterday:** N/A
- **Today:** Verify `partnerships@ebl.beauty` mailbox; send Lithic production key email once credentials confirmed
- **Blockers:** Needs `PARTNERSHIPS_EBL_PASS` or SOGo access

---

## 🎯 Upcoming Milestones

| Date | Milestone | Owner | Status |
|------|-----------|-------|--------|
| Jul 16 | Lithic production key request sent | @sa-nathan / @del | 🟡 In Progress |
| Jul 22 | Lithic escalation decision | @sa-nathan | 🔴 Not Started |
| Jul 29 | Sprint Review + new launch date | @sean | 🔴 Not Started |

---

## 📋 Action Items

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| Send Lithic production key request email | @del / @sa-nathan | Jul 16 | 🟡 In Progress |
| Open Navy Federal Credit Union accounts | @sa-nathan | Jul 18 | 🔴 To Do |
| Confirm trust account → NFCU funding capability | @sa-nathan | Jul 18 | 🔴 To Do |
| Create TASK-108 and TASK-109 files | @sean | Jul 16 | 🔴 To Do |
| Verify PWA on iOS Safari + Android Chrome | @qa-tester | Jul 19 | 🔴 To Do |
| Create updated launch runbook | @sean | Jul 22 | 🔴 To Do |

---

## 🔗 Quick Links

- [Sprint Backlog](./sprints/SPRINT-3.md)
- [Team Info](./team/TEAM.md)
- [Velocity Tracking](./sprints/VELOCITY.md)
- [Task Templates](./tasks/TEMPLATE.md)
- [Vendor Outreach Status](./VENDOR_OUTREACH_STATUS.md)
- [Gitea Repo](https://git.ebl.beauty/smayone/sovereignitity-solvy)
- [Live Site](https://solvy.cards/)

---

**Next Update:** July 16, 2026 (Daily Standup)  
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
- React PWA deployment is live at https://solvy.cards/ — verify in browser before standup.
- Juneteenth launch window has passed. All launch communications must be reset with new timeline.
