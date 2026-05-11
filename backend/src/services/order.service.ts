import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { parsePagination } from '../utils/pagination';
import { serializeOrder } from '../utils/serializers';

export const createOrder = async (input: {
  id?: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  status?: OrderStatus;
  stripePaymentIntentId?: string;
  customerId?: string;
  items: Array<{ menuItemId: string; quantity: number; unitPrice?: number }>;
}) => {
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: input.items.map((item) => item.menuItemId) } },
  });

  if (menuItems.length !== input.items.length) {
    throw new AppError(400, 'One or more menu items were not found');
  }

  const items = input.items.map((item) => {
    const menuItem = menuItems.find((entry: (typeof menuItems)[number]) => entry.id === item.menuItemId);
    const unitPrice = item.unitPrice ?? Number(menuItem?.price ?? 0);
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const order = await prisma.order.create({
    data: {
      id: input.id ?? undefined,
      orderNumber: input.orderNumber ?? `OR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customerName: input.customerName?.trim(),
      customerEmail: input.customerEmail.toLowerCase().trim(),
      customerPhone: input.customerPhone?.trim(),
      totalAmount,
      status: input.status ?? OrderStatus.pending,
      stripePaymentIntentId: input.stripePaymentIntentId,
      customerId: input.customerId,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
    },
  });

  return serializeOrder(order);
};

export const listOrders = async (filters: { page?: string | number; limit?: string | number; email?: string }) => {
  const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit });

  const where: Prisma.OrderWhereInput = filters.email
    ? { customerEmail: filters.email.toLowerCase().trim() }
    : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: orders.map(serializeOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return serializeOrder(order);
};
