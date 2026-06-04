"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.getDashboard = exports.getStats = exports.updateMe = exports.getMe = void 0;
const user_service_1 = require("./user.service");
const ApiError_1 = require("../../utils/ApiError");
const cloudinary_1 = require("../../config/cloudinary");
const getMe = async (req, res) => {
    const user = await user_service_1.UserService.getProfile(req.user.id);
    res.json({ user });
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    const user = await user_service_1.UserService.updateProfile(req.user.id, req.body);
    res.json({ user });
};
exports.updateMe = updateMe;
const getStats = async (req, res) => {
    const stats = await user_service_1.UserService.getStats(req.user.id);
    res.json({ stats });
};
exports.getStats = getStats;
const getDashboard = async (req, res) => {
    res.json(await user_service_1.UserService.getDashboard(req.user.id));
};
exports.getDashboard = getDashboard;
const uploadAvatar = async (req, res) => {
    if (!req.file)
        throw ApiError_1.ApiError.badRequest("No image uploaded");
    if (!cloudinary_1.isCloudinaryConfigured) {
        throw new ApiError_1.ApiError(503, "Image upload is not configured (set CLOUDINARY_* env vars)");
    }
    const secureUrl = await (0, cloudinary_1.uploadImage)(req.file.buffer);
    const user = await user_service_1.UserService.updateProfile(req.user.id, { avatarUrl: secureUrl });
    res.json({ user });
};
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=user.controller.js.map