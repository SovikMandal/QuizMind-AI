import { RequestHandler } from "express";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

/** Loads the quiz from :id and ensures the requester is its creator. */
export const isQuizCreator: RequestHandler<{ id: string }> = async (req, res, next) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound("Quiz not found");
  if (quiz.creatorId !== req.user!.id) throw ApiError.forbidden();
  res.locals.quiz = quiz;
  next();
};
