# Frontend-Backend Integration Map

Quick reference for developers to understand which frontend screens call which backend APIs.

---

## 🔐 Authentication Flow

### Screen 12: Sign In
```
User Input: email + password
         │
         ▼
API Call: POST /api/v1/auth/login
{
  email: "user@example.com",
  password: "password123"
}
         │
         ▼
Response: {
  accessToken: "eyJhbGc...",
  refreshToken: "token...",
  user: { id, email, username, displayName, avatarUrl, tier }
}
         │
         ▼
Store in Zustand (authStore)
Save tokens: localStorage + httpOnly cookie
         │
         ▼
Redirect to /dashboard (Screen 2)
```

### Screen 13: Sign Up
```
User Input: Full Name, Username, Email, Password, Confirm Password, Terms
         │
         ▼
API Call: POST /api/v1/auth/register
{
  displayName: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "password123"
}
         │
         ▼
Response: Same as login (tokens + user)
         │
         ▼
Auto-login → Redirect to /dashboard
```

---

## 📊 Dashboard Screen (Screen 2)

```
User navigates to /dashboard
         │
         ▼
API Call: GET /api/v1/dashboard
Header: Authorization: Bearer {accessToken}
         │
         ▼
Response: {
  streak: 16,
  user: { name, avatar },
  stats: {
    created: 42,
    joined: 128,
    avgScore: 87,
    streak: 16
  },
  activity: [
    { month: "Jan", created: 5, joined: 14 },
    { month: "Feb", created: 7, joined: 18 },
    ...
  ],
  categories: [
    { name: "Science", value: 38 },
    { name: "History", value: 24 },
    ...
  ],
  recentQuizzes: [
    { id, name, type, score, date, icon },
    ...
  ],
  goals: [
    { label: "Create 12", current: 11, total: 12, progress: 92 },
    ...
  ]
}
         │
         ▼
Store in Zustand (analyticsStore)
Render all 8 sections with Recharts
```

---

## 🎯 Discovery & Join (Screen 4)

### Browse Live Quizzes
```
User navigates to /quizzes
         │
         ▼
API Call: GET /api/v1/sessions/live
Query Params: ?limit=10&offset=0&sort=recent
         │
         ▼
Response: {
  sessions: [
    {
      id: "session-uuid",
      quizId: "quiz-uuid",
      title: "Biology Ch5",
      participants: 145,
      status: "live",
      createdAt: "2026-06-01T10:00:00Z"
    },
    ...
  ],
  total: 500,
  page: 1
}
         │
         ▼
Display 3-column grid of quiz cards
Each card has [Join] button
```

### Join Live Quiz (Public)
```
User clicks [Join] on quiz card
         │
         ▼
API Call: POST /api/v1/sessions/join
{
  sessionId: "session-uuid",
  accessCode: null,  // public quiz
  password: null
}
         │
         ▼
Response: {
  sessionId: "session-uuid",
  participantId: "participant-uuid",
  quiz: { title, questions, timeLimit },
  status: "waiting",
  participants: [...]
}
         │
         ▼
Store in quizStore
Navigate to /quiz/:id/lobby (Screen 8b - Waiting Room)
```

### Join Private Quiz (from sidebar form)
```
User enters Quiz Code + Password in Screen 4 sidebar
         │
         ▼
API Call: POST /api/v1/sessions/join
{
  accessCode: "QZ8K3M",
  password: "password123"
}
         │
         ▼
Response: Same as above
         │
         ▼
Navigate to Waiting Room (Screen 8b)
```

---

## ✏️ Create Quiz (Screens 5-7)

### Screen 5: Quiz Details
```
User fills form:
- Quiz Name
- Description
- Category (dropdown)
- Difficulty (Beginner/Intermediate/Advanced)
- Duration (seconds per question)
- Quiz Type (Public/Private)
- Password (if private)
- Allow Late Join (checkbox)

Clicks [Next] button
         │
         ▼
Validation on frontend (React Hook Form + Zod)
Store in Zustand (quizStore)
Navigate to Screen 6
```

### Screen 6: Add Questions

#### Option A: Manual Entry
```
User clicks [+ Add Question]
         │
         ▼
Form appears:
- Question Text (textarea)
- Question Type (MCQ / True-False / Short Answer)
- Options (MCQ: 4 inputs)
- Correct Answer (selector)
- Explanation (textarea)
- Difficulty (Easy/Medium/Hard)
- Points (number)

Clicks [Add] → Add to questions array in Zustand
Repeat for all questions
```

#### Option B: AI Generation
```
User enters:
- Topic: "Cell Biology"
- Count: 10
- Question Types: [MCQ, True/False]

Clicks [Generate with AI]
         │
         ▼
API Call: POST /api/v1/ai/generate-questions
{
  topic: "Cell Biology",
  difficulty: "intermediate",
  count: 10,
  questionTypes: ["mcq", "true_false"]
}
         │
         ▼
Backend calls Anthropic Claude API
Response: {
  questions: [
    {
      question_text: "...",
      options: [{ id, text, isCorrect }],
      correct_answer: "b",
      explanation: "...",
      difficulty: "medium"
    },
    ...
  ]
}
         │
         ▼
Frontend displays preview
User can edit or accept
Store in quizStore.questions
```

