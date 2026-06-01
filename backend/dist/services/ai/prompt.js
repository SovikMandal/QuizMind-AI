"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuestionPrompt = buildQuestionPrompt;
exports.parseQuestions = parseQuestions;
const label = {
    multiple_choice: "multiple choice",
    true_false: "true/false",
    short_answer: "short answer",
};
function buildQuestionPrompt(topic, difficulty, count, questionType) {
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
function parseQuestions(rawText) {
    const match = rawText.match(/\[[\s\S]*\]/);
    if (!match)
        throw new Error("Failed to extract JSON array from AI response");
    const parsed = JSON.parse(match[0]);
    return parsed.map((q) => ({
        content: q.content ?? "Invalid question",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer ?? "",
        explanation: q.explanation ?? "",
        difficulty: q.difficulty ?? "medium",
    }));
}
//# sourceMappingURL=prompt.js.map