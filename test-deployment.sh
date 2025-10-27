#!/bin/bash

echo "🧪 Testing Marketplace Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

API_URL="https://api.crisiscopilot.tech"

echo "Testing marketplace endpoint..."
echo "Expected: 401 (Unauthorized) - means route exists"
echo "Not expected: 404 (Not Found) - means route missing"
echo ""

# Test marketplace endpoint
echo "GET $API_URL/api/marketplace"
curl -s -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/marketplace"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ If you see HTTP Status: 401, the deployment was successful!"
echo "❌ If you see HTTP Status: 404, the routes are not deployed yet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
