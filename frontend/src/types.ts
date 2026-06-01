export type Tier = "free" | "pro" | "premium";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  tier: Tier;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  quizzesCreated: number;
  totalAttempts: number;
  avgScore: number;
  studentsReached: number;
}

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionInput {
  questionText: string;
  questionType: "mcq" | "true_false" | "short_answer";
  options?: Option[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  quizType: "public" | "private";
  accessCode: string | null;
  status: "draft" | "scheduled" | "waiting" | "live" | "ended";
  totalPoints: number;
  timeLimitSecs: number;
  createdAt: string;
}
