# Huginn Automation Platform Setup
## SOLVY "Going to Market" Automation

**Purpose:** Automated workflows for marketing, sales, and member onboarding  
**Platform:** Docker on VPS or Raspberry Pi  
**Domain:** automation.solvy.coop  

---

## Overview

Huginn is a self-hosted IFTTT/Zapier alternative that creates autonomous agents for:

- 📧 Automated email sequences
- 🐦 Social media posting
- 📊 Data collection and monitoring
- 🔔 Alerting and notifications
- 🔄 Workflow automation
- 📈 Market intelligence

**Use Cases for SOLVY:**
- New member onboarding sequences
- Social media content scheduling
- Competitor monitoring
- News aggregation for IBC community
- Automated reporting
- Lead nurturing

---

## Prerequisites

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB | 50 GB |
| OS | Linux | Ubuntu 22.04 LTS |

### Software Requirements
- Docker 20.10+
- Docker Compose 2.x
- Valid domain (automation.solvy.coop)
- SMTP server (MailCow recommended)

### DNS Configuration

```dns
automation.solvy.coop.  A  YOUR_SERVER_IP
```

---

## Installation

### Step 1: Prepare Environment

```bash
# Create directory
sudo mkdir -p /opt/huginn
cd /opt/huginn
sudo chown -R $USER:$USER /opt/huginn

# Create environment file
nano .env
```

Add to `.env`:

```bash
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
DATABASE_PASSWORD=your_secure_db_password

# Huginn
APP_SECRET_TOKEN=your_random_secret_token
TIMEZONE=America/New_York
INVITATION_CODE=solvy2025

# SMTP (use MailCow)
SMTP_DOMAIN=solvy.coop
SMTP_USER_NAME=noreply@solvy.coop
SMTP_PASSWORD=your_email_password
SMTP_SERVER=mail.solvy.coop
SMTP_PORT=587
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true

# Email sender
EMAIL_FROM_ADDRESS=noreply@solvy.coop
```

### Step 2: Create Docker Compose

```bash
nano docker-compose.yml
```

Add:

```yaml
version: '3.8'

services:
  huginn:
    image: huginn/huginn:latest
    container_name: huginn
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_ADAPTER=mysql2
      - DATABASE_NAME=huginn
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - APP_SECRET_TOKEN=${APP_SECRET_TOKEN}
      - TIMEZONE=${TIMEZONE}
      - INVITATION_CODE=${INVITATION_CODE}
      - SMTP_DOMAIN=${SMTP_DOMAIN}
      - SMTP_USER_NAME=${SMTP_USER_NAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_SERVER=${SMTP_SERVER}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_AUTHENTICATION=${SMTP_AUTHENTICATION}
      - SMTP_ENABLE_STARTTLS_AUTO=${SMTP_ENABLE_STARTTLS_AUTO}
      - EMAIL_FROM_ADDRESS=${EMAIL_FROM_ADDRESS}
      - REQUIRE_CONFIRMATION=true
      - ALLOW_JSONPATH_EVAL=true
      - ENABLE_INSECURE_AGENTS=true
    volumes:
      - huginn_data:/app/data
    depends_on:
      - mysql
    networks:
      - huginn_network

  mysql:
    image: mysql:8.0
    container_name: huginn_mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=huginn
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - huginn_network

  # Optional: Nginx reverse proxy for HTTPS
  nginx:
    image: nginx:alpine
    container_name: huginn_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - huginn
    networks:
      - huginn_network

volumes:
  huginn_data:
  mysql_data:

networks:
  huginn_network:
    driver: bridge
```

### Step 3: Optional Nginx Configuration

```bash
nano nginx.conf
```

