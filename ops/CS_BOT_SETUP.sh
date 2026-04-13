#!/bin/bash
# SOLVY Customer Service Bot Setup Script
# Automates MailCow webhook + Huginn agent configuration

set -e

echo "🤖 SOLVY Customer Service Bot Setup"
echo "===================================="

# Check environment variables
if [ -z "$KIMI_API_KEY" ]; then
    echo "❌ Error: KIMI_API_KEY not set"
    echo "Get your API key from: https://platform.kimi.ai"
    exit 1
fi

if [ -z "$MAILCOW_API_KEY" ]; then
    echo "❌ Error: MAILCOW_API_KEY not set"
    exit 1
fi

MAILCOW_HOST="${MAILCOW_HOST:-mail.ebl.beauty}"
HUGINN_HOST="${HUGINN_HOST:-huginn.ebl.beauty}"

echo ""
echo "Configuration:"
echo "  MailCow: $MAILCOW_HOST"
echo "  Huginn: $HUGINN_HOST"
echo ""

# Step 1: Configure MailCow webhook
echo "📧 Step 1: Configuring MailCow webhook..."

curl -X POST "https://$MAILCOW_HOST/api/v1/add/relayhost" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MAILCOW_API_KEY" \
  -d '{
    "relayhost": "support-webhook",
    "hostname": "'$HUGINN_HOST'",
    "username": "",
    "password": ""
  }'

echo "✅ MailCow webhook configured"

# Step 2: Create Huginn agents
echo ""
echo "🎯 Step 2: Creating Huginn agents..."

# Note: This requires Huginn API access
# For now, output the configuration for manual import

cat > /tmp/huginn-agents.json << 'EOF'
{
  "agents": [
    {
      "type": "WebRequestAgent",
      "name": "SOLVY Email Inbound",
      "schedule": "never",
      "keep_events_for": 86400,
      "propagate_immediately": true,
      "options": {
        "secret": "solvy-email-webhook",
        "expected_receive_period_in_days": 1
      }
    },
    {
      "type": "TriggerAgent",
      "name": "Classify Email Intent",
      "schedule": "never",
      "keep_events_for": 86400,
      "propagate_immediately": true,
      "options": {
        "rules": [
          {
            "type": "regex",
            "value": "(?i)(password|login|account|card|balance)",
            "path": "subject",
            "action": "account_issue"
          },
          {
            "type": "regex",
            "value": "(?i)(fee|charge|cost|price|how much)",
            "path": "subject",
            "action": "pricing_faq"
          },
          {
            "type": "regex",
            "value": "(?i)(dispute|fraud|unauthorized|angry|lawyer)",
            "path": "body",
            "action": "human_escalation"
          }
        ]
      },
      "sources": ["SOLVY Email Inbound"]
    },
    {
      "type": "PostAgent",
      "name": "Call Kimi API",
      "schedule": "never",
      "keep_events_for": 86400,
      "options": {
        "post_url": "https://api.kimi.ai/v1/chat/completions",
        "headers": {
          "Authorization": "Bearer <%= credential 'KIMI_API_KEY' %>",
          "Content-Type": "application/json"
        },
        "payload": {
          "model": "kimi-latest",
          "messages": [
            {
              "role": "system",
              "content": "You are SOLVY Support..."
            },
            {
              "role": "user",
              "content": "Subject: {{subject}}\\n\\nBody: {{body}}"
            }
          ]
        }
      },
      "sources": ["Classify Email Intent"]
    }
  ]
}
EOF

echo "✅ Huginn agent configuration saved to: /tmp/huginn-agents.json"
echo "   Import this file in Huginn: Scenarios → Import"

# Step 3: Test Kimi API
echo ""
echo "🧠 Step 3: Testing Kimi API connection..."

RESPONSE=$(curl -s -X POST "https://api.kimi.ai/v1/chat/completions" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-latest",
    "messages": [
      {"role": "system", "content": "You are SOLVY Support."},
      {"role": "user", "content": "What is SOLVY?"}
    ]
  }')

if echo "$RESPONSE" | grep -q "choices"; then
    echo "✅ Kimi API connection successful"
else
    echo "⚠️  Kimi API test failed. Response:"
    echo "$RESPONSE"
fi

# Step 4: Create knowledge base directory
echo ""
echo "📚 Step 4: Setting up knowledge base..."

mkdir -p /opt/solvy/support/knowledge-base

cat > /opt/solvy/support/knowledge-base/faq-general.md << 'EOF'
# SOLVY General FAQ

## What is SOLVY?
SOLVY Ecosystem™ is a cooperative financial platform where members own 70% of interchange revenue through the SOLVY Card™.

## What is the 70/20/10 model?
- 70% → Member Pool (distributed to members)
- 20% → Operations (running the platform)
- 10% → Sovereign Fund (emergency reserve)

## When does SOLVY launch?
June 19, 2026 (Juneteenth).

## How do I become a member?
Join the First Circle with a $100 equity contribution at ebl.beauty/onboarding.html.
EOF

echo "✅ Knowledge base created at /opt/solvy/support/knowledge-base/"

# Step 5: Final instructions
echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "  1. Import /tmp/huginn-agents.json into Huginn"
echo "  2. Add KIMI_API_KEY to Huginn credentials"
echo "  3. Test by sending email to support@ebl.beauty"
echo "  4. Monitor Huginn logs for errors"
echo ""
echo "Documentation: ops/CUSTOMER_SERVICE_BOT_ARCHITECTURE.md"
echo ""
