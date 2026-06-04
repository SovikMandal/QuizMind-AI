"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizQuerySchema = exports.updateQuizSchema = exports.createQuizSchema = exports.questionInputSchema = exports.optionSchema = void 0;
const zod_1 = require("zod");
exports.optionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1),
    isCorrect: zod_1.z.boolean(),
});
exports.questionInputSchema = zod_1.z.object({
    questionText: zod_1.z.string().min(1),
    questionType: zod_1.z.enum(["mcq", "true_false", "short_answer"]).default("mcq"),
    options: zod_1.z.array(exports.optionSchema).optional(),
    correctAnswer: zod_1.z.string().min(1),
    explanation: zod_1.z.string().optional(),
    points: zod_1.z.number().int().positive().default(10),
    timeLimitSecs: zod_1.z.number().int().positive().optional(),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]).default("medium"),
    topicTag: zod_1.z.string().max(100).optional(),
});
exports.createQuizSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    subject: zod_1.z.string().max(100).optional(),
    difficulty: zod_1.z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    quizType: zod_1.z.enum(["public", "private"]).default("public"),
    password: zod_1.z.string().min(1).optional(),
    allowLateJoin: zod_1.z.boolean().default(false),
    timeLimitSecs: zod_1.z.number().int().positive().default(30),
    durationMins: zod_1.z.coerce.number().int().positive().default(60),
    scheduledAt: zod_1.z.coerce.date().optional(),
    questions: zod_1.z.array(exports.questionInputSchema).default([]),
})
    .refine((d) => d.quizType !== "private" || !!d.password, {
    message: "Private quizzes require a password",
    path: ["password"],
});
exports.updateQuizSchema = exports.createQuizSchema
    .innerType()
    .omit({ questions: true, password: true })
    .partial();
exports.listQuizQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
    subject: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(["beginner", "intermediate", "advanced"]).optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=quiz.schemas.js.map