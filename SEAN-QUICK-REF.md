# Sean's MacBook Quick Reference
## SOLVY SCRUM Master - Daily Commands

---

## 🚀 Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Terminal | `Cmd+Space` → type "Terminal" |
| Open VS Code/VSCodium | `Cmd+Space` → type "vscodium" |
| VS Code Command Palette | `Cmd+Shift+P` |
| VS Code Terminal | `` Cmd+` `` (backtick) |
| VS Code Extensions | `Cmd+Shift+X` |
| VS Code Files | `Cmd+Shift+E` |
| VS Code Search | `Cmd+Shift+F` |
| VS Code Git | `Cmd+Shift+G` |

---

## 📁 Project Navigation

```bash
# Quick project access
solvy                    # Go to /Users/smayone/Sovereignitity-Stack

# Or manually
cd /Users/smayone/Sovereignitity-Stack

# Open in VS Code
codium .

# View structure
tree -L 2
```

---

## 🐳 Gitea Management

```bash
# Start Gitea
gitea-start

# Check status
gitea-status

# View logs
./manage.sh logs

# Stop Gitea
gitea-stop

# Backup
gitea-backup
```

**URLs:**
- Local: http://localhost:3000
- Public: https://gitea.ebl.beauty
- Repo: https://gitea.ebl.beauty/smayone/solvy-platform

---

## 📝 SCRUM Daily Workflow

### Morning Standup Prep

```bash
# 1. Go to project
cd /Users/smayone/Sovereignitity-Stack

# 2. Open VS Code with project
codium .

# 3. Open SCRUM board (in VS Code)
# Cmd+O → type "SCRUM-BOARD.md"

# 4. Check Todo Tree
# Click Todo Tree icon in sidebar
# Review all TODOs/BUGs

# 5. Check git status
git status
git pull gitea main
```

### During Standup

```bash
# Update task status
# 1. Open task file in tasks/in-progress/
# 2. Update status
# 3. Move file: mv tasks/in-progress/TASK-XXX.md tasks/done/

# Update SCRUM-BOARD.md
# Edit burndown chart
# Move tasks between columns
```

### End of Day

```bash
# Commit updates
git add .
git commit -m "Update SCRUM board - $(date +%Y-%m-%d)"
git push gitea main
```

---

## 🔧 Git Commands

```bash
# Check status
git status

# Pull latest
git pull gitea main

# Create branch
git checkout -b feature/TASK-XXX-description

# Stage changes
git add filename          # Specific file
git add .                 # All files

# Commit
git commit -m "TASK-XXX: Description"

# Push
git push -u gitea feature/TASK-XXX-description

# Switch branch
git checkout main

# List branches
git branch -a

# View history
git log --oneline -10
```

---

## 🐳 Docker Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs
docker logs gitea-server
docker logs gitea-postgres
docker logs gitea-tunnel

# Restart container
docker restart gitea-server

# Stop all Gitea
cd gitea-tunnel-setup
docker-compose down

# Start all Gitea
docker-compose up -d
```

---

## 🔍 VS Code Todo Tree Keywords

When you see these in code, Todo Tree tracks them:

```javascript
// TODO: New feature to implement
// FIXME: Bug that needs fixing
// BUG: Critical issue
// BLOCKED: Can't proceed
// REVIEW: Needs code review
// SPRINT: Sprint planning note
// STORY: User story
// EPIC: Large feature
// NOTE: Important note
// ASSIGNED: @developer-name
```

---

## 📊 File Locations

| File | Path | Purpose |
|------|------|---------|
| SCRUM Board | `SCRUM-BOARD.md` | Daily task board |
| Sprint Plan | `sprints/SPRINT-3.md` | Current sprint |
| Velocity | `sprints/VELOCITY.md` | Team metrics |
| Team Info | `team/TEAM.md` | Team roster |
| Task Template | `tasks/TEMPLATE.md` | Create new tasks |
| Backlog | `tasks/backlog/` | Pending tasks |
| In Progress | `tasks/in-progress/` | Active tasks |
| Done | `tasks/done/` | Completed tasks |
| Gitea Scripts | `gitea-tunnel-setup/` | Server management |

---

## 🎨 VS Code Color Coding

Todo Tree highlights:
- 🔵 **Blue** - TODO
- 🟡 **Yellow** - FIXME
- 🔴 **Red** - BUG
- 🟣 **Purple** - ASSIGNED

---

## ⚡ Useful Aliases

Already set up in `.zshrc`:

```bash
solvy           # cd to project
gitea-start     # Start Gitea
gitea-stop      # Stop Gitea
gitea-status    # Check Gitea
ll              # Detailed file list
tree            # Directory tree
cat             # Syntax-highlighted view
```

---

## 🆘 Emergency Commands

### Gitea Won't Start

```bash
cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup

# Hard restart
docker-compose down
./manage.sh start
./manage.sh tunnel

# Check what's wrong
./manage.sh logs
docker ps
```

### VS Code Won't Open Project

```bash
cd /Users/smayone/Sovereignitity-Stack
codium .
# OR
code .
```

### Git Remote Issues

```bash
# Check remotes
git remote -v

# Add Gitea remote
git remote add gitea http://localhost:3000/smayone/solvy-platform.git

# Fix URL
git remote set-url gitea http://localhost:3000/smayone/solvy-platform.git
```

### Can't Access Gitea Public URL

```bash
# Check if tunnel is running
docker ps | grep tunnel

# Restart tunnel
./manage.sh tunnel-stop
./manage.sh tunnel

# Check logs
docker logs gitea-tunnel
```

---

## 📞 Who to Contact

| Issue | Contact |
|-------|---------|
| Gitea technical | @sa-nathan |
| Process/SCRUM | @sean (you!) |
| Team issues | @sean |
| Emergency | @sa-nathan |

---

## 🎯 Daily Checklist

- [ ] Open project in VS Code
- [ ] Check Todo Tree for issues
- [ ] Review SCRUM-BOARD.md
- [ ] Run standup
- [ ] Update task statuses
- [ ] Commit changes
- [ ] Push to Gitea

---

## 🔗 Quick Links

| Resource | URL/Path |
|----------|----------|
| Gitea Public | https://gitea.ebl.beauty |
| Gitea Local | http://localhost:3000 |
| Repository | https://gitea.ebl.beauty/smayone/solvy-platform |
| Project Folder | `/Users/smayone/Sovereignitity-Stack` |
| Gitea Scripts | `/Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup` |

---

**Print this and keep it handy! 📋**

*Last Updated: March 25, 2025*
