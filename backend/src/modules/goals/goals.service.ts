import { prisma } from '../../config/prisma';

export const goalsService = {
  async getAll(userId: string) {
    return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { milestones: { orderBy: { order: 'asc' } } } });
  },
  async getById(userId: string, id: string) {
    return prisma.goal.findFirst({ where: { id, userId }, include: { milestones: { orderBy: { order: 'asc' } } } });
  },
  async create(userId: string, data: { title: string; description?: string; deadline?: string }) {
    return prisma.goal.create({ data: { userId, title: data.title, description: data.description, deadline: data.deadline ? new Date(data.deadline) : undefined } });
  },
  async update(userId: string, id: string, data: Record<string, unknown>) {
    const updateData = { ...data };
    if (data.status === 'COMPLETED') {
      (updateData as Record<string, unknown>).completedAt = new Date();
    }
    if (data.progress !== undefined && (data.progress as number) >= 100) {
      (updateData as Record<string, unknown>).status = 'COMPLETED';
      (updateData as Record<string, unknown>).completedAt = new Date();
    }
    return prisma.goal.updateMany({ where: { id, userId }, data: updateData as never });
  },
  async remove(userId: string, id: string) {
    return prisma.goal.deleteMany({ where: { id, userId } });
  },
  async createMilestone(userId: string, goalId: string, data: { title: string; order?: number }) {
    return prisma.goalMilestone.create({ data: { goalId, ...data } });
  },
  async updateMilestone(userId: string, goalId: string, milestoneId: string, data: Record<string, unknown>) {
    return prisma.goalMilestone.updateMany({
      where: { id: milestoneId, goal: { id: goalId, userId } },
      data: { ...data, ...(data.completed === true ? { completedAt: new Date() } : {}) } as never,
    });
  },
  async removeMilestone(userId: string, goalId: string, milestoneId: string) {
    return prisma.goalMilestone.deleteMany({ where: { id: milestoneId, goal: { id: goalId, userId } } });
  },
};
