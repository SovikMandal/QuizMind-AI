import winston from "winston";
import { env, isProd } from "../config/env";

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  silent: env.NODE_ENV === "test",
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} ${level} ${message}`
        )
      ),
  transports: [new winston.transports.Console()],
});
