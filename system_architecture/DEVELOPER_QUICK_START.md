# Developer Quick Start Guide

A condensed guide for developers to get started with the QuizMind AI full-stack project.

---

## 📋 Project Structure at a Glance

```
QuizMind AI
├── Frontend (React 18 + TypeScript)
│   ├── 13 Screens + Components
│   ├── Tailwind CSS + shadcn/ui
│   ├── Zustand (state) + Socket.IO (real-time)
│   └── Recharts (data viz) + React Hook Form (forms)
│
├── Backend (Node.js + Express)
│   ├── RESTful API (/api/v1)
│   ├── WebSocket Server (Socket.IO)
│   ├── PostgreSQL (data)
│   ├── Redis (cache/state)
│   ├── **⭐ Pluggable AI Service (Gemini, Claude, OpenAI, Ollama)**
│   └── Job Queue (BullMQ for async tasks)
│
└── Infrastructure
    ├── Docker + Docker Compose
    ├── Nginx (reverse proxy)
    └── GitHub Actions (CI/CD)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/quizmind-ai.git
cd quizmind-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env)**
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/quizapp
REDIS_URL=redis://localhost:6379
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
FRONTEND_URL=http://localhost:5173

# ⭐ AI Provider Configuration (Choose one)
AI_PROVIDER=gemini              # Options: gemini, anthropic, openai, ollama
AI_API_KEY=your-api-key-here

# Gemini-specific (if using Gemini)
GEMINI_MODEL=gemini-1.5-pro

# Anthropic-specific (if using Claude)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

### 3. Database Setup

```bash
cd backend

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Terminal 3: Redis (if not using Docker)**
```bash
redis-server
```

---

## 🏗️ Frontend Development

### Adding a New Screen

1. **Create page file** in `src/pages/`
   ```typescript
   // src/pages/NewScreen.tsx
   export default function NewScreen() {
     return <div>New Screen</div>;
   }
   ```

2. **Add route** in `App.tsx`
   ```typescript
   { path: '/new-screen', element: <NewScreen /> }
   ```

3. **Create components** in `src/components/`
   ```typescript
   // src/components/MyComponent.tsx
   import { Button, Card } from '@/components/ui';
   
   export function MyComponent() {
     return (
       <Card>
         <Button>Click me</Button>
       </Card>
     );
   }
   ```

### Using API

```typescript
// src/api/myapi.ts
import apiClient from './client';

export async function getMyData() {
  const response = await apiClient.get('/api/v1/endpoint');
  return response.data;
}
```

### Using Store

```typescript
// In component
import { useMyStore } from '@/stores/myStore';

function MyComponent() {
  const { data, setData } = useMyStore();
  return <div>{data}</div>;
}
```

### Using Socket.IO

```typescript
import { useSocket } from '@/hooks/useSocket';

function LiveComponent() {
  const socket = useSocket();
  
  useEffect(() => {
    socket.on('event_name', (data) => {
      console.log(data);
    });
  }, [socket]);
}
```

---

## 🔧 Backend Development

### Adding a New API Endpoint

1. **Create controller** in `src/modules/mymodule/`
   ```typescript
   // src/modules/mymodule/mymodule.controller.ts
   export async function getMyData(req, res) {
     try {
       const data = await MyModuleService.getData();
       res.json({ data });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }
   ```

2. **Create service** in same folder
   ```typescript
   // src/modules/mymodule/mymodule.service.ts
   export class MyModuleService {
     static async getData() {
       return await prisma.table.findMany();
     }
   }
   ```

3. **Create routes** in same folder
   ```typescript
   // src/modules/mymodule/mymodule.routes.ts
   import { Router } from 'express';
   import * as controller from './mymodule.controller';
   
   const router = Router();
   router.get('/', controller.getMyData);
   export default router;
   ```

4. **Register route** in `src/app.ts`
   ```typescript
   app.use('/api/v1/mymodule', myModuleRoutes);
   ```

### WebSocket Handler

