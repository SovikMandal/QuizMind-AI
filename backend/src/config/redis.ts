import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));
redis.on("connect", () => logger.info("Redis connected"));
