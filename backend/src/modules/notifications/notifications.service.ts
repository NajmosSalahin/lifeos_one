import { prisma } from '../../config/prisma';

export const notificationsService = {
  async getAll(userId: string) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },
  async markRead(userId: string, id: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { read: true, readAt: new Date() } });
  },
  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: new Date() } });
  },
};
