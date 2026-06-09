import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const breathingTechniques = [
  { name: 'Box Breathing', description: 'Equal inhale, hold, exhale, hold — 4-4-4-4', inhaleDuration: 4, holdInDuration: 4, exhaleDuration: 4, holdOutDuration: 4, cycles: 10, isBuiltIn: true },
  { name: '4-7-8 Breathing', description: 'Inhale 4, hold 7, exhale 8', inhaleDuration: 4, holdInDuration: 7, exhaleDuration: 8, holdOutDuration: 0, cycles: 8, isBuiltIn: true },
  { name: 'Diaphragmatic Breathing', description: 'Deep belly breathing with extended exhale', inhaleDuration: 4, holdInDuration: 2, exhaleDuration: 6, holdOutDuration: 0, cycles: 10, isBuiltIn: true },
  { name: 'Alternate Nostril Breathing', description: 'Nadi Shodhana — alternate nostril pattern', inhaleDuration: 4, holdInDuration: 4, exhaleDuration: 4, holdOutDuration: 0, cycles: 10, isBuiltIn: true },
];

const drinkTemplates = [
  { name: 'Water', amount: 250, hydrationCoefficient: 1.0, icon: 'Droplets', color: '#3b82f6', isDefault: true },
  { name: 'Coffee', amount: 200, hydrationCoefficient: 0.8, icon: 'Coffee', color: '#8b5cf6', isDefault: true },
  { name: 'Tea', amount: 200, hydrationCoefficient: 0.9, icon: 'Wine', color: '#10b981', isDefault: true },
  { name: 'Juice', amount: 250, hydrationCoefficient: 0.9, icon: 'Apple', color: '#f59e0b', isDefault: true },
  { name: 'Milk', amount: 200, hydrationCoefficient: 0.95, icon: 'Milk', color: '#f8fafc', isDefault: true },
  { name: 'Soda', amount: 330, hydrationCoefficient: 0.7, icon: 'Beer', color: '#ef4444', isDefault: true },
  { name: 'Protein Shake', amount: 350, hydrationCoefficient: 0.85, icon: 'FlaskConical', color: '#ec4899', isDefault: true },
  { name: 'Sports Drink', amount: 500, hydrationCoefficient: 0.9, icon: 'Zap', color: '#f97316', isDefault: true },
  { name: 'Herbal Tea', amount: 200, hydrationCoefficient: 1.0, icon: 'Leaf', color: '#22c55e', isDefault: true },
];

async function seed() {
  for (const technique of breathingTechniques) {
    await prisma.breathingTechnique.upsert({
      where: { id: technique.name },
      create: { ...technique, id: technique.name },
      update: {},
    });
  }

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@lifeos.app' } });
  if (adminUser) {
    for (const drink of drinkTemplates) {
      await prisma.drinkTemplate.upsert({
        where: { id: `${adminUser.id}-${drink.name}` },
        create: { ...drink, userId: adminUser.id, id: `${adminUser.id}-${drink.name}` },
        update: {},
      });
    }
  }

  console.log('Seed complete');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
