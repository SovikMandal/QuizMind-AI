# 🔧 Deployment Troubleshooting Guide

Common issues and their solutions when deploying QuizMind AI.

---

## 🚨 **Critical Issues**

### ❌ **Backend Returns 502/503 Error**

**Symptoms:**
- Frontend loads, but API calls fail
- "Service Temporarily Unavailable"
- "Bad Gateway"

**Causes:**
1. ⏰ **Cold start** (most common on Render free tier)
2. Build failed
3. Environment variables missing
4. Port misconfiguration

**Solutions:**
```bash
# 1. Check if it's just cold start
# Wait 30-60 seconds and try again

# 2. Check Render logs
# Dashboard → Your Service → Logs
# Look for:
# - "Server started on port 4000" ✅
# - Error messages ❌

# 3. Verify PORT variable
# Should be: PORT=4000 (or $PORT for dynamic)

# 4. Check build succeeded
# Render Dashboard → Events tab
# Should show "Deploy succeeded"
```

**Prevention:**
- Upgrade to Render Starter ($7/mo) - no sleep
- Use UptimeRobot to ping every 10 minutes

---

### ❌ **CORS Error in Browser Console**

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes:**
1. `FRONTEND_URL` doesn't match actual Vercel URL
2. Trailing slash mismatch
3. Protocol mismatch (http vs https)

**Solutions:**
```bash
# 1. Check exact URLs match
# Render FRONTEND_URL: https://my-app.vercel.app
# Vercel domain:      https://my-app.vercel.app
# NO trailing slash on either!

# 2. Update in Render
# Dashboard → Environment → Edit FRONTEND_URL
# Save (triggers redeploy)

# 3. Check browser console
# Should see: Origin: https://my-app.vercel.app
# Backend allows: https://my-app.vercel.app
```

**Quick Fix:**
```javascript
// Temporary: Allow all origins (NOT for production!)
// backend/src/app.ts
cors({ origin: '*', credentials: false })
// Then debug the real issue
```

---

### ❌ **Database Connection Failed**

**Symptoms:**
```
Error: Connection refused
Can't reach database server
SSL required
```

**Causes:**
1. Missing `?sslmode=require` in connection string
2. Wrong credentials
3. Neon project suspended

**Solutions:**
```bash
# 1. Verify connection string format
# Correct:
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
#                                                                           ^^^^^^^^^^^^^^^^
# MUST have ?sslmode=require

# 2. Test connection locally
npx prisma db push --schema=./prisma/schema.prisma

# 3. Check Neon dashboard
# console.neon.tech → Your project
# Should be "Active" not "Suspended"

# 4. Regenerate password if needed
# Neon Dashboard → Settings → Reset password
```

---

### ❌ **Redis Connection Timeout**

**Symptoms:**
```
Error: ETIMEDOUT
Redis connection failed
```

**Causes:**
1. Using `redis://` instead of `rediss://` (missing TLS)
2. Wrong URL
3. Upstash region too far

**Solutions:**
```bash
# 1. Use secure connection (rediss with double 's')
REDIS_URL=rediss://default:xxxxx@region.upstash.io:6379
#         ^^^^^^^ - SECURE connection required

# 2. Test connection
# Upstash Console → Your database → CLI
# Try: PING
# Should return: PONG

# 3. Check Upstash region
# Should be same/close to Render region
```

---

## ⚠️ **Common Issues**

### ⚠️ **Emails Not Sending**

**Symptoms:**
- OTP not received
- No error in logs
- Email verification fails

**Causes:**
1. Sender email not verified in Brevo
2. Wrong SMTP credentials
3. Daily limit reached (300/day)

**Solutions:**
```bash
# 1. Verify sender email
# Brevo Dashboard → Senders → Add sender
# Verify via email link

# 2. Check SMTP settings
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-actual-email@example.com
SMTP_PASS=your-brevo-smtp-key  # NOT your login password!
MAIL_FROM=QuizMind AI <noreply@yourdomain.com>
#                      ^^^^^^^ Must be verified sender

# 3. Test SMTP connection
# Use online SMTP tester with your credentials

# 4. Check Brevo logs
# Brevo → Transactional → Logs
```

**Dev Mode Workaround:**
```bash
# If SMTP not configured, OTP prints to console
# Render Dashboard → Logs
# Look for: "OTP for user@example.com: 123456"
```

---

### ⚠️ **Build Fails on Render**

**Symptoms:**
```
Build failed with exit code 1
npm install failed
TypeScript errors
```

**Solutions:**
```bash
# 1. Check build command is correct
# Should be: npm install && npm run build

# 2. Verify package.json has build script
# backend/package.json should have:
"scripts": {
  "build": "prisma generate && tsc -p tsconfig.json"
}

# 3. Check for TypeScript errors locally
cd backend
npm run typecheck

# 4. Ensure all dependencies are in package.json
# Not in devDependencies if needed for build

# 5. Clear build cache
# Render Dashboard → Manual Deploy → Clear build cache
```

---

### ⚠️ **Frontend Build Fails on Vercel**

