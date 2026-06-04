"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const socket_server_1 = require("./socket/socket.server");
async function start() {
    await redis_1.redis.connect();
    await db_1.prisma.$connect();
    const httpServer = (0, http_1.createServer)((0, app_1.createApp)());
    const io = (0, socket_server_1.initSocket)(httpServer);
    httpServer.listen(env_1.env.PORT, () => {
        logger_1.logger.info(`🚀 Backend listening on http://localhost:${env_1.env.PORT} (REST + Socket.IO /quiz)`);
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received, shutting down...`);
        io.close();
        httpServer.close();
        await db_1.prisma.$disconnect();
        redis_1.redis.disconnect();
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
//# sourceMappingURL=server.js.map