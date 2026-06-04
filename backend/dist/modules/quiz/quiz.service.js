"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = exports.TIER_QUIZ_LIMITS = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const password_1 = require("../../utils/password");
const generateAccessCode_1 = require("../../utils/generateAccessCode");
const quiz_mappers_1 = require("./quiz.mappers");
const notification_service_1 = require("../notification/notification.service");
exports.TIER_QUIZ_LIMITS = { free: 10, pro: 30, premium: 120 };
exports.QuizService = {
    async create(userId, input) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
        const limit = exports.TIER_QUIZ_LIMITS[user?.tier ?? "free"];
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const usedThisMonth = await db_1.prisma.quiz.count({
            where: { creatorId: userId, createdAt: { gte: startOfMonth } },
        });
        if (usedThisMonth >= limit) {
            throw ApiError_1.ApiError.forbidden(`Monthly quiz limit reached (${limit}/month for your plan). Upgrade to create more.`);
        }
        const isPrivate = input.quizType === "private";
        const totalPoints = input.questions.reduce((sum, q) => sum + (q.points ?? 10), 0);
        const quiz = await db_1.prisma.quiz.create({
            data: {
                creatorId: userId,
                title: input.title,
                description: input.description,
                subject: input.subject,
                difficulty: input.difficulty,
                quizType: input.quizType,
                allowLateJoin: input.allowLateJoin,
                timeLimitSecs: input.timeLimitSecs,
                durationMins: input.durationMins,
                scheduledAt: input.scheduledAt,
                totalPoints,
                accessCode: isPrivate ? await (0, generateAccessCode_1.generateUniqueAccessCode)() : null,
                passwordHash: isPrivate ? await (0, password_1.hashPassword)(input.password) : null,
                questions: {
                    create: input.questions.map((q, i) => ({
                        questionText: q.questionText,
                        questionType: q.questionType,
                        options: (q.options ?? undefined),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        points: q.points,
                        timeLimitSecs: q.timeLimitSecs,
                        difficulty: q.difficulty,
                        topicTag: q.topicTag,
                        orderIndex: i,
                    })),
                },
            },
            include: { questions: { orderBy: { orderIndex: "asc" } } },
        });
        if (usedThisMonth + 1 >= limit) {
            await notification_service_1.NotificationService.create({
                userId,
                type: "quiz_limit_reached",
                title: "Monthly quiz limit reached",
                body: `You've used all ${limit} quizzes in your plan this month. Upgrade to create more.`,
                link: "/pricing",
            });
        }
        return quiz;
    },
    async list(query) {
        const where = {
            ...(query.subject && { subject: query.subject }),
            ...(query.difficulty && { difficulty: query.difficulty }),
            ...(query.search && { title: { contains: query.search, mode: "insensitive" } }),
        };
        const [quizzes, total] = await Promise.all([
            db_1.prisma.quiz.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: query.limit,
                skip: query.offset,
                include: {
                    _count: { select: { questions: true } },
                    creator: { select: { displayName: true, username: true, avatarUrl: true } },
                },
            }),
            db_1.prisma.quiz.count({ where }),
        ]);
        // Participant counts + average accuracy per quiz (across all of its sessions).
        const sessions = await db_1.prisma.quizSession.findMany({
            where: { quizId: { in: quizzes.map((q) => q.id) } },
            select: { quizId: true, participants: { select: { score: true, completedAt: true } } },
        });
        const statsByQuiz = new Map();
        for (const s of sessions) {
            const e = statsByQuiz.get(s.quizId) ?? { count: 0, scored: 0, scoreSum: 0 };
            for (const p of s.participants) {
                e.count += 1;
                if (p.completedAt) {
                    e.scored += 1;
                    e.scoreSum += p.score;
                }
            }
            statsByQuiz.set(s.quizId, e);
        }
        return {
            quizzes: quizzes.map((q) => {
                const e = statsByQuiz.get(q.id);
                const accuracy = e && e.scored > 0 && q.totalPoints > 0
                    ? Math.round((e.scoreSum / e.scored / q.totalPoints) * 100)
                    : 0;
                const { passwordHash: _pw, accessCode: _ac, ...rest } = q;
                return { ...rest, status: (0, quiz_mappers_1.effectiveQuizStatus)(q), participants: e?.count ?? 0, accuracy };
            }),
            total,
            limit: query.limit,
            offset: query.offset,
        };
    },
    /** The current user's created quizzes, with sharing details (owner sees the access code). */
    async listMine(userId) {
        const quizzes = await db_1.prisma.quiz.findMany({
            where: { creatorId: userId },
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { questions: true } } },
        });
        const sessions = await db_1.prisma.quizSession.findMany({
            where: { quizId: { in: quizzes.map((q) => q.id) } },
            select: { quizId: true, participants: { select: { score: true, completedAt: true } } },
        });
        const statsByQuiz = new Map();
        for (const s of sessions) {
            const e = statsByQuiz.get(s.quizId) ?? { count: 0, scored: 0, scoreSum: 0 };
            for (const p of s.participants) {
                e.count += 1;
                if (p.completedAt) {
                    e.scored += 1;
                    e.scoreSum += p.score;
                }
            }
            statsByQuiz.set(s.quizId, e);
        }
        return quizzes.map((q) => {
            const e = statsByQuiz.get(q.id);
            const accuracy = e && e.scored > 0 && q.totalPoints > 0 ? Math.round((e.scoreSum / e.scored / q.totalPoints) * 100) : 0;
            const { passwordHash, ...rest } = q;
            return {
                ...rest,
                status: (0, quiz_mappers_1.effectiveQuizStatus)(q),
                hasPassword: !!passwordHash,
                questionCount: q._count.questions,
                participants: e?.count ?? 0,
                accuracy,
            };
        });
    },
    /** Safe scheduling metadata for any published quiz (no questions/answers/password). */
    async info(id) {
        const quiz = await db_1.prisma.quiz.findUnique({
            where: { id },
            include: {
                _count: { select: { questions: true } },
                creator: { select: { displayName: true, username: true } },
            },
        });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        const participants = await db_1.prisma.participant.count({ where: { session: { quizId: id } } });
        return {
            id: quiz.id,
            title: quiz.title,
            subject: quiz.subject,
            questionCount: quiz._count.questions,
            durationMins: quiz.durationMins,
            scheduledAt: quiz.scheduledAt,
            status: (0, quiz_mappers_1.effectiveQuizStatus)(quiz),
            hostName: quiz.creator.displayName ?? quiz.creator.username,
            participants,
        };
    },
    async getById(id, userId) {
        const quiz = await db_1.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { orderBy: { orderIndex: "asc" } } },
        });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        const isCreator = quiz.creatorId === userId;
        if (isCreator)
            return quiz;
        if (quiz.quizType === "private") {
            throw ApiError_1.ApiError.forbidden("Join this private quiz with its code to view it");
        }
        return { ...quiz, questions: quiz.questions.map(quiz_mappers_1.stripAnswers) };
    },
    async update(id, data) {
        return db_1.prisma.quiz.update({ where: { id }, data });
    },
    async remove(id) {
        await db_1.prisma.quiz.delete({ where: { id } });
    },
    async addReminder(userId, quizId) {
        const quiz = await db_1.prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        await db_1.prisma.quizReminder.upsert({
            where: { userId_quizId: { userId, quizId } },
            create: { userId, quizId },
            update: {},
        });
    },
    async removeReminder(userId, quizId) {
        await db_1.prisma.quizReminder.deleteMany({ where: { userId, quizId } });
    },
    async listReminderQuizIds(userId) {
        const rows = await db_1.prisma.quizReminder.findMany({ where: { userId }, select: { quizId: true } });
        return rows.map((r) => r.quizId);
    },
    async publish(id) {
        const quiz = await db_1.prisma.quiz.findUnique({ where: { id } });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        return db_1.prisma.quiz.update({
            where: { id },
            data: { status: quiz.scheduledAt ? "scheduled" : "waiting" },
        });
    },
};
//# sourceMappingURL=quiz.service.js.map