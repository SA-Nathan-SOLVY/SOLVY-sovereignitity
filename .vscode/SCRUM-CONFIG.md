# SOLVY SCRUM Master Configuration Guide

**SCRUM Master:** Sean  
**Project:** SOLVY Cooperative Neobank Platform  
**Repository:** Sovereignitity-Stack

---

## 🎯 Quick Start for SCRUM Master

### 1. Install Recommended Extensions
1. Open VS Code Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type: `Extensions: Show Recommended Extensions`
3. Click "Install All"

### 2. Key Extensions for Agile Management

| Extension | Purpose | Usage |
|-----------|---------|-------|
| **Todo Tree** | View all TODOs/BUGs across project | Sidebar → Todo Tree icon |
| **TODO Highlight** | Highlight tasks in code files | Automatic in editor |
| **Project Manager** | Switch between SOLVY projects | Sidebar → Projects icon |
| **GitLens** | Track who changed what | Inline blame, sidebar history |
| **Git Graph** | Visual branch management | Sidebar → Git Graph |

### 3. SCRUM Keywords

Use these keywords in code comments for automatic tracking:

```javascript
// TODO: Implement user authentication - ASSIGNED: @developer-name - DUE: 2025-04-01
// FIXME: Fix memory leak in transaction loop - BLOCKED: Waiting for API
// BUG: Dashboard not loading on mobile - PRIORITY: HIGH
// SPRINT: Sprint 3 Goal - Data Architecture Refactor
// STORY: As a member, I want to see my privacy dashboard
// EPIC: Local-First Data Architecture
// REVIEW: Code review needed for encryption service
// NOTE: This is a temporary workaround
```

---

## 📋 Team Structure

### Core Team

| Role | Name | Git Username | Focus Area |
|------|------|--------------|------------|
| **SCRUM Master** | Sean | @sean | Process, Sprint Planning |
| **Tech Lead** | SA Nathan | @sa-nathan | Architecture, Code Review |
| **Frontend Dev** | TBD | @frontend-dev | UI/UX Components |
| **Backend Dev** | TBD | @backend-dev | API, Database |
| **DevOps** | TBD | @devops | Deployment, Infrastructure |
| **QA** | TBD | @qa-tester | Testing, QA |

### Product Backlog Owners

| Component | Owner | Status |
|-----------|-------|--------|
| SOLVY Card | TBD | Active |
| SPS Integration | TBD | Active |
| IBC Portal | TBD | Maintenance |
| Privacy Dashboard | @sa-nathan | In Progress |
| Voting System | TBD | Backlog |

---

## 🏃 Sprint Structure

### Sprint Cadence
- **Duration:** 2 weeks
- **Start:** Every other Monday
- **Review:** Friday of week 2
- **Retrospective:** Friday of week 2 (after review)
- **Planning:** Monday of new sprint

### Current Sprint (Example)

```markdown
# Sprint 3: Local-First Data Architecture
**Dates:** March 25 - April 8, 2025
**Goal:** Complete privacy-centric data architecture refactor

## Sprint Backlog

### High Priority
- [ ] SPRINT-3.1: Implement IndexedDB schema
- [ ] SPRINT-3.2: Client-side aggregation service
- [ ] SPRINT-3.3: Privacy dashboard UI

### Medium Priority
- [ ] SPRINT-3.4: Threshold monitoring widget
- [ ] SPRINT-3.5: Voting system integration

### Stretch Goals
- [ ] SPRINT-3.6: Data pool encryption
```

---

## 📊 Task Management

### Task Template

Create new tasks using this format in `tasks/TASK-XXX.md`:

```markdown
# TASK-XXX: [Brief Title]

## Metadata
- **Type:** [Story / Bug / Task / Epic]
- **Priority:** [Critical / High / Medium / Low]
- **Status:** [Backlog / In Progress / Review / Done]
- **Assignee:** @username
- **Sprint:** Sprint X
- **Estimated Hours:** X hours
- **Due Date:** YYYY-MM-DD

## Description
Clear description of what needs to be done.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
Any implementation details, gotchas, or references.

## Related
- Parent Epic: EPIC-XXX
- Related Tasks: TASK-YYY, TASK-ZZZ
- Blocks: TASK-AAA
```

