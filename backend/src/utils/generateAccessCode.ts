import { customAlphabet } from "nanoid";
import { prisma } from "../config/db";

// Unambiguous uppercase alphanumerics (no 0/O/1/I).
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nano = customAlphabet(alphabet, 6);

export async function generateUniqueAccessCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = nano();
    const exists = await prisma.quiz.findUnique({ where: { accessCode: code } });
    if (!exists) return code;
  }
  throw new Error("Failed to generate a unique access code");
}
