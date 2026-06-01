"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const socket_auth_1 = require("./socket.auth");
const quiz_handler_1 = require("./handlers/quiz.handler");
function initSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.FRONTEND_URL, credentials: true },
    });
    const quiz = io.of("/quiz");
    quiz.use(socket_auth_1.authenticateSocket);
    quiz.on("connection", (socket) => {
        logger_1.logger.debug(`Socket connected: ${socket.id} (user ${socket.data.userId})`);
        (0, quiz_handler_1.registerQuizHandlers)(quiz, socket);
    });
    return io;
}
//# sourceMappingURL=socket.server.js.map