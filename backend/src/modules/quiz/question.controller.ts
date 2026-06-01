import { RequestHandler } from "express";
import { QuestionService } from "./question.service";

export const list: RequestHandler<{ id: string }> = async (req, res) => {
  const questions = await QuestionService.listForQuiz(req.params.id, req.user!.id);
  res.json({ questions });
};

export const add: RequestHandler<{ id: string }> = async (req, res) => {
  const question = await QuestionService.add(req.params.id, req.body);
  res.status(201).json({ question });
};

export const update: RequestHandler<{ id: string }> = async (req, res) => {
  const question = await QuestionService.update(req.params.id, req.user!.id, req.body);
  res.json({ question });
};

export const remove: RequestHandler<{ id: string }> = async (req, res) => {
  await QuestionService.remove(req.params.id, req.user!.id);
  res.status(204).send();
};
