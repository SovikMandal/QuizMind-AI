"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionSchema = exports.addQuestionSchema = void 0;
const quiz_schemas_1 = require("./quiz.schemas");
exports.addQuestionSchema = quiz_schemas_1.questionInputSchema;
exports.updateQuestionSchema = quiz_schemas_1.questionInputSchema.partial();
//# sourceMappingURL=question.schemas.js.map