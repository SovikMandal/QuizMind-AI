import { RequestHandler } from "express";
import { AiService } from "./ai.service";

export const generateQuestions: RequestHandler = async (req, res) => {
  const questions = await AiService.generateQuestions(req.body);
  res.json({ questions });
};
