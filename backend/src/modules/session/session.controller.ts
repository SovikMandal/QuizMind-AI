import { RequestHandler } from "express";
import { SessionService } from "./session.service";

export const join: RequestHandler = async (req, res) => {
  const result = await SessionService.join(req.user!.id, req.body);
  res.status(201).json(result);
};

export const listLive: RequestHandler = async (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const offset = Number(req.query.offset ?? 0);
  res.json({ sessions: await SessionService.listLive(limit, offset) });
};

export const getOne: RequestHandler<{ id: string }> = async (req, res) => {
  res.json({ session: await SessionService.getById(req.params.id) });
};

export const submit: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await SessionService.submitAttempt(req.user!.id, req.params.id, req.body.answers));
};
