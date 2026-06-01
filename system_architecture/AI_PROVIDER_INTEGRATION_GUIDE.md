# 🤖 AI Provider Integration Guide - Pluggable LLM Module

## Overview

This guide explains how to implement the **pluggable AI provider system** that allows you to easily swap between different LLM providers (Gemini, Claude, OpenAI, etc.) without changing your application code.

---

## 🏗️ Architecture

```
User Request
    ↓
Quiz Service (quizService.ts)
    ↓
getAIProvider() [from config/aiConfig.ts]
    ↓
┌─────────────────────────────────────────────┐
│  Abstract Interface: AIProvider              │
├─────────────────────────────────────────────┤
│  - generateQuestions()                       │
│  - generateHint()                            │
│  - validateAnswer()                          │
└─────────────────────────────────────────────┘
    ↓
    ├─→ GeminiProvider (Google Gemini)
    ├─→ AnthropicProvider (Claude)
    ├─→ OpenAIProvider (GPT-4)
    └─→ OllamaProvider (Local)
    ↓
HTTP Request to LLM API
    ↓
Response → Parse → Return to Service
```

---

## 📂 File Structure

```
backend/src/services/ai/
├── AIProvider.ts                    # Abstract interface (DON'T MODIFY)
├── config/
│   └── aiConfig.ts                  # Provider selector (MODIFY .env)
├── providers/
│   ├── GeminiProvider.ts            # Google Gemini
│   ├── AnthropicProvider.ts         # Claude
│   ├── OpenAIProvider.ts            # OpenAI GPT
│   └── OllamaProvider.ts            # Local Ollama
└── index.ts                         # Export point
```

---

## 🔧 Implementation

### Step 1: Create Abstract Interface (AIProvider.ts)

```typescript
// backend/src/services/ai/AIProvider.ts

export interface GeneratedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIProvider {
  /**
   * Generate multiple questions on a topic
   * @param topic - What to ask about
   * @param difficulty - easy, medium, or hard
   * @param count - Number of questions
   * @param questionType - Question format
   */
  generateQuestions(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number,
    questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  ): Promise<GeneratedQuestion[]>;

  /**
   * Generate a hint for a question
   * @param question - The question text
   */
  generateHint(question: string): Promise<string>;

  /**
   * Validate if an answer is correct
   * @param question - The question text
   * @param answer - The given answer
   */
  validateAnswer(question: string, answer: string): Promise<boolean>;
}
```

---

### Step 2: Implement Gemini Provider (GeminiProvider.ts)

```typescript
// backend/src/services/ai/providers/GeminiProvider.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, GeneratedQuestion } from "../AIProvider";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-pro") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateQuestions(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number,
    questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildPrompt(topic, difficulty, count, questionType);

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from Gemini response");
      }

      const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
      
      // Validate structure
      return questions.map(q => ({
        content: q.content || "Invalid question",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        difficulty: q.difficulty || 'medium'
      }));
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  async generateHint(question: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(
        `Provide a helpful hint for this question (without revealing the answer): "${question}"\n\nRespond with only the hint, no extra text.`
      );
      return result.response.text().trim();
    } catch (error) {
      console.error("Gemini Hint Generation Error:", error);
      throw new Error(`Failed to generate hint: ${error.message}`);
    }
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(
        `Is this answer correct for the following question?\n\nQuestion: "${question}"\nAnswer: "${answer}"\n\nRespond with only "true" or "false", nothing else.`
      );
      const text = result.response.text().toLowerCase().trim();
      return text === 'true' || text.includes('correct');
    } catch (error) {
      console.error("Gemini Validation Error:", error);
      throw new Error(`Failed to validate answer: ${error.message}`);
    }
  }

  private buildPrompt(
    topic: string,
    difficulty: string,
    count: number,
    questionType: string
  ): string {
    return `Generate exactly ${count} ${difficulty} level ${questionType === 'multiple_choice' ? 'multiple choice' : questionType === 'true_false' ? 'true/false' : 'short answer'} questions about "${topic}".

Format your response as a valid JSON array ONLY (no markdown, no extra text). Each question must have this exact structure:

