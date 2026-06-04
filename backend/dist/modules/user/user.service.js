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
    async getDashboard(userId) {
        const now = new Date();
        const [quizzes, parts] = await Promise.all([
            db_1.prisma.quiz.findMany({ where: { creatorId: userId }, select: { subject: true, createdAt: true } }),
            db_1.prisma.participant.findMany({
                where: { userId },
                select: {
                    score: true,
                    joinedAt: true,
                    session: { select: { quiz: { select: { subject: true, totalPoints: true } } } },
                },
            }),
        ]);
        const created = quizzes.length;
        const joined = parts.length;
        // Average score as a percentage of each quiz's total points.
        const scored = parts.filter((p) => (p.session.quiz.totalPoints ?? 0) > 0);
        const avgScore = scored.length
            ? Math.round(scored.reduce((s, p) => s + (p.score / p.session.quiz.totalPoints) * 100, 0) / scored.length)
            : 0;
        // Day streak: consecutive days (ending today or yesterday) with activity.
        const days = new Set(parts.map((p) => new Date(p.joinedAt).toDateString()));
        let dayStreak = 0;
        const cursor = new Date(now);
        if (!days.has(cursor.toDateString()))
            cursor.setDate(cursor.getDate() - 1);
        while (days.has(cursor.toDateString())) {
            dayStreak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        // Activity over the last 6 months.
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en-US", { month: "short" }), created: 0, joined: 0 };
        });
        const mIdx = new Map(months.map((m, i) => [m.key, i]));
        const bucket = (date) => mIdx.get(`${date.getFullYear()}-${date.getMonth()}`);
        for (const q of quizzes) {
            const i = bucket(new Date(q.createdAt));
            if (i !== undefined)
                months[i].created++;
        }
        for (const p of parts) {
            const i = bucket(new Date(p.joinedAt));
            if (i !== undefined)
                months[i].joined++;
        }
        const activity = months.map(({ month, created, joined }) => ({ month, created, joined }));
        // Category breakdown by subject (from quizzes joined).
        const palette = ["#ea580c", "#0d9488", "#1e3a8a", "#eab308", "#9333ea", "#dc2626"];
        const byCat = new Map();
        for (const p of parts) {
            const s = p.session.quiz.subject ?? "General";
            byCat.set(s, (byCat.get(s) ?? 0) + 1);
        }
        const totalCat = joined || 1;
        const categories = [...byCat.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count], i) => ({ name, value: Math.round((count / totalCat) * 100), fill: palette[i % palette.length] }));
        // This-month / previous-month counts for goals + trends.
        const inMonth = (date, offset) => {
            const m = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            return date.getFullYear() === m.getFullYear() && date.getMonth() === m.getMonth();
        };
        const createdThisMonth = quizzes.filter((q) => inMonth(new Date(q.createdAt), 0)).length;
        const joinedThisMonth = parts.filter((p) => inMonth(new Date(p.joinedAt), 0)).length;
        const createdPrev = quizzes.filter((q) => inMonth(new Date(q.createdAt), 1)).length;
        const joinedPrev = parts.filter((p) => inMonth(new Date(p.joinedAt), 1)).length;
        const pct = (cur, prev) => prev === 0 ? (cur > 0 ? "+100%" : "0%") : `${cur - prev >= 0 ? "+" : ""}${Math.round(((cur - prev) / prev) * 100)}%`;
        const goals = [
            { label: "Create 12 quizzes", text: `${createdThisMonth}/12`, value: Math.min(100, Math.round((createdThisMonth / 12) * 100)) },
            { label: "Join 30 quizzes", text: `${joinedThisMonth}/30`, value: Math.min(100, Math.round((joinedThisMonth / 30) * 100)) },
            { label: "20-day streak", text: `${dayStreak}/20`, value: Math.min(100, Math.round((dayStreak / 20) * 100)) },
        ];
        return {
            stats: { created, joined, avgScore, dayStreak },
            trends: { created: pct(createdThisMonth, createdPrev), joined: pct(joinedThisMonth, joinedPrev) },
            activity,
            categories,
            goals,
        };
    },
};
//# sourceMappingURL=user.service.js.map