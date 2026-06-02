import { RequestHandler } from "express";
import { NotificationService } from "./notification.service";

export const list: RequestHandler = async (req, res) => {
  res.json({ notifications: await NotificationService.list(req.user!.id) });
};

export const unreadCount: RequestHandler = async (req, res) => {
  res.json({ count: await NotificationService.unreadCount(req.user!.id) });
};

export const markRead: RequestHandler<{ id: string }> = async (req, res) => {
  await NotificationService.markRead(req.user!.id, req.params.id);
  res.json({ ok: true });
};

export const markAllRead: RequestHandler = async (req, res) => {
  await NotificationService.markAllRead(req.user!.id);
  res.json({ ok: true });
};

export const remove: RequestHandler<{ id: string }> = async (req, res) => {
  await NotificationService.remove(req.user!.id, req.params.id);
  res.json({ ok: true });
};
