import { prisma } from '../../config/prisma';

const DEFAULT_VALUES = [
  { key: 'financial_security', label: 'Financial Security', emoji: '💰' },
  { key: 'creativity', label: 'Creativity', emoji: '🎨' },
  { key: 'making_impact', label: 'Making Impact', emoji: '🌱' },
  { key: 'discovery', label: 'Discovery', emoji: '🔬' },
  { key: 'community', label: 'Community', emoji: '🍯' },
  { key: 'work_life_balance', label: 'Work-Life Balance', emoji: '⚖️' },
  { key: 'growth_and_status', label: 'Growth & Status', emoji: '📈' },
  { key: 'building_things', label: 'Building Things', emoji: '🚀' },
];

export const seedValuesIfNeeded = async () => {
  const count = await prisma.value.count();
  if (count === 0) {
    await prisma.value.createMany({ data: DEFAULT_VALUES });
  }
};

export const getAllValues = async () => {
  await seedValuesIfNeeded();
  return prisma.value.findMany({ orderBy: { key: 'asc' } });
};

export const saveUserValues = async (userId: string, valueKeys: string[]) => {
  const values = await prisma.value.findMany({ where: { key: { in: valueKeys } } });

  // Replace existing selections
  await prisma.userValue.deleteMany({ where: { userId } });
  await prisma.userValue.createMany({
    data: values.map((v) => ({ userId, valueId: v.id })),
  });

  await prisma.userEvent.create({
    data: { userId, eventType: 'values_selected', payload: { values: valueKeys } },
  });

  return prisma.userValue.findMany({
    where: { userId },
    include: { value: true },
  });
};

export const getUserValues = async (userId: string) => {
  return prisma.userValue.findMany({
    where: { userId },
    include: { value: true },
  });
};
