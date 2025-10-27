# 🚀 Manual Payment System Deployment

Since SSH access is restricted, here's how to manually deploy the payment system:

## 📋 Files to Upload

### 1. Backend Files

Upload these files to your production server at `/root/crisiscopilot-backend/`:

```
backend/src/controllers/marketplacePaymentController.js
backend/src/routes/marketplace.js
backend/db/add_marketplace.sql
```

### 2. Frontend Files

Upload the entire `frontend/dist/` folder to Cloudflare Pages.

## 🔧 Server Commands

Once files are uploaded, run these commands on your production server:

```bash
# 1. Update database schema
cd /root/crisiscopilot-backend
psql -U postgres -d crisiscopilot -f db/add_marketplace.sql

# 2. Restart the backend service
pm2 restart crisiscopilot-backend

# 3. Check if service is running
pm2 status
```

## 🧪 Testing Steps

### 1. Test Backend API

```bash
# Test if payment endpoints are available
curl -X GET https://api.crisiscopilot.tech/api/marketplace/payments/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Frontend

1. Go to your deployed frontend
2. Navigate to Marketplace
3. Click "My Marketplace"
4. Look for the "Payments" tab
5. Test the payment flow

## 🔍 Verification Checklist

- [ ] Backend files uploaded
- [ ] Database schema updated
- [ ] PM2 service restarted
- [ ] Frontend deployed to Cloudflare
- [ ] Payment tab visible in MyMarketplace
- [ ] Payment modal opens correctly
- [ ] API endpoints respond

## 🐛 Troubleshooting

### If payment tab doesn't appear:

- Check if frontend is using the latest build
- Verify API calls are working in browser console

### If API returns 404:

- Verify backend files are in correct location
- Check PM2 service is running
- Verify routes are properly imported in server.js

### If database errors:

- Check if marketplace_payments table exists
- Verify database connection
- Check PostgreSQL logs

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Verify the backend logs with `pm2 logs crisiscopilot-backend`
3. Test API endpoints directly with curl
4. Check database connectivity

---

**Ready to test! 🎉**
