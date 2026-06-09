import { z } from 'zod';

export const createHydrationSchema = z.object({
  amount: z.number().positive(),
  drinkTemplateId: z.string().optional(),
  note: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(50),
  amount: z.number().positive(),
  hydrationCoefficient: z.number().min(0).max(1).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const weatherGoalQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
