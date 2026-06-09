import { prisma } from '../../config/prisma';

export const habitsService = {
  async getAll(userId: string) {
    return prisma.habit.findMany({ where: { userId, archived: false }, orderBy: { createdAt: 'desc' } });
  },

  async getById(userId: string, id: string) {
    return prisma.habit.findFirst({ where: { id, userId } });
  },

  async create(userId: string, data: Record<string, unknown>) {
    return prisma.habit.create({ data: { userId, ...data } as never });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.habit.updateMany({ where: { id, userId }, data: data as never });
  },

  async remove(userId: string, id: string) {
    return prisma.habit.deleteMany({ where: { id, userId } });
  },

  async archive(userId: string, id: string) {
    return prisma.habit.updateMany({
      where: { id, userId },
      data: { archived: true, archivedAt: new Date() },
    });
  },

  async getLogs(habitId: string) {
    return prisma.habitLog.findMany({ where: { habitId }, orderBy: { completedAt: 'desc' } });
  },

  async createLog(userId: string, habitId: string, data: { completedAt: string; note?: string }) {
    return prisma.habitLog.create({
      data: { userId, habitId, completedAt: new Date(data.completedAt), note: data.note },
    });
  },

  async removeLog(userId: string, logId: string) {
    return prisma.habitLog.deleteMany({ where: { id: logId, userId } });
  },
};
