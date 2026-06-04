"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectiveQuizStatus = effectiveQuizStatus;
exports.stripAnswers = stripAnswers;
/** Derives the live lifecycle from the schedule: upcoming(scheduled) -> live -> ended(async). */
function effectiveQuizStatus(quiz) {
    if (quiz.status === "draft" || !quiz.scheduledAt)
        return quiz.status;
    const start = new Date(quiz.scheduledAt).getTime();
    const end = start + quiz.durationMins * 60_000;
    const now = Date.now();
    if (now < start)
        return "scheduled";
    if (now < end)
        return "live";
    return "ended";
}
/** Removes answer-revealing fields so participants can't see them before/while taking. */
function stripAnswers(question) {
    const { correctAnswer: _c, explanation: _e, options, ...rest } = question;
    const publicOptions = Array.isArray(options)
        ? options.map(({ isCorrect: _i, ...opt }) => opt)
        : options;
    return { ...rest, options: publicOptions };
}
//# sourceMappingURL=quiz.mappers.js.map