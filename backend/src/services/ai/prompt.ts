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
2. "formula" = ANY math or science formula/equation in PLAIN READABLE TEXT (NOT LaTeX):
   - Math: "x = (-b ± √(b²-4ac)) / 2a" or "∫₀¹ x² dx = 1/3"
   - Use unicode: ² ³ ₀ ₁ ₂ ₃ √ ∫ Σ π ∞ ≤ ≥ ≠ ± × ÷ → ⇌ Δ α β γ θ λ
   - Chemistry: "2H₂ + O₂ → 2H₂O" or "CH₃COOH + NaOH → CH₃COONa + H₂O"  
   - Physics: "F = ma" or "E = hν" or "v = v₀ + at"
   - NEVER use LaTeX commands like \frac, \int, \sqrt, \sum etc.
   - Write fractions as: a/b or use ½ ⅓ ¼
   - Write integrals as: ∫₀³ (x² - 4x + 3) dx
   - Write subscripts with unicode: v₀, H₂O, x₁
   - Write superscripts with unicode: x², x³, m⁻¹
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
- Code must be multi-line with proper indentation, never single-line
- CRITICAL: formulas must use UNICODE characters (², ³, ₀, ₁, √, ∫, →, ≤, π), NEVER LaTeX (\\frac, \\int, \\sqrt)`;
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