### Task Status Workflow

```
Backlog → To Do → In Progress → Code Review → Testing → Done
                ↓                    ↓           ↓
            Blocked              Changes     Failed
                ↓                    ↓           ↓
            Unblocked            Re-review   Back to Dev
```

---

## 🔍 Daily Standup Format

Use this template for daily updates:

```markdown
## [Name] - [Date]

### Yesterday
- Completed: [What was finished]
- Progress: [What was worked on]

### Today
- Focus: [What will be worked on]
- Goals: [Specific targets]

### Blockers
- [ ] Blocker 1 - Help needed from: @person
- [ ] Blocker 2 - External dependency: [what]

### Notes
- Any other relevant information
```

---

## 📈 Velocity Tracking

Track team velocity in `sprints/VELOCITY.md`:

```markdown
# Team Velocity

## Sprint History

| Sprint | Committed | Completed | Velocity | Notes |
|--------|-----------|-----------|----------|-------|
| Sprint 1 | 40 pts | 35 pts | 35 | Initial sprint |
| Sprint 2 | 35 pts | 38 pts | 36.5 | Finding rhythm |
| Sprint 3 | 38 pts | TBD | TBD | Current |

## Average Velocity
**Rolling Average (last 3 sprints):** 36.5 points

## Capacity Planning
- **Sprint 4 Planned Capacity:** 36 points
- **Buffer (20%):** 7 points
- **Total Commitment:** 29 points
```

---

## 🎨 Definition of Done

### For User Stories
- [ ] Code implemented
- [ ] Unit tests written (coverage > 80%)
- [ ] Integration tests pass
- [ ] Code reviewed by peer
- [ ] Documentation updated
- [ ] Acceptance criteria met
- [ ] QA approved
- [ ] Merged to main branch
- [ ] Deployed to staging

### For Bugs
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added
- [ ] Fix verified by QA
- [ ] Deployed to production

### For Tasks
- [ ] Task completed
- [ ] Output documented
- [ ] Reviewed by SCRUM Master
- [ ] Integrated into main codebase

---

## 🚨 Escalation Process

### Level 1: Team Level (Same Day)
- Blockers that can be resolved within the team
- Technical questions
- Clarification on requirements

### Level 2: SCRUM Master (24 hours)
- Cross-team dependencies
- Resource conflicts
- Process issues
- External blockers

### Level 3: Product Owner (48 hours)
- Scope changes
- Priority conflicts
- Strategic decisions
- Stakeholder communication

---

## 📚 Resources

### Documentation
- [SOLVY Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./solvy-platform/docs/CARD-API-DOCUMENTATION.md)
- [Data Architecture](./solvy-platform/SOVEREIGNITITY_DATA_ARCHITECTURE.md)
- [Deployment Guide](./HETZNER_SETUP.md)

### Tools
- **Git Server:** https://git.ebl.beauty (Gitea)
- **Staging:** https://staging.ebl.beauty
- **Production:** https://ebl.beauty
- **Project Board:** (TBD - Gitea Issues or external tool)

### Communication
- **Daily Standup:** 9:00 AM via (TBD)
- **Sprint Planning:** Monday 10:00 AM
- **Sprint Review:** Friday 2:00 PM
- **Retrospective:** Friday 3:00 PM

---

## ✅ SCRUM Master Checklist

### Weekly
- [ ] Review sprint progress
- [ ] Update burndown chart
- [ ] Identify blockers
- [ ] Check task assignments

### Per Sprint
- [ ] Facilitate sprint planning
- [ ] Run daily standups
- [ ] Track velocity
- [ ] Conduct review
- [ ] Lead retrospective
- [ ] Update documentation

### As Needed
- [ ] Onboard new team members
- [ ] Resolve conflicts
- [ ] Escalate issues
- [ ] Update process

---

**Last Updated:** March 25, 2025  
**Next Review:** April 8, 2025 (Sprint 3 Retrospective)
