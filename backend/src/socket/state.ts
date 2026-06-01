import { redis } from "../config/redis";

const TTL = 60 * 60 * 24; // 24h

export interface SessionState {
  status: "live" | "ended";
  currentQuestionIndex: number;
  questionId: string | null;
  questionStartedAt: number;
  timeLimitSecs: number;
  totalQuestions: number;
  questionEnded: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  username: string;
  score: number;
}

const k = {
  state: (s: string) => `quiz:session:${s}:state`,
  scores: (s: string) => `quiz:session:${s}:scores`,
  names: (s: string) => `quiz:session:${s}:names`,
  answers: (s: string, q: string) => `quiz:session:${s}:answers:${q}`,
};

export const State = {
  async set(sessionId: string, state: SessionState) {
    await redis.set(k.state(sessionId), JSON.stringify(state), "EX", TTL);
  },
  async get(sessionId: string): Promise<SessionState | null> {
    const raw = await redis.get(k.state(sessionId));
    return raw ? (JSON.parse(raw) as SessionState) : null;
  },

  async addParticipant(sessionId: string, participantId: string, username: string) {
    await redis.hset(k.names(sessionId), participantId, username);
    await redis.expire(k.names(sessionId), TTL);
  },
  async participants(sessionId: string): Promise<{ id: string; username: string }[]> {
    const names = await redis.hgetall(k.names(sessionId));
    return Object.entries(names).map(([id, username]) => ({ id, username }));
  },

  /** Records an answer once; returns false if the participant already answered. */
  async recordAnswer(sessionId: string, questionId: string, participantId: string, value: string) {
    const added = await redis.hsetnx(k.answers(sessionId, questionId), participantId, value);
    await redis.expire(k.answers(sessionId, questionId), TTL);
    return added === 1;
  },
  async answeredCount(sessionId: string, questionId: string): Promise<number> {
    return redis.hlen(k.answers(sessionId, questionId));
  },
  async allAnswers(sessionId: string, questionId: string): Promise<Record<string, string>> {
    return redis.hgetall(k.answers(sessionId, questionId));
  },

  async addScore(sessionId: string, participantId: string, points: number): Promise<number> {
    await redis.expire(k.scores(sessionId), TTL);
    return Number(await redis.zincrby(k.scores(sessionId), points, participantId));
  },
  async score(sessionId: string, participantId: string): Promise<number> {
    const s = await redis.zscore(k.scores(sessionId), participantId);
    return s ? Number(s) : 0;
  },
  async leaderboard(sessionId: string, limit = -1): Promise<LeaderboardEntry[]> {
    const flat = await redis.zrevrange(k.scores(sessionId), 0, limit, "WITHSCORES");
    const names = await redis.hgetall(k.names(sessionId));
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      const participantId = flat[i];
      entries.push({
        rank: i / 2 + 1,
        participantId,
        username: names[participantId] ?? "Player",
        score: Number(flat[i + 1]),
      });
    }
    return entries;
  },

  async cleanup(sessionId: string, questionIds: string[]) {
    const keys = [k.state(sessionId), k.scores(sessionId), k.names(sessionId)];
    for (const q of questionIds) keys.push(k.answers(sessionId, q));
    await redis.del(...keys);
  },
};
