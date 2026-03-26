# SOLVY Team - Gitea Onboarding Guide

**Welcome to SOLVY's self-hosted Git server!**

---

## 🔗 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Gitea (Public)** | https://gitea.ebl.beauty | Primary access |
| **Gitea (Local)** | http://localhost:3000 | Local development |
| **Repository** | https://gitea.ebl.beauty/smayone/solvy-platform | Main codebase |
| **SCRUM Board** | See `SCRUM-BOARD.md` in repo | Task management |

---

## 🚀 First-Time Setup

### Step 1: Get Your Account

Sean (SCRUM Master) will provide:
- Username
- Temporary password
- Repository URL

### Step 2: Log In

1. Go to: https://gitea.ebl.beauty
2. Click "Sign In"
3. Enter your credentials
4. **Immediately change your password:**
   - Click profile picture → Settings → Account
   - Change password to something secure

### Step 3: Set Up 2FA (Recommended)

1. Settings → Security → Two-Factor Authentication
2. Scan QR code with authenticator app
3. Save recovery codes

### Step 4: Configure Git

```bash
# Set your name and email (if not already set)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Generate SSH key (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to Gitea:
# 1. Go to Settings → SSH / GPG Keys
# 2. Click "Add Key"
# 3. Paste your public key
```

---

## 📥 Clone the Repository

### Option 1: HTTPS (Easier)

```bash
git clone https://gitea.ebl.beauty/smayone/solvy-platform.git
cd solvy-platform
```

You'll be prompted for username/password on first push.

### Option 2: SSH (Recommended)

```bash
git clone git@gitea.ebl.beauty:smayone/solvy-platform.git
cd solvy-platform
```

No password needed after SSH key is set up.

---

## 🌿 Workflow

### Our Branching Strategy

```
main (production-ready)
  ↓
feature/STORY-XXX-description  ← Your feature branches
  ↓
Pull Request → Code Review → Merge to main
```

### Daily Workflow

```bash
# 1. Start of day - pull latest changes
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/STORY-015-privacy-dashboard

# 3. Make changes and commit
git add .
git commit -m "STORY-015: Add privacy dashboard component"

# 4. Push to Gitea
git push -u origin feature/STORY-015-privacy-dashboard

# 5. Create Pull Request in Gitea web interface
# 6. After review, merge to main
```

---

## 📝 Commit Message Format

```
TYPE-ID: Brief description

Detailed explanation if needed.

Related: STORY-015, TASK-016
```

**Types:**
- `STORY-XXX:` - User story
- `TASK-XXX:` - General task
- `BUG-XXX:` - Bug fix
- `EPIC-XXX:` - Epic work
- `docs:` - Documentation only
- `chore:` - Maintenance

**Examples:**
```
STORY-015: Implement privacy dashboard

Added PrivacyDashboard component with:
- Local vs shared data visualization
- Download data functionality
- Sync metrics button

Related: TASK-007, TASK-008
```

---

## 🔍 Code Review Process

### Creating a Pull Request

1. Push your branch to Gitea
2. Go to Repository → Pull Requests → New
3. Fill in:
   - **Title:** `STORY-015: Privacy Dashboard`
   - **Description:** 
     - What changed
     - Why it changed
     - Testing done
     - Screenshots (if UI)
4. Assign reviewers:
   - @sa-nathan (Tech Lead) - required
   - @frontend-dev (if frontend code)
5. Link related issues
6. Click "Create Pull Request"

### Reviewing Code

1. Go to Pull Requests → [Your PR]
2. Click "Files Changed"
3. Review each file:
   - Click line numbers to add comments
   - Use "Approve" or "Request Changes"
4. Add overall comment summarizing review

### Addressing Feedback

```bash
# Make requested changes
git add .
git commit -m "Address review feedback"
git push

# PR updates automatically
```

---

## 🐛 Working with Issues

### Viewing Issues

1. Go to: https://gitea.ebl.beauty/smayone/solvy-platform/issues
2. Filter by:
   - Assignee: You
   - Label: sprint-3
   - Status: Open

### Creating Issues

For bugs or new ideas:

1. Issues → New Issue
2. Use template:
   ```markdown
   ## Description
   Clear description of bug or feature

   ## Steps to Reproduce (for bugs)
   1. Step one
   2. Step two

   ## Expected Behavior
   What should happen

   ## Actual Behavior
   What actually happens

   ## Acceptance Criteria
   - [ ] Criterion 1
   - [ ] Criterion 2
   ```

### Linking Commits to Issues

```bash
# In commit message
git commit -m "BUG-025: Fix login button on mobile

Fixed CSS for mobile viewport.

Closes #25"
```

---

## 🔄 Staying in Sync

### Before Starting Work

```bash
git checkout main
git pull origin main
git checkout -b feature/your-branch
```

### Handling Conflicts

```bash
# If you have conflicts during pull
git pull origin main

# Edit conflicting files
# Look for <<<<<<< HEAD markers
# Resolve conflicts
# Then:
git add .
git commit -m "Merge main into feature branch"
```

---

## 🛠️ Useful Commands

### Daily Commands

```bash
# See what's changed
git status

# See commit history
git log --oneline -10

# See what you're about to push
git diff origin/main

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git checkout -- .
```

### Branch Management

```bash
# List branches
git branch -a

# Switch branches
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Prune old remote branches
git fetch --prune
```

---

## 📱 Gitea Mobile

Access on mobile:
- Gitea has responsive design
- Use browser or Gitea mobile app
- Same URLs as desktop

---

## 🚨 Common Issues

### "Permission denied"

**Cause:** SSH key not set up or wrong permissions

**Fix:**
```bash
# Check SSH key exists
ls ~/.ssh/id_*

# If missing, generate one
ssh-keygen -t ed25519

# Add to Gitea Settings → SSH Keys
```

### "Repository not found"

**Cause:** Wrong URL or no access

**Fix:**
```bash
# Check remote URL
git remote -v

# Update if needed
git remote set-url origin https://gitea.ebl.beauty/smayone/solvy-platform.git
```

### "Failed to push"

**Cause:** Branch protection or out of date

**Fix:**
```bash
# Pull latest first
git pull origin main

# Resolve any conflicts
# Then push again
git push
```

---

## 📚 Resources

### Internal Documentation
- [SCRUM Board](../SCRUM-BOARD.md)
- [Team Info](../team/TEAM.md)
- [Architecture Guide](../solvy-platform/SOVEREIGNITITY_DATA_ARCHITECTURE.md)

### Gitea Help
- Gitea Docs: https://docs.gitea.io
- Issues/PRs guide in Gitea interface

### Git Help
- Git Cheat Sheet: https://git-scm.com/docs/gittutorial
- Oh Shit Git: https://ohshitgit.com

---

## ✅ Onboarding Checklist

**New team members complete this:**

- [ ] Logged into https://gitea.ebl.beauty
- [ ] Changed default password
- [ ] Set up 2FA (recommended)
- [ ] Added SSH key to Gitea
- [ ] Cloned solvy-platform repository
- [ ] Created test branch and PR
- [ ] Reviewed code review guidelines
- [ ] Joined team communication channels

**Signed off by:** _________________  
**Date:** _________________

---

## 📞 Support

**Can't access Gitea?**
1. Check VPN if required
2. Try local URL: http://localhost:3000
3. Contact: @sean (SCRUM Master)

**Git questions?**
1. Check this guide first
2. Ask in team chat
3. Ask: @sa-nathan (Tech Lead)

**Emergency:**
- Server down? Contact @devops
- Lost access? Contact @sean

---

**Welcome to the team! 🎉**

Questions? Ask Sean or post in team chat.
