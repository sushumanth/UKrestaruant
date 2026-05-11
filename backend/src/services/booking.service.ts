import { BookingStatus, PaymentStatus, Prisma, TableStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { serializeBooking } from '../utils/serializers';
import { parsePagination } from '../utils/pagination';

const normalizeTime = (time: string) => time.slice(0, 5);

const buildAvailableSlots = (openingTime: string, closingTime: string, intervalMinutes: number) => {
  const slots: string[] = [];
  const [startHour, startMinute] = openingTime.split(':').map(Number);
  const [endHour, endMinute] = closingTime.split(':').map(Number);

  const current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const closing = new Date();
  closing.setHours(endHour, endMinute, 0, 0);

  while (current < closing) {
    const hours = String(current.getHours()).padStart(2, '0');
    const minutes = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
};

export const createBooking = async (input: {
  id?: string;
  bookingId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  guests: number;
  tableId?: string;
  tableNumber?: number;
  specialRequests?: string;
  customerId?: string;
}) => {
  const settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    throw new AppError(500, 'Restaurant settings not configured');
  }

  const table = input.tableId
    ? await prisma.restaurantTable.findUnique({ where: { id: input.tableId } })
    : input.tableNumber
      ? await prisma.restaurantTable.findUnique({ where: { tableNumber: input.tableNumber } })
      : null;

  if (table && table.capacity < input.guests) {
    throw new AppError(400, 'Selected table cannot fit the guest count');
  }

  const bookingDate = new Date(`${input.bookingDate}T00:00:00.000Z`);
  const booking = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const created = await transaction.booking.create({
      data: {
        id: input.id ?? undefined,
        bookingCode: input.bookingId ?? `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase().trim(),
        customerPhone: input.customerPhone,
        bookingDate,
        bookingTime: normalizeTime(input.bookingTime),
        guests: input.guests,
        tableId: table?.id ?? input.tableId ?? null,
        tableNumber: table?.tableNumber ?? input.tableNumber ?? null,
        status: BookingStatus.confirmed,
        specialRequests: input.specialRequests,
        depositAmount: settings.defaultDepositAmount,
        paymentStatus: PaymentStatus.pending,
        customerId: input.customerId,
      },
    });

    if (table) {
      await transaction.restaurantTable.update({
        where: { id: table.id },
        data: { status: TableStatus.booked, timeSlot: normalizeTime(input.bookingTime) },
      });
    }

    return created;
  });

  return serializeBooking(booking);
};

export const listBookings = async (filters: { page?: string | number; limit?: string | number; email?: string }) => {
  const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit });

  const where: Prisma.BookingWhereInput = filters.email
    ? { customerEmail: filters.email.toLowerCase().trim() }
    : {};

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: [{ bookingDate: 'desc' }, { bookingTime: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: bookings.map(serializeBooking),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  return serializeBooking(booking);
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  const updated = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const booking = await transaction.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (booking.tableId && (status === BookingStatus.cancelled || status === BookingStatus.completed || status === BookingStatus.no_show)) {
      await transaction.restaurantTable.update({
        where: { id: booking.tableId },
        data: { status: TableStatus.available, timeSlot: null },
      });
    }

    return booking;
  });

  return serializeBooking(updated);
};

export const getAvailableSlots = async (bookingDate: string, guests: number) => {
  const settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    throw new AppError(500, 'Restaurant settings not configured');
  }

  const tables = await prisma.restaurantTable.findMany({ where: { capacity: { gte: guests } } });
  const occupiedBookings = await prisma.booking.findMany({
    where: {
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      status: { in: [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated] },
    },
    select: { bookingTime: true, tableId: true },
  });

  const occupiedByTime = new Map<string, number>();
  for (const slot of occupiedBookings as Array<{ bookingTime: string }>) {
    occupiedByTime.set(normalizeTime(slot.bookingTime), (occupiedByTime.get(normalizeTime(slot.bookingTime)) ?? 0) + 1);
  }

  const allSlots = buildAvailableSlots(settings.openingTime, settings.closingTime, settings.timeSlotInterval);
  return allSlots.map((slot) => {
    const occupiedCount = occupiedByTime.get(slot) ?? 0;
    return {
      time: slot,
      available: occupiedCount < tables.length,
      availableTables: Math.max(0, tables.length - occupiedCount),
    };
  });
};

export const getOccupiedTableIds = async (bookingDate: string, bookingTime: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      bookingTime: normalizeTime(bookingTime),
      tableId: { not: null },
      status: { in: [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated] },
    },
    select: { tableId: true },
  });

  return (bookings as Array<{ tableId: string | null }>).map((booking: { tableId: string | null }) => booking.tableId).filter((tableId: string | null): tableId is string => Boolean(tableId));
};
