import { RequestHandler } from "express";
import { AnalyticsService } from "./analytics.service";

export const results: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await AnalyticsService.results(req.params.id, req.user!.id));
};

export const leaderboard: RequestHandler<{ id: string }> = async (req, res) => {
  res.json({ leaderboard: await AnalyticsService.leaderboard(req.params.id) });
};

export const analytics: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await AnalyticsService.analytics(req.params.id, req.user!.id));
};

export const history: RequestHandler = async (req, res) => {
  res.json(await AnalyticsService.history(req.user!.id));
};
