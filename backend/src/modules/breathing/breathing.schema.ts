import { z } from 'zod';

export const createTechniqueSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  inhaleDuration: z.number().int().positive(),
  holdInDuration: z.number().int().min(0),
  exhaleDuration: z.number().int().positive(),
  holdOutDuration: z.number().int().min(0),
  cycles: z.number().int().positive(),
});

export const updateTechniqueSchema = createTechniqueSchema.partial();

export const createSessionSchema = z.object({
  techniqueId: z.string(),
  durationSeconds: z.number().int().positive(),
  cyclesCompleted: z.number().int().positive(),
  note: z.string().optional(),
  completedAt: z.string().datetime(),
});
