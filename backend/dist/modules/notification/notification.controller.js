"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.markAllRead = exports.markRead = exports.unreadCount = exports.list = void 0;
const notification_service_1 = require("./notification.service");
const list = async (req, res) => {
    res.json({ notifications: await notification_service_1.NotificationService.list(req.user.id) });
};
exports.list = list;
const unreadCount = async (req, res) => {
    res.json({ count: await notification_service_1.NotificationService.unreadCount(req.user.id) });
};
exports.unreadCount = unreadCount;
const markRead = async (req, res) => {
    await notification_service_1.NotificationService.markRead(req.user.id, req.params.id);
    res.json({ ok: true });
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    await notification_service_1.NotificationService.markAllRead(req.user.id);
    res.json({ ok: true });
};
exports.markAllRead = markAllRead;
const remove = async (req, res) => {
    await notification_service_1.NotificationService.remove(req.user.id, req.params.id);
    res.json({ ok: true });
};
exports.remove = remove;
//# sourceMappingURL=notification.controller.js.map