# Marketplace Deployment Guide

## Current Status

- ✅ Marketplace functionality is working locally
- ✅ Database tables exist in production
- ❌ Marketplace routes not deployed to production API
- ❌ Frontend needs to be deployed with updated API URL

## Quick Deployment Steps

### 1. Access Your Production Server

**Option A: SSH (if you have the password)**

```bash
ssh root@209.222.10.188
```

**Option B: Vultr Console**

1. Go to https://my.vultr.com/
2. Find your server (IP: 209.222.10.188)
3. Click "Console" to access the server

### 2. Update Backend Code

Once you have access to the server:

```bash
# Navigate to the application directory
cd /opt/payitforward

# Create backup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude=node_modules

# The marketplace files you need to update:
# - src/controllers/marketplaceController.js
# - src/routes/marketplace.js
# - src/controllers/borrowController.js

# Copy the updated files from your local machine
# You can use scp, rsync, or manually copy the content

# Install dependencies
npm install --production

# Restart the application
pm2 restart payitforward-api
```

### 3. Files to Update

The following files need to be updated on the production server:

1. **src/controllers/marketplaceController.js** - Fixed SQL query
2. **src/routes/marketplace.js** - Marketplace routes
3. **src/controllers/borrowController.js** - Borrow functionality
4. **src/server.js** - Make sure marketplace routes are included

### 4. Test the Deployment

```bash
# Test marketplace endpoint
curl https://api.crisiscopilot.tech/api/marketplace

# Should return 401 (unauthorized) instead of 404 (not found)
```

### 5. Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Cloudflare Pages
# Use the Cloudflare dashboard or wrangler CLI
```

## Alternative: Manual File Upload

If you can't SSH, you can manually update the files:

1. **Copy the content** of the updated files from your local machine
2. **Access the server** through Vultr console
3. **Edit the files** directly on the server
4. **Restart the application**

## Files to Copy

### src/controllers/marketplaceController.js

- Contains the fixed SQL query for getItemById
- All marketplace CRUD operations

### src/routes/marketplace.js

- Marketplace route definitions
- Borrow request routes

### src/controllers/borrowController.js

- Borrow request handling
- Approval/rejection logic

## Testing After Deployment

1. **Backend API**: `https://api.crisiscopilot.tech/api/marketplace`
2. **Frontend**: Your Cloudflare Pages URL
3. **Create item**: Test item creation
4. **View item**: Test item detail page

## Troubleshooting

If you get 404 errors:

- Check that marketplace routes are included in server.js
- Verify the files are properly uploaded
- Check PM2 logs: `pm2 logs payitforward-api`

If you get 500 errors:

- Check the SQL query in marketplaceController.js
- Verify database connection
- Check PM2 logs for detailed error messages
