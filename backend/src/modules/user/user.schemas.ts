import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z.string().min(1).max(100),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    phone: z.string().max(30),
    location: z.string().max(120),
    bio: z.string().max(500),
    avatarUrl: z.string().url(),
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * The dashboard tracks three fixed goal types — the user can rename each
 * goal's label and adjust its target, but the underlying signal that drives
 * the progress bar (number of quizzes created this month, etc.) is fixed.
 */
export const goalTypes = ["createdQuizzes", "joinedQuizzes", "dayStreak"] as const;

export const userGoalSchema = z.object({
  type: z.enum(goalTypes),
  label: z.string().min(1).max(60),
  target: z.number().int().min(1).max(9999),
});

export const updateGoalsSchema = z.object({
  goals: z
    .array(userGoalSchema)
    .min(1)
    .max(goalTypes.length)
    // Each `type` may appear at most once.
    .refine((g) => new Set(g.map((x) => x.type)).size === g.length, {
      message: "Each goal type can only appear once",
    }),
});

export type UserGoalInput = z.infer<typeof userGoalSchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsSchema>;
