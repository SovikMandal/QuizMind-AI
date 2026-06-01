"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const password_1 = require("../../utils/password");
const generateAccessCode_1 = require("../../utils/generateAccessCode");
const quiz_mappers_1 = require("./quiz.mappers");
exports.QuizService = {
    async create(userId, input) {
        const isPrivate = input.quizType === "private";
        const totalPoints = input.questions.reduce((sum, q) => sum + (q.points ?? 10), 0);
        return db_1.prisma.quiz.create({
            data: {
                creatorId: userId,
                title: input.title,
                description: input.description,
                subject: input.subject,
                difficulty: input.difficulty,
                quizType: input.quizType,
                allowLateJoin: input.allowLateJoin,
                timeLimitSecs: input.timeLimitSecs,
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
    },
    async list(query) {
        const where = {
            quizType: "public",
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
                include: { _count: { select: { questions: true } } },
            }),
            db_1.prisma.quiz.count({ where }),
        ]);
        return { quizzes, total, limit: query.limit, offset: query.offset };
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