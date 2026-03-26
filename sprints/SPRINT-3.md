# Sprint 3: Privacy & Voting Features

**Sprint Goal:** Complete privacy dashboard and voting system integration

**Dates:** March 25 - April 8, 2025  
**Duration:** 2 weeks  
**SCRUM Master:** Sean  
**Team Velocity Target:** 36 points

---

## 📊 Sprint Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Committed Points** | 34 | 34 |
| **Tasks Committed** | 6 | 6 |
| **Team Capacity** | 100% | 100% |
| **Buffer** | 20% | Included |

---

## 🎯 Sprint Backlog

### High Priority (Must Complete)

| ID | Task | Assignee | Points | Status |
|----|------|----------|--------|--------|
| STORY-015 | Privacy Dashboard | @frontend-dev | 5 | 🟡 In Progress |
| STORY-016 | Data Preview Component | @frontend-dev | 3 | 🔴 To Do |
| TASK-017 | Threshold Monitoring | @backend-dev | 5 | 🔴 To Do |
| STORY-018 | Voting Widget | @frontend-dev | 5 | 🔴 To Do |

### Medium Priority (Should Complete)

| ID | Task | Assignee | Points | Status |
|----|------|----------|--------|--------|
| TASK-019 | Data Pool Opt-In Modal | @frontend-dev | 3 | 🔴 To Do |
| TASK-020 | Cleanup Script | @backend-dev | 5 | 🔴 To Do |

### Stretch Goals (Nice to Have)

| ID | Task | Assignee | Points | Status |
|----|------|----------|--------|--------|
| TASK-021 | Migration Verification | @devops | 5 | 🔴 To Do |
| TASK-022 | Performance Optimization | @backend-dev | 3 | 🔴 To Do |

**Total Committed:** 26 points (High) + 8 points (Medium) = 34 points  
**Stretch:** 8 points

---

## 📅 Sprint Calendar

| Day | Date | Event | Owner |
|-----|------|-------|-------|
| Mon | Mar 25 | **Sprint Planning** | Sean |
| Tue | Mar 26 | Development Kickoff | Team |
| Wed | Mar 27 | Mid-week check-in | Sean |
| Thu | Mar 28 | STORY-015 Due | @frontend-dev |
| Fri | Mar 29 | End of Week 1 | Team |
| Mon | Apr 1 | Week 2 Start | Team |
| Tue | Apr 2 | Integration Testing | @qa-tester |
| Wed | Apr 3 | Bug fixes | Team |
| Thu | Apr 4 | Final testing | @qa-tester |
| Fri | Apr 5 | **Sprint Review** | Sean |
| Fri | Apr 5 | **Retrospective** | Sean |

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| IndexedDB compatibility issues | High | Medium | Test on all target browsers early |
| Encryption performance slow | Medium | Low | Use Web Workers, profile early |
| UI/UX takes longer than expected | Medium | Medium | Have simplified fallback design |
| API integration delays | High | Low | Mock APIs for frontend development |

---

## 🚧 Dependencies

### Internal
```
STORY-015 (Privacy Dashboard)
    ├── requires: TASK-007 (Aggregation Service) ✅ Done
    └── requires: TASK-004 (IndexedDB) ✅ Done

STORY-018 (Voting Widget)
    ├── requires: TASK-013 (Voting Service) ✅ Done
    └── requires: TASK-010 (Threshold Service) ✅ Done
```

### External
- None this sprint

---

## 📈 Burndown Chart (Update Daily)

| Day | Planned | Actual | Remaining |
|-----|---------|--------|-----------|
| Day 0 | 0 | 0 | 34 |
| Day 1 | 3 | TBD | TBD |
| Day 2 | 6 | TBD | TBD |
| Day 3 | 9 | TBD | TBD |
| Day 4 | 12 | TBD | TBD |
| Day 5 | 17 | TBD | TBD |
| Day 6 | 20 | TBD | TBD |
| Day 7 | 23 | TBD | TBD |
| Day 8 | 26 | TBD | TBD |
| Day 9 | 30 | TBD | TBD |
| Day 10 | 34 | TBD | TBD |

---

## ✅ Definition of Done (Sprint)

- [ ] All committed stories meet Definition of Done
- [ ] No critical or high bugs open
- [ ] Code coverage > 80%
- [ ] Documentation updated
- [ ] Demo script prepared
- [ ] Staging deployment successful

---

## 🎤 Sprint Review Agenda

**Date:** April 5, 2025  
**Time:** 2:00 PM  
**Duration:** 1 hour

### Agenda
1. **Sprint Goal Review** (5 min) - Sean
2. **Demo: Privacy Dashboard** (10 min) - @frontend-dev
3. **Demo: Voting System** (10 min) - @frontend-dev
4. **Technical Deep Dive** (10 min) - @sa-nathan
5. **Q&A** (15 min) - All
6. **Feedback Collection** (10 min) - Sean

---

## 🔄 Retrospective Format

**Date:** April 5, 2025  
**Time:** 3:00 PM  
**Duration:** 1 hour

### Format: Start / Stop / Continue

**Start Doing:**
- What should we start doing?

**Stop Doing:**
- What should we stop doing?

**Continue Doing:**
- What's working well?

### Action Items (From Previous Sprint)
| Action | Owner | Status |
|--------|-------|--------|
| Improve code review process | @sa-nathan | 🟡 In Progress |
| Add more unit tests | @frontend-dev | ✅ Done |
| Daily standup time consistency | Sean | ✅ Done |

---

## 📋 SCRUM Master Notes

### Week 1 Notes
- Team morale is high
- IndexedDB implementation went smoothly
- Need to ensure QA has enough time for testing

### Week 2 Focus
- Integration testing
- Performance optimization
- Documentation finalization

---

**Created:** March 25, 2025  
**Last Updated:** March 25, 2025  
**Next Review:** Daily Standup
