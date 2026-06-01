import { Quiz } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { verifyPassword } from "../../utils/password";
import { stripAnswers, effectiveQuizStatus } from "../quiz/quiz.mappers";
import { JoinInput } from "./session.schemas";

function publicQuiz(quiz: Quiz) {
  const { passwordHash: _p, ...rest } = quiz;
  return rest;
}

export const SessionService = {
  async join(userId: string, input: JoinInput) {
    // Resolve the quiz from either a private access code or a public quiz id.
    const quiz = input.accessCode
      ? await prisma.quiz.findUnique({ where: { accessCode: input.accessCode } })
      : await prisma.quiz.findUnique({ where: { id: input.quizId } });
    if (!quiz) throw ApiError.notFound("Quiz not found");

    if (quiz.quizType === "private") {
      if (quiz.passwordHash) {
        if (!input.password || !(await verifyPassword(input.password, quiz.passwordHash))) {
          throw ApiError.unauthorized("Invalid quiz password");
        }
      } else if (!input.accessCode) {
        throw ApiError.forbidden("Private quiz requires an access code");
      }
    }

    const status = effectiveQuizStatus(quiz);
    if (status === "draft") throw ApiError.badRequest("Quiz is not published yet");
    if (status === "scheduled") throw ApiError.badRequest("This quiz hasn't started yet");

    // Reuse an active session for this quiz, otherwise open one.
    let session = await prisma.quizSession.findFirst({
      where: { quizId: quiz.id, status: { in: ["waiting", "live"] } },
      orderBy: { createdAt: "desc" },
    });
    if (!session) {
      session = await prisma.quizSession.create({
        data: { quizId: quiz.id, hostId: quiz.creatorId, status: "waiting" },
      });
    }

    // One participant record per user per session.
    let participant = await prisma.participant.findFirst({
      where: { sessionId: session.id, userId },
    });
    if (!participant) {
      participant = await prisma.participant.create({
        data: { sessionId: session.id, userId },
      });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: quiz.id },
      orderBy: { orderIndex: "asc" },
    });

    // Saved answers for this participant (so a revisit shows their first attempt, read-only).
    const saved = await prisma.answer.findMany({
      where: { participantId: participant.id },
      select: { questionId: true, submittedAnswer: true },
    });
    const savedAnswers: Record<string, string> = {};
    for (const a of saved) savedAnswers[a.questionId] = a.submittedAnswer ?? "";

    return {
      sessionId: session.id,
      participantId: participant.id,
      status: session.status,
      completed: !!participant.completedAt,
      savedAnswers,
      quiz: { ...publicQuiz(quiz), questions: questions.map(stripAnswers) },
    };
  },

  async listLive(limit = 20, offset = 0) {
    const sessions = await prisma.quizSession.findMany({
      where: { status: "live", quiz: { quizType: "public" } },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        quiz: { select: { id: true, title: true, subject: true, difficulty: true } },
        _count: { select: { participants: true } },
      },
    });
    return sessions.map((s) => ({
      id: s.id,
      quizId: s.quiz.id,
      title: s.quiz.title,
      subject: s.quiz.subject,
      difficulty: s.quiz.difficulty,
      participants: s._count.participants,
      status: s.status,
      startedAt: s.startedAt,
    }));
  },

  async getById(id: string) {
    const session = await prisma.quizSession.findUnique({
      where: { id },
      include: {
        quiz: true,
        _count: { select: { participants: true } },
      },
    });
    if (!session) throw ApiError.notFound("Session not found");
    return {
      id: session.id,
      status: session.status,
      currentQIndex: session.currentQIndex,
      participantCount: session._count.participants,
      quiz: publicQuiz(session.quiz),
    };
  },

  /** Self-paced (async) attempt: scores submitted answers against the DB and stores results. */
  async submitAttempt(
    userId: string,
    sessionId: string,
    answers: { questionId: string; answer: string; timeTaken?: number }[]
  ) {
    const participant = await prisma.participant.findFirst({
      where: { sessionId, userId },
      include: { session: { select: { quizId: true } } },
    });
    if (!participant) throw ApiError.notFound("Join the quiz first");
    if (participant.completedAt) throw ApiError.badRequest("You already completed this quiz");

    const questions = await prisma.question.findMany({
      where: { quizId: participant.session.quizId },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));

    let score = 0;
    const rows = answers
      .filter((a) => byId.has(a.questionId))
      .map((a) => {
        const q = byId.get(a.questionId)!;
        const isCorrect = String(a.answer) === q.correctAnswer;
        const pointsEarned = isCorrect ? q.points : 0;
        score += pointsEarned;
        return {
          participantId: participant.id,
          questionId: q.id,
          submittedAnswer: String(a.answer),
          isCorrect,
          pointsEarned,
          timeTakenSecs: a.timeTaken ?? null,
        };
      });

    await prisma.$transaction([
      prisma.answer.createMany({ data: rows, skipDuplicates: true }),
      prisma.participant.update({
        where: { id: participant.id },
        data: { score, completedAt: new Date(), attemptType: "later" },
      }),
    ]);

    return { sessionId, score };
  },
};
