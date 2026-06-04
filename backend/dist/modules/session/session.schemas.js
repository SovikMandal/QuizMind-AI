"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAttemptSchema = exports.joinSchema = void 0;
const zod_1 = require("zod");
exports.joinSchema = zod_1.z
    .object({
    accessCode: zod_1.z.string().min(1).optional(),
    quizId: zod_1.z.string().uuid().optional(),
    password: zod_1.z.string().optional(),
})
    .refine((d) => !!d.accessCode || !!d.quizId, {
    message: "Provide an accessCode (private) or quizId (public)",
    path: ["accessCode"],
});
exports.submitAttemptSchema = zod_1.z.object({
    answers: zod_1.z
        .array(zod_1.z.object({
        questionId: zod_1.z.string().uuid(),
        answer: zod_1.z.string(),
        timeTaken: zod_1.z.number().int().nonnegative().optional(),
    }))
        .min(1),
});
//# sourceMappingURL=session.schemas.js.map