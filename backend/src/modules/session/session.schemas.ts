import { z } from "zod";

export const joinSchema = z
  .object({
    accessCode: z.string().min(1).optional(),
    quizId: z.string().uuid().optional(),
    password: z.string().optional(),
  })
  .refine((d) => !!d.accessCode || !!d.quizId, {
    message: "Provide an accessCode (private) or quizId (public)",
    path: ["accessCode"],
  });

export type JoinInput = z.infer<typeof joinSchema>;

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        answer: z.string(),
        timeTaken: z.number().int().nonnegative().optional(),
      })
    )
    .min(1),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
