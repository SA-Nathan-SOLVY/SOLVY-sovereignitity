# Gitea Setup Checklist - Tomorrow's Tasks

**Date:** March 26, 2025  
**SCRUM Master:** Sean  
**Goal:** Complete Gitea server setup for team collaboration

---

## 📋 Pre-Flight Checklist (Before Starting)

### System Requirements
- [ ] Docker Desktop installed
- [ ] Docker Desktop is running (whale icon in menu bar)
- [ ] At least 4GB RAM available
- [ ] At least 5GB disk space available
- [ ] Internet connection stable

### Access Requirements
- [ ] Cloudflare tunnel token available (in `gitea-tunnel-setup/.env`)
- [ ] Admin access to local machine
- [ ] Git configured with user name and email

### Files Ready
- [ ] `gitea-tunnel-setup/` directory exists
- [ ] `solvy-platform/` directory exists with code
- [ ] `manage.sh` is executable
- [ ] `complete-setup.sh` is executable

**Quick Verify:**
```bash
cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup
ls -la *.sh
```

---

## 🚀 Setup Steps (Execute in Order)

### Step 1: Open Terminal

**Estimated Time:** 2 minutes

```bash
# Navigate to project
cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup

# Verify scripts are executable
chmod +x manage.sh complete-setup.sh

# Check Docker is running
docker info
```

**Expected Output:**
```
Client:
 Version:    xx.xx.x
 ...
Server:
 ...
```

If you see errors, start Docker Desktop first.

---

### Step 2: Run Complete Setup

**Estimated Time:** 5-10 minutes

```bash
./complete-setup.sh
```