[
  {
    "content": "The question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is the correct answer",
    "difficulty": "${difficulty}"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no markdown code blocks or extra text
- Ensure correctAnswer matches one of the options exactly
- Make sure all ${count} questions are included
- For true/false questions, use ["True", "False"] as options`;
  }
}
```

---

### Step 3: Implement Anthropic Provider (AnthropicProvider.ts)

```typescript
// backend/src/services/ai/providers/AnthropicProvider.ts

import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, GeneratedQuestion } from "../AIProvider";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-3-5-sonnet-20241022") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateQuestions(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number,
    questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildPrompt(topic, difficulty, count, questionType);

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error("Unexpected response type from Claude");
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from Claude response");
      }

      const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
      
      // Validate structure
      return questions.map(q => ({
        content: q.content || "Invalid question",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        difficulty: q.difficulty || 'medium'
      }));
    } catch (error) {
      console.error("Claude API Error:", error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  async generateHint(question: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Provide a helpful hint for this question (without revealing the answer): "${question}"\n\nRespond with only the hint, no extra text.`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error("Unexpected response type");
      }

      return content.text.trim();
    } catch (error) {
      console.error("Claude Hint Generation Error:", error);
      throw new Error(`Failed to generate hint: ${error.message}`);
    }
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Is this answer correct for the following question?\n\nQuestion: "${question}"\nAnswer: "${answer}"\n\nRespond with only "true" or "false", nothing else.`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error("Unexpected response type");
      }

      const text = content.text.toLowerCase().trim();
      return text === 'true' || text.includes('correct');
    } catch (error) {
      console.error("Claude Validation Error:", error);
      throw new Error(`Failed to validate answer: ${error.message}`);
    }
  }

  private buildPrompt(
    topic: string,
    difficulty: string,
    count: number,
    questionType: string
  ): string {
    return `Generate exactly ${count} ${difficulty} level ${questionType === 'multiple_choice' ? 'multiple choice' : questionType === 'true_false' ? 'true/false' : 'short answer'} questions about "${topic}".

Format your response as a valid JSON array ONLY (no markdown, no extra text). Each question must have this exact structure:

