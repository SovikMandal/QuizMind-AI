# 🏗️ QuizMind AI - Deployment Architecture

## 📊 **Visual Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                          │
│                     https://your-app.vercel.app                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend - FREE)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript + Vite                              │ │
│  │  • Pages: Landing, Dashboard, Quiz, etc.                   │ │
│  │  • Zustand state management                                │ │
│  │  • Socket.IO client for real-time                          │ │
│  │  • Tailwind CSS styling                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Free Tier: 100GB bandwidth/month                                │
└───────────────┬───────────────────────────────────────────────┬─┘
                │ REST API                                      │
                │ (axios)                                       │ WebSocket
                ▼                                               │ (Socket.IO)
┌───────────────────────────────────────────────────────────────▼─┐
│                 RENDER (Backend - FREE)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express 5 + TypeScript                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Modules:                                             │ │ │
│  │  │  • Auth (JWT, email verification)                    │ │ │
│  │  │  • Quiz (CRUD, AI generation)                        │ │ │
│  │  │  • Session (live + async)                            │ │ │
│  │  │  • Payment (Razorpay)                                │ │ │
│  │  │  • Notification                                       │ │ │
│  │  │  • Analytics                                          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  Socket.IO Server (/quiz namespace)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Free Tier: 512MB RAM, sleeps after 15min                        │
│  URL: https://your-backend.onrender.com                          │
└──┬────────────┬────────────┬────────────┬────────────┬──────────┘
   │            │            │            │            │
   │ Prisma     │ ioredis    │ Cloudinary │ Nodemailer │ AI SDK
   ▼            ▼            ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   NEON   │ │ UPSTASH  │ │CLOUDINARY│ │  BREVO   │ │  GEMINI  │
│ (Postgres│ │  (Redis) │ │ (Images) │ │ (Email)  │ │   (AI)   │
│   FREE)  │ │  (FREE)  │ │  (FREE)  │ │  (FREE)  │ │  (FREE)  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
│          │ │          │ │          │ │          │ │          │
│ Database │ │  Cache   │ │  Avatar  │ │   OTP    │ │Questions │
│ Storage  │ │  Session │ │  Upload  │ │  Verify  │ │Generate  │
│          │ │  State   │ │          │ │          │ │          │
│ 0.5GB    │ │ 10K/day  │ │  25GB    │ │ 300/day  │ │ 60/min   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 🔄 **Data Flow Examples**

### 1. User Signup Flow
```
Browser → Vercel (Signup Form)
   ↓
POST /api/v1/auth/signup → Render Backend
   ↓
Hash password (bcrypt) → Save to Neon (PostgreSQL)
   ↓
Generate OTP → Send via Brevo (Email)
   ↓
Return success → Vercel → Show "Check Email"
```

### 2. Create Quiz with AI Flow
```
Browser → Vercel (Create Quiz Form)
   ↓
POST /api/v1/ai/generate → Render Backend
   ↓
Call Google Gemini API → Get AI questions
   ↓
Save quiz to Neon (PostgreSQL)
   ↓
Return quiz → Vercel → Show quiz editor
```

### 3. Live Quiz Session Flow
```
Browser → Vercel → Connect Socket.IO → Render
   ↓
join-lobby event → Save to Upstash Redis
   ↓
Host starts quiz → Broadcast to all participants
   ↓
Submit answers → Score in Redis → Save to Neon
   ↓
Show results → Update leaderboard
```

### 4. Upload Avatar Flow
```
Browser → Vercel (File picker)
   ↓
POST /api/v1/users/avatar → Render Backend
   ↓
Multer processes file → Upload to Cloudinary
   ↓
Get Cloudinary URL → Save to Neon
   ↓
Return URL → Vercel → Update profile picture
```

---

## 🌐 **Network Flow**

```
┌──────────────────────────────────────────────────────────┐
│                    Internet                              │
└──────────────┬──────────────┬────────────────────────────┘
               │              │
        HTTPS (443)      HTTPS (443)
               │              │
               ▼              ▼
        ┌──────────────┐  ┌──────────────┐
        │   Vercel     │  │    Render    │
        │   CDN Edge   │  │   Load Bal   │
        └──────┬───────┘  └──────┬───────┘
               │                 │
            Static            Dynamic
             Files          API + WebSocket
               │                 │
               ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │  React App   │  │  Express +   │
        │  (Browser)   │  │  Socket.IO   │
        └──────────────┘  └──────────────┘
```

