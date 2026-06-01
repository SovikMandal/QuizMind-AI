import { prisma } from "../src/config/db";
import { redis } from "../src/config/redis";

afterAll(async () => {
  await prisma.$disconnect();
  redis.disconnect();
});
