#!/bin/bash

# Deploy Payment System for Marketplace
# This script deploys the new payment functionality to production

echo "🚀 Deploying Payment System for Marketplace..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server details
SERVER="209.222.10.188"
SERVER_USER="root"
SERVER_PATH="/root/crisiscopilot-backend"

echo -e "${BLUE}📦 Creating deployment package...${NC}"

# Create deployment package
cd backend
tar -czf ../payment-deploy.tar.gz \
  src/controllers/marketplacePaymentController.js \
  src/routes/marketplace.js \
  db/add_marketplace.sql

cd ..

echo -e "${GREEN}✅ Package created: payment-deploy.tar.gz${NC}"

echo -e "${YELLOW}📤 Uploading files to server...${NC}"

# Upload files to server
scp payment-deploy.tar.gz ${SERVER_USER}@${SERVER}:${SERVER_PATH}/

echo -e "${YELLOW}🔧 Extracting and updating files on server...${NC}"

# SSH into server and extract files
ssh ${SERVER_USER}@${SERVER} << 'EOF'
cd /root/crisiscopilot-backend

echo "📦 Extracting payment system files..."
tar -xzf payment-deploy.tar.gz

echo "🗄️ Updating database schema..."
psql -U postgres -d crisiscopilot -f db/add_marketplace.sql

echo "🔄 Restarting backend service..."
pm2 restart crisiscopilot-backend

echo "🧹 Cleaning up..."
rm payment-deploy.tar.gz

echo "✅ Payment system deployed successfully!"
EOF

echo -e "${GREEN}🎉 Payment system deployment complete!${NC}"
echo -e "${BLUE}📋 What was deployed:${NC}"
echo "   • Marketplace payment controller"
echo "   • Payment API endpoints"
echo "   • Database schema updates"
echo "   • Payment UI in MyMarketplace"
echo ""
echo -e "${YELLOW}🔗 Available endpoints:${NC}"
echo "   • POST /api/marketplace/payments/deposit"
echo "   • POST /api/marketplace/payments/refund"
echo "   • GET /api/marketplace/payments/history"
echo "   • GET /api/marketplace/payments/pending"
echo ""
echo -e "${GREEN}🚀 Ready to test the payment system!${NC}"
