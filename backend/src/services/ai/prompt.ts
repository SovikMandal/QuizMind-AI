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
    "content": "Plain text question only (no code, no diagrams, no formulas here)",
    "diagram": "ASCII diagram if needed (trees, graphs, circuits, molecular structures, tables, flowcharts). Use \\n for newlines. Empty string if not needed.",
    "formula": "Math equation or chemistry formula if needed (use LaTeX notation like E = mc^2 or H2SO4 + NaOH -> Na2SO4 + H2O). Empty string if not needed.",
    "code": "Code snippet if needed with \\n for line breaks and proper indentation. Empty string if not needed.",
    "codeLang": "Language of code (cpp, python, java, javascript, c, etc). Empty string if no code.",
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

STRUCTURED CONTENT RULES — SEPARATE the question into distinct fields:
1. "content" = ONLY plain text question (e.g. "What is the product of the following reaction?" or "What is the output of this code for the given tree?")
2. "formula" = ANY math or science formula/equation:
   - Math: "x = (-b ± √(b²-4ac)) / 2a" or "∫₀¹ x² dx = 1/3"
   - Chemistry: "2H2 + O2 -> 2H2O" or "CH3COOH + NaOH -> CH3COONa + H2O"  
   - Physics: "F = ma" or "E = hν"
   - Use -> for reaction arrows, subscript numbers as plain (H2O not H₂O)
3. "diagram" = ANY visual structure as ASCII art with \\n for line breaks:
   - Binary trees: "    1\\n   / \\\\\\n  2   3"
   - Graphs: "A --5--> B --3--> C"
   - Circuit diagrams: "R1 ---/\\/\\/--- R2"
   - Molecular structures, state diagrams, flowcharts, tables
   - Organic chemistry structures (benzene ring, carbon chains)
4. "code" = ONLY programming code with proper formatting (\\n for newlines, 2-space indent)
5. "codeLang" = language identifier for syntax context

- NEVER put formulas, code, or diagrams inside "content"
- A question can have multiple fields filled (e.g. both formula AND diagram)
- Code must be multi-line with proper indentation, never single-line`;
}

/** Extracts and normalizes a JSON array of questions from a raw LLM response. */
export function parseQuestions(rawText: string): GeneratedQuestion[] {
  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Failed to extract JSON array from AI response");

  const parsed = JSON.parse(match[0]) as Partial<GeneratedQuestion>[];
  return parsed.map((q) => ({
    content: q.content ?? "Invalid question",
    diagram: q.diagram ?? "",
    formula: q.formula ?? "",
    code: q.code ?? "",
    codeLang: q.codeLang ?? "",
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer ?? "",
    explanation: q.explanation ?? "",
    difficulty: q.difficulty ?? "medium",
  }));
}
