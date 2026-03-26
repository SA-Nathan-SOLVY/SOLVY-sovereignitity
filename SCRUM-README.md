# SOLVY SCRUM Master Setup Guide

**Welcome, Sean!** This guide will help you set up your IDE and start managing the SOLVY development team.

---

## 🚀 Quick Start (5 Minutes)

### 1. Install VS Code Extensions

Open VS Code and press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux), then type:

```
Extensions: Show Recommended Extensions
```

Click **"Install All"** to install the SCRUM/agile extensions.

### 2. Verify Setup

Open Terminal in VS Code (`Ctrl+``) and run:

```bash
# Check Todo Tree is working
grep -r "TODO:" --include="*.js" --include="*.md" .

# View SCRUM board
cat SCRUM-BOARD.md
```

### 3. Start Managing

Open these files in VS Code tabs:
1. `SCRUM-BOARD.md` - Daily board
2. `sprints/SPRINT-3.md` - Current sprint
3. `team/TEAM.md` - Team info

---

## 📁 Project Structure

```
Sovereignitity-Stack/
│
├── .vscode/                    # VS Code Configuration
│   ├── settings.json          # IDE settings (installed!)
│   ├── extensions.json        # Recommended extensions
│   ├── launch.json           # Debug configuration
│   └── SCRUM-CONFIG.md       # SCRUM Master guide
│
├── tasks/                     # Task Management
│   ├── TEMPLATE.md           # Task template
│   ├── backlog/              # Backlog tasks
│   ├── in-progress/          # Active tasks
│   ├── review/               # In code review
│   └── done/                 # Completed tasks
│
├── sprints/                   # Sprint Planning
│   ├── SPRINT-3.md           # Current sprint
│   └── VELOCITY.md           # Velocity tracking
│
├── team/                      # Team Management
│   └── TEAM.md               # Team roster & info
│
├── SCRUM-BOARD.md            # Visual SCRUM board
└── SCRUM-README.md          # This file
```

---

## 🎯 Your Daily Workflow

### Morning Routine (9:00 AM)

1. **Open SCRUM Board**
   ```bash
   code SCRUM-BOARD.md
   ```

2. **Review Todo Tree**
   - Click Todo Tree icon in sidebar
   - Review all TODOs/BUGs from yesterday

3. **Update Board**
   - Move completed tasks to "Done"
   - Check for new blockers
   - Update burndown chart

### Daily Standup (9:30 AM)

Use this format:
```markdown
## [Name] - [Date]

### Yesterday
- What was completed

### Today
- What will be worked on

### Blockers
- What's blocking progress
```

### Throughout the Day

- **Monitor blockers** - Update SCRUM-BOARD.md
- **Track velocity** - Update sprints/VELOCITY.md
- **Review PRs** - Use Git Graph extension
- **Update tasks** - Move files between task folders

---

## 🛠️ Essential Tools

### 1. Todo Tree (Sidebar)

Shows all TODOs, BUGs, FIXMEs across the project.

**Usage:**
- Click Todo Tree icon in left sidebar
- Filter by tag (TODO, BUG, etc.)
- Click to jump to code location

**Keywords Tracked:**
```javascript
// TODO: New feature to implement
// FIXME: Bug that needs fixing
// BUG: Critical issue
// BLOCKED: Can't proceed
// REVIEW: Needs code review
// SPRINT: Sprint-related note
// STORY: User story
// EPIC: Large feature
```

### 2. TODO Highlight

Highlights keywords in code with colors.

**Visual Indicators:**
- `TODO:` - Blue highlight
- `FIXME:` - Yellow highlight
- `BUG:` - Red highlight
- `BLOCKED:` - Dark red highlight
- `ASSIGNED:` - Purple highlight

### 3. Git Graph

Visual Git history and branch management.

**Usage:**
- Click Git Graph icon in sidebar
- View commit history
- Manage branches
- Create/merge PRs

### 4. Project Manager

Quickly switch between projects.

**Usage:**
- Click Project Manager icon
- See all SOLVY projects
- One-click project switching

---

## 📝 Creating Tasks

### Method 1: Using Template

1. Copy `tasks/TEMPLATE.md`
2. Rename to `tasks/backlog/TASK-XXX-short-name.md`
3. Fill in the details
4. Move to `in-progress/` when started

### Method 2: Quick Task

Create a task file with minimum info:

```markdown
# TASK-025: Quick Fix

## Metadata
- **Type:** Bug
- **Priority:** High
- **Status:** To Do
- **Assignee:** @frontend-dev
- **Sprint:** Sprint 3

## Description
Fix the login button not working on mobile.

## Acceptance Criteria
- [ ] Button works on iOS Safari
- [ ] Button works on Android Chrome
- [ ] Tests pass
```

### Method 3: Inline in Code

```javascript
// TODO: Fix mobile login button - BUG-025 - ASSIGNED: @frontend-dev - DUE: 2025-03-28
```

Then create the task file later.

---

## 🏃 Running a Sprint

### Sprint Planning (Monday, Week 1)

1. **Review Backlog**
   ```bash
   ls -la tasks/backlog/
   ```

2. **Select Tasks for Sprint**
   - Move selected tasks to `sprints/SPRINT-X.md`
   - Assign story points
   - Assign team members

3. **Create Sprint File**
   ```bash
   cp sprints/SPRINT-3.md sprints/SPRINT-4.md
   # Edit SPRINT-4.md
   ```

### Daily Standups (Every Day)

1. Open `SCRUM-BOARD.md`
2. Go to "Daily Standup" section
3. Each team member answers:
   - What did you do yesterday?
   - What will you do today?
   - Any blockers?

### Sprint Review (Friday, Week 2)

1. Demo completed features
2. Update `SCRUM-BOARD.md`
3. Move completed tasks to `tasks/done/`
4. Calculate velocity

### Retrospective (Friday, Week 2)

Update `sprints/VELOCITY.md` with:
- What went well?
- What didn't go well?
- Action items for next sprint

---

## 📊 Tracking Metrics

### Velocity Chart

Update `sprints/VELOCITY.md` after each sprint:

```markdown
| Sprint | Committed | Completed | Velocity |
|--------|-----------|-----------|----------|
| Sprint 3 | 34 | 32 | 32 |
```

### Burndown Chart

Update `SCRUM-BOARD.md` daily:

```
Remaining Points:
Day 0: 34
Day 1: 31
Day 2: 28
...
```

### Team Happiness

Update `team/TEAM.md` weekly:

```markdown
| Team Member | Happiness (1-10) |
|-------------|------------------|
| @frontend-dev | 9 |
| @backend-dev | 8 |
```

---

## 🚨 Handling Blockers

### Step 1: Identify
Add `BLOCKED:` comment in task:
```markdown
## Blockers
- [ ] BLOCKED: Waiting for API endpoint from @backend-dev
```

### Step 2: Escalate

| Level | Timeline | Action |
|-------|----------|--------|
| Level 1 | Same day | Resolve within team |
| Level 2 | 24 hours | Escalate to SCRUM Master |
| Level 3 | 48 hours | Escalate to Product Owner |

### Step 3: Update Board

Add to `SCRUM-BOARD.md`:
```markdown
## Blocked
| ID | Task | Blocked By | Owner |
|----|------|------------|-------|
| TASK-025 | API Integration | API not ready | @backend-dev |
```

---

## 🔗 Useful Commands

```bash
# Find all TODOs
grep -r "TODO:" --include="*.js" --include="*.md" --include="*.html" .

# Find all tasks assigned to someone
grep -r "ASSIGNED: @frontend-dev" tasks/

# Count tasks by status
ls tasks/backlog/ | wc -l      # Backlog count
ls tasks/in-progress/ | wc -l  # In progress count
ls tasks/done/ | wc -l         # Done count

# View recent changes
git log --oneline --since="1 week ago"

# Check velocity
cat sprints/VELOCITY.md
```

---

## 🎓 Tips for Success

### 1. Keep Board Updated
- Update `SCRUM-BOARD.md` at least daily
- Move task files to correct folders
- Update status in task metadata

### 2. Use Consistent Naming
- Task IDs: `TASK-XXX`, `STORY-XXX`, `BUG-XXX`, `EPIC-XXX`
- Branch names: `feature/TASK-XXX-short-name`
- Commit messages: `TASK-XXX: Brief description`

### 3. Communicate Early
- Flag blockers immediately
- Update team on scope changes
- Share wins in standup

### 4. Protect Team Focus
- Shield team from interruptions
- Defend sprint scope
- Say "no" to mid-sprint changes

### 5. Continuous Improvement
- Review velocity each sprint
- Update process based on retro
- Keep documentation current

---

## 📚 Resources

### Documentation
- [SCRUM Configuration](./.vscode/SCRUM-CONFIG.md)
- [Task Template](./tasks/TEMPLATE.md)
- [Current Sprint](./sprints/SPRINT-3.md)
- [Team Info](./team/TEAM.md)
- [Velocity History](./sprints/VELOCITY.md)

### External Tools
- **Git Server:** https://git.ebl.beauty
- **Staging:** https://staging.ebl.beauty
- **Production:** https://ebl.beauty

### Contact
- **SCRUM Master:** Sean (@sean)
- **Tech Lead:** SA Nathan (@sa-nathan)
- **Team:** team@solvy.coop

---

## ✅ Setup Checklist

For Sean:

- [ ] Install VS Code extensions
- [ ] Review `SCRUM-CONFIG.md`
- [ ] Read `team/TEAM.md`
- [ ] Check `sprints/SPRINT-3.md`
- [ ] Open `SCRUM-BOARD.md`
- [ ] Run first standup
- [ ] Set up recurring calendar invites
- [ ] Join team chat (Discord/Slack)

---

## 🎉 You're Ready!

You now have everything you need to manage the SOLVY development team. The system is designed to be:

- **Simple** - No complex tools needed
- **Transparent** - Everything in git/GitHub
- **Flexible** - Adapt to your workflow
- **Lightweight** - Minimal overhead

**Questions?** Ask SA Nathan or check the `.vscode/SCRUM-CONFIG.md` guide.

---

**Happy SCRUM Mastering!** 🚀

*Last Updated: March 25, 2025*
