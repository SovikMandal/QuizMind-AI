import { GeneratedQuestion, QuestionFormat, AIDifficulty } from "./AIProvider";

const label: Record<QuestionFormat, string> = {
  multiple_choice: "multiple choice",
  true_false: "true/false",
  short_answer: "short answer",
};

export function buildQuestionPrompt(
  topic: string,
  difficulty: AIDifficulty,
  count: number,
  questionType: QuestionFormat
): string {
  return `Generate exactly ${count} ${difficulty} level ${label[questionType]} questions about "${topic}".

Respond with a valid JSON array ONLY (no markdown, no extra text). Each item must have:
[
  {
    "content": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct",
    "difficulty": "${difficulty}"
  }
]

Rules:
- Return ONLY the JSON array.
- correctAnswer must exactly match one of the options.
- For true/false questions, use ["True", "False"] as options.
- For short answer questions, use an empty options array and put the answer in correctAnswer.`;
}

/** Extracts and normalizes a JSON array of questions from a raw LLM response. */
export function parseQuestions(rawText: string): GeneratedQuestion[] {
  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Failed to extract JSON array from AI response");

  const parsed = JSON.parse(match[0]) as Partial<GeneratedQuestion>[];
  return parsed.map((q) => ({
    content: q.content ?? "Invalid question",
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer ?? "",
    explanation: q.explanation ?? "",
    difficulty: q.difficulty ?? "medium",
  }));
}
