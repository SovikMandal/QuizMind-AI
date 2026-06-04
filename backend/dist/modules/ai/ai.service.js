"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const ai_1 = require("../../services/ai");
const ApiError_1 = require("../../utils/ApiError");
const db_1 = require("../../config/db");
const AI_QUESTION_LIMITS = { free: 12, pro: 70, premium: 70 };
const OPTION_IDS = ["a", "b", "c", "d", "e", "f"];
function toAppQuestion(g, format) {
    const base = { questionText: g.content, explanation: g.explanation, difficulty: g.difficulty };
    if (format === "short_answer") {
        return { ...base, questionType: "short_answer", correctAnswer: g.correctAnswer };
    }
    if (format === "true_false") {
        const isTrue = /true/i.test(g.correctAnswer);
        return {
            ...base,
            questionType: "true_false",
            options: [
                { id: "true", text: "True", isCorrect: isTrue },
                { id: "false", text: "False", isCorrect: !isTrue },
            ],
            correctAnswer: isTrue ? "true" : "false",
        };
    }
    // multiple_choice
    const options = g.options.map((text, i) => ({
        id: OPTION_IDS[i] ?? `o${i}`,
        text,
        isCorrect: text.trim() === g.correctAnswer.trim(),
    }));
    if (options.length && !options.some((o) => o.isCorrect))
        options[0].isCorrect = true;
    const correct = options.find((o) => o.isCorrect)?.id ?? options[0]?.id ?? "a";
    return { ...base, questionType: "mcq", options, correctAnswer: correct };
}
let cached;
exports.AiService = {
    async generateQuestions(userId, input) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
        const max = AI_QUESTION_LIMITS[user?.tier ?? "free"];
        if (input.count > max) {
            throw new ApiError_1.ApiError(403, `Your plan allows up to ${max} AI-generated questions per quiz. Upgrade for more.`);
        }
        const provider = (cached ??= (0, ai_1.getAIProvider)());
        const generated = await provider.generateQuestions(input.topic, input.difficulty, input.count, input.questionType);
        return generated.map((g) => toAppQuestion(g, input.questionType));
    },
};
//# sourceMappingURL=ai.service.js.map