# PayItForward - Deployment Guide

Complete guide to deploying PayItForward for RowdyHacks 2025

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Vultr account with API key
- Auth0 account
- Cloudflare account
- Google Cloud account (for Gemini API)
- Terraform installed
- Git

## Table of Contents

1. [Auth0 Setup](#1-auth0-setup)
2. [Vultr Infrastructure with Terraform](#2-vultr-infrastructure-with-terraform)
3. [Database Setup](#3-database-setup)
4. [Backend Deployment](#4-backend-deployment)
5. [Frontend Deployment](#5-frontend-deployment)
6. [Cloudflare Worker Setup](#6-cloudflare-worker-setup)
7. [Testing](#7-testing)

---

## 1. Auth0 Setup

### Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application:
   - Name: `PayItForward`
   - Type: `Single Page Application`
3. Configure Application Settings:
   - **Allowed Callback URLs**: `http://localhost:5173, https://your-cloudflare-pages-url.pages.dev`
   - **Allowed Logout URLs**: Same as above
   - **Allowed Web Origins**: Same as above
4. Enable **Passwordless** connections:
   - Go to Authentication > Passwordless
   - Enable SMS
   - Configure Twilio credentials (or use Auth0 test SMS)

### Create Auth0 API

1. Go to Applications > APIs
2. Create new API:
   - Name: `PayItForward API`
   - Identifier: `https://api.payitforward.com`
   - Signing Algorithm: `RS256`

### Note Down Credentials

```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=https://api.payitforward.com
AUTH0_ISSUER=https://your-domain.auth0.com/
```

---

## 2. Vultr Infrastructure with Terraform

### Get Vultr API Key

1. Log into [Vultr](https://my.vultr.com/)
2. Go to Account > API
3. Generate API Key

### Deploy with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cat > terraform.tfvars <<EOF
vultr_api_key = "YOUR_VULTR_API_KEY"
region = "ewr"  # Newark (closest to Texas)
EOF

# Plan deployment
terraform plan

# Apply (create resources)
terraform apply

# Save outputs
terraform output -json > outputs.json
```

### Extract Connection Details

```bash
# Get database connection string
terraform output connection_string

# Get server IP
terraform output backend_server_ip
```

---

## 3. Database Setup

### SSH into Vultr Server

```bash
# Get server IP from Terraform output
SERVER_IP=$(terraform output -raw backend_server_ip)

# SSH (password will be emailed to you)
ssh root@$SERVER_IP
```

### Clone Repository

```bash
cd /opt/payitforward
git clone https://github.com/your-repo/payitforward.git .
cd backend
npm install
```

### Configure Environment

```bash
# Create .env file
cat > .env <<EOF
PORT=3000
NODE_ENV=production

# Database (from Terraform output)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.payitforward.com
AUTH0_ISSUER=https://your-domain.auth0.com/

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Cloudflare
CLOUDFLARE_WORKER_URL=https://payment-scheduler.your-subdomain.workers.dev

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# CORS
CORS_ORIGIN=https://your-frontend.pages.dev
EOF
```

### Run Database Migration

```bash
npm run migrate
```

You should see:
```
✅ Database schema created successfully!
✅ Migration complete! 9 tables in database.
```

### Seed Demo Data (Optional)

```bash
npm run seed
```

---

## 4. Backend Deployment

### Start Backend with PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the application
pm2 start src/server.js --name payitforward-api

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Configure Nginx (Optional - for HTTPS)

```bash
# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
cat > /etc/nginx/sites-available/payitforward <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/payitforward /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

### Test Backend

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T...",
  "service": "PayItForward API",
  "version": "1.0.0"
}
```

---

## 5. Frontend Deployment

### Configure Frontend Environment

```bash
cd frontend

# Create .env.production
cat > .env.production <<EOF
VITE_API_URL=https://your-backend-url.com/api
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.payitforward.com
EOF
```

### Deploy to Cloudflare Pages

#### Option 1: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pages > Create a project
3. Connect to Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
5. Add environment variables from .env.production
6. Deploy

#### Option 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build frontend
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=payitforward
```

### Update Auth0 URLs

Go back to Auth0 and add your Cloudflare Pages URL to:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

---

## 6. Cloudflare Worker Setup

### Configure Worker

```bash
cd cloudflare-worker

# Install Wrangler if not already installed
npm install -g wrangler

# Login
wrangler login

# Update wrangler.toml with your account ID
# Get account ID from: https://dash.cloudflare.com/
```

### Set Secrets

```bash
# Set API secret
wrangler secret put API_SECRET
# Enter a strong random string

# Update worker code with your backend URL
# Edit payment-scheduler.js:
# const API_URL = 'https://your-backend-url.com/api';
```

### Deploy Worker

```bash
wrangler deploy
```

### Test Worker

```bash
# Manual trigger
curl -X POST https://payment-scheduler.your-subdomain.workers.dev/trigger \
  -H "Authorization: Bearer YOUR_API_SECRET"
```

---

## 7. Testing

### Backend API Tests

```bash
# Health check
curl https://your-backend-url.com/health

# Test Auth0 integration (get token from Auth0 first)
curl https://your-backend-url.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Tests

1. Visit `https://your-frontend.pages.dev`
2. Click "Get Started"
3. Complete Auth0 login
4. Verify dashboard loads

### Full Flow Test

1. **Create a Circle**:
   - Go to "Create New Circle"
   - Fill in details
   - Note the invite code

2. **Invite Members** (use incognito windows):
   - Login as different user
   - Join circle with invite code
   - Have admin approve member

3. **Make Payment**:
   - Go to Payments
   - Make a contribution
   - Verify credit score increases

4. **AI Risk Assessment**:
   - Try to join circle with new account
   - Observe AI-powered risk analysis

---

## Environment Variables Checklist

### Backend (.env)
- ✅ `DATABASE_URL`
- ✅ `AUTH0_DOMAIN`
- ✅ `AUTH0_AUDIENCE`
- ✅ `AUTH0_ISSUER`
- ✅ `GEMINI_API_KEY`
- ✅ `CLOUDFLARE_WORKER_URL`
- ✅ `CORS_ORIGIN`

### Frontend (.env.production)
- ✅ `VITE_API_URL`
- ✅ `VITE_AUTH0_DOMAIN`
- ✅ `VITE_AUTH0_CLIENT_ID`
- ✅ `VITE_AUTH0_AUDIENCE`

### Cloudflare Worker (wrangler.toml)
- ✅ `API_URL`
- ✅ `API_SECRET` (via wrangler secret)

---

## Quick Start Script

```bash
#!/bin/bash
# deploy.sh - Complete deployment script

echo "🚀 Starting PayItForward deployment..."

# 1. Deploy infrastructure
cd terraform
terraform init
terraform apply -auto-approve
cd ..

# 2. Deploy backend
SERVER_IP=$(cd terraform && terraform output -raw backend_server_ip)
ssh root@$SERVER_IP << 'ENDSSH'
  cd /opt/payitforward
  git clone YOUR_REPO_URL .
  cd backend
  npm install
  npm run migrate
  pm2 start src/server.js --name payitforward-api
  pm2 save
ENDSSH

# 3. Deploy frontend
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=payitforward
cd ..

# 4. Deploy worker
cd cloudflare-worker
wrangler deploy
cd ..

echo "✅ Deployment complete!"
echo "📍 Backend: http://$SERVER_IP:3000"
echo "📍 Frontend: Check Cloudflare Pages dashboard"
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
psql "postgresql://user:password@host:port/dbname"
```

### Backend Not Starting
```bash
# Check logs
pm2 logs payitforward-api

# Restart
pm2 restart payitforward-api
```

### Frontend Auth Issues
- Verify Auth0 callback URLs match your domain
- Check browser console for errors
- Ensure CORS_ORIGIN is set correctly in backend

### Worker Not Running
```bash
# Check worker logs
wrangler tail payment-scheduler

# Test manually
curl https://your-worker.workers.dev/health
```

---

## Production Checklist

- [ ] Database backups enabled
- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] Monitoring set up
- [ ] Error tracking (Sentry/Rollbar)
- [ ] CDN configured for static assets
- [ ] Database connection pooling optimized
- [ ] PM2 configured to restart on server reboot

---

## Demo Day Tips

1. **Seed realistic data** before demo
2. **Test the full flow** 30 minutes before
3. **Have backup accounts** ready (different roles)
4. **Prepare speaking points** for each feature
5. **Screenshot key features** in case of connectivity issues

---

## Support

For issues during RowdyHacks:
- Check logs: `pm2 logs payitforward-api`
- Database status: `systemctl status postgresql`
- Worker logs: `wrangler tail`

Good luck at RowdyHacks! 🤠🚀
