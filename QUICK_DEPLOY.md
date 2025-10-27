# Quick Marketplace Deployment

## Step 1: Get Server Access

You need the root password that Vultr sent you when the server was created. Check your email for the server credentials.

## Step 2: Upload Files (Choose one method)

### Method A: Use the upload script

```bash
./upload-marketplace-files.sh
```

### Method B: Manual upload

```bash
# Upload marketplace controller
scp backend/src/controllers/marketplaceController.js root@209.222.10.188:/tmp/

# Upload marketplace routes
scp backend/src/routes/marketplace.js root@209.222.10.188:/tmp/

# Upload borrow controller
scp backend/src/controllers/borrowController.js root@209.222.10.188:/tmp/
```

## Step 3: SSH into Server

```bash
ssh root@209.222.10.188
```

## Step 4: Deploy on Server

Once you're SSH'd into the server, run these commands:

```bash
# Navigate to application directory
cd /opt/payitforward

# Copy the uploaded files to the correct locations
cp /tmp/marketplaceController.js src/controllers/
cp /tmp/marketplace.js src/routes/
cp /tmp/borrowController.js src/controllers/

# Restart the application
pm2 restart payitforward-api

# Clean up temporary files
rm /tmp/marketplace*.js /tmp/borrowController.js

# Check if it's running
pm2 status
```

## Step 5: Test the Deployment

```bash
# Test marketplace endpoint (should return 401, not 404)
curl https://api.crisiscopilot.tech/api/marketplace

# Check server logs
pm2 logs payitforward-api
```

## Step 6: Deploy Frontend

The frontend is already built in `frontend/dist/`. Deploy it to Cloudflare Pages:

1. Go to Cloudflare Pages dashboard
2. Upload the `frontend/dist` folder
3. Set environment variables if needed

## Troubleshooting

If you get permission errors:

- Make sure you're using the correct root password
- Try: `ssh -o PreferredAuthentications=password root@209.222.10.188`

If the server doesn't respond:

- Check if the server is running in Vultr dashboard
- Try accessing via Vultr console

If PM2 commands don't work:

- Try: `pm2 list` to see running processes
- Try: `pm2 restart all`
