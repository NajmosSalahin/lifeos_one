import { prisma } from '../../config/prisma';

export const journalService = {
  async getAll(userId: string) {
    return prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },
  async getById(userId: string, id: string) {
    return prisma.journalEntry.findFirst({ where: { id, userId } });
  },
  async create(userId: string, data: { title: string; content: string; tags?: string[]; category?: string }) {
    const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    return prisma.journalEntry.create({ data: { userId, wordCount, tags: data.tags ?? [], ...data } });
  },
  async update(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.journalEntry.updateMany({ where: { id, userId }, data: data as never });
  },
  async remove(userId: string, id: string) {
    return prisma.journalEntry.deleteMany({ where: { id, userId } });
  },
  async toggleFavorite(userId: string, id: string) {
    const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
    if (!entry) return null;
    return prisma.journalEntry.update({ where: { id }, data: { favorited: !entry.favorited } });
  },
  async search(userId: string, query: string) {
    return prisma.journalEntry.findMany({
      where: { userId, OR: [{ title: { contains: query, mode: 'insensitive' } }, { content: { contains: query, mode: 'insensitive' } }] },
      orderBy: { createdAt: 'desc' },
    });
  },
};
