"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueAccessCode = generateUniqueAccessCode;
const nanoid_1 = require("nanoid");
const db_1 = require("../config/db");
// Unambiguous uppercase alphanumerics (no 0/O/1/I).
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nano = (0, nanoid_1.customAlphabet)(alphabet, 6);
async function generateUniqueAccessCode() {
    for (let i = 0; i < 5; i++) {
        const code = nano();
        const exists = await db_1.prisma.quiz.findUnique({ where: { accessCode: code } });
        if (!exists)
            return code;
    }
    throw new Error("Failed to generate a unique access code");
}
//# sourceMappingURL=generateAccessCode.js.map