"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinSchema = void 0;
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
//# sourceMappingURL=session.schemas.js.map