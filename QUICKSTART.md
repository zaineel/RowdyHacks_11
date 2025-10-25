# PayItForward - Quick Start Deployment

Follow these steps to deploy PayItForward for your hackathon demo.

## Prerequisites Checklist

- [x] Vultr API key (you have this!)
- [ ] Auth0 account
- [ ] Cloudflare account
- [ ] Gemini API key (Google Cloud)

---

## Part 1: Deploy Infrastructure (15 minutes)

### Step 1: Edit Terraform Variables

Open `terraform/terraform.tfvars` and replace `YOUR_VULTR_API_KEY_HERE` with your actual Vultr API key.

### Step 2: Provision Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview what will be created
terraform plan

# Create the resources (this takes 5-10 minutes)
terraform apply
# Type 'yes' when prompted
```

**What this does:**
- Creates a PostgreSQL database on Vultr
- Creates an Ubuntu server (VM) on Vultr
- Sets up networking and firewall rules

**Cost:** ~$27/month (you can delete it after the hackathon!)

### Step 3: Save the Outputs

```bash
# Save all the connection details
terraform output -json > outputs.json

# View the important info
terraform output backend_server_ip
terraform output database_host
terraform output connection_string
```

**IMPORTANT:** Copy these values - you'll need them!

---

## Part 2: Set Up Backend (20 minutes)

### Step 4: Get Server Password

Check your email - Vultr sends the root password when the server is created.
Subject: "Your new Vultr server is ready!"

### Step 5: Update Backend Environment

Edit `backend/.env` with the database connection string from terraform output:

```bash
cd ../backend

# Copy example
cp .env.example .env

# Edit .env and update these:
# - DATABASE_URL (from terraform output connection_string)
# - AUTH0_DOMAIN (we'll set up Auth0 next)
# - GEMINI_API_KEY (get from Google Cloud)
```

### Step 6: SSH into Server

```bash
# Get your server IP from terraform output
SERVER_IP=$(cd ../terraform && terraform output -raw backend_server_ip)

# SSH in (use the password from email)
ssh root@$SERVER_IP
```

### Step 7: Deploy Backend on Server

Once you're SSH'd into the server, run these commands:

```bash
# Create app directory
cd /opt/payitforward

# Clone your repo (or upload files)
# For now, we'll upload from your local machine
exit  # Exit SSH for now
```

Back on your local machine:

```bash
# Package the backend
cd backend
tar -czf deploy.tar.gz . --exclude=node_modules --exclude=.git

# Upload to server
scp deploy.tar.gz root@$SERVER_IP:/opt/payitforward/

# SSH back in
ssh root@$SERVER_IP
```

Now on the server:

```bash
cd /opt/payitforward
tar -xzf deploy.tar.gz
rm deploy.tar.gz

# Install dependencies
npm install

# Copy your .env file
# (You'll need to create this with your database credentials)

# Run migrations
npm run migrate

# Seed demo data
npm run seed

# Start the API
pm2 start src/server.js --name payitforward-api
pm2 save
pm2 startup  # Make it start on reboot

# Test it works
curl http://localhost:3000/health
```

You should see: `{"status":"healthy",...}`

**Exit SSH** (type `exit`)

Test from your computer:
```bash
curl http://$SERVER_IP:3000/health
```

---

## Part 3: Set Up Auth0 (10 minutes)

### Step 8: Create Auth0 Application

1. Go to https://auth0.com/ and sign up (free)
2. Create a new Application:
   - Name: **PayItForward**
   - Type: **Single Page Application**
3. Note down:
   - Domain: `your-domain.us.auth0.com`
   - Client ID: `abc123...`

### Step 9: Configure Auth0

In the Application Settings:

**Allowed Callback URLs:**
```
http://localhost:5173,
https://your-app.pages.dev
```

**Allowed Logout URLs:**
```
http://localhost:5173,
https://your-app.pages.dev
```

**Allowed Web Origins:**
```
http://localhost:5173,
https://your-app.pages.dev
```

### Step 10: Create Auth0 API

1. Go to Applications > APIs
2. Create API:
   - Name: **PayItForward API**
   - Identifier: `https://api.payitforward.com`
   - Signing Algorithm: RS256

### Step 11: Update Environment Variables

**Backend** (SSH into server and edit `/opt/payitforward/.env`):
```bash
ssh root@$SERVER_IP
cd /opt/payitforward
nano .env

# Update these lines:
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_AUDIENCE=https://api.payitforward.com
AUTH0_ISSUER=https://your-domain.us.auth0.com/

# Save and exit (Ctrl+X, Y, Enter)

# Restart backend
pm2 restart payitforward-api
exit
```

**Frontend** (on your local machine):
```bash
cd frontend

# Edit .env
nano .env

# Update:
VITE_AUTH0_DOMAIN=your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.payitforward.com
```

---

## Part 4: Deploy Frontend (15 minutes)

### Step 12: Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
```

### Step 13: Login to Cloudflare

```bash
wrangler login
```

This opens a browser - approve the connection.

### Step 14: Build Frontend

```bash
cd frontend

# Update API URL in .env
echo "VITE_API_URL=http://$SERVER_IP:3000/api" >> .env

# Build
npm run build
```

### Step 15: Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=payitforward
```

**Note the URL** - it will be something like: `https://payitforward-xyz.pages.dev`

### Step 16: Update CORS

SSH back into your server and update the CORS origin:

```bash
ssh root@$SERVER_IP
cd /opt/payitforward
nano .env

# Update:
CORS_ORIGIN=https://payitforward-xyz.pages.dev

# Restart
pm2 restart payitforward-api
exit
```

### Step 17: Update Auth0 URLs

Go back to Auth0 and add your Cloudflare Pages URL to:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

---

## Part 5: Test Everything (5 minutes)

### Step 18: Open Your App

Visit: `https://payitforward-xyz.pages.dev`

1. Click "Get Started"
2. Login with Auth0
3. Explore the app!

---

## Optional: Deploy Cloudflare Worker

### Step 19: Deploy Payment Scheduler

```bash
cd cloudflare-worker

# Update wrangler.toml with your backend URL
nano wrangler.toml
# Change API_URL to http://$SERVER_IP:3000/api

# Set secret
wrangler secret put API_SECRET
# Enter a strong password

# Deploy
wrangler deploy
```

---

## Troubleshooting

### Backend won't start
```bash
ssh root@$SERVER_IP
pm2 logs payitforward-api
```

### Database connection fails
- Check DATABASE_URL in .env
- Test: `psql "postgresql://user:pass@host:port/dbname"`

### Frontend shows blank page
- Check browser console (F12)
- Verify Auth0 URLs match exactly
- Check CORS_ORIGIN in backend .env

---

## Quick Reference

**Backend API:** `http://$SERVER_IP:3000`
**Frontend:** `https://your-app.pages.dev`
**Database:** Check `terraform/outputs.json`

---

## After the Hackathon

To avoid charges, destroy the infrastructure:

```bash
cd terraform
terraform destroy
# Type 'yes' to confirm
```

This deletes everything on Vultr.

---

Good luck at RowdyHacks! 🤠🚀
