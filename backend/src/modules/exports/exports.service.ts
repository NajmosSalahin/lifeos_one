import { prisma } from '../../config/prisma';

export const exportsService = {
  async exportJson(userId: string) {
    const [habits, habitLogs, moodLogs, sleepLogs, hydrationLogs, drinkTemplates, journalEntries, breathingSessions, breathingTechniques, goals, notifications] =
      await Promise.all([
        prisma.habit.findMany({ where: { userId } }),
        prisma.habitLog.findMany({ where: { userId } }),
        prisma.moodLog.findMany({ where: { userId } }),
        prisma.sleepLog.findMany({ where: { userId } }),
        prisma.hydrationLog.findMany({ where: { userId } }),
        prisma.drinkTemplate.findMany({ where: { userId } }),
        prisma.journalEntry.findMany({ where: { userId } }),
        prisma.breathingSession.findMany({ where: { userId } }),
        prisma.breathingTechnique.findMany({ where: { userId } }),
        prisma.goal.findMany({ where: { userId }, include: { milestones: true } }),
        prisma.notification.findMany({ where: { userId } }),
      ]);
    return { habits, habitLogs, moodLogs, sleepLogs, hydrationLogs, drinkTemplates, journalEntries, breathingSessions, breathingTechniques, goals, notifications };
  },

  async exportCsv(userId: string, module: string) {
    const map: Record<string, { findMany: (opts: { where: { userId: string } }) => Promise<unknown[]> }> = {
      habits: prisma.habit as never,
      mood: prisma.moodLog as never,
      sleep: prisma.sleepLog as never,
      hydration: prisma.hydrationLog as never,
      journal: prisma.journalEntry as never,
      goals: prisma.goal as never,
    };
    const delegate = map[module];
    if (!delegate) throw { statusCode: 400, code: 'INVALID_MODULE', message: `Unknown module: ${module}` };
    const data = await delegate.findMany({ where: { userId } });
    if (!data.length) return '';
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = (data as Record<string, unknown>[]).map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  },

  async exportJournalMarkdown(userId: string) {
    const entries = await prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return entries.map(e => `# ${e.title}\n\n${e.content.replace(/<[^>]*>/g, '')}\n\n---\n*${e.createdAt.toISOString().split('T')[0]}* | ${e.wordCount} words | Tags: ${e.tags.join(', ')}\n\n`).join('\n');
  },

  async exportPdfReport(userId: string) {
    return `PDF report generation placeholder for user ${userId}. In production, use a library like Puppeteer or jsPDF.`;
  },
};
