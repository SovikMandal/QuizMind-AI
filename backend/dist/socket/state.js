"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const redis_1 = require("../config/redis");
const TTL = 60 * 60 * 24; // 24h
const k = {
    state: (s) => `quiz:session:${s}:state`,
    scores: (s) => `quiz:session:${s}:scores`,
    names: (s) => `quiz:session:${s}:names`,
    answers: (s, q) => `quiz:session:${s}:answers:${q}`,
};
exports.State = {
    async set(sessionId, state) {
        await redis_1.redis.set(k.state(sessionId), JSON.stringify(state), "EX", TTL);
    },
    async get(sessionId) {
        const raw = await redis_1.redis.get(k.state(sessionId));
        return raw ? JSON.parse(raw) : null;
    },
    async addParticipant(sessionId, participantId, username) {
        await redis_1.redis.hset(k.names(sessionId), participantId, username);
        await redis_1.redis.expire(k.names(sessionId), TTL);
    },
    async participants(sessionId) {
        const names = await redis_1.redis.hgetall(k.names(sessionId));
        return Object.entries(names).map(([id, username]) => ({ id, username }));
    },
    /** Records an answer once; returns false if the participant already answered. */
    async recordAnswer(sessionId, questionId, participantId, value) {
        const added = await redis_1.redis.hsetnx(k.answers(sessionId, questionId), participantId, value);
        await redis_1.redis.expire(k.answers(sessionId, questionId), TTL);
        return added === 1;
    },
    async answeredCount(sessionId, questionId) {
        return redis_1.redis.hlen(k.answers(sessionId, questionId));
    },
    async allAnswers(sessionId, questionId) {
        return redis_1.redis.hgetall(k.answers(sessionId, questionId));
    },
    async addScore(sessionId, participantId, points) {
        await redis_1.redis.expire(k.scores(sessionId), TTL);
        return Number(await redis_1.redis.zincrby(k.scores(sessionId), points, participantId));
    },
    async score(sessionId, participantId) {
        const s = await redis_1.redis.zscore(k.scores(sessionId), participantId);
        return s ? Number(s) : 0;
    },
    async leaderboard(sessionId, limit = -1) {
        const flat = await redis_1.redis.zrevrange(k.scores(sessionId), 0, limit, "WITHSCORES");
        const names = await redis_1.redis.hgetall(k.names(sessionId));
        const entries = [];
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
    async cleanup(sessionId, questionIds) {
        const keys = [k.state(sessionId), k.scores(sessionId), k.names(sessionId)];
        for (const q of questionIds)
            keys.push(k.answers(sessionId, q));
        await redis_1.redis.del(...keys);
    },
};
//# sourceMappingURL=state.js.map