import { z } from "zod";

export const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const questionInputSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(["mcq", "true_false", "short_answer"]).default("mcq"),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  points: z.number().int().positive().default(10),
  timeLimitSecs: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  topicTag: z.string().max(100).optional(),
});

export const createQuizSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    subject: z.string().max(100).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    quizType: z.enum(["public", "private"]).default("public"),
    password: z.string().min(1).optional(),
    allowLateJoin: z.boolean().default(false),
    timeLimitSecs: z.number().int().positive().default(30),
    durationMins: z.coerce.number().int().positive().default(60),
    scheduledAt: z.coerce.date().optional(),
    questions: z.array(questionInputSchema).default([]),
  })
  .refine((d) => d.quizType !== "private" || !!d.password, {
    message: "Private quizzes require a password",
    path: ["password"],
  });

export const updateQuizSchema = createQuizSchema
  .innerType()
  .omit({ questions: true, password: true })
  .partial();

export const listQuizQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  subject: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  search: z.string().optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type ListQuizQuery = z.infer<typeof listQuizQuerySchema>;