### Screen 7: Review & Publish
```
User reviews all questions
Can edit individual questions
Clicks [Publish Quiz]
         │
         ▼
API Call: POST /api/v1/quizzes
{
  title: "Cell Biology Basics",
  description: "Chapter 5 review",
  subject: "Biology",
  difficulty: "intermediate",
  quizType: "public",
  accessCode: null,  // auto-generated for private
  password: null,
  timeLimitSecs: 30,
  allowLateJoin: false,
  questions: [
    {
      question_text: "...",
      questionType: "mcq",
      options: [...],
      correctAnswer: "b",
      explanation: "...",
      difficulty: "medium",
      points: 10,
      topicTag: "cell-structure"
    }
  ]
}
         │
         ▼
Response: {
  quizId: "quiz-uuid",
  accessCode: "QZ8K3M",  // if private
  status: "draft"
}
         │
         ▼
Redirect to /dashboard (Screen 2)
Show success message
```

---

## 🎮 Live Quiz (Screens 8 & 8b)

### Waiting Room (Screen 8b)

```
User joins quiz → Lands on /quiz/:id/lobby
         │
         ▼
Frontend WebSocket: emit 'join_room'
{
  sessionId: "session-uuid",
  participantId: "participant-uuid",
  token: "{accessToken}"
}
         │
         ▼
Backend:
1. Authenticate socket
2. Join socket to room: "quiz:session-uuid"
3. Broadcast to all in room

Server → Client: 'participant_joined'
{
  participantId: "...",
  username: "John",
  totalCount: 42
}
         │
         ▼
Screen 8b updates:
- Participants list
- Countdown timer
- "Waiting for host to start..."
```

### Live Quiz Starts (Screen 8)

```
Host clicks [Start Quiz] on Screen 8b
         │
         ▼
API Call: POST /api/v1/quizzes/:id/start
{
  sessionId: "session-uuid"
}
         │
         ▼
Backend:
1. Set session status = "live"
2. Get first question
3. Broadcast to all in room

Server → All Clients: 'quiz_started'
{
  firstQuestion: { id, text, options, timeLimit },
  questionIndex: 0,
  totalQuestions: 20
}
         │
         ▼
Redirect all to Screen 8 (Live Quiz)
Display first question
Start 30-second timer
```

### Submit Answer (Screen 8)

```
User selects answer on Screen 8
Clicks [Next] or timer expires
         │
         ▼
Frontend WebSocket: emit 'submit_answer'
{
  sessionId: "session-uuid",
  questionId: "question-uuid",
  submittedAnswer: "b",
  timeTaken: 12  // seconds
}
         │
         ▼
Backend:
1. Validate answer
2. Award points
3. Update Redis sorted set (leaderboard)
4. Check if all answered or timer expired

Emit to Client: 'answer_confirmed'
{
  isCorrect: true,
  pointsEarned: 10,
  currentScore: 95
}
         │
         ▼
Show brief feedback (1-2 seconds)
Then broadcast to all:

Server → All Clients: 'leaderboard_update'
{
  leaderboard: [
    { rank: 1, username: "Alice", score: 100, delta: "+5" },
    { rank: 2, username: "Bob", score: 95, delta: "+0" },
    ...
  ]
}
         │
         ▼
Screen 8: Update mini-leaderboard on sidebar
```

### Quiz Ends (Screen 3b)

```
Last question submitted OR timer runs out
         │
         ▼
Host clicks [End Quiz] OR auto-end
         │
         ▼
Backend:
1. Set session status = "ended"
2. Persist all answers to PostgreSQL
3. Calculate final ranks
4. Generate analytics

Broadcast to all: 'quiz_ended'
{
  finalLeaderboard: [
    { rank: 1, username, score, time, medal: "🏆" },
    ...
  ],
  sessionId: "session-uuid"
}
         │
         ▼
Auto-redirect to /quiz/:id/results (Screen 3b)
Display results with leaderboard
```

---

## 📈 Analytics (Screen 3)

### Creator Viewing Quiz Analytics
```
Quiz creator navigates to /quiz/:id/analytics
         │
         ▼
API Call: GET /api/v1/sessions/:id/analytics
Header: Authorization: Bearer {accessToken}
Query: ?creatorOnly=true
         │
         ▼
Response: {
  metrics: [
    {
      totalStudents: 145,
      avgScore: 72.5,
      completionRate: 89,
      avgTimeSecs: 1110
    }
  ],
  charts: {
    participation: [
      { time: "12:00", participants: 12 },
      { time: "12:05", participants: 28 },
      ...
    ],
    distribution: [
      { range: "0-10%", count: 2 },
      { range: "10-20%", count: 5 },
      ...
    ]
  },
  leaderboard: [
    { rank: 1, name: "Sarah", score: 98, time: 750, medal: "🏆" },
    ...
  ],
  questions: [
    {
      id: "q1",
      text: "...",
      accuracy: 92,
      avgTime: 45,
      difficulty: "medium"
    },
    ...
  ],
  aiInsights: "Class performed above average. Strong on MCQ, needs review on essays."
}
         │
         ▼
Store in analyticsStore
Render Screen 3 with all charts & data
```

