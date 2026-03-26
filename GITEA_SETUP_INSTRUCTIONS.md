# SOLVY Platform - Gitea Setup Instructions

## ✅ What Has Been Prepared

### 1. Gitea Server Configuration
- **Location**: `gitea-tunnel-setup/`
- **Local URL**: http://localhost:3000
- **Public URL**: https://gitea.ebl.beauty (after tunnel starts)
- **Cloudflare Tunnel Token**: ✅ Already configured

### 2. SOLVY Platform Code
- **Location**: `solvy-platform/`
- **Status**: ✅ Committed and ready to push
- **Gitea Actions**: `.gitea/workflows/deploy.yml` configured

### 3. Complete Setup Script
- **File**: `gitea-tunnel-setup/complete-setup.sh`
- **Purpose**: Automates all 3 steps

---

## 🚀 Quick Start (After Docker is Running)

### Option A: One-Command Setup
```bash
cd gitea-tunnel-setup
./complete-setup.sh
```

### Option B: Step-by-Step

#### Step 1: Start Gitea
```bash
cd gitea-tunnel-setup
./manage.sh start
```
Wait for "Gitea is ready!" message

#### Step 2: Create Repository
1. Open http://localhost:3000
2. Register/Login
3. Click **+** → **New Repository**
4. Name: `solvy-platform`
5. Click **Create Repository**

#### Step 3: Push Code
```bash
cd solvy-platform
git remote add gitea http://localhost:3000/smayone/solvy-platform.git
git push -u gitea main
```

#### Step 4: Start Tunnel
```bash
cd gitea-tunnel-setup
./manage.sh tunnel
```

---

## 🔗 Access URLs After Setup

| Service | URL |
|---------|-----|
| Gitea (Local) | http://localhost:3000 |
| Gitea (Public) | https://gitea.ebl.beauty |
| SOLVY Repo | https://gitea.ebl.beauty/smayone/solvy-platform |
| Gitea Actions | https://gitea.ebl.beauty/smayone/solvy-platform/actions |

---

## 📁 SOLVY Platform Files

```
solvy-platform/
├── index.html                    # Main EBL landing page
├── card/
│   ├── solvy-card.html          # Card interface
│   └── card-customizer.html     # Card customizer
├── sps-pilot/index.html         # SPS replenishment feed
├── payment/payment.html         # Payment processing
├── invoice/invoice-management.html
├── remittance/remittance.html
├── community/communities.html
├── decidey/decidey-ngo.html
├── operations/operations-dashboard.html
├── docs/CARD-API-DOCUMENTATION.md
├── Dockerfile
├── docker-compose.yml
├── .gitea/workflows/deploy.yml  # CI/CD
└── GITEA-DEPLOYMENT.md          # Deployment guide
```

---

## 🔧 Management Commands

```bash
# Start/Stop Gitea
cd gitea-tunnel-setup
./manage.sh start
./manage.sh stop
./manage.sh restart

# Tunnel management
./manage.sh tunnel          # Start tunnel
./manage.sh tunnel-stop     # Stop tunnel

# View logs
./manage.sh logs            # Gitea logs
./manage.sh logs-db         # Database logs

# Backup
./manage.sh backup          # Create backup

# Status
./manage.sh status          # Check all services
```

---

## 🐳 Docker Not Running?

### Start Docker Desktop:
1. Open **Docker Desktop** application
2. Wait for whale icon to show "Docker Desktop is running"
3. Run setup script:
   ```bash
   cd gitea-tunnel-setup
   ./complete-setup.sh
   ```

---

## ✅ Verification Checklist

After running setup, verify:

- [ ] Gitea accessible at http://localhost:3000
- [ ] Repository created at `/smayone/solvy-platform`
- [ ] Code pushed to Gitea
- [ ] Tunnel running (`docker ps | grep gitea-tunnel`)
- [ ] Public URL working: https://gitea.ebl.beauty

---

## 🆘 Troubleshooting

### Gitea won't start
```bash
docker logs gitea-server      # Check errors
docker logs gitea-postgres    # Check database
```

### Tunnel won't start
```bash
# Verify token
cat gitea-tunnel-setup/.env | grep TUNNEL_TOKEN

# Check tunnel logs
docker logs gitea-tunnel
```

### Can't push code
```bash
# Check remote
cd solvy-platform
git remote -v

# Add remote if missing
git remote add gitea http://localhost:3000/smayone/solvy-platform.git
```

---

## 📞 Next Steps

1. **Start Docker Desktop**
2. **Run**: `cd gitea-tunnel-setup && ./complete-setup.sh`
3. **Access**: https://gitea.ebl.beauty/smayone/solvy-platform
4. **Deploy**: Use Gitea Actions or Docker to deploy the static site

Your SOLVY platform will be fully hosted on your own Gitea server! 🎉