[
  {
    "content": "The question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is the correct answer",
    "difficulty": "${difficulty}"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no markdown code blocks or extra text
- Ensure correctAnswer matches one of the options exactly
- Make sure all ${count} questions are included
- For true/false questions, use ["True", "False"] as options`;
  }
}
```

---

### Step 4: Create Configuration (aiConfig.ts)

```typescript
// backend/src/services/ai/config/aiConfig.ts

import { AIProvider } from "../AIProvider";
import { GeminiProvider } from "../providers/GeminiProvider";
import { AnthropicProvider } from "../providers/AnthropicProvider";

/**
 * Factory function to get the configured AI provider
 * Provider is selected via environment variable AI_PROVIDER
 * API key is read from corresponding environment variable
 */
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      `Missing API key for AI provider "${provider}". ` +
      `Set AI_API_KEY environment variable.`
    );
  }

  switch (provider) {
    case "gemini":
      const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";
      console.log(`✓ Using Gemini AI provider (model: ${geminiModel})`);
      return new GeminiProvider(apiKey, geminiModel);

    case "anthropic":
    case "claude":
      const claudeModel = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
      console.log(`✓ Using Anthropic Claude provider (model: ${claudeModel})`);
      return new AnthropicProvider(apiKey, claudeModel);

    case "openai":
    case "gpt":
      console.log("⚠️  OpenAI provider not yet implemented");
      throw new Error("OpenAI provider not yet implemented");

    case "ollama":
      console.log("⚠️  Ollama provider not yet implemented");
      throw new Error("Ollama provider not yet implemented");

    default:
      throw new Error(
        `Unknown AI provider: "${provider}". ` +
        `Valid options: gemini, anthropic, openai, ollama`
      );
  }
}

/**
 * Test the current AI provider
 * Run: npx ts-node -e "require('./src/services/ai/config/aiConfig').testAIProvider()"
 */
export async function testAIProvider(): Promise<void> {
  try {
    const provider = getAIProvider();
    console.log("Testing AI provider...");

    const questions = await provider.generateQuestions(
      "JavaScript",
      "easy",
      1,
      "multiple_choice"
    );

    console.log("✓ Question generation works:", questions[0]);

    const hint = await provider.generateHint("What is JavaScript?");
    console.log("✓ Hint generation works:", hint);

    const isValid = await provider.validateAnswer(
      "What is 2+2?",
      "4"
    );
    console.log("✓ Answer validation works:", isValid);
  } catch (error) {
    console.error("✗ AI provider test failed:", error.message);
    throw error;
  }
}
```

---

### Step 5: Export from Index (index.ts)

```typescript
// backend/src/services/ai/index.ts

export { AIProvider, GeneratedQuestion } from "./AIProvider";
export { getAIProvider, testAIProvider } from "./config/aiConfig";
export { GeminiProvider } from "./providers/GeminiProvider";
export { AnthropicProvider } from "./providers/AnthropicProvider";
```

---

## 📋 Environment Configuration

### .env Example (Choose Your Provider)

**Option 1: Use Gemini (Google)**
```env
# AI Provider
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-pro

# Database, Redis, etc.
...
```

**Option 2: Use Claude (Anthropic)**
```env
# AI Provider
AI_PROVIDER=anthropic
AI_API_KEY=your-anthropic-api-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Database, Redis, etc.
...
```

**Option 3: Switch Providers Later**
```env
# Change AI_PROVIDER to switch - no code changes needed!
AI_PROVIDER=gemini        # or anthropic, openai, ollama
AI_API_KEY=your-key-here

# Backend & Database
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/quizmind_ai
REDIS_URL=redis://localhost:6379

# Other configs...
```

---

## 🔌 Usage in Services

### In Quiz Service

```typescript
// backend/src/services/quizService.ts

import { getAIProvider } from "./ai";

export class QuizService {
  private aiProvider = getAIProvider();

  async generateQuizWithAI(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    questionCount: number
  ) {
    // This works with ANY provider - just swap .env!
    const questions = await this.aiProvider.generateQuestions(
      topic,
      difficulty,
      questionCount,
      "multiple_choice"
    );

    // Save to database
    const quiz = await prisma.quiz.create({
      data: {
        title: `${topic} Quiz`,
        description: `Generated quiz about ${topic}`,
        ai_generated: true,
        // ... other fields
      }
    });

    // Add questions
    for (const q of questions) {
      await prisma.question.create({
        data: {
          quiz_id: quiz.id,
          content: q.content,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          // ... other fields
        }
      });
    }

    return quiz;
  }
}
```

---

## 🧪 Testing the AI Provider

### Test Script

```bash
# Test your configured provider
cd backend
npm run test:ai
```

### Manual Test

```typescript
// Create a test file: backend/test-ai.ts
import { getAIProvider } from './src/services/ai';

async function test() {
  const provider = getAIProvider();
  
  console.log("Testing question generation...");
  const questions = await provider.generateQuestions(
    "React.js",
    "medium",
    3,
    "multiple_choice"
  );
  
  console.log("Generated questions:", JSON.stringify(questions, null, 2));
}

test().catch(console.error);
```

---

## 🔄 Switching Providers

### Change Provider in 1 Step

1. Edit `.env` file:
   ```env
   # Just change this line!
   AI_PROVIDER=anthropic    # was: gemini
   AI_API_KEY=new-api-key
   ```

2. Restart backend - done! No code changes needed.

---

## 📊 Comparison

| Provider | Cost | Quality | Speed | Setup |
|----------|------|---------|-------|-------|
| **Gemini** | $0.075/1M tokens | Excellent | Fast | Easy |
| **Claude** | $0.003/1K tokens | Excellent | Medium | Easy |
| **OpenAI** | $0.03/1K tokens | Very Good | Medium | Not implemented |
| **Ollama** | Free | Good | Varies | Not implemented |

---

## 🚀 Adding a New Provider

### Template

```typescript
// backend/src/services/ai/providers/NewProvider.ts

import { AIProvider, GeneratedQuestion } from "../AIProvider";

export class NewProvider implements AIProvider {
  constructor(apiKey: string, model?: string) {
    // Initialize your client
  }

  async generateQuestions(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number,
    questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  ): Promise<GeneratedQuestion[]> {
    // Implement question generation
  }

  async generateHint(question: string): Promise<string> {
    // Implement hint generation
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    // Implement answer validation
  }
}
```

Then add to `aiConfig.ts`:
```typescript
case "newprovider":
  return new NewProvider(apiKey);
```

---

## ⚠️ Error Handling

All providers wrap errors:

```typescript
try {
  const questions = await provider.generateQuestions(...);
} catch (error) {
  // Handle error - all providers throw with same format
  if (error.message.includes("API key")) {
    // Handle auth error
  } else if (error.message.includes("quota")) {
    // Handle rate limit
  }
}
```

---

## 📚 Installation Commands

### Gemini
```bash
npm install @google/generative-ai
```

### Anthropic
```bash
npm install @anthropic-ai/sdk
```

### OpenAI (future)
```bash
npm install openai
```

---

## 🎯 Summary

✅ **Pluggable system** - Swap providers by changing 1 line in `.env`  
✅ **Type-safe** - TypeScript ensures consistency  
✅ **Well-documented** - Each provider clearly implemented  
✅ **Easy to test** - Included test functions  
✅ **Production-ready** - Error handling, logging, validation  
✅ **Extensible** - Simple template for new providers

**You can now build with any LLM provider and switch anytime!**
