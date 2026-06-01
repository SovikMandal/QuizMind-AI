import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { stripAnswers } from "./quiz.mappers";
import { addQuestionSchema, updateQuestionSchema } from "./question.schemas";

type AddInput = z.infer<typeof addQuestionSchema>;
type UpdateInput = z.infer<typeof updateQuestionSchema>;

async function recalcTotalPoints(quizId: string) {
  const agg = await prisma.question.aggregate({
    where: { quizId },
    _sum: { points: true },
  });
  await prisma.quiz.update({
    where: { id: quizId },
    data: { totalPoints: agg._sum.points ?? 0 },
  });
}

/** Loads a question with its quiz and asserts the requester owns the quiz. */
async function getOwnedQuestion(questionId: string, userId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { select: { creatorId: true } } },
  });
  if (!question) throw ApiError.notFound("Question not found");
  if (question.quiz.creatorId !== userId) throw ApiError.forbidden();
  return question;
}

export const QuestionService = {
  async listForQuiz(quizId: string, userId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });
    if (!quiz) throw ApiError.notFound("Quiz not found");

    const isCreator = quiz.creatorId === userId;
    if (isCreator) return quiz.questions;
    if (quiz.quizType === "private") throw ApiError.forbidden();
    return quiz.questions.map(stripAnswers);
  },

  async add(quizId: string, input: AddInput) {
    const count = await prisma.question.count({ where: { quizId } });
    const question = await prisma.question.create({
      data: {
        quizId,
        questionText: input.questionText,
        questionType: input.questionType,
        options: (input.options ?? undefined) as Prisma.InputJsonValue | undefined,
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

  async update(questionId: string, userId: string, data: UpdateInput) {
    const existing = await getOwnedQuestion(questionId, userId);
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...data,
        options: (data.options ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    if (data.points !== undefined) await recalcTotalPoints(existing.quizId);
    return question;
  },

  async remove(questionId: string, userId: string) {
    const existing = await getOwnedQuestion(questionId, userId);
    await prisma.question.delete({ where: { id: questionId } });
    await recalcTotalPoints(existing.quizId);
  },
};
