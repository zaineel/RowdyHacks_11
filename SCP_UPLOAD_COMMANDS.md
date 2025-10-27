# 📤 SCP Commands to Upload Payment System Files

## 🚀 Upload Commands

Run these commands from your local machine to upload the payment system files to your production server:

### 1. Upload Payment Controller

```bash
scp backend/src/controllers/marketplacePaymentController.js root@209.222.10.188:/root/crisiscopilot-backend/src/controllers/
```

### 2. Upload Updated Routes

```bash
scp backend/src/routes/marketplace.js root@209.222.10.188:/root/crisiscopilot-backend/src/routes/
```

### 3. Upload Database Schema

```bash
scp backend/db/add_marketplace.sql root@209.222.10.188:/root/crisiscopilot-backend/db/
```

## 🔧 Server Commands

After uploading, SSH into your server and run these commands:

```bash
# SSH into server
ssh root@209.222.10.188

# Navigate to backend directory
cd /root/crisiscopilot-backend

# Update database schema
psql -U postgres -d crisiscopilot -f db/add_marketplace.sql

# Restart the backend service
pm2 restart crisiscopilot-backend

# Check if service is running
pm2 status

# Check logs if needed
pm2 logs crisiscopilot-backend
```

## 🧪 Verify Upload

After uploading, verify the files are in place:

```bash
# Check if files exist
ls -la /root/crisiscopilot-backend/src/controllers/marketplacePaymentController.js
ls -la /root/crisiscopilot-backend/src/routes/marketplace.js
ls -la /root/crisiscopilot-backend/db/add_marketplace.sql

# Check if marketplace_payments table exists
psql -U postgres -d crisiscopilot -c "\dt marketplace_payments"
```

## 🎯 All-in-One Command

If you want to run all uploads at once:

```bash
# Upload all files
scp backend/src/controllers/marketplacePaymentController.js root@209.222.10.188:/root/crisiscopilot-backend/src/controllers/ && \
scp backend/src/routes/marketplace.js root@209.222.10.188:/root/crisiscopilot-backend/src/routes/ && \
scp backend/db/add_marketplace.sql root@209.222.10.188:/root/crisiscopilot-backend/db/ && \
echo "✅ All files uploaded successfully!"
```

## 🚨 Troubleshooting

### If SCP asks for password:

- Use the root password you received from Vultr
- Or set up SSH keys for easier access

### If permission denied:

- Make sure you're using the correct server IP
- Verify the file paths exist on the server

### If database update fails:

- Check if PostgreSQL is running
- Verify database connection
- Check the SQL file for syntax errors

---

**Ready to upload! 🚀**

