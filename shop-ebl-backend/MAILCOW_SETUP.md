# MailCow SMTP Configuration for EBL Backend

## Overview

The EBL backend uses MailCow for sending email notifications to Eva when customers:
- Submit contact requests
- Book appointments
- Complete payments

## MailCow Setup Steps

### 1. Access MailCow Admin Panel

```
URL: https://mail.ebl.beauty
Login with admin credentials
```

### 2. Create Email Account for Backend

Navigate to: **Email** → **Mailboxes** → **Add mailbox**

**Configuration:**
- **Email address**: `noreply@ebl.beauty`
- **Full name**: EBL Payment App
- **Password**: Generate strong password (save for .env file)
- **Quota**: 1GB (minimal, just for sending)
- **Active**: ✅ Yes

### 3. Create Email Account for Eva

Navigate to: **Email** → **Mailboxes** → **Add mailbox**

**Configuration:**
- **Email address**: `eva@ebl.beauty`
- **Full name**: Eva - Evergreen Beauty Lounge
- **Password**: Set secure password
- **Quota**: 5GB
- **Active**: ✅ Yes

### 4. Configure SMTP Settings

Navigate to: **System** → **Configuration** → **Options**

**SMTP Submission (Port 587):**
- **Enable SMTP submission**: ✅ Yes
- **STARTTLS**: ✅ Required
- **Authentication**: ✅ Required

### 5. Allow Backend Server IP

Navigate to: **System** → **Configuration** → **Access**

**Whitelist VPS IP:**
- Add `46.62.235.95` to SMTP whitelist
- This allows backend to send emails without rate limiting

### 6. Test SMTP Connection

From VPS, test SMTP:

```bash
# Install swaks (SMTP test tool)
apt-get install swaks

# Test SMTP connection
swaks --to eva@ebl.beauty \
  --from noreply@ebl.beauty \
  --server mail.ebl.beauty:587 \
  --auth LOGIN \
  --auth-user noreply@ebl.beauty \
  --auth-password 'YOUR_PASSWORD' \
  --tls \
  --header "Subject: Test Email from EBL Backend" \
  --body "This is a test email to verify SMTP configuration."
```

Expected output: `250 2.0.0 Ok: queued as XXXXX`

### 7. Configure Backend .env File

Update `/var/www/ebl-api/.env`:

```env
MAILCOW_HOST=mail.ebl.beauty
MAILCOW_USER=noreply@ebl.beauty
MAILCOW_PASS=your_generated_password_here
EVA_EMAIL=eva@ebl.beauty
```

### 8. Restart Backend Service

```bash
systemctl restart ebl-api
systemctl status ebl-api
```

## Email Templates

The backend sends these email types:

### Contact Request Email
```
To: eva@ebl.beauty
From: noreply@ebl.beauty
Subject: New Contact Request - [Service Name]

Body:
- Customer phone number
- Service requested
- Optional message
```

### Appointment Booking Email
```
To: eva@ebl.beauty
From: noreply@ebl.beauty
Subject: New Appointment Request - [Service Name]

Body:
- Customer phone number
- Service type
- Preferred date/time
```

### Payment Success Email
```
To: eva@ebl.beauty
From: noreply@ebl.beauty
Subject: Payment Received - [Service Name]

Body:
- Customer phone number
- Service paid for
- Amount
- Stripe payment ID
```

## Troubleshooting

### SMTP Connection Refused

**Problem**: Backend can't connect to MailCow

**Solutions**:
1. Check firewall allows port 587:
   ```bash
   ufw allow 587/tcp
   ```

2. Verify MailCow is running:
   ```bash
   docker ps | grep mailcow
   ```

3. Check MailCow logs:
   ```bash
   docker logs mailcowdockerized_postfix-mailcow_1
   ```

### Authentication Failed

**Problem**: SMTP authentication error

**Solutions**:
1. Verify credentials in .env file
2. Check mailbox is active in MailCow admin
3. Reset password in MailCow admin panel

### Emails Not Arriving

**Problem**: Emails sent but not received

**Solutions**:
1. Check spam folder
2. Verify SPF/DKIM/DMARC records:
   ```bash
   dig TXT ebl.beauty
   dig TXT _dmarc.ebl.beauty
   ```

3. Check MailCow queue:
   ```bash
   docker exec mailcowdockerized_postfix-mailcow_1 postqueue -p
   ```

## Security Best Practices

1. **Use App-Specific Password**: Don't use main mailbox password
2. **Enable 2FA**: For admin MailCow access
3. **Monitor Logs**: Watch for suspicious activity
4. **Rate Limiting**: Configure in MailCow to prevent abuse
5. **TLS Required**: Always use encrypted connections

## Integration with Huginn

For future automation, Huginn can:
- Monitor `eva@ebl.beauty` inbox
- Auto-respond to common requests
- Create tasks from appointment bookings
- Send follow-up emails to customers

**Huginn Setup** (Future Phase):
1. Install Huginn on Hetzner VPS
2. Create IMAP agent to monitor eva@ebl.beauty
3. Create webhook agents to trigger actions
4. Connect to backend API for automated responses

## Support

For MailCow issues:
- Documentation: https://docs.mailcow.email
- Community: https://community.mailcow.email

For backend integration issues:
- Check logs: `journalctl -u ebl-api -f`
- Contact: eva@ebl.beauty
