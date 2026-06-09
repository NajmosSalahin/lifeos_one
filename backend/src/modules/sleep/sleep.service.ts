import { prisma } from '../../config/prisma';

export const sleepService = {
  async getAll(userId: string) {
    return prisma.sleepLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } });
  },
  async getById(userId: string, id: string) {
    return prisma.sleepLog.findFirst({ where: { id, userId } });
  },
  async create(userId: string, data: { sleepStart: string; sleepEnd: string; quality?: number; note?: string; loggedAt?: string }) {
    const start = new Date(data.sleepStart);
    const end = new Date(data.sleepEnd);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return prisma.sleepLog.create({
      data: {
        userId,
        sleepStart: start,
        sleepEnd: end,
        durationMinutes,
        quality: data.quality,
        note: data.note,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      },
    });
  },
  async update(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.sleepLog.updateMany({ where: { id, userId }, data: data as never });
  },
  async remove(userId: string, id: string) {
    return prisma.sleepLog.deleteMany({ where: { id, userId } });
  },
};
