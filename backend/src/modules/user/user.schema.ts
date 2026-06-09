import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().int().min(12).max(20).optional(),
  densityMode: z.enum(['COMPACT', 'COMFORTABLE', 'SPACIOUS']).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  sidebarWidth: z.number().int().min(200).max(320).optional(),
  sidebarCollapsed: z.boolean().optional(),
  dashboardLayout: z.any().optional(),
  reducedMotion: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  heightCm: z.number().positive().optional().nullable(),
  weightKg: z.number().positive().optional().nullable(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional().nullable(),
  hydrationUnit: z.enum(['ML', 'OZ']).optional(),
});
