import { prisma } from '../../config/prisma';

export const moodService = {
  async getAll(userId: string) {
    return prisma.moodLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } });
  },
  async getById(userId: string, id: string) {
    return prisma.moodLog.findFirst({ where: { id, userId } });
  },
  async create(userId: string, data: { score: number; note?: string; loggedAt: string }) {
    return prisma.moodLog.create({ data: { userId, score: data.score, note: data.note, loggedAt: new Date(data.loggedAt) } });
  },
  async update(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.moodLog.updateMany({ where: { id, userId }, data: data as never });
  },
  async remove(userId: string, id: string) {
    return prisma.moodLog.deleteMany({ where: { id, userId } });
  },
};
