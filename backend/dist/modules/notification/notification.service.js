"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = require("../../config/db");
const DAY = 86_400_000;
/** Lazily materializes time-based notifications so we don't need a background scheduler. */
async function syncDerived(userId) {
    const now = new Date();
    // Notifications expire after 5 days — purge from the DB (and thus from every client).
    await db_1.prisma.notification.deleteMany({
        where: { userId, createdAt: { lt: new Date(now.getTime() - 5 * DAY) } },
    });
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, subscriptionEndsAt: true },
    });
    if (!user)
        return;
    // Subscription expiring within 5 days (at most one per expiry window).
    if (user.tier !== "free" && user.subscriptionEndsAt) {
        const fiveDays = new Date(now.getTime() + 5 * DAY);
        if (user.subscriptionEndsAt > now && user.subscriptionEndsAt <= fiveDays) {
            const windowStart = new Date(user.subscriptionEndsAt.getTime() - 5 * DAY);
            const exists = await db_1.prisma.notification.findFirst({
                where: { userId, type: "subscription_expiring", createdAt: { gte: windowStart } },
                select: { id: true },
            });
            if (!exists) {
                const days = Math.ceil((user.subscriptionEndsAt.getTime() - now.getTime()) / DAY);
                await db_1.prisma.notification.create({
                    data: {
                        userId,
                        type: "subscription_expiring",
                        title: "Your subscription is expiring soon",
                        body: `Your plan ends in ${days} day${days === 1 ? "" : "s"}. Renew to keep your benefits.`,
                        link: "/pricing",
                    },
                });
            }
        }
    }
    // The user's own scheduled quizzes going live within 24h (deduped by link).
    const soon = new Date(now.getTime() + DAY);
    const quizzes = await db_1.prisma.quiz.findMany({
        where: { creatorId: userId, status: "scheduled", scheduledAt: { gt: now, lte: soon } },
        select: { id: true, title: true },
    });
    for (const q of quizzes) {
        const link = `/join/${q.id}`;
        const exists = await db_1.prisma.notification.findFirst({
            where: { userId, type: "upcoming_quiz", link },
            select: { id: true },
        });
        if (!exists) {
            await db_1.prisma.notification.create({
                data: {
                    userId,
                    type: "upcoming_quiz",
                    title: "Upcoming quiz starting soon",
                    body: `"${q.title}" goes live within the next 24 hours.`,
                    link,
                },
            });
        }
    }
    // Quizzes the user asked to be reminded about: one alert before start, one when live.
    const reminders = await db_1.prisma.quizReminder.findMany({
        where: { userId, OR: [{ notifiedSoon: false }, { notifiedLive: false }] },
        select: {
            id: true,
            notifiedSoon: true,
            notifiedLive: true,
            quiz: { select: { id: true, title: true, scheduledAt: true, durationMins: true, status: true } },
        },
    });
    for (const r of reminders) {
        const q = r.quiz;
        if (!q.scheduledAt || q.status === "draft")
            continue;
        const start = new Date(q.scheduledAt).getTime();
        const end = start + q.durationMins * 60_000;
        const t = now.getTime();
        if (!r.notifiedSoon && t < start && start - t <= 60 * 60_000) {
            await db_1.prisma.notification.create({
                data: {
                    userId,
                    type: "upcoming_quiz",
                    title: "Your quiz starts soon",
                    body: `"${q.title}" starts in less than an hour. Get ready!`,
                    link: `/join/${q.id}`,
                },
            });
            await db_1.prisma.quizReminder.update({ where: { id: r.id }, data: { notifiedSoon: true } });
        }
        if (!r.notifiedLive && t >= start && t < end) {
            await db_1.prisma.notification.create({
                data: {
                    userId,
                    type: "upcoming_quiz",
                    title: "Your quiz is live now",
                    body: `"${q.title}" is live — join now!`,
                    link: `/join/${q.id}`,
                },
            });
            await db_1.prisma.quizReminder.update({ where: { id: r.id }, data: { notifiedLive: true } });
        }
    }
}
exports.NotificationService = {
    create(input) {
        return db_1.prisma.notification.create({ data: input });
    },
    async list(userId) {
        await syncDerived(userId);
        return db_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    },
    async unreadCount(userId) {
        await syncDerived(userId);
        return db_1.prisma.notification.count({ where: { userId, read: false } });
    },
    async markRead(userId, id) {
        await db_1.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    },
    async markAllRead(userId) {
        await db_1.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    },
    async remove(userId, id) {
        await db_1.prisma.notification.deleteMany({ where: { id, userId } });
    },
};
//# sourceMappingURL=notification.service.js.map