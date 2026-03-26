# Gitea Setup - Quick Reference Card

## 🚀 One-Command Setup

```bash
cd /Users/smayone/Sovereignitity-Stack/gitea-tunnel-setup
./complete-setup.sh
```

---

## 📍 Key URLs

| Service | URL |
|---------|-----|
| Gitea Local | http://localhost:3000 |
| Gitea Public | https://gitea.ebl.beauty |
| Repository | https://gitea.ebl.beauty/smayone/solvy-platform |

---

## 🎮 Management Commands

```bash
./manage.sh start        # Start Gitea
./manage.sh stop         # Stop all services
./manage.sh restart      # Restart Gitea
./manage.sh tunnel       # Start Cloudflare tunnel
./manage.sh tunnel-stop  # Stop tunnel
./manage.sh status       # Check status
./manage.sh logs         # View logs
./manage.sh backup       # Create backup
```

---

## ✅ Setup Verification

```bash
# Check services
docker ps

# Check Gitea health
curl http://localhost:3000/api/healthz

# Check remotes
cd ../solvy-platform && git remote -v
```

---

## 🆘 Emergency Restart

```bash
./manage.sh stop
./manage.sh start
./manage.sh tunnel
```

---

## 🔧 Common Fixes

| Issue | Command |
|-------|---------|
| Docker not running | Start Docker Desktop |
| Gitea not responding | `./manage.sh restart` |
| Tunnel not working | Check `.env` for TUNNEL_TOKEN |
| Can't push | `git remote add gitea http://localhost:3000/smayone/solvy-platform.git` |

---

## 📞 Support

- **Setup issues:** Check `GITEA_SETUP_INSTRUCTIONS.md`
- **Team questions:** `GITEA-TEAM-ONBOARDING.md`
- **Full checklist:** `GITEA-SETUP-CHECKLIST.md`
- **Emergency:** Contact @sa-nathan

---

*Keep this handy during setup!*
