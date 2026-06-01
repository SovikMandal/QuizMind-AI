"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const password_1 = require("../../utils/password");
const quiz_mappers_1 = require("../quiz/quiz.mappers");
function publicQuiz(quiz) {
    const { passwordHash: _p, ...rest } = quiz;
    return rest;
}
exports.SessionService = {
    async join(userId, input) {
        // Resolve the quiz from either a private access code or a public quiz id.
        const quiz = input.accessCode
            ? await db_1.prisma.quiz.findUnique({ where: { accessCode: input.accessCode } })
            : await db_1.prisma.quiz.findUnique({ where: { id: input.quizId } });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        if (quiz.quizType === "private") {
            if (!input.accessCode)
                throw ApiError_1.ApiError.forbidden("Private quiz requires an access code");
            if (quiz.passwordHash) {
                if (!input.password || !(await (0, password_1.verifyPassword)(input.password, quiz.passwordHash))) {
                    throw ApiError_1.ApiError.unauthorized("Invalid quiz password");
                }
            }
        }
        if (quiz.status === "draft")
            throw ApiError_1.ApiError.badRequest("Quiz is not published yet");
        if (quiz.status === "ended" && !quiz.allowLateJoin) {
            throw ApiError_1.ApiError.badRequest("This quiz has ended");
        }
        // Reuse an active session for this quiz, otherwise open one.
        let session = await db_1.prisma.quizSession.findFirst({
            where: { quizId: quiz.id, status: { in: ["waiting", "live"] } },
            orderBy: { createdAt: "desc" },
        });
        if (!session) {
            session = await db_1.prisma.quizSession.create({
                data: { quizId: quiz.id, hostId: quiz.creatorId, status: "waiting" },
            });
        }
        // One participant record per user per session.
        let participant = await db_1.prisma.participant.findFirst({
            where: { sessionId: session.id, userId },
        });
        if (!participant) {
            participant = await db_1.prisma.participant.create({
                data: { sessionId: session.id, userId },
            });
        }
        const questions = await db_1.prisma.question.findMany({
            where: { quizId: quiz.id },
            orderBy: { orderIndex: "asc" },
        });
        return {
            sessionId: session.id,
            participantId: participant.id,
            status: session.status,
            quiz: { ...publicQuiz(quiz), questions: questions.map(quiz_mappers_1.stripAnswers) },
        };
    },
    async listLive(limit = 20, offset = 0) {
        const sessions = await db_1.prisma.quizSession.findMany({
            where: { status: "live", quiz: { quizType: "public" } },
            orderBy: { startedAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                quiz: { select: { id: true, title: true, subject: true, difficulty: true } },
                _count: { select: { participants: true } },
            },
        });
        return sessions.map((s) => ({
            id: s.id,
            quizId: s.quiz.id,
            title: s.quiz.title,
            subject: s.quiz.subject,
            difficulty: s.quiz.difficulty,
            participants: s._count.participants,
            status: s.status,
            startedAt: s.startedAt,
        }));
    },
    async getById(id) {
        const session = await db_1.prisma.quizSession.findUnique({
            where: { id },
            include: {
                quiz: true,
                _count: { select: { participants: true } },
            },
        });
        if (!session)
            throw ApiError_1.ApiError.notFound("Session not found");
        return {
            id: session.id,
            status: session.status,
            currentQIndex: session.currentQIndex,
            participantCount: session._count.participants,
            quiz: publicQuiz(session.quiz),
        };
    },
};
//# sourceMappingURL=session.service.js.map