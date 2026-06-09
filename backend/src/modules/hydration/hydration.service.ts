import { prisma } from '../../config/prisma';
import { fetchWeather } from '../../shared/utils/weather';
import { calculateHydrationGoal } from '../../shared/utils/hydration-goal';

export const hydrationService = {
  async getLogs(userId: string) {
    return prisma.hydrationLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' }, include: { drinkTemplate: true } });
  },

  async createLog(userId: string, data: { amount: number; drinkTemplateId?: string; note?: string; loggedAt?: string }) {
    return prisma.hydrationLog.create({
      data: { userId, amount: data.amount, drinkTemplateId: data.drinkTemplateId, note: data.note, loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date() },
    });
  },

  async removeLog(userId: string, id: string) {
    return prisma.hydrationLog.deleteMany({ where: { id, userId } });
  },

  async getTemplates(userId: string) {
    return prisma.drinkTemplate.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  },

  async createTemplate(userId: string, data: Record<string, unknown>) {
    return prisma.drinkTemplate.create({ data: { userId, ...data } as never });
  },

  async updateTemplate(userId: string, id: string, data: Record<string, unknown>) {
    return prisma.drinkTemplate.updateMany({ where: { id, userId }, data: data as never });
  },

  async removeTemplate(userId: string, id: string) {
    return prisma.drinkTemplate.deleteMany({ where: { id, userId } });
  },

  async getWeatherGoal(userId: string, lat: number, lng: number) {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    if (!prefs?.weightKg) {
      throw { statusCode: 400, code: 'MISSING_PROFILE', message: 'Set your weight in Settings > Health Profile first' };
    }
    const weather = await fetchWeather(lat, lng);
    const goal = calculateHydrationGoal({
      weightKg: prefs.weightKg,
      activityLevel: prefs.activityLevel ?? 'MODERATE',
      temperature: weather.temperature,
      humidity: weather.humidity,
    });
    return { goal, weather };
  },
};