---

## 👤 Profile (Screen 10)

### Load Profile
```
User navigates to /profile
         │
         ▼
API Call: GET /api/v1/users/me
         │
         ▼
Response: {
  user: {
    id, email, username, displayName, avatarUrl,
    phone, location, joinedAt
  },
  stats: {
    quizzesCreated: 24,
    totalAttempts: 1280,
    avgScore: 86,
    studentsReached: 312
  },
  subscription: {
    tier: "pro",
    price: 250,
    renewsAt: "2026-07-01",
    quizzesUsed: 18,
    quizzesLimit: 30
  }
}
         │
         ▼
Store in authStore
Display Screen 10 (Profile)
```

### Update Avatar
```
User clicks camera icon on avatar
File input opens → Select image
         │
         ▼
Frontend: Create FormData with image
API Call: POST /api/v1/users/me/avatar
Header: multipart/form-data
         │
         ▼
Backend: Upload to S3 / File storage
Return new avatarUrl
         │
         ▼
Update in authStore
Display new avatar immediately
```

### Edit Profile
```
User clicks [Edit] button
Fields become editable:
- Full Name
- Username
- Email
- Phone
- Bio

User clicks [Save]
         │
         ▼
API Call: PUT /api/v1/users/me
{
  displayName: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  phone: "+1234567890",
  bio: "..."
}
         │
         ▼
Response: { user: { updated fields } }
         │
         ▼
Update authStore
Show success message
```

---

## 🔄 Data Sync Between Stores

```
Frontend Store Flow:
         
1. authStore (Zustand)
   - Holds: user, accessToken, refreshToken, tier
   - Persisted in: localStorage
   - Updates from: /auth/* endpoints

2. quizStore (Zustand)
   - Holds: currentQuestion, score, leaderboard, status
   - Real-time: via Socket.IO
   - Updates from: WebSocket events

3. analyticsStore (Zustand)
   - Holds: sessionId, metrics, charts, leaderboard
   - Cached from: /analytics endpoint
   - Updates: Manual refetch

Middleware:
- API Interceptor: Attach auth token to all requests
- Socket Auth: Pass token in WebSocket handshake
- Token Refresh: Auto-refresh on 401
```

---

## 📡 Real-Time Events (WebSocket)

```
Namespace: /quiz

Client → Server:
- join_room { sessionId, participantId, token }
- submit_answer { sessionId, questionId, answer, time }
- next_question { sessionId }
- start_quiz { sessionId }

Server → Client:
- participant_joined { participantId, username, count }
- quiz_started { firstQuestion, timeLimit }
- question_started { question, index, total, timeLimit }
- answer_confirmed { isCorrect, points, score }
- question_ended { correctAnswer, explanation, leaderboard }
- leaderboard_update { leaderboard: [...] }
- quiz_ended { finalLeaderboard, sessionId }
- error { message }
```

---

## ✅ Error Handling

```
API Response Error (401):
- Token expired
- Action: Auto-refresh token
- If refresh fails: Redirect to /auth/login

API Response Error (403):
- User not authorized
- Action: Show error message
- Redirect to previous page

API Response Error (400):
- Invalid input
- Action: Show validation message
- Highlight form fields

WebSocket Disconnect:
- Connection lost
- Action: Show offline banner
- Auto-reconnect with exponential backoff
- If persistent: Redirect to home
```

---

## 🎯 Quick Endpoint Summary

| Method | Endpoint | Screen | Purpose |
|--------|----------|--------|---------|
| POST | /auth/login | 12 | Login |
| POST | /auth/register | 13 | Sign up |
| GET | /api/v1/dashboard | 2 | Load dashboard |
| GET | /api/v1/sessions/live | 4 | List live quizzes |
| POST | /api/v1/sessions/join | 4, 8b | Join quiz |
| GET | /api/v1/quizzes/:id | 5-7 | Load quiz |
| POST | /api/v1/quizzes | 7 | Create quiz |
| POST | /api/v1/ai/generate-questions | 6 | AI generate |
| GET | /api/v1/sessions/:id/analytics | 3 | Analytics |
| GET | /api/v1/sessions/:id/results | 3b | Quiz results |
| GET | /api/v1/users/me | 10 | Load profile |
| PUT | /api/v1/users/me | 10 | Update profile |

---

**This mapping is your guide to understanding how the entire frontend talks to the backend! 🚀**
