import { prisma } from '../config/prisma';

export const listCategories = async () => {
  const items = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return { items };
};

export const createCategory = async (name: string) => {
  const item = await prisma.category.create({
    data: { name: name.trim() },
  });

  return item;
};