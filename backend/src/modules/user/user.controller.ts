import { RequestHandler } from "express";
import { UserService } from "./user.service";
import { ApiError } from "../../utils/ApiError";
import { uploadImage, isCloudinaryConfigured } from "../../config/cloudinary";

export const getMe: RequestHandler = async (req, res) => {
  const user = await UserService.getProfile(req.user!.id);
  res.json({ user });
};

export const updateMe: RequestHandler = async (req, res) => {
  const user = await UserService.updateProfile(req.user!.id, req.body);
  res.json({ user });
};

export const getStats: RequestHandler = async (req, res) => {
  const stats = await UserService.getStats(req.user!.id);
  res.json({ stats });
};

export const getDashboard: RequestHandler = async (req, res) => {
  res.json(await UserService.getDashboard(req.user!.id));
};

export const getGoals: RequestHandler = async (req, res) => {
  res.json({ goals: await UserService.getGoals(req.user!.id) });
};

export const updateGoals: RequestHandler = async (req, res) => {
  const goals = await UserService.updateGoals(req.user!.id, req.body);
  res.json({ goals });
};

export const uploadAvatar: RequestHandler = async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image uploaded");
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, "Image upload is not configured (set CLOUDINARY_* env vars)");
  }
  const secureUrl = await uploadImage(req.file.buffer);
  const user = await UserService.updateProfile(req.user!.id, { avatarUrl: secureUrl });
  res.json({ user });
};
