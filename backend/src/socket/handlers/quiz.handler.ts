import { Namespace, Socket } from "socket.io";
import { prisma } from "../../config/db";
import { State, SessionState } from "../state";
import { stripAnswers } from "../../modules/quiz/quiz.mappers";
import { logger } from "../../utils/logger";

const room = (sessionId: string) => `session:${sessionId}`;
const timers = new Map<string, NodeJS.Timeout>();

function clearTimer(sessionId: string) {
  const t = timers.get(sessionId);
  if (t) {
    clearTimeout(t);
    timers.delete(sessionId);
  }
}

async function startQuestion(nsp: Namespace, sessionId: string, index: number) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { quiz: true },
  });
  if (!session) return;

  const questions = await prisma.question.findMany({
    where: { quizId: session.quizId },
    orderBy: { orderIndex: "asc" },
  });
  if (index >= questions.length) return endQuiz(nsp, sessionId);

  const question = questions[index];
  const timeLimit = question.timeLimitSecs ?? session.quiz.timeLimitSecs;
  const state: SessionState = {
    status: "live",
    currentQuestionIndex: index,
    questionId: question.id,
    questionStartedAt: Date.now(),
    timeLimitSecs: timeLimit,
    totalQuestions: questions.length,
    questionEnded: false,
  };
  await State.set(sessionId, state);
  await prisma.quizSession.update({ where: { id: sessionId }, data: { currentQIndex: index } });

  nsp.to(room(sessionId)).emit("question_started", {
    question: stripAnswers(question),
    questionIndex: index,
    total: questions.length,
    timeLimit,
  });

  clearTimer(sessionId);
  timers.set(sessionId, setTimeout(() => void endQuestion(nsp, sessionId), timeLimit * 1000));
}

async function endQuestion(nsp: Namespace, sessionId: string) {
  clearTimer(sessionId);
  const state = await State.get(sessionId);
  if (!state || state.questionEnded || !state.questionId) return;

  const question = await prisma.question.findUnique({ where: { id: state.questionId } });
  if (!question) return;

  state.questionEnded = true;
  await State.set(sessionId, state);

  nsp.to(room(sessionId)).emit("question_ended", {
    questionId: question.id,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    leaderboard: await State.leaderboard(sessionId),
  });
}

async function endQuiz(nsp: Namespace, sessionId: string) {
  clearTimer(sessionId);
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session || session.status === "ended") return;

  const questions = await prisma.question.findMany({
    where: { quizId: session.quizId },
    select: { id: true },
  });

  // Flush answers from Redis to Postgres.
  const rows = [];
  for (const q of questions) {
    const answers = await State.allAnswers(sessionId, q.id);
    for (const [participantId, value] of Object.entries(answers)) {
      const [submittedAnswer, time, correct, points] = value.split("|");
      rows.push({
        participantId,
        questionId: q.id,
        submittedAnswer,
        isCorrect: correct === "1",
        pointsEarned: Number(points),
        timeTakenSecs: Number(time),
      });
    }
  }
  if (rows.length) await prisma.answer.createMany({ data: rows, skipDuplicates: true });

  const leaderboard = await State.leaderboard(sessionId);
  await prisma.$transaction(
    leaderboard.map((e) =>
      prisma.participant.update({
        where: { id: e.participantId },
        data: { score: e.score, rank: e.rank, completedAt: new Date() },
      })
    )
  );
  await prisma.quizSession.update({
    where: { id: sessionId },
    data: { status: "ended", endedAt: new Date() },
  });
  await prisma.quiz.update({
    where: { id: session.quizId },
    data: { status: "ended", endedAt: new Date() },
  });

  nsp.to(room(sessionId)).emit("quiz_ended", { finalLeaderboard: leaderboard, sessionId });
  await State.cleanup(sessionId, questions.map((q) => q.id));
}

async function assertHost(socket: Socket, sessionId: string) {
  const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    socket.emit("error", { message: "Session not found" });
    return null;
  }
  if (session.hostId !== socket.data.userId) {
    socket.emit("error", { message: "Only the host can control the quiz" });
    return null;
  }
  return session;
}

export function registerQuizHandlers(nsp: Namespace, socket: Socket) {
  socket.on("join_room", async ({ sessionId, participantId }) => {
    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { user: true },
      });
      if (!participant || participant.sessionId !== sessionId) {
        return socket.emit("error", { message: "Invalid participant" });
      }
      socket.data.participantId = participantId;
      await socket.join(room(sessionId));

      const username = participant.user.displayName ?? participant.user.username;
      await State.addParticipant(sessionId, participantId, username);
      const participants = await State.participants(sessionId);

      nsp.to(room(sessionId)).emit("participant_joined", {
        participantId,
        username,
        totalCount: participants.length,
      });
      nsp.to(room(sessionId)).emit("waiting_room_update", { participants });
    } catch (e) {
      logger.error(`join_room error: ${e instanceof Error ? e.message : e}`);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("start_quiz", async ({ sessionId }) => {
    const session = await assertHost(socket, sessionId);
    if (!session) return;
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: { status: "live", startedAt: new Date() },
    });
    await prisma.quiz.update({
      where: { id: session.quizId },
      data: { status: "live", startedAt: new Date() },
    });
    const total = await prisma.question.count({ where: { quizId: session.quizId } });
    nsp.to(room(sessionId)).emit("quiz_started", { totalQuestions: total });
    await startQuestion(nsp, sessionId, 0);
  });

  socket.on("submit_answer", async ({ sessionId, questionId, answer, timeTaken }) => {
    const participantId = socket.data.participantId;
    if (!participantId) return socket.emit("error", { message: "Join the room first" });

    const state = await State.get(sessionId);
    if (!state || state.status !== "live" || state.questionEnded || state.questionId !== questionId) {
      return socket.emit("error", { message: "Question is not active" });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return socket.emit("error", { message: "Question not found" });

    const isCorrect = String(answer) === question.correctAnswer;
    const pointsEarned = isCorrect ? question.points : 0;
    const recorded = await State.recordAnswer(
      sessionId,
      questionId,
      participantId,
      `${answer}|${timeTaken ?? 0}|${isCorrect ? 1 : 0}|${pointsEarned}`
    );
    if (!recorded) return socket.emit("error", { message: "Already answered" });

    const currentScore = isCorrect
      ? await State.addScore(sessionId, participantId, pointsEarned)
      : await State.score(sessionId, participantId);

    socket.emit("answer_confirmed", { isCorrect, pointsEarned, currentScore });
    nsp.to(room(sessionId)).emit("leaderboard_update", {
      leaderboard: await State.leaderboard(sessionId, 9),
    });

    const [answered, participants] = await Promise.all([
      State.answeredCount(sessionId, questionId),
      State.participants(sessionId),
    ]);
    if (answered >= participants.length) await endQuestion(nsp, sessionId);
  });

  socket.on("next_question", async ({ sessionId }) => {
    const session = await assertHost(socket, sessionId);
    if (!session) return;
    const state = await State.get(sessionId);
    await startQuestion(nsp, sessionId, (state?.currentQuestionIndex ?? -1) + 1);
  });
}
