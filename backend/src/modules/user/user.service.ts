import { prisma } from '../../config/prisma';

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
    });
    return user;
  },

  async getPreferences(userId: string) {
    let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.userPreferences.create({ data: { userId } });
    }
    return prefs;
  },

  async updatePreferences(userId: string, data: Record<string, unknown>) {
    await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.getPreferences(userId);
  },
};
