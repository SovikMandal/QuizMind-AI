import { z } from "zod";

export const generateQuestionsSchema = z.object({
  topic: z.string().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  count: z.number().int().min(1).max(70).default(5),
  questionType: z
    .enum(["multiple_choice", "true_false", "short_answer"])
    .default("multiple_choice"),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
