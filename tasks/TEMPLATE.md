# Task Template

Use this template to create new tasks. Save as `tasks/{status}/TASK-XXX-short-name.md`

---

## Task ID Format
- `TASK-XXX` - General tasks
- `STORY-XXX` - User stories
- `BUG-XXX` - Bug fixes
- `EPIC-XXX` - Large features/epics
- `SPIKE-XXX` - Research/spike tasks

---

# TASK-XXX: [Title]

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Story / Bug / Task / Epic / Spike |
| **Priority** | Critical / High / Medium / Low |
| **Status** | Backlog / To Do / In Progress / Review / Testing / Done |
| **Assignee** | @username |
| **Sprint** | Sprint X |
| **Story Points** | 1 / 2 / 3 / 5 / 8 / 13 |
| **Estimated Hours** | X hours |
| **Due Date** | YYYY-MM-DD |

---

## 📝 Description

Clear description of what needs to be accomplished. For user stories, use the format:

> As a [type of user], I want [some goal] so that [some reason/benefit].

---

## ✅ Acceptance Criteria

- [ ] Criterion 1: Specific, measurable, testable condition
- [ ] Criterion 2: Another condition
- [ ] Criterion 3: Final condition

**Definition of Done:**
- [ ] Code implemented
- [ ] Tests written (unit + integration)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] QA approved
- [ ] Merged to main

---

## 🔧 Technical Notes

### Implementation Details
- Architecture decisions
- Technical approach
- Libraries/frameworks to use
- API endpoints involved

### Dependencies
- TASK-XXX (blocks this)
- TASK-YYY (this blocks it)
- External: API, service, etc.

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk description | High/Med/Low | How to handle |

---

## 📎 Related

- **Parent Epic:** EPIC-XXX
- **Related Tasks:** TASK-YYY, TASK-ZZZ
- **Design Mockups:** [Figma link]
- **API Spec:** [Document link]
- **User Research:** [Notes link]

---

## 💬 Discussion Log

### 2025-03-25 - @sa-nathan
Initial task creation. Need to clarify scope with team.

### 2025-03-26 - @sean
Clarified scope in sprint planning. Ready for development.

---

## 🏷️ Labels

```
Type: feature | bug | chore | docs | spike
Priority: critical | high | medium | low
Status: blocked | needs-review | ready-for-qa
Component: frontend | backend | database | devops | security
Sprint: sprint-1 | sprint-2 | sprint-3
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2025-03-25 | Created | @sa-nathan |
| 2025-03-26 | Updated priority | @sean |

