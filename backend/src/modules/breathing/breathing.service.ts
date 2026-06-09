import { prisma } from '../../config/prisma';

export const breathingService = {
  async getTechniques(userId: string) {
    return prisma.breathingTechnique.findMany({ where: { OR: [{ userId }, { isBuiltIn: true }] } });
  },
  async createTechnique(userId: string, data: Record<string, unknown>) {
    return prisma.breathingTechnique.create({ data: { userId, ...data } as never });
  },
  async updateTechnique(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.breathingTechnique.updateMany({ where: { id, userId }, data: data as never });
  },
  async removeTechnique(userId: string, id: string) {
    return prisma.breathingTechnique.deleteMany({ where: { id, userId } });
  },
  async getSessions(userId: string) {
    return prisma.breathingSession.findMany({ where: { userId }, orderBy: { completedAt: 'desc' }, include: { technique: true } });
  },
  async createSession(userId: string, data: { techniqueId: string; durationSeconds: number; cyclesCompleted: number; note?: string; completedAt: string }) {
    return prisma.breathingSession.create({ data: { userId, ...data, completedAt: new Date(data.completedAt) } });
  },
  async getTotalMindfulMinutes(userId: string) {
    const result = await prisma.breathingSession.aggregate({ where: { userId }, _sum: { durationSeconds: true } });
    return Math.round((result._sum.durationSeconds ?? 0) / 60);
  },
};
