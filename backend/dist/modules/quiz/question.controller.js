"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.add = exports.list = void 0;
const question_service_1 = require("./question.service");
const list = async (req, res) => {
    const questions = await question_service_1.QuestionService.listForQuiz(req.params.id, req.user.id);
    res.json({ questions });
};
exports.list = list;
const add = async (req, res) => {
    const question = await question_service_1.QuestionService.add(req.params.id, req.body);
    res.status(201).json({ question });
};
exports.add = add;
const update = async (req, res) => {
    const question = await question_service_1.QuestionService.update(req.params.id, req.user.id, req.body);
    res.json({ question });
};
exports.update = update;
const remove = async (req, res) => {
    await question_service_1.QuestionService.remove(req.params.id, req.user.id);
    res.status(204).send();
};
exports.remove = remove;
//# sourceMappingURL=question.controller.js.map