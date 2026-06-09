import { z } from 'zod';

export const createSleepSchema = z.object({
  sleepStart: z.string().datetime(),
  sleepEnd: z.string().datetime(),
  quality: z.number().int().min(1).max(5).optional(),
  note: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
});

export const updateSleepSchema = createSleepSchema.partial();