```typescript
// src/socket/handlers/myhandler.ts
export function setupMyHandler(io) {
  io.on('connection', (socket) => {
    socket.on('my_event', (data) => {
      // Handle event
      socket.emit('response', { status: 'ok' });
    });
  });
}
```

---

## 🔌 Connecting Frontend to Backend

### 1. API Request
```typescript
// Frontend
const response = await apiClient.post('/api/v1/quizzes', {
  title: 'My Quiz'
});
// → Backend receives at POST /api/v1/quizzes
```

### 2. WebSocket Event
```typescript
// Frontend
socket.emit('submit_answer', { answer: 'a' });

// Backend receives
socket.on('submit_answer', (data) => {
  // Process
  socket.emit('answer_confirmed', { correct: true });
});

// Frontend receives
socket.on('answer_confirmed', (data) => {
  // Update UI
});
```

---

## 📦 Key Patterns

### API Pattern (REST)
```
Client Request
  ↓
Express Route
  ↓
Controller (validation)
  ↓
Service (business logic)
  ↓
Database (Prisma)
  ↓
Response
```

### WebSocket Pattern
```
Socket Connection
  ↓
Authentication
  ↓
Join Room
  ↓
Listen for Events
  ↓
Process & Broadcast
  ↓
Client receives
```

### State Management Pattern
```
User Action (click, input)
  ↓
API Call or WebSocket Event
  ↓
Update Zustand Store
  ↓
React Re-render
  ↓
UI Updates
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm run test
npm run test:integration
```

### API Testing (Thunder Client / Postman)
```
Method: POST
URL: http://localhost:4000/api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 🐛 Debugging

### Frontend
```typescript
// Use React DevTools browser extension
// Use Zustand DevTools for state inspection
// Console.log for quick debugging
console.log('value:', value);
```

### Backend
```bash
# Debug mode
node --inspect-brk ./dist/index.js

# Use VS Code debugger or similar
# Add breakpoints and step through code

# Check logs
tail -f logs/app.log
```

### Database
```bash
# Connect to PostgreSQL
psql -U user -d quizapp

# View Redis
redis-cli
```

---

## 📊 Database Queries

### Common Queries

```typescript
// Get user with quizzes
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { quizzes: true }
});

// Get quiz with questions
const quiz = await prisma.quiz.findUnique({
  where: { id: quizId },
  include: { questions: true }
});

// Get session results
const results = await prisma.participant.findMany({
  where: { sessionId },
  include: { answers: true },
  orderBy: { score: 'desc' }
});
```

---

## 🤖 AI Integration (Pluggable LLM System)

### Overview
QuizMind AI includes a **pluggable AI provider system** that supports multiple LLM backends (Gemini, Claude, OpenAI, Ollama) with **zero code changes** to switch providers.

### Supported Providers
- ✅ **Gemini** (Google) - Default, fully implemented
- ✅ **Claude** (Anthropic) - Fully implemented  
- 🔄 **OpenAI** (Framework ready)
- 🔄 **Ollama** (Framework ready, local)

### Configuration

Select your provider via `.env`:

**Using Gemini (Google):**
```env
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro
```

**Using Claude (Anthropic):**
```env
AI_PROVIDER=anthropic
AI_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Usage in Backend

```typescript
// src/services/quizService.ts
import { getAIProvider } from './ai/config/aiConfig';

export class QuizService {
  private aiProvider = getAIProvider();

  async generateQuizWithAI(topic: string, difficulty: string, count: number) {
    const questions = await this.aiProvider.generateQuestions(
      topic,
      difficulty as any,
      count,
      "multiple_choice"
    );
    
    // Save to database
    return questions;
  }
}
```

### Testing AI Provider

```bash
cd backend

# Test current AI provider
npm run test:ai

# or manually:
npx ts-node -e "require('./src/services/ai/config/aiConfig').testAIProvider()"
```

### Switching Providers (1 Step!)