**What This Does:**
1. ✅ Checks Docker is running
2. ✅ Starts Gitea server (http://localhost:3000)
3. ✅ Prompts to create repository
4. ✅ Pushes SOLVY code to Gitea
5. ✅ Starts Cloudflare tunnel

**Expected Output:**
```
========================================
  SOLVY Platform Gitea Setup
========================================

[STEP] Checking Docker...
[INFO] Docker is running ✓

[STEP] Step 1/4: Starting Gitea Server...
...

🎉 SETUP COMPLETE!
========================================
```

---

### Step 3: Create Repository (Manual Step)

**Estimated Time:** 3 minutes

When the script prompts you:

1. **Open Browser:** http://localhost:3000
2. **Register Admin Account:**
   - Username: `smayone` (or your preferred admin username)
   - Email: your email
   - Password: strong password (save in password manager!)
3. **Click "+" → "New Repository"**
4. **Fill Repository Details:**
   - Repository Name: `solvy-platform`
   - Description: `SOLVY Cooperative Financial Platform`
   - Visibility: **Private** (recommended)
   - ☑️ Check "Initialize Repository"
5. **Click "Create Repository"**
6. **Return to Terminal** and press Enter

---

### Step 4: Verify Setup

**Estimated Time:** 2 minutes

```bash
# Check all services are running
./manage.sh status
```

**Expected Output:**
```
Service Status:
NAME            STATUS
server          running
db              running
tunnel          running

Health Check:
✓ Gitea is healthy
```

**Test URLs:**
- [ ] Local: http://localhost:3000/smayone/solvy-platform
- [ ] Public: https://gitea.ebl.beauty/smayone/solvy-platform

---

## ✅ Post-Setup Verification

### 1. Gitea Web Interface

**Test:** Open http://localhost:3000

**Verify:**
- [ ] Can see login page
- [ ] Can log in with admin account
- [ ] Can see `solvy-platform` repository
- [ ] Repository shows files (index.html, README.md, etc.)

### 2. Repository Content

**Test:** Browse repository in Gitea

**Verify:**
- [ ] All files from `solvy-platform/` are present
- [ ] File history shows commits
- [ ] Branches visible (main/master)

### 3. Public Access (Tunnel)

**Test:** Open https://gitea.ebl.beauty

**Verify:**
- [ ] Page loads over HTTPS
- [ ] SSL certificate is valid
- [ ] Can log in
- [ ] Repository accessible

**Note:** If tunnel doesn't work immediately, wait 2-3 minutes for DNS propagation.

### 4. Git Operations

**Test:** Run these commands

```bash
cd /Users/smayone/Sovereignitity-Stack/solvy-platform

# Check remote is configured
git remote -v

# Expected output:
# gitea   http://localhost:3000/smayone/solvy-platform.git (fetch)
# gitea   http://localhost:3000/smayone/solvy-platform.git (push)

# Test pull
git pull gitea main

# Make a test change
echo "# Test" >> README.md
git add README.md
git commit -m "Test commit from local"
git push gitea main
```

**Verify:**
- [ ] No errors during push
- [ ] Commit appears in Gitea web interface

---

## 👥 Team Onboarding (After Setup)

### 1. Create Team Accounts

**For each team member:**

1. Go to http://localhost:3000/user/sign_up
2. Create account for team member
3. Or use Admin Panel → User Accounts → Create User

**Team Members to Create:**
- [ ] @frontend-dev (Developer)
- [ ] @backend-dev (Developer)
- [ ] @qa-tester (QA)
- [ ] @devops (DevOps)

### 2. Grant Repository Access

1. Go to repository: http://localhost:3000/smayone/solvy-platform
2. Settings → Collaboration
3. Add each team member:
   - @frontend-dev → Write access
   - @backend-dev → Write access
   - @qa-tester → Read access
   - @devops → Admin access

### 3. Set Up Branch Protection

1. Repository Settings → Branches
2. Add Rule for `main` branch:
   - ☑️ Require pull request reviews
   - ☑️ Require status checks (if CI enabled)
   - ☑️ Restrict pushes

### 4. Share Access Info

**Send to team:**
```
SOLVY Gitea Server Access

URLs:
- Public: https://gitea.ebl.beauty/smayone/solvy-platform
- Local: http://localhost:3000/smayone/solvy-platform

Your Account:
- Username: [their username]
- Password: [temporary password]

Actions:
1. Log in and change your password
2. Set up 2FA (recommended)
3. Generate SSH key for Git operations
4. Clone repository: git clone https://gitea.ebl.beauty/smayone/solvy-platform.git
```

---

## 🔧 Optional Configuration

### 1. Enable Gitea Actions (CI/CD)

1. Admin Panel → Configuration
2. Find `[actions]` section
3. Set `ENABLED = true`
4. Restart Gitea: `./manage.sh restart`

### 2. Configure Email Notifications

1. Admin Panel → Configuration → SMTP Mailer
2. Add SMTP settings for your email provider
3. Test email delivery

### 3. Set Up Webhooks

1. Repository → Settings → Webhooks
2. Add webhook for deployment (if needed)

---

## 🚨 Troubleshooting

### Issue: Docker not running

**Symptom:** `Error: Docker is not running!`

**Fix:**
1. Open Docker Desktop
2. Wait for whale icon to appear
3. Retry setup

---

### Issue: Gitea won't start

**Symptom:** `Gitea is not responding`

**Fix:**
```bash
# Check logs
./manage.sh logs

# Look for errors
# Common issues:
# - Port 3000 already in use
# - Database connection failed

# Restart
docker-compose down
./manage.sh start
```

---

### Issue: Tunnel won't start

**Symptom:** `TUNNEL_TOKEN not configured`

**Fix:**
```bash
# Check .env file
cat .env

# Should show:
# TUNNEL_TOKEN=your_actual_token_here

# If missing, add it:
echo "TUNNEL_TOKEN=your_token_here" >> .env
```

---

### Issue: Can't push code

**Symptom:** `fatal: unable to access`

**Fix:**
```bash
cd /Users/smayone/Sovereignitity-Stack/solvy-platform

# Check remote
git remote -v

# If missing, add it:
git remote add gitea http://localhost:3000/smayone/solvy-platform.git

# If wrong URL, update it:
git remote set-url gitea http://localhost:3000/smayone/solvy-platform.git
```

---

### Issue: Public URL not working

**Symptom:** `https://gitea.ebl.beauty` doesn't load

**Fix:**
1. Wait 2-3 minutes for DNS
2. Check tunnel is running: `docker ps | grep tunnel`
3. Check tunnel logs: `docker logs gitea-tunnel`
4. Verify Cloudflare tunnel is active in Cloudflare dashboard

---

## 📝 Completion Sign-Off

Once all steps are complete, fill out:

| Check | Status | Notes |
|-------|--------|-------|
| Gitea running locally | ☐ | |
| Repository created | ☐ | |
| Code pushed to Gitea | ☐ | |
| Tunnel running | ☐ | |
| Public URL accessible | ☐ | |
| Team accounts created | ☐ | |
| Access permissions set | ☐ | |

**Completed by:** _________________  
**Date:** _________________  
**Time:** _________________

---

## 🎯 Next Steps (After Setup)

### Immediate (Today)
- [ ] Test all team member logins
- [ ] Clone repository on team machines
- [ ] Set up first pull request

### This Week
- [ ] Configure Gitea Actions for CI/CD
- [ ] Set up automated backups
- [ ] Document branching strategy

### This Sprint
- [ ] Move all SCRUM tasks to Gitea Issues
- [ ] Set up automated deployments
- [ ] Train team on Gitea workflow

---

## 📞 Support

**If stuck:**
1. Check logs: `./manage.sh logs`
2. Review: `GITEA_SETUP_INSTRUCTIONS.md`
3. Contact: SA Nathan (@sa-nathan)

**Emergency restart:**
```bash
cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup
./manage.sh stop
./manage.sh start
./manage.sh tunnel
```

---

**Good luck! 🚀**
