import { prisma } from '../../config/prisma';

export const calendarService = {
  async getMonth(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [habitLogs, moodLogs, sleepLogs, hydrationLogs, breathingSessions, journalEntries] = await Promise.all([
      prisma.habitLog.findMany({ where: { userId, completedAt: { gte: start, lte: end } } }),
      prisma.moodLog.findMany({ where: { userId, loggedAt: { gte: start, lte: end } } }),
      prisma.sleepLog.findMany({ where: { userId, loggedAt: { gte: start, lte: end } } }),
      prisma.hydrationLog.findMany({ where: { userId, loggedAt: { gte: start, lte: end } } }),
      prisma.breathingSession.findMany({ where: { userId, completedAt: { gte: start, lte: end } } }),
      prisma.journalEntry.findMany({ where: { userId, createdAt: { gte: start, lte: end } }, select: { id: true, title: true, createdAt: true, favorited: true } }),
    ]);

    const days: Record<string, { habits: number; mood: number | null; sleep: boolean; hydration: boolean; breathing: boolean; journal: number }> = {};

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days[key] = { habits: 0, mood: null, sleep: false, hydration: false, breathing: false, journal: 0 };
    }

    habitLogs.forEach(l => { const k = l.completedAt.toISOString().split('T')[0]; if (days[k]) days[k].habits++; });
    moodLogs.forEach(l => { const k = l.loggedAt.toISOString().split('T')[0]; if (days[k]) days[k].mood = l.score; });
    sleepLogs.forEach(l => { const k = l.loggedAt.toISOString().split('T')[0]; if (days[k]) days[k].sleep = true; });
    hydrationLogs.forEach(l => { const k = l.loggedAt.toISOString().split('T')[0]; if (days[k]) days[k].hydration = true; });
    breathingSessions.forEach(s => { const k = s.completedAt.toISOString().split('T')[0]; if (days[k]) days[k].breathing = true; });
    journalEntries.forEach(e => { const k = e.createdAt.toISOString().split('T')[0]; if (days[k]) days[k].journal++; });

    return { year, month, days };
  },
};
