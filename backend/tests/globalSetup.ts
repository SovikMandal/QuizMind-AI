import { execSync } from "child_process";
import path from "path";

const DATABASE_URL = "postgresql://quizuser:quizpass@127.0.0.1:5434/quizapp_test";

export default async function globalSetup() {
  process.env.DATABASE_URL = DATABASE_URL;
  process.env.DIRECT_URL = DATABASE_URL;

  // Create the test database (if missing) and sync the schema.
  // Use --schema flag to ensure Prisma finds the schema regardless of cwd.
  const schemaPath = path.resolve(__dirname, "..", "prisma", "schema.prisma");
  execSync(`npx prisma db push --skip-generate --accept-data-loss --schema="${schemaPath}"`, {
    env: { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL },
    stdio: "inherit",
  });

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE answers, participants, quiz_sessions, questions, quizzes, users RESTART IDENTITY CASCADE`
  );
  await prisma.$disconnect();
}
