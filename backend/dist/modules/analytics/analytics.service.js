"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
async function loadSession(sessionId) {
    const session = await db_1.prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: { quiz: true },
    });
    if (!session)
        throw ApiError_1.ApiError.notFound("Session not found");
    return session;
}
function name(p) {
    return p.user.displayName ?? p.user.username;
}
exports.AnalyticsService = {
    async leaderboard(sessionId) {
        await loadSession(sessionId);
        const participants = await db_1.prisma.participant.findMany({
            where: { sessionId },
            orderBy: [{ score: "desc" }, { timeTakenSecs: "asc" }],
            include: { user: { select: { username: true, displayName: true } } },
        });
        return participants.map((p, i) => ({
            rank: p.rank ?? i + 1,
            participantId: p.id,
            username: name(p),
            score: p.score,
        }));
    },
    async results(sessionId, userId) {
        const session = await loadSession(sessionId);
        const participants = await db_1.prisma.participant.findMany({
            where: { sessionId },
            orderBy: [{ score: "desc" }, { timeTakenSecs: "asc" }],
            include: { user: { select: { username: true, displayName: true } } },
        });
        const mine = participants.find((p) => p.userId === userId);
        const isCreator = session.quiz.creatorId === userId;
        if (!mine && !isCreator)
            throw ApiError_1.ApiError.forbidden("You did not take this quiz");
        let breakdown = [];
        if (mine) {
            const answers = await db_1.prisma.answer.findMany({
                where: { participantId: mine.id },
                include: { question: { select: { questionText: true, correctAnswer: true, orderIndex: true, options: true } } },
                orderBy: { question: { orderIndex: "asc" } },
            });
            breakdown = answers.map((a) => ({
                questionText: a.question.questionText,
                submittedAnswer: a.submittedAnswer,
                correctAnswer: a.question.correctAnswer,
                isCorrect: a.isCorrect,
                pointsEarned: a.pointsEarned,
                options: a.question.options,
            }));
        }
        const total = session.quiz.totalPoints || 1;
        return {
            quiz: { title: session.quiz.title, subject: session.quiz.subject, totalPoints: session.quiz.totalPoints },
            personal: mine
                ? {
                    score: mine.score,
                    rank: mine.rank ?? participants.findIndex((p) => p.userId === userId) + 1,
                    accuracyPct: Math.round((mine.score / total) * 100),
                }
                : null,
            breakdown,
            leaderboard: participants.map((p, i) => ({
                rank: p.rank ?? i + 1,
                username: name(p),
                score: p.score,
            })),
        };
    },
    async analytics(sessionId, userId) {
        const session = await loadSession(sessionId);
        if (session.quiz.creatorId !== userId) {
            const participant = await db_1.prisma.participant.findFirst({ where: { sessionId, userId } });
            if (!participant)
                throw ApiError_1.ApiError.forbidden("You did not take this quiz");
        }
        const participants = await db_1.prisma.participant.findMany({
            where: { sessionId },
            orderBy: [{ score: "desc" }, { timeTakenSecs: "asc" }],
            include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
        });
        const answers = await db_1.prisma.answer.findMany({
            where: { participant: { sessionId } },
            include: {
                question: { select: { id: true, questionText: true, orderIndex: true, topicTag: true } },
            },
        });
        const questionCount = await db_1.prisma.question.count({ where: { quizId: session.quizId } });
        const totalStudents = participants.length;
        const totalPoints = session.quiz.totalPoints || 1;
        const completed = participants.filter((p) => p.completedAt).length;
        const avgScorePct = totalStudents
            ? Math.round(participants.reduce((s, p) => s + p.score / totalPoints, 0) / totalStudents * 100)
            : 0;
        // Total answer time per participant -> average.
        const timeByParticipant = new Map();
        for (const a of answers) {
            timeByParticipant.set(a.participantId, (timeByParticipant.get(a.participantId) ?? 0) + (a.timeTakenSecs ?? 0));
        }
        const times = [...timeByParticipant.values()];
        const avgTimeSecs = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
        // Per-question accuracy.
        const byQuestion = new Map();
        for (const a of answers) {
            const q = a.question;
            const e = byQuestion.get(q.id) ?? { text: q.questionText, order: q.orderIndex, topic: q.topicTag, total: 0, correct: 0, time: 0 };
            e.total += 1;
            if (a.isCorrect)
                e.correct += 1;
            e.time += a.timeTakenSecs ?? 0;
            byQuestion.set(q.id, e);
        }
        const questions = [...byQuestion.values()]
            .sort((a, b) => a.order - b.order)
            .map((e, i) => ({
            index: i + 1,
            questionText: e.text,
            accuracy: e.total ? Math.round((e.correct / e.total) * 100) : 0,
            avgTimeSecs: e.total ? Math.round(e.time / e.total) : 0,
        }));
        // Topic accuracy.
        const byTopic = new Map();
        for (const a of answers) {
            const tag = a.question.topicTag ?? "General";
            const e = byTopic.get(tag) ?? { total: 0, correct: 0 };
            e.total += 1;
            if (a.isCorrect)
                e.correct += 1;
            byTopic.set(tag, e);
        }
        const topics = [...byTopic.entries()].map(([topic, e]) => ({
            topic,
            accuracy: e.total ? Math.round((e.correct / e.total) * 100) : 0,
        }));
        // Score distribution (4 buckets).
        const buckets = [
            { range: "0-40", count: 0 },
            { range: "41-60", count: 0 },
            { range: "61-80", count: 0 },
            { range: "81-100", count: 0 },
        ];
        for (const p of participants) {
            const pct = (p.score / totalPoints) * 100;
            const idx = pct <= 40 ? 0 : pct <= 60 ? 1 : pct <= 80 ? 2 : 3;
            buckets[idx].count += 1;
        }
        // Participation over the last 6 weeks (by join date).
        const now = new Date();
        const participation = Array.from({ length: 6 }, (_, i) => ({ label: `W${i + 1}`, attempts: 0 }));
        for (const p of participants) {
            const weeksAgo = Math.floor((now.getTime() - new Date(p.joinedAt).getTime()) / (7 * 24 * 3600 * 1000));
            if (weeksAgo >= 0 && weeksAgo < 6)
                participation[5 - weeksAgo].attempts += 1;
        }
        // Leaderboard with avatar, total time, and status.
        const leaderboard = participants.map((p, i) => ({
            rank: p.rank ?? i + 1,
            participantId: p.id,
            username: p.user.displayName ?? p.user.username,
            avatarUrl: p.user.avatarUrl,
            score: p.score,
            timeSecs: timeByParticipant.get(p.id) ?? 0,
            status: p.completedAt ? "completed" : "in_progress",
        }));
        const hardest = [...questions].sort((a, b) => a.accuracy - b.accuracy)[0];
        const summary = totalStudents === 0
            ? "No participants yet."
            : `Class average ${avgScorePct}% across ${totalStudents} participant(s).` +
                (hardest ? ` Hardest: "${hardest.questionText}" (${hardest.accuracy}% correct).` : "");
        return {
            quiz: {
                id: session.quizId,
                title: session.quiz.title,
                subject: session.quiz.subject,
                totalPoints: session.quiz.totalPoints,
                questionCount,
                status: session.quiz.status,
                createdAt: session.quiz.createdAt,
            },
            metrics: { totalStudents, avgScorePct, completionRate: totalStudents ? Math.round((completed / totalStudents) * 100) : 0, avgTimeSecs },
            questions,
            topics,
            participation,
            scoreDistribution: buckets,
            leaderboard,
            summary,
        };
    },
    async history(userId) {
        const [created, participated] = await Promise.all([
            db_1.prisma.quiz.findMany({
                where: { creatorId: userId },
                orderBy: { createdAt: "desc" },
                select: { id: true, title: true, subject: true, status: true, createdAt: true },
            }),
            db_1.prisma.participant.findMany({
                where: { userId },
                orderBy: { joinedAt: "desc" },
                include: { session: { include: { quiz: { select: { title: true, subject: true, creatorId: true } } } } },
            }),
        ]);
        // Rank is computed from score order (stored rank may be null for self-paced attempts).
        const allParts = await db_1.prisma.participant.findMany({
            where: { sessionId: { in: participated.map((p) => p.sessionId) } },
            select: { sessionId: true, score: true },
        });
        const scoresBySession = new Map();
        for (const p of allParts) {
            const arr = scoresBySession.get(p.sessionId) ?? [];
            arr.push(p.score);
            scoresBySession.set(p.sessionId, arr);
        }
        return {
            created,
            participated: participated.map((p) => ({
                sessionId: p.sessionId,
                title: p.session.quiz.title,
                subject: p.session.quiz.subject,
                creatorId: p.session.quiz.creatorId,
                score: p.score,
                rank: p.rank ?? (scoresBySession.get(p.sessionId)?.filter((s) => s > p.score).length ?? 0) + 1,
                status: p.session.status,
                joinedAt: p.joinedAt,
            })),
        };
    },
};
//# sourceMappingURL=analytics.service.js.map