---

## 🔐 **Security Layers**

```
┌─────────────────────────────────────────────────────────┐
│  Browser Security                                        │
│  • HTTPS only                                            │
│  • HTTP-only cookies (JWT refresh token)               │
│  • CORS policy                                           │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Network Security                                        │
│  • Vercel/Render SSL/TLS                                │
│  • DDoS protection                                       │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Application Security                                    │
│  • JWT authentication                                    │
│  • Bcrypt password hashing (12 rounds)                  │
│  • Rate limiting (express-rate-limit)                   │
│  • Input validation (Zod)                               │
│  • Helmet.js headers                                     │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Database Security                                       │
│  • Neon: SSL required, isolated compute                 │
│  • Upstash: TLS encryption (rediss://)                  │
│  • Prisma: Parameterized queries (SQL injection safe)   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 **Deployment Pipeline**

```
┌────────────────────────────────────────────────────────────┐
│  Local Development                                          │
│  • Write code                                               │
│  • Test locally (npm run dev)                              │
│  • Commit to feature branch                                │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│  GitHub                                                     │
│  • Push to main branch                                      │
│  • Triggers webhooks                                        │
└───────────────┬──────────────────────────┬─────────────────┘
                │                          │
    ┌───────────▼─────────────┐  ┌─────────▼────────────┐
    │  Vercel Auto-Deploy     │  │  Render Auto-Deploy  │
    │  1. Clone repo          │  │  1. Clone repo       │
    │  2. Install deps        │  │  2. Install deps     │
    │  3. Build (vite build)  │  │  3. Build (tsc)      │
    │  4. Deploy to CDN       │  │  4. Start server     │
    │  Time: ~2 minutes       │  │  Time: ~5 minutes    │
    └─────────────────────────┘  └──────────────────────┘
```

---

## 🔄 **State Management**

```
┌─────────────────────────────────────────────────────────────┐
│  Client State (Zustand)                                      │
│  • User authentication                                       │
│  • Current quiz                                              │
│  • UI state (modals, loading)                               │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Hot State (Redis/Upstash)                                  │
│  • Active quiz sessions                                      │
│  • Real-time leaderboards                                    │
│  • Socket.IO room data                                       │
│  • TTL: Auto-expire after session ends                      │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Durable State (PostgreSQL/Neon)                            │
│  • Users, quizzes, questions                                 │
│  • Sessions, participants, answers                           │
│  • Historical data, analytics                                │
│  • Permanent storage                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 **Backup Strategy**

```
┌─────────────────────────────────────────────────────────────┐
│  Neon PostgreSQL                                             │
│  • Auto-backup: Every 24 hours                              │
│  • Retention: 7 days (free tier)                            │
│  • Point-in-time restore: Last 7 days                       │
│                                                              │
│  Manual Backup (recommended):                               │
│  $ pg_dump $DATABASE_URL > backup-$(date +%F).sql          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Cloudinary                                                  │
│  • Permanent storage                                         │
│  • Recommend periodic export for critical images            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Redis/Upstash                                              │
│  • Ephemeral cache (no backup needed)                       │
│  • All critical data also in PostgreSQL                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Cost Projection**

```
┌──────────────────────────────────────────────────────────────┐
│  Users/Month │ Cost/Month │ What You Need                    │
├──────────────┼────────────┼──────────────────────────────────┤
│  0 - 100     │    $0      │ All free tiers                   │
│  100 - 1K    │    $7      │ Render Starter (no sleep)        │
│  1K - 5K     │   $50      │ + Neon Launch + Vercel Pro       │
│  5K - 10K    │   $100     │ + Upstash pay-as-you-go          │
│  10K+        │   $200+    │ Consider self-hosting            │
└──────────────────────────────────────────────────────────────┘
```

This diagram is now in: **`DEPLOYMENT_ARCHITECTURE.md`**
