"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
exports.UserService = {
    async getProfile(userId) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw ApiError_1.ApiError.notFound("User not found");
        return (0, sanitizeUser_1.toPublicUser)(user);
    },
    async updateProfile(userId, data) {
        const user = await db_1.prisma.user.update({ where: { id: userId }, data });
        return (0, sanitizeUser_1.toPublicUser)(user);
    },
    async getStats(userId) {
        const [quizzesCreated, attempts, hostedSessions] = await Promise.all([
            db_1.prisma.quiz.count({ where: { creatorId: userId } }),
            db_1.prisma.participant.findMany({
                where: { userId },
                select: { score: true },
            }),
            db_1.prisma.quizSession.findMany({
                where: { hostId: userId },
                select: { _count: { select: { participants: true } } },
            }),
        ]);
        const totalAttempts = attempts.length;
        const avgScore = totalAttempts === 0
            ? 0
            : Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts);
        const studentsReached = hostedSessions.reduce((sum, s) => sum + s._count.participants, 0);
        return { quizzesCreated, totalAttempts, avgScore, studentsReached };
    },
};
//# sourceMappingURL=user.service.js.map