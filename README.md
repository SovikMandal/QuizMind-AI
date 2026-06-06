# 🧠 QuizMind AI

> **AI-powered quiz platform with real-time multiplayer and self-paced learning**

A full-stack TypeScript application that combines live quiz competitions with asynchronous learning, powered by AI question generation and real-time Socket.IO technology.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

### 🎮 Dual Quiz Modes
- **🔴 Live Multiplayer**: Real-time quizzes with host controls, lobby system, and synchronized progression
- **⏱️ Self-Paced (Async)**: Take quizzes at your own pace with instant scoring and results

### 🤖 AI-Powered Question Generation
- Multiple AI providers: **Google Gemini**, **Anthropic Claude**, **OpenRouter**
- Context-aware question generation based on subject and difficulty
- Structured output with explanations

### 📊 Rich Analytics
- Session performance metrics
- Question-level analysis
- Interactive charts and leaderboards
- Score distribution visualization

### 💳 Subscription Tiers
| Tier | Quizzes | Participants/Quiz | Price |
|------|---------|-------------------|-------|
| 🆓 Free | 10 | Unlimited | Free |
| ⭐ Pro | 30 | Unlimited | ₹299/mo |
| 💎 Premium | 120 | Unlimited | ₹999/mo |

### 🎯 Additional Features
- ⏰ **Scheduled Quizzes**: Auto-transition from scheduled → live → async
- 🔒 **Access Control**: Public or private quizzes with 6-digit codes
- 📧 **Email Verification**: OTP-based account verification
- 🔔 **Real-time Notifications**: Quiz reminders and tier limit alerts
- 📈 **Smart Leaderboards**: Live ranking with time-based scoring
- 🖼️ **Avatar Uploads**: Cloudinary-powered profile pictures

---

## 🏗️ Architecture

### Tech Stack

#### **Frontend**
- ⚛️ **React 18** + TypeScript
- ⚡ **Vite 6** for blazing-fast builds
- 🎨 **Tailwind CSS 4** for styling
- 🐻 **Zustand** for state management
- 🔌 **Socket.IO Client** for real-time features
- 📡 **Axios** for HTTP requests
- 📊 **Recharts** for analytics visualization

#### **Backend**
- 🟢 **Node.js** + **Express 5** + TypeScript
- 🐘 **PostgreSQL 15** with **Prisma ORM**
- 🔴 **Redis 7** for caching and real-time state
- 🔌 **Socket.IO** for WebSocket connections
- 🔐 **JWT** authentication with refresh tokens
- ✅ **Zod** for runtime validation
- 📧 **Nodemailer** for email delivery
- ☁️ **Cloudinary** for image uploads
- 💳 **Razorpay** for subscription payments

### System Design Highlights

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   React     │◄───────►│   Express    │◄───────►│  PostgreSQL  │
│  + Vite     │  REST   │  + Socket.IO │  Prisma │  (Durable)   │
└─────────────┘         └──────────────┘         └──────────────┘
       │                        │
       │ WebSocket             │
       ▼                        ▼
┌─────────────┐         ┌──────────────┐
│  Socket.IO  │◄───────►│    Redis     │
│   Client    │         │ (Hot State)  │
└─────────────┘         └──────────────┘
```

**Key Architectural Decisions:**
- ✅ **Time-Driven Lifecycle**: Quiz status computed from `scheduledAt + durationMins` (no cron jobs)
- ✅ **Separate Async Flow**: REST submission for self-paced quizzes to avoid side effects on live sessions
- ✅ **Redis for Hot Path**: Active session state cached in Redis, durable data in Postgres
- ✅ **Pluggable AI**: Interface-based design for easy provider switching

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and npm
- **Docker** and Docker Compose (for local infrastructure)
- API keys (optional): AI provider, Cloudinary, Razorpay, SMTP

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SovikMandal/quizmind-ai.git
cd quizmind-ai
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Start Infrastructure
```bash
npm run infra:up
```
This starts PostgreSQL (port 5434) and Redis (port 6380) in Docker containers.

### 4️⃣ Configure Environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

**Frontend** (`frontend/.env`):
```bash
echo "VITE_API_URL=http://localhost:4000" > frontend/.env
```

### 5️⃣ Initialize Database
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
cd ..
```

### 6️⃣ Start Development Servers
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

🎉 Open **http://localhost:5173** in your browser!

---

## 📦 Project Structure

```
quizmind-ai/
├── backend/
│   ├── src/
│   │   ├── modules/          # Domain modules (auth, quiz, session, ai, payment, etc.)
│   │   ├── config/           # Database, Redis, Cloudinary, Razorpay
│   │   ├── middlewares/      # Auth, validation, rate-limiting
│   │   ├── socket/           # Socket.IO server + authentication
│   │   ├── utils/            # JWT, logger, mailer, password hashing
│   │   ├── app.ts            # Express app factory
│   │   └── server.ts         # HTTP + Socket.IO initialization
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── tests/                # Jest + Supertest
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # 18 route pages (lazy-loaded)
│   │   ├── components/       # Reusable UI components
│   │   ├── stores/           # Zustand state management
│   │   ├── lib/              # API client, utilities
│   │   └── App.tsx           # Router + layout
│   └── dist/                 # Production build output
│
├── docker-compose.yml        # Local PostgreSQL + Redis
├── package.json              # Workspace root
└── README.md                 # You are here!
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```bash
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database & Cache
DATABASE_URL=postgresql://quizuser:quizpass@127.0.0.1:5434/quizapp
REDIS_URL=redis://127.0.0.1:6380

