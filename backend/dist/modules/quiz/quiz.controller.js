"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReminders = exports.cancelRemind = exports.remind = exports.publish = exports.remove = exports.update = exports.info = exports.getOne = exports.listMine = exports.list = exports.create = void 0;
const quiz_service_1 = require("./quiz.service");
const quiz_schemas_1 = require("./quiz.schemas");
const create = async (req, res) => {
    const quiz = await quiz_service_1.QuizService.create(req.user.id, req.body);
    res.status(201).json({ quiz });
};
exports.create = create;
const list = async (req, res) => {
    const query = quiz_schemas_1.listQuizQuerySchema.parse(req.query);
    res.json(await quiz_service_1.QuizService.list(query));
};
exports.list = list;
const listMine = async (req, res) => {
    res.json({ quizzes: await quiz_service_1.QuizService.listMine(req.user.id) });
};
exports.listMine = listMine;
const getOne = async (req, res) => {
    const quiz = await quiz_service_1.QuizService.getById(req.params.id, req.user.id);
    res.json({ quiz });
};
exports.getOne = getOne;
const info = async (req, res) => {
    res.json({ quiz: await quiz_service_1.QuizService.info(req.params.id) });
};
exports.info = info;
const update = async (req, res) => {
    const quiz = await quiz_service_1.QuizService.update(req.params.id, req.body);
    res.json({ quiz });
};
exports.update = update;
const remove = async (req, res) => {
    await quiz_service_1.QuizService.remove(req.params.id);
    res.status(204).send();
};
exports.remove = remove;
const publish = async (req, res) => {
    const quiz = await quiz_service_1.QuizService.publish(req.params.id);
    res.json({ quiz });
};
exports.publish = publish;
const remind = async (req, res) => {
    await quiz_service_1.QuizService.addReminder(req.user.id, req.params.id);
    res.json({ ok: true });
};
exports.remind = remind;
const cancelRemind = async (req, res) => {
    await quiz_service_1.QuizService.removeReminder(req.user.id, req.params.id);
    res.json({ ok: true });
};
exports.cancelRemind = cancelRemind;
const listReminders = async (req, res) => {
    res.json({ quizIds: await quiz_service_1.QuizService.listReminderQuizIds(req.user.id) });
};
exports.listReminders = listReminders;
//# sourceMappingURL=quiz.controller.js.map