# Files to Copy to Production Server

## Server Details

- **IP**: 209.222.10.188
- **User**: root
- **Application Path**: /opt/payitforward

## Files to Update

### 1. src/controllers/marketplaceController.js

Copy the entire content of this file to `/opt/payitforward/src/controllers/marketplaceController.js`

### 2. src/routes/marketplace.js

Copy the entire content of this file to `/opt/payitforward/src/routes/marketplace.js`

### 3. src/controllers/borrowController.js

Copy the entire content of this file to `/opt/payitforward/src/controllers/borrowController.js`

## Commands to Run After Copying Files

```bash
# Navigate to application directory
cd /opt/payitforward

# Restart the application
pm2 restart payitforward-api

# Check status
pm2 status

# Check logs
pm2 logs payitforward-api
```

## Test the Deployment

```bash
# Test marketplace endpoint
curl https://api.crisiscopilot.tech/api/marketplace
# Should return 401 (unauthorized) instead of 404 (not found)
```

## Quick Copy Commands (if you have SSH access)

```bash
# Copy files to server
scp backend/src/controllers/marketplaceController.js root@209.222.10.188:/opt/payitforward/src/controllers/
scp backend/src/routes/marketplace.js root@209.222.10.188:/opt/payitforward/src/routes/
scp backend/src/controllers/borrowController.js root@209.222.10.188:/opt/payitforward/src/controllers/

# SSH and restart
ssh root@209.222.10.188
cd /opt/payitforward
pm2 restart payitforward-api
```
