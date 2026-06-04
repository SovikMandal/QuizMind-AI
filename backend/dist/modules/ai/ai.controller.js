"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestions = void 0;
const ai_service_1 = require("./ai.service");
const generateQuestions = async (req, res) => {
    const questions = await ai_service_1.AiService.generateQuestions(req.user.id, req.body);
    res.json({ questions });
};
exports.generateQuestions = generateQuestions;
//# sourceMappingURL=ai.controller.js.map