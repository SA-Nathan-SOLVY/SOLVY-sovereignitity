# SOLVY Development Team

**Last Updated:** March 25, 2025

---

## 👥 Team Roster

### Core Team

| Role | Name | Git Username | Email | Timezone | Focus |
|------|------|--------------|-------|----------|-------|
| **SCRUM Master** | Sean | @sean | sean@ebl.beauty | EST | Process, Planning |
| **Tech Lead** | SA Nathan | @sa-nathan | nathan@solvy.coop | EST | Architecture, Review |
| **Senior Frontend** | TBD | @frontend-dev | frontend@solvy.coop | TBD | UI/UX, Components |
| **Senior Backend** | TBD | @backend-dev | backend@solvy.coop | TBD | API, Database |
| **DevOps Engineer** | TBD | @devops | devops@solvy.coop | TBD | CI/CD, Infrastructure |
| **QA Engineer** | TBD | @qa-tester | qa@solvy.coop | TBD | Testing, QA |

### Extended Team

| Role | Name | Git Username | Focus |
|------|------|--------------|-------|
| **Product Owner** | TBD | @product | Roadmap, Priorities |
| **UX Designer** | TBD | @designer | Design System, Mockups |
| **Security Advisor** | TBD | @security | Security Review |

---

## 🎯 Team Capacity

### Working Hours
- **Core Hours:** 9:00 AM - 5:00 PM EST
- **Overlap Hours:** 10:00 AM - 3:00 PM EST (all team)
- **Standup:** 9:30 AM EST (Daily, 15 min)

### Availability

| Team Member | Capacity | Vacation | Notes |
|-------------|----------|----------|-------|
| @sean | 100% | - | SCRUM Master |
| @sa-nathan | 80% | - | Also handling architecture |
| @frontend-dev | 100% | - | New hire, onboarding |
| @backend-dev | 100% | - | - |
| @devops | 50% | - | Part-time, shared resource |
| @qa-tester | 100% | - | - |

**Total Sprint Capacity:** 530% ≈ 5.3 FTE

---

## 🏗️ Team Structure

### Pod Organization

```
┌─────────────────────────────────────────────────────────────┐
│                        SOLVY TEAM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │   PLATFORM POD  │      │    IBC POD      │              │
│  │                 │      │                 │              │
│  │  @frontend-dev  │      │  @frontend-dev  │              │
│  │  @backend-dev   │      │  @backend-dev   │              │
│  │  @qa-tester     │      │  @qa-tester     │              │
│  └────────┬────────┘      └────────┬────────┘              │
│           │                        │                       │
│           └────────┬───────────────┘                       │
│                    │                                       │
│           ┌────────▼────────┐                              │
│           │  PLATFORM TEAM  │                              │
│           │                 │                              │
│           │  @sa-nathan     │  Tech Lead                   │
│           │  @devops        │  Infrastructure              │
│           └─────────────────┘                              │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                 SCRUM MASTER                        │   │
│  │                    @sean                           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Roles & Responsibilities

### SCRUM Master (@sean)
- Facilitate all SCRUM ceremonies
- Remove blockers
- Track velocity and metrics
- Coach team on agile practices
- Liaison with stakeholders

### Tech Lead (@sa-nathan)
- Architecture decisions
- Code review (all PRs)
- Technical guidance
- Performance optimization
- Security review

### Frontend Developer (@frontend-dev)
- UI component development
- User experience implementation
- Browser compatibility
- Accessibility (WCAG 2.1 AA)
- Unit testing

### Backend Developer (@backend-dev)
- API development
- Database design
- Integration testing
- Performance tuning
- Security implementation

### DevOps Engineer (@devops)
- CI/CD pipeline
- Infrastructure management
- Deployment automation
- Monitoring & alerting
- Security hardening

### QA Engineer (@qa-tester)
- Test planning
- Manual testing
- Automated test development
- Regression testing
- Quality metrics

---

## 💬 Communication Channels

### Real-Time Chat
- **Platform:** (TBD - Discord/Slack)
- **Channels:**
  - `#general` - General discussion
  - `#development` - Technical chat
  - `#random` - Off-topic
  - `#alerts` - CI/CD alerts
  - `#standup` - Async standup updates

### Video Calls
- **Daily Standup:** 9:30 AM EST (15 min)
- **Sprint Planning:** Monday 10:00 AM EST (2 hours)
- **Sprint Review:** Friday 2:00 PM EST (1 hour)
- **Retrospective:** Friday 3:00 PM EST (1 hour)

### Email
- **Team:** team@solvy.coop
- **Support:** support@solvy.coop

---

## 🎓 Onboarding Checklist

### New Developer Onboarding

#### Day 1: Setup
- [ ] GitHub/Gitea account added to organization
- [ ] VPN access configured
- [ ] Development environment setup
- [ ] IDE extensions installed
- [ ] Slack/Discord invited
- [ ] Team introductions

#### Week 1: First Sprint
- [ ] Shadow current sprint ceremonies
- [ ] Pick up first "good first issue"
- [ ] Complete architecture overview
- [ ] Set up 1:1s with team members

#### Month 1: Integration
- [ ] Deliver first feature
- [ ] Participate in full sprint cycle
- [ ] Complete security training
- [ ] Receive feedback

---

## 📊 Team Metrics

### Velocity History

| Sprint | Committed | Completed | Velocity |
|--------|-----------|-----------|----------|
| Sprint 1 | 40 | 35 | 35 |
| Sprint 2 | 35 | 38 | 36.5 |
| Sprint 3 | 34 | TBD | TBD |

### Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Code Coverage | >80% | 78% |
| Bug Escape Rate | <5% | 3% |
| PR Review Time | <24h | 18h avg |
| Build Success Rate | >95% | 98% |

### Happiness Index

| Team Member | Happiness (1-10) | Notes |
|-------------|------------------|-------|
| @sean | 8 | Good progress |
| @sa-nathan | 7 | Heavy workload |
| @frontend-dev | 9 | Excited about new features |
| @backend-dev | 8 | Good challenges |
| @devops | 8 | Part-time working well |
| @qa-tester | 9 | Clear requirements |

**Team Average:** 8.2/10

---

## 🚨 Escalation Matrix

| Issue Type | First Contact | Escalation | Timeline |
|------------|---------------|------------|----------|
| Technical Blocker | Tech Lead (@sa-nathan) | SCRUM Master (@sean) | Same day |
| Resource Conflict | SCRUM Master (@sean) | Product Owner | 24 hours |
| Process Issue | SCRUM Master (@sean) | Product Owner | 24 hours |
| Scope Change | Product Owner | Stakeholders | 48 hours |
| Urgent Bug | On-call Developer | Tech Lead | Immediate |

---

## 🎯 Team Goals (Quarterly)

### Q2 2025 Goals
1. **Launch SOLVY 2.0** - Privacy-first architecture
2. **100% Test Coverage** - Critical paths
3. **Zero Security Vulnerabilities** - Penetration testing
4. **Team Velocity >40** - Consistent delivery

### Professional Development
- Each team member: 2 conference talks or blog posts
- Certifications: AWS, Security+, or equivalent
- Cross-training: Each dev learns another area

---

**Next Team Review:** Sprint 3 Retrospective (April 5, 2025)
