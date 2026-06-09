import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  targetDays: z.array(z.number().int().min(0).max(6)).optional(),
  reminderTime: z.string().optional(),
});

export const updateHabitSchema = createHabitSchema.partial();

export const createHabitLogSchema = z.object({
  completedAt: z.string().datetime(),
  note: z.string().optional(),
});
