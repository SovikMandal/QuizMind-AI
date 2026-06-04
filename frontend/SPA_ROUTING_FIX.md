# SPA Routing Fix (404 on Page Refresh)

## Problem
When refreshing the page on routes like `/dashboard` or `/quiz/123`, you get a **404: NOT_FOUND** error in production.

## Root Cause
React Router handles routing on the **client-side**. When you refresh `/dashboard`:
1. Browser sends request to server for `/dashboard`
2. Server looks for a physical file at that path
3. No file exists → 404 error

The server needs to serve `index.html` for **all routes** so React Router can handle routing.

---

## Solution by Platform

### ✅ 1. Vercel (Recommended)

**File:** `frontend/vercel.json` (already created)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:** All routes are rewritten to serve `index.html`, which loads React Router.

**Deploy:**
```bash
cd frontend
npm run build
vercel --prod
```

---

### ✅ 2. Netlify

**Option A:** `frontend/public/_redirects` (already created)
```
/*    /index.html   200
```

**Option B:** `frontend/netlify.toml` (already created)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy:**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

### ✅ 3. Nginx (Docker)

**File:** `frontend/nginx.conf` (already configured)

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**This already exists in your config!** If still getting 404 with Docker:

**Check:**
1. Rebuild the Docker image:
   ```bash
   docker compose down
   docker compose build frontend --no-cache
   docker compose up -d
   ```

2. Verify nginx is serving the built files:
   ```bash
   docker exec -it frontend-container ls /usr/share/nginx/html
   # Should show: index.html, assets/
   ```

---

### ✅ 4. Apache

**File:** `frontend/public/.htaccess` (create if needed)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### ✅ 5. Express (Node.js Server)

**File:** `server.js`

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000);
```

---

## Verification

After deploying, test these URLs directly (not via navigation):

```
✅ https://your-domain.com/
✅ https://your-domain.com/dashboard
✅ https://your-domain.com/quiz/123
✅ https://your-domain.com/profile
```

All should load the app without 404 errors.

---

## Common Mistakes

### ❌ Wrong: Redirect with 301/302
```nginx
# DON'T DO THIS
location / {
  return 301 /index.html;  # Browser URL changes to /index.html
}
```

### ✅ Right: Rewrite/try_files
```nginx
# DO THIS
location / {
  try_files $uri $uri/ /index.html;  # URL stays as /dashboard
}
```

---

## Platform Detection

Not sure which platform you're using? Check:

```bash
# Vercel
ls vercel.json  # If exists, you're on Vercel

# Netlify
ls netlify.toml  # If exists, you're on Netlify

# Docker/Nginx
docker ps | grep frontend  # If running, using Docker

# Custom server
ls server.js  # If exists, custom Node server
```

---

## Files Created

✅ `frontend/vercel.json` - Vercel SPA rewrites
✅ `frontend/netlify.toml` - Netlify redirects
✅ `frontend/public/_redirects` - Netlify alternative
✅ `frontend/nginx.conf` - Already had SPA fallback

---

## Next Steps

1. **Identify your deployment platform**
2. **Verify the config file exists** (created above)
3. **Rebuild and redeploy**
4. **Test a direct URL** (e.g., `/dashboard`)

If still having issues, share:
- Platform (Vercel/Netlify/Docker/etc.)
- Build command
- Deploy logs
