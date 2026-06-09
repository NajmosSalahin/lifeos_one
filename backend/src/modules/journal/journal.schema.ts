import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const updateJournalSchema = createJournalSchema.partial();
