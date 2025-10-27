# Cloudflare CLI Setup Guide

## Quick Setup Options

You have 3 ways to set up your domain via CLI:

### Option 1: Full Automated Setup (Recommended)
```bash
./setup-domain-cli.sh
```
This script:
- ✅ Creates all DNS records (CNAME for frontend, A record for API)
- ✅ Adds custom domain to Cloudflare Pages
- ✅ Lists all current DNS records
- ⚠️ Requires: Cloudflare API Token

### Option 2: Pages Domain Only (Simplest)
```bash
./setup-pages-domain.sh
```
This script:
- ✅ Uses Wrangler CLI (already installed)
- ✅ Adds custom domain to your Pages project
- ✅ Interactive browser login
- ⚠️ DNS records must be added separately

### Option 3: Manual Commands
See below for individual commands.

---

## Option 1: Full Automated Setup

### Step 1: Get Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use **Edit zone DNS** template
4. Add permission: **Cloudflare Pages:Edit**
5. Zone Resources: **Include** → **Specific zone** → **lassothestars.rodeo**
6. Click **Continue to summary** → **Create Token**
7. Copy the token

### Step 2: Run the Script

```bash
cd /Users/zaineelmithani/rowdyhacks_25
./setup-domain-cli.sh
```

Follow the prompts:
- Enter your API Token
- Enter your Vultr VPS IP address
- Optionally add custom domain to Pages

---

## Option 2: Wrangler Pages Setup (Simplest)

### Prerequisites
- DNS records already created in Cloudflare dashboard OR
- You'll create DNS manually after

### Run the Script

```bash
cd /Users/zaineelmithani/rowdyhacks_25
./setup-pages-domain.sh
```

This will:
1. Log you into Cloudflare (opens browser)
2. List your Pages projects
3. Add custom domain to selected project

---

## Option 3: Manual CLI Commands

### A. DNS Records via API

First, set your API token:
```bash
export CF_API_TOKEN="your_api_token_here"
export CF_ZONE_ID="your_zone_id"  # Get this from Cloudflare dashboard
export VPS_IP="your.vps.ip.address"
```

#### Get Zone ID
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=lassothestars.rodeo" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[0].id'
```

#### Create CNAME for Root Domain
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "@",
    "content": "994cfecc.payitforward-41x.pages.dev",
    "ttl": 1,
    "proxied": true
  }'
```

#### Create A Record for API Subdomain
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"api\",
    \"content\": \"$VPS_IP\",
    \"ttl\": 1,
    \"proxied\": true
  }"
```

#### Create CNAME for WWW
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "www",
    "content": "lassothestars.rodeo",
    "ttl": 1,
    "proxied": true
  }'
```

#### List DNS Records
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[] | "\(.type)\t\(.name)\t→\t\(.content)"'
```

### B. Pages Custom Domain via Wrangler

#### Login to Cloudflare
```bash
wrangler login
```

#### List Pages Projects
```bash
wrangler pages project list
```

#### Add Custom Domain
```bash
# Replace PROJECT_NAME with your actual project name
wrangler pages domain add lassothestars.rodeo --project-name="PROJECT_NAME"
wrangler pages domain add www.lassothestars.rodeo --project-name="PROJECT_NAME"
```

#### List Domains
```bash
wrangler pages domain list --project-name="PROJECT_NAME"
```

#### Remove Domain (if needed)
```bash
wrangler pages domain remove lassothestars.rodeo --project-name="PROJECT_NAME"
```

### C. Pages Environment Variables via Wrangler

#### Set Production Environment Variable
```bash
# Replace PROJECT_NAME with your actual project name
wrangler pages deployment create \
  --project-name="PROJECT_NAME" \
  --branch=main \
  --env production

# Or use the secret command
wrangler pages secret put VITE_API_URL \
  --project-name="PROJECT_NAME" \
  --env production
# When prompted, enter: https://api.lassothestars.rodeo/api
```

**Note**: For Vite environment variables, you might need to redeploy instead:

1. Create a `.env.production` file:
```bash
cat > frontend/.env.production << EOF
VITE_API_URL=https://api.lassothestars.rodeo/api
VITE_AUTH0_DOMAIN=dev-1t43g8tuajrctbnp.us.auth0.com
VITE_AUTH0_CLIENT_ID=TTBacfWkPElpP7xXOFfKRlloWz9K4Ccn
VITE_AUTH0_AUDIENCE=https://api.payitforward.com
EOF
```

2. Rebuild and redeploy (if using direct publish):
```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name="PROJECT_NAME"
```

---

## Verification Commands

### Check DNS Propagation
```bash
# Check root domain
nslookup lassothestars.rodeo

# Check API subdomain
nslookup api.lassothestars.rodeo

# Check with specific DNS server (Cloudflare)
nslookup lassothestars.rodeo 1.1.1.1
```

### Test Endpoints
```bash
# Test frontend (after DNS propagates)
curl -I https://lassothestars.rodeo

# Test API health endpoint
curl https://api.lassothestars.rodeo/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"PayItForward API","version":"1.0.0"}
```

### Check SSL Status
```bash
# Check certificate
openssl s_client -connect lassothestars.rodeo:443 -servername lassothestars.rodeo < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check API certificate
openssl s_client -connect api.lassothestars.rodeo:443 -servername api.lassothestars.rodeo < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## Troubleshooting

### "wrangler: command not found"
```bash
npm install -g wrangler
```

### "jq: command not found"
```bash
brew install jq  # macOS
# or
sudo apt-get install jq  # Linux
```

### "Zone not found"
Make sure you're using the correct domain name and have access to it in Cloudflare.

### DNS records already exist
If you get an error about existing records, you can:

1. Delete existing records first:
```bash
# Get record ID
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records?name=lassothestars.rodeo" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq -r '.result[0].id'

# Delete record
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records/RECORD_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN"
```

2. Or update existing records instead of creating new ones (use PUT instead of POST)

### Pages custom domain fails
Make sure:
- DNS records are created first
- You're using the correct project name
- You have permissions to edit the Pages project

---

## Summary

**Easiest**: Run `./setup-pages-domain.sh` for Pages custom domain only

**Complete**: Run `./setup-domain-cli.sh` for DNS + Pages setup

**Advanced**: Use individual `curl` and `wrangler` commands above

All three methods achieve the same result - your choice depends on your preference and requirements!