# Authentication
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Provider (choose one: gemini | anthropic | openrouter)
AI_PROVIDER=gemini
AI_API_KEY=your-api-key
AI_REQUIRE_PAID=false

# Cloudinary (avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (payments)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email (Nodemailer + Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM=QuizMind AI <no-reply@example.com>
```

---

## 📝 API Documentation

### REST Endpoints

#### Authentication
```
POST   /api/v1/auth/signup              # Register new user
POST   /api/v1/auth/login               # Login (returns JWT)
POST   /api/v1/auth/logout              # Clear refresh token
POST   /api/v1/auth/refresh             # Refresh access token
POST   /api/v1/auth/send-verification   # Send email OTP
POST   /api/v1/auth/verify-email        # Verify OTP code
```

#### Quizzes
```
GET    /api/v1/quizzes                  # List quizzes (paginated)
POST   /api/v1/quizzes                  # Create quiz
GET    /api/v1/quizzes/:id              # Get quiz details
PATCH  /api/v1/quizzes/:id              # Update quiz
DELETE /api/v1/quizzes/:id              # Delete quiz
POST   /api/v1/quizzes/:id/publish      # Publish quiz
```

#### AI Generation
```
POST   /api/v1/ai/generate              # Generate questions with AI
```

#### Sessions
```
POST   /api/v1/sessions/:id/join        # Join quiz session
POST   /api/v1/sessions/:id/submit      # Submit async answers
GET    /api/v1/sessions/:id/results     # Get session results
```

### Socket.IO Events (Namespace: `/quiz`)

#### Client → Server
```javascript
socket.emit('join-lobby', { sessionId, userId })
socket.emit('start-quiz', { sessionId })
socket.emit('submit-answer', { sessionId, questionId, answer })
socket.emit('next-question', { sessionId })
socket.emit('end-quiz', { sessionId })
```

#### Server → Client
```javascript
socket.on('lobby-update', { participants })
socket.on('quiz-started', { currentQuestion, questionIndex })
socket.on('show-results', { rankings, correctAnswer })
socket.on('quiz-ended', { finalRankings })
socket.on('error', { message })
```

---

## 🧪 Testing

```bash
cd backend
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:ai        # Test AI provider connection
```

---

## 🏭 Production Deployment

### 🚀 Deploy to Free Platforms

This app can be deployed **100% FREE** using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL
- **Redis**: Upstash
- **Files**: Cloudinary
- **Email**: Brevo

**📖 Complete Guides**:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed step-by-step instructions
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Quick checklist
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Cost breakdown & architecture
- [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) - Visual diagrams
- [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) - Common issues & fixes
- [frontend/SPA_ROUTING_FIX.md](frontend/SPA_ROUTING_FIX.md) - **Fix 404 errors on page refresh**

**🔧 Helper Scripts**:
```bash
# Generate JWT secrets
node scripts/generate-secrets.js

# Pre-deployment checklist (Linux/Mac)
bash scripts/pre-deployment-check.sh

# Pre-deployment checklist (Windows)
powershell .\scripts\pre-deployment-check.ps1
```

### Quick Start

1. **Setup Services** (5 minutes each):
   - [Neon](https://neon.tech) - PostgreSQL
   - [Upstash](https://upstash.com) - Redis
   - [Cloudinary](https://cloudinary.com) - File storage
   - [Brevo](https://brevo.com) - Email
   - [Google AI Studio](https://aistudio.google.com) - AI API

2. **Deploy Backend to Render**:
   - Connect GitHub repo
   - Add environment variables
   - Deploy (5-10 minutes)

3. **Deploy Frontend to Vercel**:
   - Connect GitHub repo
   - Add `VITE_API_URL` env variable
   - Deploy (2-3 minutes)

4. **Update CORS**:
   - Set `FRONTEND_URL` in Render to your Vercel URL

### Using Docker Compose (Self-Hosted)
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Environment Checklist
- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT secrets (32+ characters)
- ✅ Enable `COOKIE_SECURE=true` (requires HTTPS)
- ✅ Configure SMTP for email delivery
- ✅ Set up SSL/TLS with Nginx or similar
- ✅ Use PostgreSQL with connection pooling
- ✅ Configure Redis persistence (AOF/RDB)

---

## 🎓 Development Insights

This project demonstrates:

1. **Dual-Mode Architecture**: Separate live (Socket.IO) and async (REST) flows to avoid blast radius
2. **Time-Based State Derivation**: Quiz lifecycle computed from timestamps, not state machines
3. **Efficient Aggregations**: Batch queries + in-memory reduce to avoid N+1 problems
4. **Pluggable Services**: Interface-based design for AI providers, easy to extend
5. **Production-Grade Security**: JWT rotation, rate limiting, input validation, secure cookies
6. **Developer Experience**: Monorepo workspaces, TypeScript everywhere, hot reload, sensible defaults

See [DEVELOPMENT_JOURNAL.md](DEVELOPMENT_JOURNAL.md) for detailed feature breakdowns and architectural decisions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for inspiration
- **Vercel** for deployment guidance
- **Prisma** for excellent ORM documentation
- **Socket.IO** team for real-time magic

---

## 📧 Contact

**Developer**: Sovik Mandal  
**Email**: mandalsouvik9635@gmail.com 
**LinkedIn**: [linkedin.com/in/sovikmandal](https://www.linkedin.com/in/sovik-mandal-6bba46285)  
**GitHub**: [github.com/sovikmandal](https://github.com/SovikMandal)

---

<div align="center">

### ⭐ If you found this project helpful, please give it a star!

Made with ❤️ and ☕ by Sovik Mandal

</div>
