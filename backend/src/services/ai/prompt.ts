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
    "content": "The question text here (plain text only, no code or diagrams in this field)",
    "diagram": "ASCII diagram or tree structure if needed (use \\n for newlines), or empty string if not needed",
    "code": "Code snippet if the question involves code (use \\n for newlines and proper indentation), or empty string if not needed",
    "codeLang": "Language of the code (e.g. cpp, python, java, javascript), or empty string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct",
    "difficulty": "${difficulty}"
  }
]

IMPORTANT RULES:
- Return ONLY the JSON array, no markdown fences, no extra text.
- correctAnswer must exactly match one of the options.
- For true/false questions, use ["True", "False"] as options.
- For short answer questions, use an empty options array and put the answer in correctAnswer.
- SEPARATE the question into 3 parts:
  1. "content" = plain text question (e.g. "What is the output of the following code for this binary tree?")
  2. "diagram" = any tree, graph, table, or structure as ASCII art with \\n for line breaks (e.g. "    1\\n   / \\\\\\n  2   3\\n / \\\\\\n4   5")
  3. "code" = any code snippet with \\n for line breaks and proper indentation (e.g. "void traverse(Node* root) {\\n  if (root == NULL) return;\\n  cout << root->data;\\n  traverse(root->left);\\n  traverse(root->right);\\n}")
- If question has no diagram, set "diagram" to ""
- If question has no code, set "code" to ""
- NEVER put code or diagrams inside the "content" field
- Code must be properly formatted with line breaks, not on a single line`;
}

/** Extracts and normalizes a JSON array of questions from a raw LLM response. */
export function parseQuestions(rawText: string): GeneratedQuestion[] {
  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Failed to extract JSON array from AI response");

  const parsed = JSON.parse(match[0]) as Partial<GeneratedQuestion>[];
  return parsed.map((q) => ({
    content: q.content ?? "Invalid question",
    diagram: q.diagram ?? "",
    code: q.code ?? "",
    codeLang: q.codeLang ?? "",
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer ?? "",
    explanation: q.explanation ?? "",
    difficulty: q.difficulty ?? "medium",
  }));
}
