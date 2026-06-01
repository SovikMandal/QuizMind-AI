export type QuestionFormat = "multiple_choice" | "true_false" | "short_answer";
export type AIDifficulty = "easy" | "medium" | "hard";

export interface GeneratedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: AIDifficulty;
}

export interface AIProvider {
  generateQuestions(
    topic: string,
    difficulty: AIDifficulty,
    count: number,
    questionType: QuestionFormat
  ): Promise<GeneratedQuestion[]>;

  generateHint(question: string): Promise<string>;

  validateAnswer(question: string, answer: string): Promise<boolean>;
}
