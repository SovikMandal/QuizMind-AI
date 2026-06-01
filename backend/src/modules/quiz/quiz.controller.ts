import { RequestHandler } from "express";
import { QuizService } from "./quiz.service";
import { listQuizQuerySchema } from "./quiz.schemas";

export const create: RequestHandler = async (req, res) => {
  const quiz = await QuizService.create(req.user!.id, req.body);
  res.status(201).json({ quiz });
};

export const list: RequestHandler = async (req, res) => {
  const query = listQuizQuerySchema.parse(req.query);
  res.json(await QuizService.list(query));
};

export const listMine: RequestHandler = async (req, res) => {
  res.json({ quizzes: await QuizService.listMine(req.user!.id) });
};

export const getOne: RequestHandler<{ id: string }> = async (req, res) => {
  const quiz = await QuizService.getById(req.params.id, req.user!.id);
  res.json({ quiz });
};

export const info: RequestHandler<{ id: string }> = async (req, res) => {
  res.json({ quiz: await QuizService.info(req.params.id) });
};

export const update: RequestHandler<{ id: string }> = async (req, res) => {
  const quiz = await QuizService.update(req.params.id, req.body);
  res.json({ quiz });
};

export const remove: RequestHandler<{ id: string }> = async (req, res) => {
  await QuizService.remove(req.params.id);
  res.status(204).send();
};

export const publish: RequestHandler<{ id: string }> = async (req, res) => {
  const quiz = await QuizService.publish(req.params.id);
  res.json({ quiz });
};
