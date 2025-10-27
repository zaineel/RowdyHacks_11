#!/bin/bash

echo "🤠 Uploading Marketplace Files to Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVER_IP="209.222.10.188"
SERVER_USER="root"

echo "📁 Files to upload:"
echo "  - src/controllers/marketplaceController.js"
echo "  - src/routes/marketplace.js" 
echo "  - src/controllers/borrowController.js"
echo ""

echo "🚀 Uploading files..."

# Upload marketplace controller
scp backend/src/controllers/marketplaceController.js $SERVER_USER@$SERVER_IP:/tmp/marketplaceController.js

# Upload marketplace routes
scp backend/src/routes/marketplace.js $SERVER_USER@$SERVER_IP:/tmp/marketplace.js

# Upload borrow controller
scp backend/src/controllers/borrowController.js $SERVER_USER@$SERVER_IP:/tmp/borrowController.js

echo "✅ Files uploaded to /tmp/ on production server"
echo ""
echo "Next steps:"
echo "1. SSH into the server: ssh root@$SERVER_IP"
echo "2. Run the deployment commands below"
echo ""
echo "📋 Deployment commands to run on server:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "cd /opt/payitforward"
echo "cp /tmp/marketplaceController.js src/controllers/"
echo "cp /tmp/marketplace.js src/routes/"
echo "cp /tmp/borrowController.js src/controllers/"
echo "pm2 restart payitforward-api"
echo "rm /tmp/marketplace*.js /tmp/borrowController.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
