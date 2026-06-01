"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuizCreator = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
/** Loads the quiz from :id and ensures the requester is its creator. */
const isQuizCreator = async (req, res, next) => {
    const quiz = await db_1.prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz)
        throw ApiError_1.ApiError.notFound("Quiz not found");
    if (quiz.creatorId !== req.user.id)
        throw ApiError_1.ApiError.forbidden();
    res.locals.quiz = quiz;
    next();
};
exports.isQuizCreator = isQuizCreator;
//# sourceMappingURL=ownership.middleware.js.map