#!/bin/bash

echo "🚀 Uploading Payout Controller..."

# Method 1: Try SCP with verbose output
echo "📤 Attempting SCP upload..."
scp -v payoutController_enhanced.js root@45.76.123.123:/opt/payitforward/src/controllers/payoutController.js

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
    echo "🔄 Restarting PM2..."
    ssh root@45.76.123.123 "pm2 restart payitforward-api && pm2 logs payitforward-api --lines 5"
else
    echo "❌ SCP failed. Trying alternative method..."
    echo "📋 Manual steps:"
    echo "1. SSH into server: ssh root@45.76.123.123"
    echo "2. Create the file: nano /opt/payitforward/src/controllers/payoutController.js"
    echo "3. Copy the content from payoutController_enhanced.js"
    echo "4. Save and restart: pm2 restart payitforward-api"
fi

