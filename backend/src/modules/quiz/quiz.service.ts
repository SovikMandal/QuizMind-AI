import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { generateUniqueAccessCode } from "../../utils/generateAccessCode";
import { stripAnswers, effectiveQuizStatus } from "./quiz.mappers";
import { CreateQuizInput, UpdateQuizInput, ListQuizQuery } from "./quiz.schemas";
import { NotificationService } from "../notification/notification.service";

export const TIER_QUIZ_LIMITS = { free: 10, pro: 30, premium: 120 } as const;

export const QuizService = {
  async create(userId: string, input: CreateQuizInput) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
    const limit = TIER_QUIZ_LIMITS[user?.tier ?? "free"];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const usedThisMonth = await prisma.quiz.count({
      where: { creatorId: userId, createdAt: { gte: startOfMonth } },
    });
    if (usedThisMonth >= limit) {
      throw ApiError.forbidden(`Monthly quiz limit reached (${limit}/month for your plan). Upgrade to create more.`);
    }

    const isPrivate = input.quizType === "private";
    const totalPoints = input.questions.reduce((sum, q) => sum + (q.points ?? 10), 0);

    const quiz = await prisma.quiz.create({
      data: {
        creatorId: userId,
        title: input.title,
        description: input.description,
        subject: input.subject,
        difficulty: input.difficulty,
        quizType: input.quizType,
        allowLateJoin: input.allowLateJoin,
        timeLimitSecs: input.timeLimitSecs,
        durationMins: input.durationMins,
        scheduledAt: input.scheduledAt,
        totalPoints,
        accessCode: isPrivate ? await generateUniqueAccessCode() : null,
        passwordHash: isPrivate ? await hashPassword(input.password!) : null,
        questions: {
          create: input.questions.map((q, i) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: (q.options ?? undefined) as Prisma.InputJsonValue | undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            timeLimitSecs: q.timeLimitSecs,
            difficulty: q.difficulty,
            topicTag: q.topicTag,
            orderIndex: i,
          })),
        },
      },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });

    if (usedThisMonth + 1 >= limit) {
      await NotificationService.create({
        userId,
        type: "quiz_limit_reached",
        title: "Monthly quiz limit reached",
        body: `You've used all ${limit} quizzes in your plan this month. Upgrade to create more.`,
        link: "/pricing",
      });
    }
    return quiz;
  },

  async list(query: ListQuizQuery) {
    const where: Prisma.QuizWhereInput = {
      ...(query.subject && { subject: query.subject }),
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.search && { title: { contains: query.search, mode: "insensitive" } }),
    };

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: {
          _count: { select: { questions: true } },
          creator: { select: { displayName: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    // Participant counts + average accuracy per quiz (across all of its sessions).
    const sessions = await prisma.quizSession.findMany({
      where: { quizId: { in: quizzes.map((q) => q.id) } },
      select: { quizId: true, participants: { select: { score: true, completedAt: true } } },
    });
    const statsByQuiz = new Map<string, { count: number; scored: number; scoreSum: number }>();
    for (const s of sessions) {
      const e = statsByQuiz.get(s.quizId) ?? { count: 0, scored: 0, scoreSum: 0 };
      for (const p of s.participants) {
        e.count += 1;
        if (p.completedAt) {
          e.scored += 1;
          e.scoreSum += p.score;
        }
      }
      statsByQuiz.set(s.quizId, e);
    }

    return {
      quizzes: quizzes.map((q) => {
        const e = statsByQuiz.get(q.id);
        const accuracy =
          e && e.scored > 0 && q.totalPoints > 0
            ? Math.round((e.scoreSum / e.scored / q.totalPoints) * 100)
            : 0;
        const { passwordHash: _pw, accessCode: _ac, ...rest } = q;
        return { ...rest, status: effectiveQuizStatus(q), participants: e?.count ?? 0, accuracy };
      }),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  },

  /** The current user's created quizzes, with sharing details (owner sees the access code). */
  async listMine(userId: string) {
    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true } } },
    });
    const sessions = await prisma.quizSession.findMany({
      where: { quizId: { in: quizzes.map((q) => q.id) } },
      select: { quizId: true, participants: { select: { score: true, completedAt: true } } },
    });
    const statsByQuiz = new Map<string, { count: number; scored: number; scoreSum: number }>();
    for (const s of sessions) {
      const e = statsByQuiz.get(s.quizId) ?? { count: 0, scored: 0, scoreSum: 0 };
      for (const p of s.participants) {
        e.count += 1;
        if (p.completedAt) {
          e.scored += 1;
          e.scoreSum += p.score;
        }
      }
      statsByQuiz.set(s.quizId, e);
    }
    return quizzes.map((q) => {
      const e = statsByQuiz.get(q.id);
      const accuracy =
        e && e.scored > 0 && q.totalPoints > 0 ? Math.round((e.scoreSum / e.scored / q.totalPoints) * 100) : 0;
      const { passwordHash, ...rest } = q;
      return {
        ...rest,
        status: effectiveQuizStatus(q),
        hasPassword: !!passwordHash,
        questionCount: q._count.questions,
        participants: e?.count ?? 0,
        accuracy,
      };
    });
  },

  /** Safe scheduling metadata for any published quiz (no questions/answers/password). */
  async info(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true } },
        creator: { select: { displayName: true, username: true } },
      },
    });
    if (!quiz) throw ApiError.notFound("Quiz not found");
    const participants = await prisma.participant.count({ where: { session: { quizId: id } } });
    return {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      questionCount: quiz._count.questions,
      durationMins: quiz.durationMins,
      scheduledAt: quiz.scheduledAt,
      status: effectiveQuizStatus(quiz),
      hostName: quiz.creator.displayName ?? quiz.creator.username,
      participants,
    };
  },

  async getById(id: string, userId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });
    if (!quiz) throw ApiError.notFound("Quiz not found");

    const isCreator = quiz.creatorId === userId;
    if (isCreator) return quiz;
    if (quiz.quizType === "private") {
      throw ApiError.forbidden("Join this private quiz with its code to view it");
    }
    return { ...quiz, questions: quiz.questions.map(stripAnswers) };
  },

  async update(id: string, data: UpdateQuizInput) {
    return prisma.quiz.update({ where: { id }, data });
  },

  async remove(id: string) {
    await prisma.quiz.delete({ where: { id } });
  },

  async addReminder(userId: string, quizId: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
    if (!quiz) throw ApiError.notFound("Quiz not found");
    await prisma.quizReminder.upsert({
      where: { userId_quizId: { userId, quizId } },
      create: { userId, quizId },
      update: {},
    });
  },

  async removeReminder(userId: string, quizId: string) {
    await prisma.quizReminder.deleteMany({ where: { userId, quizId } });
  },

  async listReminderQuizIds(userId: string) {
    const rows = await prisma.quizReminder.findMany({ where: { userId }, select: { quizId: true } });
    return rows.map((r) => r.quizId);
  },

  async publish(id: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw ApiError.notFound("Quiz not found");
    return prisma.quiz.update({
      where: { id },
      data: { status: quiz.scheduledAt ? "scheduled" : "waiting" },
    });
  },
};
