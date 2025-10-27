#!/bin/bash

# Quick Cloudflare Pages Custom Domain Setup using Wrangler
# Simpler alternative to the full setup script

set -e

echo "🌟 Cloudflare Pages Custom Domain Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Wrangler is not installed. Installing..."
    npm install -g wrangler
fi

# Step 1: Login to Cloudflare
echo -e "${YELLOW}Step 1: Login to Cloudflare${NC}"
echo "This will open your browser to authenticate..."
echo ""
wrangler login
echo ""

# Step 2: List Pages projects
echo -e "${YELLOW}Step 2: Finding your Pages project${NC}"
echo ""
wrangler pages project list
echo ""

read -p "Enter your Pages project name (from list above): " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
    echo "Error: Project name is required"
    exit 1
fi

# Step 3: Add custom domain
echo ""
echo -e "${YELLOW}Step 3: Adding custom domain to $PROJECT_NAME${NC}"
echo ""

# Add main domain
echo "Adding lassothestars.rodeo..."
wrangler pages domain add lassothestars.rodeo --project-name="$PROJECT_NAME"

echo ""
echo "Adding www.lassothestars.rodeo..."
wrangler pages domain add www.lassothestars.rodeo --project-name="$PROJECT_NAME"

echo ""
echo -e "${GREEN}✅ Custom domains added!${NC}"
echo ""
echo "Domains added to $PROJECT_NAME:"
echo "  • lassothestars.rodeo"
echo "  • www.lassothestars.rodeo"
echo ""
echo "SSL certificates will be provisioned automatically (1-5 minutes)"
echo ""
echo "Check status with:"
echo "  wrangler pages domain list --project-name=\"$PROJECT_NAME\""
echo ""
