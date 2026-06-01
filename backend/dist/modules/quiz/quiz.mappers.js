"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripAnswers = stripAnswers;
/** Removes answer-revealing fields so participants can't see them before/while taking. */
function stripAnswers(question) {
    const { correctAnswer: _c, explanation: _e, options, ...rest } = question;
    const publicOptions = Array.isArray(options)
        ? options.map(({ isCorrect: _i, ...opt }) => opt)
        : options;
    return { ...rest, options: publicOptions };
}
//# sourceMappingURL=quiz.mappers.js.map