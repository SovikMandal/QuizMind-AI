import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env, isProd } from "./config/env";
import { logger } from "./utils/logger";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
import questionRoutes from "./modules/quiz/question.routes";
import sessionRoutes from "./modules/session/session.routes";
import aiRoutes from "./modules/ai/ai.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import notificationRoutes from "./modules/notification/notification.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    morgan(isProd ? "combined" : "dev", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  const api = express.Router();
  api.use("/auth", authRoutes);
  api.use("/users", userRoutes);
  api.use("/quizzes", quizRoutes);
  api.use("/questions", questionRoutes);
  api.use("/sessions", sessionRoutes);
  api.use("/ai", aiRoutes);
  api.use("/payments", paymentRoutes);
  api.use("/notifications", notificationRoutes);
  app.use("/api/v1", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
