import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./config/db";
import { redis } from "./config/redis";
import { initSocket } from "./socket/socket.server";

async function start() {
  await redis.connect();
  await prisma.$connect();

  const httpServer = createServer(createApp());
  const io = initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Backend listening on http://localhost:${env.PORT} (REST + Socket.IO /quiz)`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    io.close();
    httpServer.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("FULL ERROR:");
  console.error(err);
  process.exit(1);
});
