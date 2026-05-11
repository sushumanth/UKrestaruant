import type { TableStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { serializeRestaurantSettings, serializeRestaurantTable } from '../utils/serializers';

export const getRestaurantSettings = async () => {
  const settings = await prisma.restaurantSettings.findFirst();
  return settings ? serializeRestaurantSettings(settings) : null;
};

export const updateRestaurantSettings = async (payload: {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  timeSlotInterval: number;
  defaultDepositAmount: number;
  cancellationDeadlineHours: number;
  autoReleaseMinutes: number;
}) => {
  const current = payload.id
    ? await prisma.restaurantSettings.findUnique({ where: { id: payload.id } })
    : await prisma.restaurantSettings.findFirst();

  if (!current) {
    const created = await prisma.restaurantSettings.create({
      data: {
        name: payload.name,
        address: payload.address,
        phone: payload.phone,
        email: payload.email,
        openingTime: payload.openingTime,
        closingTime: payload.closingTime,
        timeSlotInterval: payload.timeSlotInterval,
        defaultDepositAmount: payload.defaultDepositAmount,
        cancellationDeadlineHours: payload.cancellationDeadlineHours,
        autoReleaseMinutes: payload.autoReleaseMinutes,
      },
    });

    return serializeRestaurantSettings(created);
  }

  const updated = await prisma.restaurantSettings.update({
    where: { id: current.id },
    data: {
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      openingTime: payload.openingTime,
      closingTime: payload.closingTime,
      timeSlotInterval: payload.timeSlotInterval,
      defaultDepositAmount: payload.defaultDepositAmount,
      cancellationDeadlineHours: payload.cancellationDeadlineHours,
      autoReleaseMinutes: payload.autoReleaseMinutes,
    },
  });

  return serializeRestaurantSettings(updated);
};

export const listTables = async () => {
  const tables = await prisma.restaurantTable.findMany({ orderBy: { tableNumber: 'asc' } });
  return tables.map(serializeRestaurantTable);
};

export const createTable = async (payload: { id?: string; tableNumber: number; capacity: number; status?: TableStatus; timeSlot?: string | null }) => {
  const existing = await prisma.restaurantTable.findUnique({ where: { tableNumber: payload.tableNumber } });

  if (existing) {
    throw new AppError(409, 'Table number already exists');
  }

  const table = await prisma.restaurantTable.create({
    data: {
      id: payload.id ?? undefined,
      tableNumber: payload.tableNumber,
      capacity: payload.capacity,
      status: payload.status ?? 'available',
      timeSlot: payload.timeSlot ?? null,
    },
  });

  return serializeRestaurantTable(table);
};

export const updateTableStatus = async (tableId: string, status: TableStatus, timeSlot: string | null = null) => {
  const table = await prisma.restaurantTable.update({
    where: { id: tableId },
    data: { status, timeSlot },
  });

  return serializeRestaurantTable(table);
};

export const deleteTable = async (tableId: string) => {
  await prisma.restaurantTable.delete({ where: { id: tableId } });
};
