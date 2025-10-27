# Cloudflare DNS Quick Setup for lassothestars.rodeo

## DNS Records to Add

Go to **Cloudflare Dashboard** → **lassothestars.rodeo** → **DNS** → **Records**

### Record 1: Frontend (Root Domain)
```
Type:          CNAME
Name:          @
Target:        994cfecc.payitforward-41x.pages.dev
Proxy status:  Proxied (🟠 orange cloud ON)
TTL:           Auto
```

### Record 2: Backend API
```
Type:          A
Name:          api
Target:        [YOUR_VULTR_VPS_IP]
Proxy status:  Proxied (🟠 orange cloud ON)
TTL:           Auto
```
**Note**: Replace `[YOUR_VULTR_VPS_IP]` with your actual Vultr server IP address.

### Record 3: WWW Redirect (Optional)
```
Type:          CNAME
Name:          www
Target:        lassothestars.rodeo
Proxy status:  Proxied (🟠 orange cloud ON)
TTL:           Auto
```

---

## Cloudflare Pages Custom Domain Setup

1. Go to **Cloudflare Dashboard** → **Pages**
2. Select your project (the one with ID: `994cfecc`)
3. Click **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `lassothestars.rodeo`
6. Click **Continue**
7. Wait for SSL provisioning (1-5 minutes)
8. ✅ Done!

---

## After DNS is Set Up

### Update Cloudflare Pages Environment Variable

1. In Pages project → **Settings** → **Environment variables**
2. Add for **Production**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api.lassothestars.rodeo/api`
3. **Redeploy** the site (Deployments → Retry deployment)

### Your URLs
- **Frontend**: https://lassothestars.rodeo
- **Backend**: https://api.lassothestars.rodeo
- **Health Check**: https://api.lassothestars.rodeo/health

---

## Next Steps

See `DOMAIN_SETUP_GUIDE.md` for:
- Complete Vultr VPS backend deployment
- SSL certificate setup
- Auth0 configuration
- Testing instructions
