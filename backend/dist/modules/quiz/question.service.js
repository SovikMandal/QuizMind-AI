"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const quiz_mappers_1 = require("./quiz.mappers");
async function recalcTotalPoints(quizId) {
    const agg = await db_1.prisma.question.aggregate({
        where: { quizId },
        _sum: { points: true },
    });
    await db_1.prisma.quiz.update({
        where: { id: quizId },
        data: { totalPoints: agg._sum.points ?? 0 },
    });
}
/** Loads a question with its quiz and asserts the requester owns the quiz. */
async function getOwnedQuestion(questionId, userId) {
    const question = await db_1.prisma.question.findUnique({
        where: { id: questionId },
        include: { quiz: { select: { creatorId: true } } },
    });
    if (!question)
        throw ApiError_1.ApiError.notFound("Question not found");
    if (question.quiz.creatorId !== userId)
        throw ApiError_1.ApiError.forbidden();
    return question;
}
exports.QuestionService = {
    async listForQuiz(quizId, userId) {
        const quiz = await db_1.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { orderBy: { orderIndex: "asc" } } },
        });
        if (!quiz)
            throw ApiError_1.ApiError.notFound("Quiz not found");
        const isCreator = quiz.creatorId === userId;
        if (isCreator)
            return quiz.questions;
        if (quiz.quizType === "private")
            throw ApiError_1.ApiError.forbidden();
        return quiz.questions.map(quiz_mappers_1.stripAnswers);
    },
    async add(quizId, input) {
        const count = await db_1.prisma.question.count({ where: { quizId } });
        const question = await db_1.prisma.question.create({
            data: {
                quizId,
                questionText: input.questionText,
                questionType: input.questionType,
                options: (input.options ?? undefined),
                correctAnswer: input.correctAnswer,
                explanation: input.explanation,
                points: input.points,
                timeLimitSecs: input.timeLimitSecs,
                difficulty: input.difficulty,
                topicTag: input.topicTag,
                orderIndex: count,
            },
        });
        await recalcTotalPoints(quizId);
        return question;
    },
    async update(questionId, userId, data) {
        const existing = await getOwnedQuestion(questionId, userId);
        const question = await db_1.prisma.question.update({
            where: { id: questionId },
            data: {
                ...data,
                options: (data.options ?? undefined),
            },
        });
        if (data.points !== undefined)
            await recalcTotalPoints(existing.quizId);
        return question;
    },
    async remove(questionId, userId) {
        const existing = await getOwnedQuestion(questionId, userId);
        await db_1.prisma.question.delete({ where: { id: questionId } });
        await recalcTotalPoints(existing.quizId);
    },
};
//# sourceMappingURL=question.service.js.map