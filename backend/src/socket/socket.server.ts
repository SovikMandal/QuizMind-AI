import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { authenticateSocket } from "./socket.auth";
import { registerQuizHandlers } from "./handlers/quiz.handler";
import { registerPresenceHandlers } from "./handlers/presence.handler";

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });

  const quiz = io.of("/quiz");
  quiz.use(authenticateSocket);
  quiz.on("connection", (socket) => {
    logger.debug(`Socket connected: ${socket.id} (user ${socket.data.userId})`);
    registerQuizHandlers(quiz, socket);
    registerPresenceHandlers(quiz, socket);
  });

  return io;
}
