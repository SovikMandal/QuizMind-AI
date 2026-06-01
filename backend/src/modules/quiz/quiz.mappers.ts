import { Question, Quiz, QuizStatus } from "@prisma/client";

type Option = { id?: string; text?: string; isCorrect?: boolean };

/** Derives the live lifecycle from the schedule: upcoming(scheduled) -> live -> ended(async). */
export function effectiveQuizStatus(quiz: Quiz): QuizStatus {
  if (quiz.status === "draft" || !quiz.scheduledAt) return quiz.status;
  const start = new Date(quiz.scheduledAt).getTime();
  const end = start + quiz.durationMins * 60_000;
  const now = Date.now();
  if (now < start) return "scheduled";
  if (now < end) return "live";
  return "ended";
}

/** Removes answer-revealing fields so participants can't see them before/while taking. */
export function stripAnswers(question: Question) {
  const { correctAnswer: _c, explanation: _e, options, ...rest } = question;
  const publicOptions = Array.isArray(options)
    ? (options as Option[]).map(({ isCorrect: _i, ...opt }) => opt)
    : options;
  return { ...rest, options: publicOptions };
}
