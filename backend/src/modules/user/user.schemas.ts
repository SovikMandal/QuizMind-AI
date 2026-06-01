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
