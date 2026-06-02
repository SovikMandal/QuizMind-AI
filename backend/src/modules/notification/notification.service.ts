import { NotificationType } from "@prisma/client";
import { prisma } from "../../config/db";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

const DAY = 86_400_000;

/** Lazily materializes time-based notifications so we don't need a background scheduler. */
async function syncDerived(userId: string) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, subscriptionEndsAt: true },
  });
  if (!user) return;

  // Subscription expiring within 5 days (at most one per expiry window).
  if (user.tier !== "free" && user.subscriptionEndsAt) {
    const fiveDays = new Date(now.getTime() + 5 * DAY);
    if (user.subscriptionEndsAt > now && user.subscriptionEndsAt <= fiveDays) {
      const windowStart = new Date(user.subscriptionEndsAt.getTime() - 5 * DAY);
      const exists = await prisma.notification.findFirst({
        where: { userId, type: "subscription_expiring", createdAt: { gte: windowStart } },
        select: { id: true },
      });
      if (!exists) {
        const days = Math.ceil((user.subscriptionEndsAt.getTime() - now.getTime()) / DAY);
        await prisma.notification.create({
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
  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: userId, status: "scheduled", scheduledAt: { gt: now, lte: soon } },
    select: { id: true, title: true },
  });
  for (const q of quizzes) {
    const link = `/join/${q.id}`;
    const exists = await prisma.notification.findFirst({
      where: { userId, type: "upcoming_quiz", link },
      select: { id: true },
    });
    if (!exists) {
      await prisma.notification.create({
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
  const reminders = await prisma.quizReminder.findMany({
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
    if (!q.scheduledAt || q.status === "draft") continue;
    const start = new Date(q.scheduledAt).getTime();
    const end = start + q.durationMins * 60_000;
    const t = now.getTime();

    if (!r.notifiedSoon && t < start && start - t <= 60 * 60_000) {
      await prisma.notification.create({
        data: {
          userId,
          type: "upcoming_quiz",
          title: "Your quiz starts soon",
          body: `"${q.title}" starts in less than an hour. Get ready!`,
          link: `/join/${q.id}`,
        },
      });
      await prisma.quizReminder.update({ where: { id: r.id }, data: { notifiedSoon: true } });
    }

    if (!r.notifiedLive && t >= start && t < end) {
      await prisma.notification.create({
        data: {
          userId,
          type: "upcoming_quiz",
          title: "Your quiz is live now",
          body: `"${q.title}" is live — join now!`,
          link: `/join/${q.id}`,
        },
      });
      await prisma.quizReminder.update({ where: { id: r.id }, data: { notifiedLive: true } });
    }
  }
}

export const NotificationService = {
  create(input: NotifyInput) {
    return prisma.notification.create({ data: input });
  },

  async list(userId: string) {
    await syncDerived(userId);
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async unreadCount(userId: string) {
    await syncDerived(userId);
    return prisma.notification.count({ where: { userId, read: false } });
  },

  async markRead(userId: string, id: string) {
    await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },

  async remove(userId: string, id: string) {
    await prisma.notification.deleteMany({ where: { id, userId } });
  },
};
