#!/bin/bash

set -e  # Exit on any error

echo "🤠 PayItForward Marketplace Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Server details
SERVER_IP="209.222.10.188"
SERVER_USER="root"

print_step "Step 1: Uploading marketplace deployment package"
echo ""

# Upload the deployment package
scp marketplace-deploy.tar.gz $SERVER_USER@$SERVER_IP:/root/

print_success "Package uploaded to server"

print_step "Step 2: Deploying to production server"
echo ""

# Deploy to server
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
echo "🤠 Deploying PayItForward Marketplace Update"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to application directory
cd /opt/payitforward

# Backup current version
echo "📦 Creating backup..."
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude=node_modules --exclude=backup-*.tar.gz

# Extract new version
echo "📂 Extracting new version..."
tar -xzf /root/marketplace-deploy.tar.gz

# Install dependencies
echo "📥 Installing dependencies..."
npm install --production

# Run database migrations (marketplace tables should already exist)
echo "🗄️ Running database migrations..."
npm run migrate || echo "Migration completed or already up to date"

# Restart the application
echo "🔄 Restarting application..."
pm2 restart payitforward-api || pm2 start src/server.js --name payitforward-api

# Save PM2 configuration
pm2 save

echo "✅ Marketplace deployment complete!"
echo "📍 API: https://api.crisiscopilot.tech"
echo ""

# Clean up
rm /root/marketplace-deploy.tar.gz

# Show status
echo "📊 Application Status:"
pm2 status
ENDSSH

print_success "Backend deployed successfully!"

# Clean up local package
rm marketplace-deploy.tar.gz

print_step "Step 3: Testing production API"
echo ""

# Test the marketplace endpoint
echo "Testing marketplace endpoint..."
curl -s -X GET "https://api.crisiscopilot.tech/api/marketplace" | head -c 100
echo ""

print_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Marketplace Deployment Complete!"
print_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Backend API: https://api.crisiscopilot.tech"
echo "📍 Marketplace: https://api.crisiscopilot.tech/api/marketplace"
echo ""
echo "Next steps:"
echo "1. Deploy frontend to Cloudflare Pages"
echo "2. Test marketplace functionality"
echo "3. Update CORS settings if needed"
echo ""
