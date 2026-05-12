import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { parsePagination } from '../utils/pagination';
import { serializeMenuItem } from '../utils/serializers';

export const listMenuItems = async (filters: {
  page?: string | number;
  limit?: string | number;
  search?: string;
  category?: string;
  isActive?: string;
}) => {
  const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit });

  const where: Prisma.MenuItemWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isActive === 'true') {
    where.isActive = true;
  } else if (filters.isActive === 'false') {
    where.isActive = false;
  }

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.menuItem.count({ where }),
  ]);

  return {
    items: items.map(serializeMenuItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getMenuItemById = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });

  if (!item) {
    throw new AppError(404, 'Menu item not found');
  }

  return serializeMenuItem(item);
};

export const createMenuItem = async (payload: {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  prepTime: number;
  isVeg: boolean;
  tags: string[];
  isActive: boolean;
  sortOrder: number;
}) => {
  const item = await prisma.menuItem.create({
    data: {
      id: payload.id ?? undefined,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      imageUrl: payload.imageUrl,
      rating: payload.rating,
      prepTime: payload.prepTime,
      isVeg: payload.isVeg,
      tags: payload.tags,
      isActive: payload.isActive,
      sortOrder: payload.sortOrder,
    },
  });

  return serializeMenuItem(item);
};

export const updateMenuItem = async (id: string, payload: Partial<Parameters<typeof createMenuItem>[0]>) => {
  const item = await prisma.menuItem.update({
    where: { id },
    data: payload,
  });

  return serializeMenuItem(item);
};

export const deleteMenuItem = async (id: string) => {
  await prisma.menuItem.delete({ where: { id } });
};
