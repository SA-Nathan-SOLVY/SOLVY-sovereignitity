#!/bin/bash
# ============================================================================
# SOLVY Ecosystem™ — CI/CD SSH Key Setup
# Run this ONCE on your local machine to generate deployment keys
# ============================================================================

set -e

VPS_HOST="${VPS_HOST:-46.62.235.95}"
VPS_USER="${VPS_USER:-root}"
KEY_NAME="solvy-deploy"
KEY_DIR="${HOME}/.ssh/solvy-deploy-keys"

echo "========================================"
echo "SOLVY CI/CD SSH Key Setup"
echo "========================================"
echo ""

# Create key directory
mkdir -p "$KEY_DIR"

# Generate SSH key pair (no passphrase for CI/CD automation)
if [ -f "$KEY_DIR/$KEY_NAME" ]; then
    echo "⚠️  Key already exists at $KEY_DIR/$KEY_NAME"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key."
    else
        rm -f "$KEY_DIR/$KEY_NAME" "$KEY_DIR/$KEY_NAME.pub"
        ssh-keygen -t ed25519 -a 100 -f "$KEY_DIR/$KEY_NAME" -N "" -C "solvy-deploy-$(date +%Y%m%d)"
    fi
else
    echo "🔐 Generating new SSH key pair..."
    ssh-keygen -t ed25519 -a 100 -f "$KEY_DIR/$KEY_NAME" -N "" -C "solvy-deploy-$(date +%Y%m%d)"
fi

echo ""
echo "========================================"
echo "Step 1: Add Public Key to VPS"
echo "========================================"
echo ""
echo "Run this command to add the public key to your VPS:"
echo ""
echo "  ssh-copy-id -i $KEY_DIR/$KEY_NAME.pub ${VPS_USER}@${VPS_HOST}"
echo ""
echo "Or manually copy this public key to ~/.ssh/authorized_keys on the VPS:"
echo ""
cat "$KEY_DIR/$KEY_NAME.pub"
echo ""

echo "========================================"
echo "Step 2: Add Private Key to Gitea"
echo "========================================"
echo ""
echo "1. Go to your Gitea repository:"
echo "   https://gitea.ebl.beauty/smayone/solvy-platform/settings/secrets/actions"
echo ""
echo "2. Click 'Add Secret'"
echo ""
echo "3. Name: SSH_PRIVATE_KEY"
echo "   Value: (copy the entire contents below, including BEGIN/END lines)"
echo ""
cat "$KEY_DIR/$KEY_NAME"
echo ""

echo "========================================"
echo "Step 3: Add VPS Secrets to Gitea"
echo "========================================"
echo ""
echo "Add these additional secrets:"
echo ""
echo "  Name: VPS_HOST"
echo "  Value: $VPS_HOST"
echo ""
echo "  Name: VPS_USER"
echo "  Value: $VPS_USER"
echo ""

echo "========================================"
echo "Step 4: Test the Connection"
echo "========================================"
echo ""
echo "Test SSH access with the new key:"
echo ""
echo "  ssh -i $KEY_DIR/$KEY_NAME ${VPS_USER}@${VPS_HOST} 'echo Connected!'"
echo ""

echo "========================================"
echo "Security Notes"
echo "========================================"
echo ""
echo "• This key is for CI/CD automation ONLY — do not use it for daily SSH"
echo "• The private key has NO passphrase (required for CI/CD)"
echo "• Store the private key securely in Gitea secrets — never commit it"
echo "• To revoke access: remove the public key from ~/.ssh/authorized_keys on the VPS"
echo ""
echo "Key files stored in: $KEY_DIR/"
echo "  Private: $KEY_DIR/$KEY_NAME"
echo "  Public:  $KEY_DIR/$KEY_NAME.pub"
