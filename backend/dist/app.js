"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const quiz_routes_1 = __importDefault(require("./modules/quiz/quiz.routes"));
const question_routes_1 = __importDefault(require("./modules/quiz/question.routes"));
const session_routes_1 = __importDefault(require("./modules/session/session.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.FRONTEND_URL,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.isProd ? "combined" : "dev", {
        stream: { write: (msg) => logger_1.logger.info(msg.trim()) },
    }));
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", uptime: process.uptime() });
    });
    const api = express_1.default.Router();
    api.use("/auth", auth_routes_1.default);
    api.use("/users", user_routes_1.default);
    api.use("/quizzes", quiz_routes_1.default);
    api.use("/questions", question_routes_1.default);
    api.use("/sessions", session_routes_1.default);
    api.use("/ai", ai_routes_1.default);
    api.use("/payments", payment_routes_1.default);
    app.use("/api/v1", api);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map