Add:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream huginn {
        server huginn:3000;
    }

    server {
        listen 80;
        server_name automation.solvy.coop;
        
        location / {
            proxy_pass http://huginn;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 4: Start Huginn

```bash
# Pull images
docker compose pull

# Start services
docker compose up -d

# Watch logs
docker compose logs -f huginn
```

Wait for "Listening on tcp://0.0.0.0:3000" message (5-10 minutes).

### Step 5: Access Huginn

```
URL: http://automation.solvy.coop (or http://SERVER_IP:3000)
Username: admin
Password: password
```

**Change password immediately!**

---

## Initial Configuration

### Step 1: Create Account

1. Go to http://automation.solvy.coop
2. Click "Sign up"
3. Use invitation code: `solvy2025`
4. Create admin account
5. Login

### Step 2: Configure Settings

1. Click username → Account Settings
2. Set timezone: America/New_York
3. Configure email:
   - From: noreply@solvy.coop
   - SMTP settings (already in docker-compose)
4. Save

### Step 3: Create Service Credentials

Go to Services → New Service:

| Service | Purpose |
|---------|---------|
| Twitter/X | Social media posting |
| LinkedIn | Professional networking |
| MailCow | Email sending |
| Webhook | External integrations |

---

## SOLVY Automation Workflows

### Workflow 1: New Member Onboarding

**Trigger:** Webhook from SOLVY app (new registration)

**Scenario:**
```
Webhook Trigger
    ↓
Delay (5 minutes)
    ↓
Email Agent: Welcome email
    ↓
Delay (1 day)
    ↓
Email Agent: Getting started guide
    ↓
Delay (3 days)
    ↓
Email Agent: Privacy features explanation
    ↓
Delay (7 days)
    ↓
Email Agent: Community invitation
    ↓
Tag: onboarded
```

**Implementation:**

1. Create **Webhook Agent**:
   - Name: "New Member Webhook"
   - Type: Webhook Agent
   - Options:
     ```json
     {
       "secret": "your_webhook_secret",
       "expected_receive_period_in_days": 1
     }
     ```

2. Create **Email Agents** (one per email):
   - Name: "Welcome Email"
   - Type: Email Agent
   - Options:
     ```json
     {
       "subject": "Welcome to SOLVY, {{member_name}}!",
       "headline": "Your journey to financial sovereignty starts now",
       "body": "Hi {{member_name}},\n\nWelcome to SOLVY..."
     }
     ```

3. Create **Delay Agents** between emails

4. Create **Scenario** connecting all agents

### Workflow 2: Social Media Content Calendar

**Trigger:** Schedule (daily)

**Scenario:**
```
Schedule (9 AM daily)
    ↓
Data Output Agent: Get today's topic
    ↓
OpenAI Agent: Generate post
    ↓
Post Agent: Twitter/X
    ↓
Post Agent: LinkedIn
    ↓
Email Agent: Notify team
```

### Workflow 3: IBC News Aggregator

**Trigger:** RSS feed updates

**Scenario:**
```
RSS Agent: IBC blogs
    ↓
Trigger Agent: New article
    ↓
OpenAI Agent: Summarize
    ↓
Email Agent: Daily digest to members
    ↓
Tag: news
```

### Workflow 4: Competitor Monitoring

**Trigger:** Schedule (weekly)

**Scenario:**
```
Schedule (Monday 9 AM)
    ↓
Website Agent: Check competitor sites
    ↓
Change Detector: Compare to last check
    ↓
OpenAI Agent: Analyze changes
    ↓
Slack/Email Agent: Alert team
```

### Workflow 5: Automated Reporting

**Trigger:** Schedule (monthly)

**Scenario:**
```
Schedule (1st of month, 8 AM)
    ↓
HTTP Request Agent: Get SOLVY metrics API
    ↓
JavaScript Agent: Process data
    ↓
PDF Generator Agent: Create report
    ↓
Email Agent: Send to stakeholders
```

---

## Agent Types Quick Reference

### Triggers (Start Workflows)

| Agent | Purpose |
|-------|---------|
| Webhook Agent | External triggers |
| Schedule Agent | Time-based triggers |
| RSS Agent | Feed monitoring |
| IMAP Agent | Email monitoring |
| Twitter Stream | Social monitoring |

### Actions (Do Things)

| Agent | Purpose |
|-------|---------|
| Email Agent | Send emails |
| Post Agent | Social media posts |
| Webhook Agent | Call external APIs |
| Slack Agent | Send Slack messages |
| Data Output | Database operations |

### Processing (Transform Data)

| Agent | Purpose |
|-------|---------|
| JavaScript Agent | Custom logic |
| OpenAI Agent | AI generation |
| Event Formatting | Transform events |
| Trigger Agent | Conditional logic |
| Delay Agent | Wait periods |

---

## Security

### 1. Change Default Password

```
Admin → Account → Change Password
Use strong password (16+ characters)
```

### 2. Enable HTTPS

```bash
# Using Let's Encrypt
docker compose exec nginx certbot --nginx -d automation.solvy.coop

# Or manually add certificates to ./ssl/
```

### 3. Firewall Rules

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Huginn (if no nginx)
sudo ufw enable
```

### 4. Webhook Secrets

Always use secrets for webhooks:
```json
{
  "secret": "long_random_string_here",
  "expected_receive_period_in_days": 1
}
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check containers
docker compose ps

# Check logs
docker compose logs huginn --tail=100

# Check database
docker compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Restart if needed
docker compose restart huginn
```

### Backup

```bash
# Backup database
docker compose exec mysql mysqldump -u root -p huginn > huginn_backup_$(date +%Y%m%d).sql

# Backup data volume
docker run --rm -v huginn_huginn_data:/data -v $(pwd):/backup alpine tar czf /backup/huginn_data_$(date +%Y%m%d).tar.gz -C /data .
```

Add to crontab:
```bash
0 2 * * * cd /opt/huginn && ./backup.sh
```

### Updates

```bash
# Update Huginn
docker compose pull
docker compose up -d

# Clean up
docker system prune -f
```

---

## Troubleshooting

### Huginn Won't Start

```bash
# Check logs
docker compose logs huginn --tail=50

# Common issues:
# - Database not ready: docker compose restart huginn
# - Memory: Check docker stats
# - Wrong credentials: Verify .env file
```

### Emails Not Sending

```bash
# Test SMTP
docker compose exec huginn bundle exec rails runner "UserMailer.test_email('you@solvy.coop').deliver_now"

# Check mail logs
docker compose logs huginn | grep -i smtp
```

### Webhooks Not Working

```bash
# Test webhook
curl -X POST http://automation.solvy.coop/users/1/web_requests/1/secret \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check webhook agent logs in Huginn UI
```

---

## Integration Examples

### Calling Huginn from SOLVY

```javascript
// When new member registers
fetch('https://automation.solvy.coop/users/1/web_requests/1/your_secret', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    member_name: 'John Doe',
    member_email: 'john@example.com',
    plan: 'premium'
  })
});
```

### Huginn Calling SOLVY API

```json
// HTTP Request Agent
{
  "post_url": "https://api.solvy.coop/v1/members",
  "expected_receive_period_in_days": "1",
  "content_type": "json",
  "method": "post",
  "payload": {
    "name": "{{name}}",
    "email": "{{email}}"
  },
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  }
}
```

---

## Resources

- **Huginn Docs:** https://github.com/huginn/huginn/wiki
- **Agent Documentation:** https://github.com/huginn/huginn/wiki/Agent-configuration-options
- **Community:** https://github.com/huginn/huginn/discussions
- **Example Scenarios:** https://github.com/huginn/huginn/wiki/Scenario-examples

---

**Setup Date:** _______________  
**Admin:** _______________  
**Domain:** automation.solvy.coop
