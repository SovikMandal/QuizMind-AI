# QuizMind AI — Full-Stack System Architecture & Design

> **Version:** 2.0 | **Target:** Production-Ready Full-Stack Platform  
> **Purpose:** Complete integration of frontend (React + Tailwind) with backend architecture  
> **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui + Recharts (13 Screens)  
> **Backend:** Express.js + Socket.IO + PostgreSQL + Redis + AI Integration

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Frontend Architecture (13 Screens)](#2-frontend-architecture-13-screens)
3. [Core Features & User Stories](#3-core-features--user-stories)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Technology Stack](#5-technology-stack)
6. [Database Schema](#6-database-schema)
7. [API Design (REST + WebSocket)](#7-api-design-rest--websocket)
8. [AI Integration Layer](#8-ai-integration-layer)
9. [Real-Time System (Live Quiz Engine)](#9-real-time-system-live-quiz-engine)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Frontend-Backend Integration](#11-frontend-backend-integration)
12. [Quiz Types & Access Control](#12-quiz-types--access-control)
13. [Analytics & Leaderboard Engine](#13-analytics--leaderboard-engine)
14. [Folder Structure](#14-folder-structure)
15. [Environment Variables](#15-environment-variables)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

## 1. Project Overview

A full-stack, production-ready AI-powered quiz platform combining:

**Frontend:** 13 distinct React screens with professional UI (Tailwind CSS + shadcn/ui)  
**Backend:** Scalable Node.js API with real-time WebSocket engine

### Key Capabilities
- **Create quizzes** manually or via AI (topic + difficulty → auto-generated questions)
- **Host quizzes** as Public (open join) or Private (ID + password protected)
- **Join quizzes** live or attempt later with dedicated interfaces
- **View analytics** — personal performance, leaderboard, difficulty heatmaps per question/topic
- **Attend live public quizzes** happening on the platform in real time
- **Subscribe to tiers** (Free, Pro, Premium) with feature access control

**No separate educator/student role** — all users share the same account type with full create & join capabilities.

---

## 2. Frontend Architecture (13 Screens)

### Frontend Navigation Structure

```
QuizMind AI - 13 Screens + Navigation Hub
├── Landing & Auth (4 screens)
│   ├── Screen 1: Landing/Home
│   ├── Screen 9: Pricing
│   ├── Screen 12: Sign In
│   └── Screen 13: Sign Up
├── Dashboard & Quiz Discovery
│   ├── Screen 2: Main Dashboard
│   └── Screen 4: Discover Quizzes
├── Quiz Creation (3-step wizard)
│   ├── Screen 5: Quiz Details
│   ├── Screen 6: Add Questions
│   └── Screen 7: Review & Publish
├── Quiz Experience
│   ├── Screen 8: Live Quiz Interface
│   ├── Screen 8b: Waiting Room
│   └── Screen 3b: Quiz Results
├── Analytics & Insights
│   └── Screen 3: Quiz Analytics Dashboard
└── User Management
    ├── Screen 10: Profile
    └── Screen 11: Settings
```

### Frontend Design System

**Primary Color:** #2b7fff (Blue)  
**Text Gray:** #71717b  
**Danger Red:** #e7000b  
**Max Layout Width:** 1140px  
**Typography:** Consistent sans-serif with Tailwind scale  

**UI Component Library:** shadcn/ui (Button, Card, Input, Avatar, Badge, Progress, Table, Charts)

---

## 3. Core Features & User Stories

### 2.1 Authentication
- `US-01` — User can register with email + password
- `US-02` — User can log in and receive a JWT access token + refresh token
- `US-03` — User can log out (token revocation)

### 2.2 Quiz Creation
- `US-04` — User creates a quiz manually: title, subject, difficulty, questions (MCQ / True-False / Short Answer), options, correct answer, explanation
- `US-05` — User creates a quiz via AI: inputs topic, subject, difficulty, number of questions → AI generates complete question set
- `US-06` — User sets quiz as **Public** (no password needed) or **Private** (system generates a 6-char alphanumeric Quiz ID + user sets a password)
- `US-07` — User can schedule quiz for a future time or start immediately
- `US-08` — User can edit quiz before it starts
- `US-09` — User can choose: **Live Only** or **Allow Attempt Later**

### 2.3 Joining a Quiz
- `US-10` — User can browse all live/upcoming **Public** quizzes from Screen 4 (Discover Quizzes)
- `US-11` — User joins a **Private** quiz by entering Quiz ID + Password in Screen 4 sidebar
- `US-12` — If quiz hasn't started yet, user lands on **Screen 8b (Waiting Room)** showing countdown and participants list
- `US-13` — User can attempt quiz later (if host allowed it) via Screen 4 or quiz results

### 2.4 Live Quiz Experience
- `US-14` — Host starts the quiz from Waiting Room → all participants move to **Screen 8 (Live Quiz)**
- `US-15` — **Screen 8** shows one question at a time with per-question timer
- `US-16` — Answers are submitted in real time via WebSocket
- `US-17` — **Screen 3b (Results)** shows answer reveal with explanation (processed backend)
- `US-18` — Real-time leaderboard updates shown in Screen 3b mini-leaderboard

### 2.5 Post-Quiz Analytics
- `US-19` — After quiz ends, all participants see **Screen 3b** with score, rank, breakdown
- `US-20` — Creator sees **Screen 3 (Quiz Analytics)** with per-question accuracy, charts, heat maps
- `US-21` — Global leaderboard in Screen 3b visible to all participants with medals (🏆)
- `US-22` — User's **Screen 2 (Dashboard)** shows history of all quizzes taken and created

### 2.6 Subscription & Pricing (Screen 9)
- `US-23` — User views **Screen 9 (Pricing)** with 3 tiers: Free, Pro (₹250), Premium (₹900)
- `US-24` — Free users limited to 10 quizzes, Pro to 30, Premium unlimited
- `US-25` — AI quiz generation available only in Pro/Premium tiers

### 2.7 User Profile Management (Screen 10 & 11)
- `US-26` — User can upload avatar, edit profile, manage subscription from **Screen 10 (Profile)**
- `US-27` — Security settings: password, 2FA, notifications, logout
- `US-28` — User can view stats on sidebar (Quizzes Created, Total Attempts, Avg Score)

---

## 4. System Architecture Overview

### Full-Stack Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Frontend)                            │
│  React 18 + TypeScript + Tailwind + shadcn/ui (13 Screens)                 │
│  State: Zustand + TanStack Query | Real-time: Socket.IO Client             │
│  Routing: React Router | Forms: React Hook Form + Zod                      │
│  Charts: Recharts                                                            │
└────────────────────────────────────────────┬─────────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
        ┌────────────▼────────────┐                   ┌──────────▼──────────┐
        │   REST API Layer        │                   │ WebSocket Layer     │
        │  (Express.js) :4000     │                   │ (Socket.IO) :4000   │
        │  /api/v1                │                   │ Namespace: /quiz    │
        └────────────┬────────────┘                   └──────────┬──────────┘
                     │                                             │
        ┌────────────┴─────────────────────────────────────────────┴────────┐
        │                     SERVICE LAYER                                 │
        │  AuthService | QuizService | AIService | AnalyticsService        │
        │  SessionService | WebSocketHandler                                │
        └────────────┬──────────────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬──────────────────┬────────────────┐
     │               │               │                  │                │
   ┌──▼────┐    ┌─────▼────┐   ┌─────▼──────┐    ┌──────▼──────┐    ┌───▼──────┐
   │PostgreSQL│   │ Redis   │   │ Anthropic │   │ S3 Files    │   │ External │
   │Database │   │Cache/   │   │ Claude    │   │ (Media)     │   │ Services │
   │         │   │PubSub   │   │ API       │   │             │   │(OAuth)   │
   │Tables  │   │Session  │   │           │   │             │   │          │
   │(Users,│   │State    │   │Question  │   │             │   │ Google,  │
   │Quizzes)│   │Live     │   │Generation │  │             │   │ GitHub   │
   └────────┘   │Quiz    │   └──────────┘   └─────────────┘   └──────────┘
               │Data    │
               └─────────┘
```

### Frontend-Backend Integration Flow

```
USER INTERACTION (React)
        │
        ▼
  UI Component Emits Action
        │
        ├─── REST API Call ────→ [Auth | Quiz | Analytics API]
        │                              │
        │                              ├─ Validate Request
        │                              ├─ Process Business Logic
        │                              ├─ Query Database/Cache
        │                              └─ Return JSON Response
        │                                      │
        ├────────────────────────────────────┘
        │
        ├─── WebSocket Event (Real-time) ───→ [Socket.IO Server]
        │                                           │
        │                                      ├─ Authenticate Socket
        │                                      ├─ Handle Live Quiz Events
        │                                      ├─ Broadcast to Room
        │                                      ├─ Update Redis State
        │                                      └─ Emit to All Clients
        │                                              │
        └──────────────────────────────────────────┘
                     │
                     ▼
        Update Zustand Store
        Re-render React Components
        Display UI Updates
```

### Integration Examples

#### Example 1: Join Live Quiz (Screen 4 → Screen 8b)

```
User clicks [Join] button on Screen 4
        │
        ▼
Frontend: POST /api/v1/sessions/join { accessCode, password }
        │
        ▼
Backend: Validate code + password → Create participant record
        │
        ▼
Return: { sessionId, participantId, quizDetails }
        │
        ▼
Frontend: Store in Zustand → Navigate to /quiz/:id/lobby (Screen 8b)
        │
        ▼
Frontend: WebSocket emit 'join_room' { sessionId, participantId, token }
        │
        ▼
Backend: Add socket to room 'quiz:sessionId' → Broadcast participant_joined
        │
        ▼
Screen 8b: Update participants list in real-time
```

#### Example 2: Live Quiz Submission & Leaderboard Update

```
User selects answer on Screen 8 → Clicks Next/Submit
        │
        ▼
Frontend: WebSocket emit 'submit_answer' { sessionId, questionId, answer, time }
        │
        ▼
Backend: Validate answer → Update Redis sorted set score
        │
        ▼
Backend: Broadcast 'leaderboard_update' to all in room
        │
        ▼
Frontend: Zustand updates leaderboard store
        │
        ▼
Screen 8 (mini-leaderboard): Re-renders with new ranks
```

#### Example 3: Quiz Results & Analytics (Screen 3)

```
Quiz ends → User navigates to /quiz/:id/analytics
        │
        ▼
Frontend: GET /api/v1/sessions/:id/analytics { creator: true }
        │
        ▼
Backend: Query PostgreSQL for all answers → Calculate metrics
        │
        ▼
Return: {
  metrics: [{ students, avgScore, completion, avgTime }],
  charts: [{ participationOverTime }, { scoreDistribution }],
  leaderboard: [{ rank, name, score, time }],
  aiInsights: "Class performed above average..."
}
        │
        ▼
Frontend: Store in Zustand → Render Screen 3 components
        │
        ▼
Recharts: Visualize data in Area/Bar/Pie charts
```

---

## 5. Technology Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20+ | Server runtime |
| Framework | Express.js 5 | REST API |
| Real-Time | Socket.IO 4 | WebSocket live quiz engine |
| ORM | Prisma 5 | Database access layer |
| Auth | JWT (jsonwebtoken) + bcryptjs | Token auth + password hashing |
| Cache / PubSub | Redis (ioredis) | Live session state, rate limiting |
| AI | Anthropic Claude API / OpenAI API | Question generation |
| Validation | Zod | Request schema validation |
| Queue | BullMQ (Redis-backed) | AI generation jobs, email notifications |
| Logging | Winston + Morgan | Structured logging |
| Testing | Jest + Supertest | Unit + integration tests |

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + TypeScript | Web UI |
| State | Zustand | Global state management |
| Data Fetching | TanStack Query (React Query) | Server state, caching |
| Real-Time | Socket.IO Client | WebSocket connection |
| Charts | Recharts | Analytics visualizations |
| Forms | React Hook Form + Zod | Form handling and validation |
| Routing | React Router v6 | Client-side routing |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| Build | Vite | Dev server and bundler |

### Infrastructure
| Component | Technology |
|---|---|
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Reverse Proxy | Nginx |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | AWS / Railway / Render |
| File Storage | AWS S3 (quiz media assets) |

---

## 5. Database Schema

### 5.1 Users Table
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Quizzes Table
```sql
CREATE TABLE quizzes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  subject         VARCHAR(100),
  difficulty      ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  quiz_type       ENUM('public', 'private') DEFAULT 'public',
  access_code     VARCHAR(6) UNIQUE,       -- auto-generated for private quizzes
  password_hash   VARCHAR(255),            -- hashed password for private quizzes
  allow_late_join BOOLEAN DEFAULT FALSE,   -- attempt after live session ends
  status          ENUM('draft', 'scheduled', 'waiting', 'live', 'ended') DEFAULT 'draft',
  scheduled_at    TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  time_limit_secs INT DEFAULT 30,          -- per-question timer (seconds)
  is_ai_generated BOOLEAN DEFAULT FALSE,
  total_points    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Questions Table
```sql
CREATE TABLE questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   ENUM('mcq', 'true_false', 'short_answer') DEFAULT 'mcq',
  options         JSONB,                  -- [{id, text, isCorrect}]
  correct_answer  TEXT NOT NULL,
  explanation     TEXT,                  -- shown after answer reveal
  points          INT DEFAULT 10,
  time_limit_secs INT,                   -- overrides quiz-level timer if set
  order_index     INT NOT NULL,          -- question sequence
  difficulty      ENUM('easy', 'medium', 'hard'),
  topic_tag       VARCHAR(100),          -- subtopic within the quiz subject
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.4 Quiz Sessions Table
```sql
-- Each time a quiz is run live, a session is created
CREATE TABLE quiz_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID REFERENCES quizzes(id),
  host_id         UUID REFERENCES users(id),
  status          ENUM('waiting', 'live', 'ended') DEFAULT 'waiting',
  current_q_index INT DEFAULT 0,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.5 Participants Table
```sql
CREATE TABLE participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  score           INT DEFAULT 0,
  rank            INT,
  time_taken_secs INT,                   -- total time to complete
  completed_at    TIMESTAMPTZ,
  attempt_type    ENUM('live', 'later') DEFAULT 'live'
);
```

### 5.6 Answers Table
```sql
CREATE TABLE answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  UUID REFERENCES participants(id) ON DELETE CASCADE,
  question_id     UUID REFERENCES questions(id),
  submitted_answer TEXT,
  is_correct      BOOLEAN,
  points_earned   INT DEFAULT 0,
  time_taken_secs INT,                   -- time taken for this question
  answered_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.7 Indexes
```sql
CREATE INDEX idx_quizzes_creator ON quizzes(creator_id);
CREATE INDEX idx_quizzes_access_code ON quizzes(access_code);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id, order_index);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_answers_participant ON answers(participant_id);
CREATE INDEX idx_answers_question ON answers(question_id);
```

---

## 6. API Design (REST + WebSocket)

### 6.1 REST API Base URL: `/api/v1`

#### Auth Endpoints
```
POST   /api/v1/auth/register          — Register new user
POST   /api/v1/auth/login             — Login, returns accessToken + refreshToken
POST   /api/v1/auth/refresh           — Refresh access token
POST   /api/v1/auth/logout            — Revoke refresh token
GET    /api/v1/auth/me                — Get current user profile
```

#### Quiz Endpoints
```
GET    /api/v1/quizzes                — List public quizzes (paginated, filterable)
POST   /api/v1/quizzes                — Create a new quiz
GET    /api/v1/quizzes/:id            — Get quiz details (if authorized)
PUT    /api/v1/quizzes/:id            — Update quiz (creator only)
DELETE /api/v1/quizzes/:id            — Delete quiz (creator only)

POST   /api/v1/quizzes/:id/publish    — Publish quiz (sets status to 'waiting' or 'scheduled')
POST   /api/v1/quizzes/:id/start      — Host starts the live quiz
POST   /api/v1/quizzes/:id/end        — Host ends the live quiz
```

#### Questions Endpoints
```
GET    /api/v1/quizzes/:id/questions  — Get all questions for a quiz
POST   /api/v1/quizzes/:id/questions  — Add a question manually
PUT    /api/v1/questions/:id          — Update a question
DELETE /api/v1/questions/:id          — Delete a question
```

#### AI Generation Endpoints
```
POST   /api/v1/ai/generate-questions  — Generate questions via AI
  Body: { topic, subject, difficulty, count, questionTypes[] }
  Returns: { questions: [...] }        — Questions ready to be saved

POST   /api/v1/ai/explain-answer      — Get AI explanation for a question answer
  Body: { questionId }
```

#### Join / Session Endpoints
```
POST   /api/v1/sessions/join          — Join a quiz
  Body: { accessCode, password? }
  Returns: { sessionId, quizDetails, participantId }

GET    /api/v1/sessions/live          — List all currently live public quiz sessions
GET    /api/v1/sessions/:id           — Get session state
POST   /api/v1/sessions/:id/answer    — Submit an answer (for async/later attempts)
```

#### Analytics Endpoints
```
GET    /api/v1/sessions/:id/results          — Post-session results summary
GET    /api/v1/sessions/:id/leaderboard      — Full leaderboard for a session
GET    /api/v1/sessions/:id/analytics        — Per-question analytics (creator view)
GET    /api/v1/users/me/history              — User's quiz history (created + participated)
GET    /api/v1/users/me/stats                — Aggregate user stats
```

### 6.2 WebSocket Events (Socket.IO)

#### Namespace: `/quiz`

**Client → Server Events:**
```javascript
// Join the waiting room for a session
socket.emit('join_room', { sessionId, participantId, token })

// Submit answer during live quiz
socket.emit('submit_answer', { sessionId, questionId, answer, timeTaken })

// Host: advance to next question manually (if not on auto-timer)
socket.emit('next_question', { sessionId })

// Host: start quiz (moves all waiting participants in)
socket.emit('start_quiz', { sessionId })
```

**Server → Client Events:**
```javascript
// Sent to all waiting room participants when someone joins
socket.on('participant_joined', { participantId, username, totalCount })

// Sent to all in room when quiz starts
socket.on('quiz_started', { firstQuestion, timeLimit })

// Sent to all when next question begins
socket.on('question_started', { question, questionIndex, total, timeLimit })

// Sent to individual on answer confirmation
socket.on('answer_confirmed', { isCorrect, pointsEarned, currentScore })

// Sent to all when question timer ends
socket.on('question_ended', { correctAnswer, explanation, leaderboard })

// Sent to all when quiz ends
socket.on('quiz_ended', { finalLeaderboard, sessionId })

// Leaderboard update after each question
socket.on('leaderboard_update', { leaderboard: [{ rank, username, score, delta }] })

// Live participant count in waiting room
socket.on('waiting_room_update', { participants: [{ id, username }] })
```

---

## 7. AI Integration Layer

### 7.1 AI Service Architecture

```
POST /api/v1/ai/generate-questions
        │
        ▼
  AIService.generateQuestions(params)
        │
        ├── Build structured prompt
        │
        ├── Call AI Provider (Claude / GPT-4)
        │
        ├── Parse JSON response
        │
        └── Return validated question objects
```

### 7.2 Prompt Template

```
You are an expert educational quiz designer.

Generate {count} {difficulty} level quiz questions about "{topic}" 
in the subject of "{subject}".

Requirements:
- Question types: {questionTypes} (mcq / true_false / short_answer)
- Each MCQ must have exactly 4 options with exactly 1 correct answer
- Include a clear explanation (2-3 sentences) for each correct answer
- Difficulty distribution: match the requested difficulty level
- Assign a topic_tag (subtopic) for each question

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "question_text": "...",
    "question_type": "mcq",
    "options": [
      {"id": "a", "text": "...", "isCorrect": false},
      {"id": "b", "text": "...", "isCorrect": true},
      {"id": "c", "text": "...", "isCorrect": false},
      {"id": "d", "text": "...", "isCorrect": false}
    ],
    "correct_answer": "b",
    "explanation": "...",
    "difficulty": "medium",
    "topic_tag": "..."
  }
]
```

### 7.3 AI Service Code Pattern

```typescript
// services/ai.service.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateQuestionsParams {
  topic: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  questionTypes: string[];
}

export async function generateQuestions(params: GenerateQuestionsParams) {
  const prompt = buildPrompt(params);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.content[0].type === 'text' 
    ? response.content[0].text : '';
  
  // Strip markdown fences if present
  const jsonStr = rawText.replace(/```json|```/g, '').trim();
  
  const questions = JSON.parse(jsonStr);
  return validateQuestions(questions); // Zod schema validation
}
```

---

## 8. Real-Time System (Live Quiz Engine)

### 8.1 Session State in Redis

```
Key: quiz:session:{sessionId}:state
Value (JSON):
{
  "status": "live",
  "currentQuestionIndex": 2,
  "questionStartedAt": 1719000000000,
  "timeLimitSecs": 30,
  "totalQuestions": 10
}
TTL: 24 hours
```

```
Key: quiz:session:{sessionId}:scores
Type: Redis Sorted Set (ZADD)
Members: {participantId}
Scores: cumulative_score
(Used for O(log N) leaderboard updates)
```

```
Key: quiz:session:{sessionId}:answers:{questionId}
Type: Redis Hash
Fields: {participantId} → "{answer}:{timeTaken}:{isCorrect}"
(Tracks who has answered, prevents double submit)
```

### 8.2 Live Quiz Flow

```
HOST clicks "Start Quiz"
        │
        ▼
Server sets session status = 'live' (DB + Redis)
        │
        ▼
Server emits quiz_started to all room sockets
        │
        ▼
Server emits question_started (Q1) to all
+ starts per-question timer in Redis
        │
        ▼
Students submit answers → Server validates,
stores in Redis, updates sorted set score
        │
        ▼
Timer expires OR all answered
        │
        ▼
Server emits question_ended + leaderboard_update
        │
        ▼
Repeat for next question
        │
        ▼
After last question → Server emits quiz_ended
Sets session status = 'ended' in DB
Persists all answers + scores from Redis → PostgreSQL
Calculates final ranks → stores in participants table
```

### 8.3 Waiting Room Flow

```
User POSTs /api/v1/sessions/join
        │
        ├── Validate accessCode + password
        ├── Create participant record (DB)
        ├── Join Socket.IO room: quiz:{sessionId}
        └── Emit waiting_room_update to all in room

If quiz not yet started → receive waiting_room_update broadcasts
When host starts → receive quiz_started event
```

---

## 9. Authentication & Authorization

### 9.1 JWT Strategy

```
Access Token:  15 minutes TTL, signed with RS256
Refresh Token: 7 days TTL, stored in DB (revokable), sent as HttpOnly cookie
```

### 9.2 Middleware Stack

```typescript
// middlewares/auth.middleware.ts

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isQuizCreator = async (req, res, next) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz || quiz.creatorId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.quiz = quiz;
  next();
};
```

### 9.3 Socket.IO Auth

```typescript
// socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});
```

---

## 10. Frontend Architecture

### 10.1 Route Structure

```
/                        → Home (Browse live public quizzes)
/auth/login              → Login page
/auth/register           → Register page
/dashboard               → User dashboard (my quizzes + history)
/quiz/create             → Create quiz (manual or AI)
/quiz/:id/edit           → Edit quiz
/quiz/:id/lobby          → Waiting room screen
/quiz/:id/live           → Live quiz screen
/quiz/:id/results        → Post-quiz results & leaderboard
/quiz/:id/analytics      → Creator analytics view
/join                    → Join by access code + password
/profile                 → User profile & stats
```

### 10.2 State Management (Zustand)

```typescript
// stores/quizStore.ts

interface LiveQuizState {
  sessionId: string | null;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  leaderboard: LeaderboardEntry[];
  status: 'idle' | 'waiting' | 'live' | 'ended';
  
  // Actions
  setCurrentQuestion: (q: Question) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  incrementScore: (points: number) => void;
  setStatus: (s: string) => void;
}
```

### 10.3 Socket.IO Client Hooks

```typescript
// hooks/useLiveQuiz.ts

export function useLiveQuiz(sessionId: string) {
  const { setCurrentQuestion, updateLeaderboard, setStatus } = useQuizStore();
  
  useEffect(() => {
    socket.emit('join_room', { sessionId, token: getAccessToken() });
    
    socket.on('question_started', ({ question, timeLimit }) => {
      setCurrentQuestion(question);
      startTimer(timeLimit);
    });
    
    socket.on('leaderboard_update', ({ leaderboard }) => {
      updateLeaderboard(leaderboard);
    });
    
    socket.on('quiz_ended', ({ finalLeaderboard }) => {
      updateLeaderboard(finalLeaderboard);
      setStatus('ended');
      navigate(`/quiz/${sessionId}/results`);
    });
    
    return () => socket.off();
  }, [sessionId]);
  
  const submitAnswer = (answer: string, timeTaken: number) => {
    socket.emit('submit_answer', { sessionId, answer, timeTaken });
  };
  
  return { submitAnswer };
}
```

### 10.4 Key UI Screens

**Waiting Room Screen:**
- Animated countdown to quiz start
- Real-time participant list (updates via WebSocket)
- Quiz info panel (title, subject, question count)
- Host sees "Start Quiz" button

**Live Quiz Screen:**
- Question display with progress bar (current / total)
- Per-question countdown timer (animated ring)
- Answer options (MCQ: 4 buttons; True/False: 2 buttons)
- After submit: show correct/wrong state + brief explanation
- Mini-leaderboard sidebar (top 5 participants)

**Results Screen:**
- Personal score card (score, rank, accuracy %, time)
- Full leaderboard table (rank, name, score, time)
- Question-by-question breakdown (correct/wrong per user)

**Creator Analytics Screen:**
- Bar chart: % correct per question
- Heatmap table: question vs difficulty (color-coded)
- Topic difficulty chart: which subtopic had lowest accuracy
- Individual participant drill-down table
- AI-generated summary: "Most students struggled with [topic]. Consider reviewing [concept]."

## 11. Frontend-Backend Integration

### API Endpoints Mapped to Screens

| Screen | Action | Endpoint | Method | Payload | Response |
|--------|--------|----------|--------|---------|----------|
| Screen 12 | Login | `/auth/login` | POST | email, password | accessToken, refreshToken, user |
| Screen 13 | Sign Up | `/auth/register` | POST | email, username, password, name | accessToken, refreshToken, user |
| Screen 2 | Load Dashboard | `/api/v1/dashboard` | GET | - | stats, charts, recentQuizzes, goals |
| Screen 4 | List Live Quizzes | `/api/v1/sessions/live` | GET | - | sessions[] |
| Screen 4 | Join Private | `/api/v1/sessions/join` | POST | accessCode, password | sessionId, participantId |
| Screen 5-7 | Create Quiz | `/api/v1/quizzes` | POST | title, description, questions | quizId, accessCode (if private) |
| Screen 6 | Generate Questions | `/api/v1/ai/generate-questions` | POST | topic, difficulty, count | questions[] |
| Screen 8 | Live Quiz Events | `/quiz` (WebSocket) | WS | quiz events | question_started, answer_confirmed, leaderboard |
| Screen 3 | Quiz Analytics | `/api/v1/sessions/:id/analytics` | GET | - | metrics, charts, leaderboard, insights |
| Screen 3b | Quiz Results | `/api/v1/sessions/:id/results` | GET | - | personalScore, leaderboard, breakdown |
| Screen 10 | Get Profile | `/api/v1/users/me` | GET | - | user profile, stats, subscription |
| Screen 10 | Update Profile | `/api/v1/users/me` | PUT | name, email, avatar | updated user |

### WebSocket Events (Real-Time Updates)

| Event | Direction | Screen | Payload |
|-------|-----------|--------|---------|
| `join_room` | Client → Server | Screen 8b | { sessionId, participantId, token } |
| `participant_joined` | Server → Client | Screen 8b | { participantId, username, totalCount } |
| `quiz_started` | Server → Client | Screen 8 | { firstQuestion, timeLimit } |
| `question_started` | Server → Client | Screen 8 | { question, index, total, timeLimit } |
| `submit_answer` | Client → Server | Screen 8 | { sessionId, questionId, answer, time } |
| `answer_confirmed` | Server → Client | Screen 8 | { isCorrect, points, currentScore } |
| `leaderboard_update` | Server → Client | Screen 8 | { leaderboard: [{ rank, name, score }] } |
| `question_ended` | Server → Client | Screen 3b | { correctAnswer, explanation, leaderboard } |
| `quiz_ended` | Server → Client | Screen 3b | { finalLeaderboard, sessionId } |

### Data Models Shared Between Frontend & Backend

```typescript
// User
interface User {
  id: UUID;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tier: 'free' | 'pro' | 'premium';
  createdAt: Date;
}

// Quiz
interface Quiz {
  id: UUID;
  creatorId: UUID;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  quizType: 'public' | 'private';
  accessCode: string; // 6-char code
  status: 'draft' | 'scheduled' | 'waiting' | 'live' | 'ended';
  totalQuestions: number;
  timeLimitSecs: number;
  allowLateJoin: boolean;
  isAiGenerated: boolean;
  createdAt: Date;
}

// Question
interface Question {
  id: UUID;
  quizId: UUID;
  questionText: string;
  questionType: 'mcq' | 'true_false' | 'short_answer';
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  topicTag: string;
  orderIndex: number;
}

// QuizSession
interface QuizSession {
  id: UUID;
  quizId: UUID;
  hostId: UUID;
  status: 'waiting' | 'live' | 'ended';
  participants: Participant[];
  currentQuestionIndex: number;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

// Participant
interface Participant {
  id: UUID;
  sessionId: UUID;
  userId: UUID;
  username: string;
  score: number;
  rank: number;
  timeTakenSecs: number;
  attemptType: 'live' | 'later';
  completedAt?: Date;
}

// Answer
interface Answer {
  id: UUID;
  participantId: UUID;
  questionId: UUID;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeTakenSecs: number;
  answeredAt: Date;
}
```

### Frontend State Management (Zustand Stores)

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User) => void;
  setTokens: (token: string, refresh: string) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

// quizStore.ts - Live Quiz State
interface LiveQuizState {
  sessionId: string | null;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  rank: number;
  leaderboard: LeaderboardEntry[];
  participants: Participant[];
  status: 'waiting' | 'live' | 'ended';
  
  setCurrentQuestion: (q: Question) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  updateScore: (points: number) => void;
  setStatus: (s: string) => void;
  reset: () => void;
}

// analyticsStore.ts
interface AnalyticsState {
  sessionId: string | null;
  metrics: CoreMetrics;
  charts: {
    participation: DataPoint[];
    distribution: DataPoint[];
  };
  leaderboard: LeaderboardEntry[];
  aiInsights: string;
  
  setAnalytics: (data: AnalyticsData) => void;
}
```

### API Client Setup (Axios with Interceptors)

```typescript
// api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - attach token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshed = await useAuthStore().refreshToken();
      if (refreshed) {
        return apiClient(error.config); // Retry
      } else {
        useAuthStore().logout(); // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Socket.IO Client Setup

```typescript
// hooks/useSocket.ts
import io, { Socket } from 'socket.io-client';
import { useEffect } from 'react';

export function useSocket() {
  const { accessToken } = useAuthStore();
  
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    
    return () => socket.disconnect();
  }, [accessToken]);
}
```

---

## 12. Quiz Types & Access Control

### 11.1 Public Quiz
- `quiz_type = 'public'`, no `access_code`, no `password_hash`
- Listed on the home feed
- Any logged-in user can join
- Joinable from `/join` without a code or from the live feed

### 11.2 Private Quiz
- `quiz_type = 'private'`, `access_code` = system-generated 6-char code (e.g. `QZ8K3M`)
- `password_hash` = bcrypt hash of creator-defined password
- Creator shares the code + password with intended participants
- Join flow: `/join` → enter code → enter password → enter waiting room
- Not listed on public feed

### 11.3 Access Code Generation

```typescript
// utils/generateAccessCode.ts
import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

export async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;
  while (exists) {
    code = nanoid();
    exists = !!(await prisma.quiz.findUnique({ where: { accessCode: code } }));
  }
  return code;
}
```

---

## 13. Analytics & Leaderboard Engine

### 12.1 Per-Question Analytics (Computed on Session End)

```sql
-- Accuracy per question
SELECT 
  q.id,
  q.question_text,
  q.topic_tag,
  q.difficulty,
  COUNT(a.id) as total_attempts,
  SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(AVG(a.time_taken_secs), 2) as avg_time_secs,
  ROUND(100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / COUNT(a.id), 1) as accuracy_pct
FROM questions q
LEFT JOIN answers a ON a.question_id = q.id
LEFT JOIN participants p ON p.id = a.participant_id
WHERE p.session_id = $1
GROUP BY q.id
ORDER BY q.order_index;
```

### 12.2 Leaderboard (Real-Time via Redis Sorted Set)

```typescript
// Get top N during live quiz (O(log N))
const leaderboard = await redis.zrevrange(
  `quiz:session:${sessionId}:scores`, 
  0, 9, 
  'WITHSCORES'
);

// On session end, persist to PostgreSQL
const entries = await redis.zrevrangeWithScores(
  `quiz:session:${sessionId}:scores`, 0, -1
);
await prisma.$transaction(
  entries.map((e, idx) =>
    prisma.participant.update({
      where: { id: e.value },
      data: { score: e.score, rank: idx + 1 }
    })
  )
);
```

### 12.3 Topic Difficulty Chart Data

```typescript
// Returns data for frontend chart:
// [{ topic, accuracy, avgTime, questionCount }]

async function getTopicAnalytics(sessionId: string) {
  return prisma.$queryRaw`
    SELECT 
      q.topic_tag,
      COUNT(DISTINCT q.id) as question_count,
      ROUND(AVG(CASE WHEN a.is_correct THEN 100 ELSE 0 END), 1) as accuracy_pct,
      ROUND(AVG(a.time_taken_secs), 1) as avg_time_secs
    FROM questions q
    JOIN answers a ON a.question_id = q.id
    JOIN participants p ON p.id = a.participant_id
    WHERE p.session_id = ${sessionId}
    GROUP BY q.topic_tag
    ORDER BY accuracy_pct ASC;
  `;
}
```

---

## 14. Folder Structure

```
quiz-app/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx (Screen 1)
│   │   │   ├── PricingPage.tsx (Screen 9)
│   │   │   ├── LoginPage.tsx (Screen 12)
│   │   │   ├── SignUpPage.tsx (Screen 13)
│   │   │   ├── Dashboard.tsx (Screen 2)
│   │   │   ├── QuizAnalytics.tsx (Screen 3)
│   │   │   ├── DiscoverQuizzes.tsx (Screen 4)
│   │   │   ├── CreateQuizWizard.tsx (Screens 5-7)
│   │   │   ├── LiveQuiz.tsx (Screen 8)
│   │   │   ├── WaitingRoom.tsx (Screen 8b)
│   │   │   ├── QuizResults.tsx (Screen 3b)
│   │   │   ├── UserProfile.tsx (Screen 10)
│   │   │   └── UserSettings.tsx (Screen 11)
│   │   │
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Progress.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── ... (20+ shadcn components)
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx (Sticky nav)
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── SidebarNav.tsx
│   │   │   │
│   │   │   ├── dashboard/ (Screen 2)
│   │   │   │   ├── WelcomeSection.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── QuizActivityChart.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   ├── RecentQuizzesTable.tsx
│   │   │   │   ├── GoalsProgress.tsx
│   │   │   │   └── AIInsightsCard.tsx
│   │   │   │
│   │   │   ├── analytics/ (Screen 3)
│   │   │   │   ├── MetricsCards.tsx
│   │   │   │   ├── ParticipationChart.tsx
│   │   │   │   ├── ScoreDistribution.tsx
│   │   │   │   ├── LeaderboardTable.tsx
│   │   │   │   ├── HardestQuestionsCard.tsx
│   │   │   │   ├── AIInsightsSummary.tsx
│   │   │   │   ├── AccuracyChart.tsx
│   │   │   │   └── TopicHeatmap.tsx
│   │   │   │
│   │   │   ├── quiz/
│   │   │   │   ├── QuestionCard.tsx (Screen 8)
│   │   │   │   ├── Timer.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   ├── WaitingRoomParticipants.tsx (Screen 8b)
│   │   │   │   ├── AnswerReveal.tsx
│   │   │   │   └── QuizHeader.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignUpForm.tsx
│   │   │   │   ├── BrandedPanel.tsx
│   │   │   │   └── SocialAuthButtons.tsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── NotificationToast.tsx
│   │   │       └── Modal.tsx
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts (Zustand - auth)
│   │   │   ├── quizStore.ts (Live quiz state)
│   │   │   ├── uiStore.ts (Theme, sidebar)
│   │   │   └── analyticsStore.ts (Cached data)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLiveQuiz.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useTimer.ts
│   │   │   ├── useQuery.ts
│   │   │   └── usePagination.ts
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts (Axios instance)
│   │   │   ├── auth.api.ts
│   │   │   ├── quiz.api.ts
│   │   │   ├── analytics.api.ts
│   │   │   ├── ai.api.ts
│   │   │   └── session.api.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts (Zod schemas)
│   │   │   ├── localStorage.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.css
│   │   │
│   │   ├── App.tsx (Routes config)
│   │   └── main.tsx (Entry point)
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── assets/
│   │
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts (Prisma)
│   │   │   ├── redis.ts
│   │   │   ├── env.ts
│   │   │   └── socket.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── quiz/
│   │   │   │   ├── quiz.controller.ts
│   │   │   │   ├── quiz.service.ts
│   │   │   │   ├── question.controller.ts
│   │   │   │   ├── question.service.ts
│   │   │   │   ├── quiz.routes.ts
│   │   │   │   └── question.routes.ts
│   │   │   │
│   │   │   ├── session/
│   │   │   │   ├── session.controller.ts
│   │   │   │   ├── session.service.ts
│   │   │   │   └── session.routes.ts
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── ai.prompt.ts
│   │   │   │   └── ai.routes.ts
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── analytics.routes.ts
│   │   │   │
│   │   │   └── user/
│   │   │       ├── user.controller.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.routes.ts
│   │   │
│   │   ├── socket/
│   │   │   ├── socket.server.ts
│   │   │   ├── handlers/
│   │   │   │   ├── quiz.handler.ts
│   │   │   │   └── participant.handler.ts
│   │   │   ├── socket.auth.ts
│   │   │   └── socket.events.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── generateAccessCode.ts
│   │   │   ├── hashPassword.ts
│   │   │   ├── jwtTokens.ts
│   │   │   ├── logger.ts
│   │   │   └── validators.ts (Zod)
│   │   │
│   │   ├── jobs/
│   │   │   └── ai.worker.ts (BullMQ)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts (Shared types)
│   │   │
│   │   └── app.ts (Express setup)
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── nginx.conf
├── README.md
└── .github/
    └── workflows/
        └── ci-cd.yml
```

---

## 15. Environment Variables

### Backend `.env`
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quizapp

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-opus-4-6
AI_MAX_TOKENS=4096

# App
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

---

## 16. Deployment Architecture

```
Internet
    │
    ▼
 [Cloudflare CDN / DDoS Protection]
    │
    ▼
 [Nginx Reverse Proxy]
    ├── /          → React Static (served from Nginx)
    └── /api       → Backend (Node.js:4000)
    └── /socket.io → Backend (Socket.IO)
    │
    ▼
 [Node.js Backend] ──→ [PostgreSQL]
         │          ──→ [Redis]
         │          ──→ [Anthropic API]
         │
    [BullMQ Workers] (AI generation jobs)
```

### Docker Compose (Development)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quizapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## 17. Implementation Roadmap

### Phase 1 — Foundation (Week 1–2)
- [ ] Project setup (monorepo, Docker, CI/CD pipeline)
- [ ] Database schema + Prisma migrations
- [ ] Auth module (register, login, JWT, refresh token)
- [ ] User profile API

### Phase 2 — Quiz Core (Week 3–4)
- [ ] Quiz CRUD (create, read, update, delete)
- [ ] Question CRUD (manual creation)
- [ ] Access code generation for private quizzes
- [ ] Quiz join API (validate code + password)

### Phase 3 — AI Integration (Week 5)
- [ ] AI service with Anthropic API
- [ ] Question generation endpoint
- [ ] BullMQ job queue for async generation
- [ ] Frontend: AI quiz creation form

### Phase 4 — Real-Time Engine (Week 6–7)
- [ ] Socket.IO server setup + auth middleware
- [ ] Waiting room (join room, participant broadcast)
- [ ] Live quiz flow (start, question cycle, timer, answer submission)
- [ ] Redis session state management
- [ ] Leaderboard (sorted set + real-time updates)

### Phase 5 — Frontend Screens (Week 8–9)
- [ ] Waiting room screen
- [ ] Live quiz screen (timer, answer UI, mini-leaderboard)
- [ ] Post-quiz results screen
- [ ] Quiz creation wizard (manual + AI)
- [ ] Public quiz browse / join feed

### Phase 6 — Analytics (Week 10)
- [ ] Per-question accuracy analytics
- [ ] Topic difficulty heatmap
- [ ] Creator analytics dashboard (charts via Recharts)
- [ ] User performance history dashboard

### Phase 7 — Polish & Production (Week 11–12)
- [ ] Rate limiting (express-rate-limit + Redis)
- [ ] Input sanitization + security audit
- [ ] Error handling + logging (Winston)
- [ ] Load testing (Socket.IO with 500 concurrent users)
- [ ] Deployment (Docker + Nginx + Postgres + Redis on AWS/Railway)
- [ ] README + API documentation

---

## Key Design Decisions Summary

| Decision | Choice | Reason |
|---|---|---|
| Single user role | Yes (no teacher/student split) | Simpler auth, every user can create & join |
| Real-time transport | Socket.IO | Rooms, namespaces, auto-reconnect built-in |
| Live state store | Redis Sorted Set | O(log N) leaderboard updates at scale |
| AI provider | Anthropic Claude | Structured JSON output, strong instruction following |
| ORM | Prisma | Type-safe queries, migrations, great DX |
| Quiz access | Code + Password | Short memorable code, extra security via password |
| Token strategy | JWT (short-lived) + Refresh (HttpOnly cookie) | Stateless + revocable |
| Later attempts | Supported (host opt-in) | Async REST submit, no WebSocket needed |

---

*End of Full-Stack System Architecture Document — v2.0*

## Summary: Frontend-Backend Integration

This document provides a complete blueprint for **QuizMind AI**, a production-ready, full-stack AI-powered quiz platform:

### ✅ Frontend (React)
- **13 distinct screens** with professional UI/UX
- Tailwind CSS + shadcn/ui component library
- Real-time updates via Socket.IO
- State management with Zustand
- Form validation with React Hook Form + Zod
- Data visualization with Recharts
- Authentication with JWT tokens
- File upload with avatar support

### ✅ Backend (Node.js)
- RESTful API with Express.js
- WebSocket real-time engine (Socket.IO)
- PostgreSQL for persistent data
- Redis for caching & live state
- AI integration (Anthropic Claude API)
- JWT-based authentication
- BullMQ for async jobs
- Comprehensive error handling & logging

### ✅ Features
- User authentication & authorization
- Quiz creation (manual + AI-generated)
- Live quiz hosting with real-time updates
- Leaderboard system (sorted set in Redis)
- Comprehensive analytics & insights
- AI-powered explanations
- Subscription tiers (Free, Pro, Premium)
- Response tracking & performance analytics

### ✅ Architecture Principles
- **Separation of Concerns** — Modular service layer
- **Scalability** — Redis pub/sub for horizontal scaling
- **Real-Time** — WebSocket for instant updates
- **Type Safety** — TypeScript throughout
- **Security** — JWT + bcrypt + input validation
- **Performance** — Caching, indexed queries, optimized state

### 🚀 Ready for Production
- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Error handling & logging (Winston)
- Load testing strategies
- Deployment guides (AWS, Railway, Render)
- Database migrations (Prisma)

This is a **complete, enterprise-ready system** ready for implementation and deployment.
