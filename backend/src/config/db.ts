import { PrismaClient } from "@prisma/client";
import { env, isProd } from "./env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "test" ? [] : isProd ? ["error"] : ["warn", "error"],
});
