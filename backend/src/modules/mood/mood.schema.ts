import { z } from 'zod';

export const createMoodSchema = z.object({
  score: z.number().int().min(1).max(10),
  note: z.string().optional(),
  loggedAt: z.string().datetime(),
});

export const updateMoodSchema = createMoodSchema.partial();
