"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z
    .object({
    displayName: zod_1.z.string().min(1).max(100),
    username: zod_1.z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().max(30),
    location: zod_1.z.string().max(120),
    bio: zod_1.z.string().max(500),
    avatarUrl: zod_1.z.string().url(),
})
    .partial();
//# sourceMappingURL=user.schemas.js.map