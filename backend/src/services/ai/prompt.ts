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
  return `You are an expert quiz author. Generate exactly ${count} high-quality ${difficulty}-level ${label[questionType]} questions about "${topic}".

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════
Return ONLY a valid JSON array. No markdown fences, no commentary, no trailing text.

Each object MUST follow this exact shape:
{
  "content": "The question in plain text only",
  "formula": "Math/science equation in unicode, or \\"\\"",
  "diagram": "ASCII art (trees/graphs/tables) with \\n line breaks, or \\"\\"",
  "code": "Source code with \\n line breaks and 2-space indent, or \\"\\"",
  "codeLang": "cpp | python | java | javascript | c | ... or \\"\\"",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "must exactly match one option",
  "explanation": "1-2 sentence justification of the correct answer",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
FIELD SEPARATION (STRICT)
════════════════════════════════════════
Split every question into the RIGHT field. NEVER mix code, formulas, or diagrams into "content".

• content  → ONLY the plain-text question sentence.
• formula  → math / physics / chemistry expressions in UNICODE (never LaTeX):
             use ² ³ ₀ ₁ ₂ √ ∫ Σ Π π ∞ ≤ ≥ ≠ ± × ÷ · → ⇌ Δ α β γ θ λ μ
             fractions as a/b or ½ ⅓ ¼ ; subscripts v₀, H₂O ; superscripts x², m⁻¹
             NEVER output \\frac, \\int, \\sqrt, \\sum or any backslash command.
• diagram  → ASCII structures (binary trees, graphs, circuits, flowcharts,
             tables, molecular chains) using \\n for new lines.
• code     → runnable, properly indented multi-line code. Never single-line.
• codeLang → the language of "code" so it can be syntax-highlighted.

A single question MAY populate more than one field (e.g. a question with both
a diagram AND code, or text AND a formula).

════════════════════════════════════════
QUESTION TYPE RULES
════════════════════════════════════════
• multiple choice → 4 distinct options, exactly one correct, plausible distractors.
• true/false      → options MUST be ["True", "False"].
• short answer    → options MUST be [] and put the answer in "correctAnswer".

════════════════════════════════════════
QUALITY BAR
════════════════════════════════════════
• Match the "${difficulty}" difficulty precisely.
• Cover a variety of sub-topics within "${topic}" (avoid repetition).
• Distractors must be believable, not obviously wrong.
• Keep "content" concise and unambiguous.

════════════════════════════════════════
EXAMPLES (format reference only — do not copy content)
════════════════════════════════════════
[
  {
    "content": "What is the output of the following code?",
    "formula": "",
    "diagram": "",
    "code": "const nums = [1, 2, 3];\\nconst r = nums.map(n => n * n);\\nconsole.log(r);",
    "codeLang": "javascript",
    "options": ["[1, 4, 9]", "[1, 2, 3]", "[2, 4, 6]", "[9, 4, 1]"],
    "correctAnswer": "[1, 4, 9]",
    "explanation": "map squares each element, producing [1, 4, 9].",
    "difficulty": "${difficulty}"
  },
  {
    "content": "Find the maximum height reached by a ball thrown up at 20 m/s (g = 10 m/s²).",
    "formula": "h = v₀²/(2g)",
    "diagram": "",
    "code": "",
    "codeLang": "",
    "options": ["20 m", "10 m", "40 m", "5 m"],
    "correctAnswer": "20 m",
    "explanation": "h = 20²/(2·10) = 400/20 = 20 m.",
    "difficulty": "${difficulty}"
  }
]

Now generate ${count} questions about "${topic}". Return ONLY the JSON array.`;
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
