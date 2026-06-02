# 🚀 QuizMind AI - Production Deployment Guide

Complete step-by-step guide to deploy your application to production using **100% free platforms**.

---

## 📦 **Prerequisites**

Before starting, create accounts on:
- ✅ [GitHub](https://github.com) (for code hosting)
- ✅ [Vercel](https://vercel.com) (for frontend)
- ✅ [Render](https://render.com) (for backend)
- ✅ [Neon](https://neon.tech) (for PostgreSQL)
- ✅ [Upstash](https://upstash.com) (for Redis)
- ✅ [Cloudinary](https://cloudinary.com) (for images)
- ✅ [Brevo](https://brevo.com) (for emails)
- ✅ [Google AI Studio](https://aistudio.google.com) (for AI)

---

## 🗄️ **Step 1: Setup Database (Neon PostgreSQL)**

### 1.1 Create Database
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Name: `quizmind-ai`
4. Region: Choose closest to your users
5. Click **"Create Project"**

### 1.2 Get Connection String
1. In your project dashboard, click **"Connection Details"**
2. Copy the **Connection string** (should look like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this - you'll need it for Render

### 1.3 Run Migrations
```bash
# In your local terminal
cd backend
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npx prisma generate
```

---

## 🔴 **Step 2: Setup Redis (Upstash)**

### 2.1 Create Redis Database
1. Go to [console.upstash.com](https://console.upstash.com)
2. Click **"Create Database"**
3. Name: `quizmind-redis`
4. Type: **Regional**
5. Region: Choose closest to your Render region
6. Click **"Create"**

### 2.2 Get Connection String
1. Click on your database
2. Scroll to **"REST API"** section
3. Copy **"UPSTASH_REDIS_REST_URL"** (should look like):
   ```
   rediss://default:xxxxx@usw1-xxxxx.upstash.io:6379
   ```
4. Save this for Render

---

## ☁️ **Step 3: Setup File Storage (Cloudinary)**

### 3.1 Get API Keys
1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. In Dashboard, find:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Save these values

---

## 📧 **Step 4: Setup Email (Brevo)**

### 4.1 Get SMTP Credentials
1. Go to [app.brevo.com](https://app.brevo.com)
2. Navigate to **SMTP & API** → **SMTP**
3. Click **"Generate a new SMTP key"**
4. Copy:
   - **Login**: Your email
   - **SMTP Key**: Generated password
5. Verify a sender email in **Senders** tab

---

## 🤖 **Step 5: Setup AI (Google Gemini)**

### 5.1 Get API Key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Select **"Create API key in new project"**
4. Copy the API key

---

## 🖥️ **Step 6: Deploy Backend (Render)**

### 6.1 Connect GitHub
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### 6.2 Create Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `quizmind-backend`
   - **Region**: Same as your Neon/Upstash
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 6.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add all from below:

```bash
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-app.vercel.app  # Will update later

# Database (from Neon)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Redis (from Upstash)
REDIS_URL=rediss://default:password@redis-host.upstash.io:6379

# JWT Secrets (GENERATE NEW ONES!)
# Generate with: openssl rand -base64 32
JWT_ACCESS_SECRET=your-generated-secret-32-chars
JWT_REFRESH_SECRET=your-generated-secret-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
COOKIE_SECURE=true

# AI (from Google AI Studio)
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
AI_REQUIRE_PAID=false
GEMINI_MODEL=gemini-2.0-flash-exp

# Cloudinary (from Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (Optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email (from Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASS=your-brevo-smtp-key
MAIL_FROM=QuizMind AI <noreply@yourdomain.com>
```

### 6.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Copy your backend URL (e.g., `https://quizmind-backend.onrender.com`)

### 6.5 Important Note ⚠️
Render free tier spins down after 15 minutes of inactivity. First request will take 30-60 seconds to wake up.

---

## 🌐 **Step 7: Deploy Frontend (Vercel)**

### 7.1 Update Frontend Environment
Create `frontend/.env.production`:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

### 7.2 Push Changes
```bash
git add frontend/.env.production
git commit -m "Add production env"
git push origin main
```

### 7.3 Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend.onrender.com`
5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Copy your frontend URL (e.g., `https://quizmind-ai.vercel.app`)

### 7.4 Update Backend CORS
1. Go back to Render dashboard
2. Open your backend service
3. Go to **"Environment"**
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://quizmind-ai.vercel.app
   ```
5. Click **"Save Changes"** (auto-redeploys)

---

## 🎯 **Step 8: Final Configuration**

### 8.1 Test Your Deployment
1. Visit your Vercel URL
2. Try to signup/login
3. Create a test quiz
4. Join a quiz session

### 8.2 Common Issues & Fixes

#### Issue: CORS errors
**Fix**: Make sure `FRONTEND_URL` in Render matches your Vercel domain exactly (no trailing slash)

#### Issue: Database connection fails
**Fix**: Ensure `?sslmode=require` is in your DATABASE_URL

#### Issue: Redis connection fails
**Fix**: Use `rediss://` (with double 's') for secure connection

#### Issue: Backend takes 30+ seconds to respond
**Fix**: This is normal on Render free tier (cold start). Consider keeping it warm with a cron job or upgrading to paid tier.

#### Issue: Email not sending
**Fix**: Verify your sender email in Brevo dashboard under **Senders** section

---

## 🔄 **Step 9: Continuous Deployment**

Both Vercel and Render auto-deploy on git push:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main
```

- **Vercel** will auto-deploy frontend (~2 min)
- **Render** will auto-deploy backend (~5 min)

---

## 💰 **Free Tier Limits**

| Service | Free Tier Limits |
|---------|------------------|
| **Vercel** | 100GB bandwidth/month, unlimited deployments |
| **Render** | 750 hours/month, 512MB RAM, spins down after 15 min |
| **Neon** | 0.5GB storage, 1 project |
| **Upstash** | 10,000 commands/day |
| **Cloudinary** | 25GB storage, 25GB bandwidth/month |
| **Brevo** | 300 emails/day |
| **Gemini** | 60 requests/minute (free tier) |

---

## 🚀 **Production Checklist**

Before going live:

- [ ] Strong JWT secrets generated (32+ characters)
- [ ] `COOKIE_SECURE=true` set
- [ ] `NODE_ENV=production` set
- [ ] All API keys added to Render
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] Email sender verified in Brevo
- [ ] Test signup/login flow
- [ ] Test quiz creation and joining
- [ ] Test file uploads
- [ ] Test email verification
- [ ] Monitor logs in Render dashboard

---

## 📊 **Monitoring**

### Render Logs
- Go to your service in Render
- Click **"Logs"** tab to see real-time logs

### Vercel Logs
- Go to your project in Vercel
- Click **"Deployments"** → Select deployment → **"Logs"**

### Database
- Neon dashboard shows connection count and query stats

### Redis
- Upstash dashboard shows command count and memory usage

---

## 🆙 **Upgrade Path (When You Grow)**

When you hit free tier limits:

1. **Render**: Upgrade to Starter ($7/month)
   - No sleep time
   - 512MB RAM → 2GB RAM
   
2. **Neon**: Upgrade to Launch ($19/month)
   - 0.5GB → 10GB storage
   - More connections

3. **Upstash**: Upgrade to Pay-as-you-go
   - $0.2 per 100K commands

4. **Vercel**: Upgrade to Pro ($20/month)
   - 1TB bandwidth
   - Better analytics

---

## 🆘 **Getting Help**

If you encounter issues:

1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
5. Test API endpoints directly using Postman/Thunder Client

---

## 🎉 **You're Done!**

Your QuizMind AI app is now live on production using 100% free services!

Share your URL: `https://your-app.vercel.app`

---

Made with ❤️ by [Your Name]
