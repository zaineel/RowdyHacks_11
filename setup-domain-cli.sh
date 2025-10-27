#!/bin/bash

# Cloudflare Domain Setup Script for lassothestars.rodeo
# This script sets up DNS records and custom domain via CLI

set -e

echo "🌟 Cloudflare Domain Setup for lassothestars.rodeo"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required commands exist
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${YELLOW}Warning: jq not installed. Install for better output: brew install jq${NC}"; }

# Step 1: Get Cloudflare credentials
echo -e "${YELLOW}Step 1: Cloudflare API Credentials${NC}"
echo "You need your Cloudflare API Token with DNS and Pages permissions."
echo ""
echo "To create one:"
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Click 'Create Token'"
echo "3. Use 'Edit zone DNS' template"
echo "4. Add 'Cloudflare Pages:Edit' permission"
echo "5. Zone Resources: Include -> Specific zone -> lassothestars.rodeo"
echo ""
read -p "Enter your Cloudflare API Token: " CF_API_TOKEN
echo ""

if [ -z "$CF_API_TOKEN" ]; then
    echo -e "${RED}Error: API Token is required${NC}"
    exit 1
fi

# Step 2: Get Zone ID
echo -e "${YELLOW}Step 2: Getting Zone ID for lassothestars.rodeo...${NC}"

ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=lassothestars.rodeo" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ZONE_ID" ]; then
    echo -e "${RED}Error: Could not find zone for lassothestars.rodeo${NC}"
    echo "Response: $ZONE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Zone ID: $ZONE_ID${NC}"
echo ""

# Step 3: Get Vultr VPS IP
echo -e "${YELLOW}Step 3: Backend API Setup${NC}"
read -p "Enter your Vultr VPS IP address for api.lassothestars.rodeo: " VPS_IP
echo ""

if [ -z "$VPS_IP" ]; then
    echo -e "${YELLOW}Warning: No VPS IP provided. Skipping API DNS record.${NC}"
else
    # Validate IP format (basic check)
    if [[ ! $VPS_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo -e "${RED}Error: Invalid IP address format${NC}"
        exit 1
    fi
fi

# Step 4: Create DNS Records
echo -e "${YELLOW}Step 4: Creating DNS Records...${NC}"
echo ""

# Record 1: CNAME for root domain to Cloudflare Pages
echo "Creating CNAME record: @ -> 994cfecc.payitforward-41x.pages.dev"

CNAME_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "@",
    "content": "994cfecc.payitforward-41x.pages.dev",
    "ttl": 1,
    "proxied": true
  }')

if echo $CNAME_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Root domain CNAME created${NC}"
else
    echo -e "${YELLOW}Note: CNAME might already exist or there was an error${NC}"
    echo "Response: $CNAME_RESPONSE"
fi
echo ""

# Record 2: CNAME for www
echo "Creating CNAME record: www -> lassothestars.rodeo"

WWW_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "www",
    "content": "lassothestars.rodeo",
    "ttl": 1,
    "proxied": true
  }')

if echo $WWW_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✓ WWW CNAME created${NC}"
else
    echo -e "${YELLOW}Note: WWW CNAME might already exist or there was an error${NC}"
    echo "Response: $WWW_RESPONSE"
fi
echo ""

# Record 3: A record for API subdomain (if VPS IP provided)
if [ ! -z "$VPS_IP" ]; then
    echo "Creating A record: api -> $VPS_IP"

    API_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{
        \"type\": \"A\",
        \"name\": \"api\",
        \"content\": \"$VPS_IP\",
        \"ttl\": 1,
        \"proxied\": true
      }")

    if echo $API_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✓ API A record created${NC}"
    else
        echo -e "${YELLOW}Note: API A record might already exist or there was an error${NC}"
        echo "Response: $API_RESPONSE"
    fi
    echo ""
fi

# Step 5: List all DNS records
echo -e "${YELLOW}Step 5: Current DNS Records${NC}"
echo ""

DNS_LIST=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json")

if command -v jq >/dev/null 2>&1; then
    echo "$DNS_LIST" | jq -r '.result[] | "\(.type)\t\(.name)\t->\t\(.content)\tProxied: \(.proxied)"'
else
    echo "$DNS_LIST"
fi

echo ""
echo -e "${GREEN}✓ DNS records configured!${NC}"
echo ""

# Step 6: Cloudflare Pages Custom Domain
echo -e "${YELLOW}Step 6: Cloudflare Pages Custom Domain Setup${NC}"
echo ""
echo "To add custom domain to Cloudflare Pages, you need:"
echo "1. Your Cloudflare Account ID"
echo "2. Your Pages Project Name"
echo ""
echo "You can find these by running: wrangler pages project list"
echo ""

read -p "Do you want to add the custom domain to Pages now? (y/n): " ADD_PAGES

if [ "$ADD_PAGES" = "y" ] || [ "$ADD_PAGES" = "Y" ]; then
    read -p "Enter your Cloudflare Account ID: " ACCOUNT_ID
    read -p "Enter your Pages Project Name (e.g., payitforward-41x): " PROJECT_NAME

    if [ ! -z "$ACCOUNT_ID" ] && [ ! -z "$PROJECT_NAME" ]; then
        echo ""
        echo "Adding custom domain: lassothestars.rodeo to $PROJECT_NAME..."

        PAGES_RESPONSE=$(curl -s -X POST \
          "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
          -H "Authorization: Bearer $CF_API_TOKEN" \
          -H "Content-Type: application/json" \
          --data '{"name": "lassothestars.rodeo"}')

        if echo $PAGES_RESPONSE | grep -q '"success":true'; then
            echo -e "${GREEN}✓ Custom domain lassothestars.rodeo added to Pages!${NC}"
        else
            echo -e "${YELLOW}Note: Error adding custom domain${NC}"
            echo "Response: $PAGES_RESPONSE"
        fi

        # Add www subdomain
        echo ""
        echo "Adding www.lassothestars.rodeo..."

        WWW_PAGES_RESPONSE=$(curl -s -X POST \
          "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
          -H "Authorization: Bearer $CF_API_TOKEN" \
          -H "Content-Type: application/json" \
          --data '{"name": "www.lassothestars.rodeo"}')

        if echo $WWW_PAGES_RESPONSE | grep -q '"success":true'; then
            echo -e "${GREEN}✓ Custom domain www.lassothestars.rodeo added to Pages!${NC}"
        else
            echo -e "${YELLOW}Note: Error adding www subdomain${NC}"
            echo "Response: $WWW_PAGES_RESPONSE"
        fi
    fi
fi

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Domain Setup Complete!"
echo "==================================================${NC}"
echo ""
echo "Your domains:"
echo "  • Frontend: https://lassothestars.rodeo"
if [ ! -z "$VPS_IP" ]; then
    echo "  • Backend:  https://api.lassothestars.rodeo"
fi
echo ""
echo "Next steps:"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Check DNS: nslookup lassothestars.rodeo"
if [ ! -z "$VPS_IP" ]; then
    echo "3. Deploy backend to Vultr VPS (see DOMAIN_SETUP_GUIDE.md)"
    echo "4. Test API: curl https://api.lassothestars.rodeo/health"
fi
echo ""
