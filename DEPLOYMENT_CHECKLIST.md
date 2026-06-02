# ✅ Deployment Quick Checklist

Use this as a quick reference while deploying. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps.

---

## 📋 Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] `.env.production.example` reviewed

---

## 🔑 Get Your API Keys

### 1. Database - Neon PostgreSQL
- [ ] Create account: https://console.neon.tech
- [ ] Create project
- [ ] Copy connection string
- [ ] Run migrations locally: `DATABASE_URL="..." npx prisma migrate deploy`

### 2. Redis - Upstash
- [ ] Create account: https://console.upstash.com
- [ ] Create database
- [ ] Copy `REDIS_URL` (starts with `rediss://`)

### 3. File Storage - Cloudinary
- [ ] Create account: https://cloudinary.com/console
- [ ] Copy: Cloud Name, API Key, API Secret

### 4. Email - Brevo
- [ ] Create account: https://app.brevo.com
- [ ] Generate SMTP key
- [ ] Verify sender email
- [ ] Copy: Login email, SMTP key

### 5. AI - Google Gemini
- [ ] Get API key: https://aistudio.google.com/apikey
- [ ] Copy API key

### 6. JWT Secrets
- [ ] Generate access secret: `openssl rand -base64 32`
- [ ] Generate refresh secret: `openssl rand -base64 32`

---

## 🖥️ Deploy Backend (Render)

- [ ] Go to: https://dashboard.render.com
- [ ] New Web Service
- [ ] Connect GitHub repo
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Add ALL environment variables (see list below)
- [ ] Deploy and wait ~5 minutes
- [ ] Copy backend URL: `https://xxx.onrender.com`

### Backend Environment Variables
```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://xxx.vercel.app

DATABASE_URL=postgresql://...neon.tech...
REDIS_URL=rediss://...upstash.io:6379

JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
COOKIE_SECURE=true

AI_PROVIDER=gemini
AI_API_KEY=your-gemini-key
AI_REQUIRE_PAID=false
GEMINI_MODEL=gemini-2.0-flash-exp

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-smtp-key
MAIL_FROM=QuizMind AI <noreply@yourdomain.com>
```

---

## 🌐 Deploy Frontend (Vercel)

- [ ] Create `frontend/.env.production`:
  ```
  VITE_API_URL=https://your-backend.onrender.com
  ```
- [ ] Push to GitHub
- [ ] Go to: https://vercel.com/new
- [ ] Import GitHub repo
- [ ] Framework: Vite
- [ ] Root Directory: `frontend`
- [ ] Add env var: `VITE_API_URL=https://xxx.onrender.com`
- [ ] Deploy and wait ~2 minutes
- [ ] Copy frontend URL: `https://xxx.vercel.app`

---

## 🔄 Update Backend CORS

- [ ] Go back to Render
- [ ] Edit `FRONTEND_URL` to match Vercel URL
- [ ] Save (auto-redeploys)

---

## 🧪 Test Deployment

- [ ] Visit frontend URL
- [ ] Signup/Login works
- [ ] Email verification works
- [ ] Create quiz works
- [ ] Join quiz works
- [ ] File upload works
- [ ] AI generation works
- [ ] Live quiz works

---

## 🐛 Common Fixes

**CORS Error**: Update `FRONTEND_URL` in Render (no trailing slash)

**Database Error**: Add `?sslmode=require` to `DATABASE_URL`

**Redis Error**: Use `rediss://` (double s)

**Slow Backend**: Normal on Render free tier (cold start ~30s)

**Email Not Sending**: Verify sender email in Brevo dashboard

---

## 📊 Monitor

- **Backend Logs**: Render Dashboard → Logs tab
- **Frontend Logs**: Vercel → Deployments → Select → Logs
- **Database**: Neon Dashboard
- **Redis**: Upstash Dashboard

---

## 🎉 Done!

Your app is live at: `https://your-app.vercel.app`

Share it with the world! 🌍
