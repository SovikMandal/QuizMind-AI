"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = exports.remove = exports.update = exports.getOne = exports.list = exports.create = void 0;
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
const getOne = async (req, res) => {
    const quiz = await quiz_service_1.QuizService.getById(req.params.id, req.user.id);
    res.json({ quiz });
};
exports.getOne = getOne;
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
//# sourceMappingURL=quiz.controller.js.map