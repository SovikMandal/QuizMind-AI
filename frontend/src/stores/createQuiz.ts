import { create } from "zustand";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import type { QuestionInput } from "@/types";

export type Difficulty = "easy" | "medium" | "hard";
export type QuizType = "public" | "private";

interface CreateQuizState {
  // wizard
  step: number;

  // step 1 — details
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  durationMins: number;
  date: string;
  time: string;
  quizType: QuizType;
  password: string;
  allowLateJoin: boolean;

  // step 2 — questions
  topicPrompt: string;
  count: number;
  questions: QuestionInput[];

  // async flags
  generating: boolean;

  // actions
  patch: (partial: Partial<CreateQuizState>) => void;
  generate: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: 1,
  title: "",
  description: "",
  subject: "",
  difficulty: "easy" as Difficulty,
  durationMins: 30,
  date: "",
  time: "",
  quizType: "public" as QuizType,
  password: "",
  allowLateJoin: false,
  topicPrompt: "",
  count: 10,
  questions: [] as QuestionInput[],
  generating: false,
};

export const useCreateQuiz = create<CreateQuizState>((set, get) => ({
  ...initialState,

  patch: (partial) => set(partial),

  generate: async () => {
    const { topicPrompt, difficulty, count, generating } = get();
    if (generating || !topicPrompt.trim()) return;
    set({ generating: true });
    try {
      const res = await api.post("/ai/generate-questions", {
        topic: topicPrompt,
        difficulty,
        count,
        questionType: "multiple_choice",
      });
      // Append to whatever questions exist now (state may have changed).
      set((s) => ({ questions: [...s.questions, ...res.data.questions] }));
      toast.success(`Generated ${res.data.questions.length} questions`);
    } catch (err) {
      toast.error(apiError(err, "Generation failed"));
    } finally {
      set({ generating: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
