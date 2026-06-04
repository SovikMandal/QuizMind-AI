"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submit = exports.getOne = exports.listLive = exports.join = void 0;
const session_service_1 = require("./session.service");
const join = async (req, res) => {
    const result = await session_service_1.SessionService.join(req.user.id, req.body);
    res.status(201).json(result);
};
exports.join = join;
const listLive = async (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    res.json({ sessions: await session_service_1.SessionService.listLive(limit, offset) });
};
exports.listLive = listLive;
const getOne = async (req, res) => {
    res.json({ session: await session_service_1.SessionService.getById(req.params.id) });
};
exports.getOne = getOne;
const submit = async (req, res) => {
    res.json(await session_service_1.SessionService.submitAttempt(req.user.id, req.params.id, req.body.answers));
};
exports.submit = submit;
//# sourceMappingURL=session.controller.js.map