**Symptoms:**
```
Build error
Module not found
Type errors
```

**Solutions:**
```bash
# 1. Test build locally
cd frontend
npm run build
# Should succeed without errors

# 2. Check Vercel build settings
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install

# 3. Environment variables
# VITE_API_URL must be set in Vercel

# 4. Check Vercel logs
# Project → Deployments → [Latest] → View logs
```

---

### ⚠️ **Socket.IO Connection Fails**

**Symptoms:**
```
WebSocket connection failed
transport close
```

**Causes:**
1. Backend not running
2. Wrong WebSocket URL
3. CORS issues

**Solutions:**
```bash
# 1. Check backend is running
# Hit: https://your-backend.onrender.com/health
# Should return: {"status":"ok"}

# 2. Verify Socket.IO namespace
# Should connect to: wss://your-backend.onrender.com/quiz

# 3. Check browser console
# Should see: "Connected to Socket.IO"
# If errors, check FRONTEND_URL in Render

# 4. Test Socket.IO separately
# Use: https://socket.io/docs/v4/client-installation/#basic-emit
```

---

### ⚠️ **File Upload Fails (Cloudinary)**

**Symptoms:**
```
Upload error
Invalid signature
```

**Causes:**
1. Wrong API credentials
2. Cloud name mismatch
3. Upload preset not configured

**Solutions:**
```bash
# 1. Verify credentials in Render
CLOUDINARY_CLOUD_NAME=your-cloud-name  # NOT your email!
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

# 2. Check Cloudinary dashboard
# Settings → Upload
# Enable unsigned uploads or use signed

# 3. Test upload locally
# Use Postman to test /api/v1/users/avatar endpoint
```

---

## 🐛 **Debugging Steps**

### Step 1: Check Logs

**Render (Backend):**
```bash
# Dashboard → Your Service → Logs
# Look for:
# - Startup messages
# - Error stack traces
# - Database connection status
# - Redis connection status
```

**Vercel (Frontend):**
```bash
# Project → Deployments → [Latest] → View logs
# Look for:
# - Build errors
# - Runtime errors (rare, it's static)
```

**Browser (Client):**
```bash
# Open DevTools → Console
# Look for:
# - Network errors (red requests)
# - CORS errors
# - JavaScript errors
```

---

### Step 2: Test API Directly

```bash
# 1. Health check
curl https://your-backend.onrender.com/health

# 2. Test login
curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Check CORS headers
curl -I -X OPTIONS https://your-backend.onrender.com/api/v1/auth/login \
  -H "Origin: https://your-app.vercel.app"
# Should see: Access-Control-Allow-Origin: https://your-app.vercel.app
```

---

### Step 3: Verify Environment Variables

**Render:**
```bash
# Dashboard → Environment → All variables shown
# Click "eye" icon to reveal values
# Verify:
# - No typos
# - No extra spaces
# - Correct URLs (https://, no trailing slash)
```

**Vercel:**
```bash
# Project → Settings → Environment Variables
# Verify:
# - VITE_API_URL is correct
# - Matches Render URL exactly
```

---

### Step 4: Database Sanity Check

```bash
# 1. Check if schema is applied
# Connect to Neon using Prisma Studio locally
DATABASE_URL="your-neon-url" npx prisma studio

# 2. Verify tables exist
# Should see: users, quizzes, questions, etc.

# 3. Check for data
# Run a simple query in Prisma Studio
```

---

## 📊 **Monitoring Checklist**

Daily:
- [ ] Backend is responding (check /health)
- [ ] No 502/503 errors
- [ ] Upstash commands < 10K
- [ ] Brevo emails < 300

Weekly:
- [ ] Check Render build minutes
- [ ] Check Neon storage usage
- [ ] Check Vercel bandwidth
- [ ] Check Cloudinary usage

Monthly:
- [ ] Review logs for errors
- [ ] Database backup
- [ ] Update dependencies

---

## 🆘 **Emergency Rollback**

If something breaks after deployment:

### Render:
```bash
# Dashboard → Your Service → Events
# Find last working deployment
# Click "Redeploy"
```

### Vercel:
```bash
# Project → Deployments
# Find last working deployment
# Click ⋯ → Promote to Production
```

---

## 📞 **Getting Help**

1. **Check logs first** (Render + Vercel + Browser console)
2. **Search error message** in Google/Stack Overflow
3. **GitHub Issues** (check if others had same issue)
4. **Community Discord/Slack** (Render, Vercel have active communities)
5. **Support**:
   - Render: support@render.com
   - Vercel: support@vercel.com
   - Neon: support@neon.tech

---

## 💡 **Pro Tips**

1. **Keep a deployment log** - Note what you changed before it broke
2. **Test locally first** - Always `npm run build` locally
3. **Use environment branches** - Test on dev branch before main
4. **Monitor uptime** - UptimeRobot free tier
5. **Backup database** - Weekly `pg_dump`
6. **Version your deployments** - Git tags for each production deploy

---

Made with 🔧 to help you troubleshoot faster!
