"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionsSchema = void 0;
const zod_1 = require("zod");
exports.generateQuestionsSchema = zod_1.z.object({
    topic: zod_1.z.string().min(1).max(500),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]).default("medium"),
    count: zod_1.z.number().int().min(1).max(20).default(5),
    questionType: zod_1.z
        .enum(["multiple_choice", "true_false", "short_answer"])
        .default("multiple_choice"),
});
//# sourceMappingURL=ai.schemas.js.map