Just change `.env`:
```env
# Was:
AI_PROVIDER=gemini

# Now:
AI_PROVIDER=anthropic
AI_API_KEY=your-anthropic-key
```

Restart backend - done! ✅ No code changes needed.

### API Endpoint

```typescript
// Frontend
POST /api/v1/quizzes/ai/generate
Body: {
  topic: "React.js",
  difficulty: "medium",
  questionCount: 5,
  questionType: "multiple_choice"
}

Response: {
  questions: [
    {
      content: "What is React?",
      options: [...],
      correctAnswer: "...",
      explanation: "..."
    }
  ]
}
```

### Adding a New AI Provider

1. Create file: `backend/src/services/ai/providers/MyProvider.ts`
2. Implement `AIProvider` interface
3. Update `aiConfig.ts` to handle new provider
4. Update `.env` to use new provider

See **AI_PROVIDER_INTEGRATION_GUIDE.md** for complete details.

---

## 🚢 Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Deploying to AWS / Railway / Render
See `Deployment Architecture` section in main architecture document.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `quiz_system_architecture.md` | Complete system design |
| `ARCHITECTURE_UPDATE_SUMMARY.md` | What's new in v2.1 |
| `FRONTEND_BACKEND_MAPPING.md` | Screen-to-API mappings |
| `AI_PROVIDER_INTEGRATION_GUIDE.md` | **⭐ AI provider system details** |
| `DEVELOPER_QUICK_START.md` | This file |
| `README.md` | General project info |

---

## 🔑 Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Sign up
- `POST /api/v1/auth/login` - Sign in
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Sign out

### Quizzes
- `GET /api/v1/quizzes` - List quizzes
- `POST /api/v1/quizzes` - Create quiz
- `GET /api/v1/quizzes/:id` - Get quiz
- `PUT /api/v1/quizzes/:id` - Update quiz
- `DELETE /api/v1/quizzes/:id` - Delete quiz

### Sessions
- `POST /api/v1/sessions/join` - Join quiz
- `GET /api/v1/sessions/live` - List live sessions
- `GET /api/v1/sessions/:id/results` - Get results
- `GET /api/v1/sessions/:id/analytics` - Get analytics

### AI (⭐ Pluggable LLM System)
- `POST /api/v1/quizzes/ai/generate` - Generate questions via AI
  - Supports: Gemini, Claude, OpenAI, Ollama
  - Configuration: `.env` AI_PROVIDER & AI_API_KEY
  - See: **AI_PROVIDER_INTEGRATION_GUIDE.md**

### User
- `GET /api/v1/users/me` - Get profile
- `PUT /api/v1/users/me` - Update profile

---

## 💡 Common Tasks

### Task: Add a new form field
1. Update Zod schema in `src/utils/validators.ts`
2. Add field to React Hook Form in component
3. Update API request body

### Task: Create a new chart
1. Import Recharts component
2. Pass data to chart
3. Style with Tailwind + CSS variables

### Task: Add real-time feature
1. Emit event from frontend via Socket.IO
2. Listen in backend handler
3. Broadcast back to clients
4. Update Zustand store
5. Re-render React component

### Task: Add database column
1. Update `schema.prisma`
2. Run `npx prisma migrate dev`
3. Update TypeScript types
4. Use in queries

---

## 🆘 Troubleshooting

### "Connection refused" to backend
- Check if backend is running on port 4000
- Check if Redis is running
- Check if PostgreSQL is accessible

### "Socket connection failed"
- Check if Socket.IO is initialized
- Verify auth token is being passed
- Check browser console for errors

### "Database query failed"
- Check Prisma client initialization
- Verify connection string
- Check database migrations are applied

### "Token expired"
- Token interceptor should auto-refresh
- Check refresh token is valid
- Check JWT_PRIVATE_KEY and JWT_PUBLIC_KEY

---

## 📞 Support

- Check documentation files for detailed info
- Review code comments for examples
- Check existing components for patterns
- Read error messages carefully - they're usually helpful!

---

**Happy coding! 🎉**

Last Updated: June 1, 2026
