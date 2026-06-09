import { prisma } from '../../config/prisma';

export const analyticsService = {
  async habits(userId: string) {
    const logs = await prisma.habitLog.findMany({ where: { userId }, include: { habit: true }, orderBy: { completedAt: 'asc' } });
    const total = logs.length;
    const habits = await prisma.habit.findMany({ where: { userId, archived: false } });
    return { totalCompletions: total, totalHabits: habits.length, logs };
  },

  async mood(userId: string) {
    const logs = await prisma.moodLog.findMany({ where: { userId }, orderBy: { loggedAt: 'asc' } });
    const scores = logs.map(l => l.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { totalEntries: logs.length, averageScore: Math.round(avg * 10) / 10, logs };
  },

  async sleep(userId: string) {
    const logs = await prisma.sleepLog.findMany({ where: { userId }, orderBy: { loggedAt: 'asc' } });
    const durations = logs.filter(l => l.durationMinutes).map(l => l.durationMinutes!);
    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return { totalEntries: logs.length, averageDurationMinutes: Math.round(avg), logs };
  },

  async hydration(userId: string) {
    const logs = await prisma.hydrationLog.findMany({ where: { userId }, orderBy: { loggedAt: 'asc' } });
    const totalMl = logs.reduce((a, b) => a + b.amount, 0);
    return { totalEntries: logs.length, totalMl: Math.round(totalMl), logs };
  },

  async breathing(userId: string) {
    const sessions = await prisma.breathingSession.findMany({ where: { userId } });
    const totalMinutes = sessions.reduce((a, b) => a + b.durationSeconds, 0) / 60;
    return { totalSessions: sessions.length, totalMindfulMinutes: Math.round(totalMinutes) };
  },

  async journal(userId: string) {
    const entries = await prisma.journalEntry.findMany({ where: { userId } });
    const totalWords = entries.reduce((a, b) => a + b.wordCount, 0);
    return { totalEntries: entries.length, totalWords, averageWordsPerEntry: entries.length ? Math.round(totalWords / entries.length) : 0 };
  },

  async goals(userId: string) {
    const goals = await prisma.goal.findMany({ where: { userId } });
    const completed = goals.filter(g => g.status === 'COMPLETED').length;
    return { totalGoals: goals.length, completed, inProgress: goals.filter(g => g.status === 'ACTIVE').length };
  },

  async overview(userId: string) {
    const [mood, sleep, hydration, breathing, journal, goals] = await Promise.all([
      this.mood(userId), this.sleep(userId), this.hydration(userId),
      this.breathing(userId), this.journal(userId), this.goals(userId),
    ]);
    return { mood, sleep, hydration, breathing, journal, goals };
  },
};
