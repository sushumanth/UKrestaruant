import { BookingStatus, PaymentStatus, Prisma, TableStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { serializeBooking } from '../utils/serializers';
import { parsePagination } from '../utils/pagination';

const normalizeTime = (time: string) => time.slice(0, 5);

const addMinutes = (d: Date, minutes: number) => {
  const n = new Date(d);
  n.setMinutes(n.getMinutes() + minutes);
  return n;
};

const getDiningDurationMinutes = (guests: number) => {
  if (guests <= 2) return 90;
  if (guests <= 4) return 120;
  if (guests <= 6) return 150;
  return 180;
};

const toDateTime = (dateStr: string, timeStr: string) => {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
  return new Date(`${dateStr}T${timeStr}:00`);
};

const intervalsOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
  return startA < endB && endA > startB;
};

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

  // compute booking times
  const start = toDateTime(input.bookingDate, normalizeTime(input.bookingTime));
  const duration = getDiningDurationMinutes(input.guests);
  const end = addMinutes(start, duration);
  const cleaningBuffer = 15;
  const release = addMinutes(end, cleaningBuffer);

  // validate restaurant open/closed
  const opening = settings.openingTime; // 'HH:mm'
  const closing = settings.closingTime;
  const openingDate = toDateTime(input.bookingDate, opening);
  const closingDate = toDateTime(input.bookingDate, closing);

  // Monday closed (0=Sun,1=Mon)
  const day = start.getDay();
  if (day === 1) {
    throw new AppError(400, 'Restaurant is closed on Mondays');
  }

  if (start < new Date() && input.bookingDate === new Date().toISOString().slice(0, 10)) {
    throw new AppError(400, 'Cannot book a time in the past');
  }

  if (start < openingDate || release > closingDate) {
    throw new AppError(400, 'Selected time is outside restaurant opening hours');
  }

  // transactional create with conflict check
  const booking = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    // if a specific table requested, verify availability
    let assignedTable = table;

    if (assignedTable) {
      // load existing bookings for this table on the date
      const existing = await transaction.booking.findMany({
        where: {
          tableId: assignedTable.id,
          bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`),
          status: { in: [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated] },
        },
        select: { bookingStart: true, bookingEnd: true, releaseTime: true, durationMinutes: true, tableId: true },
      });

      const selectedEndWithBuffer = release; // release already includes cleaning buffer
      for (const ex of existing) {
        const exStart: Date = ex.bookingStart ? new Date(ex.bookingStart) : toDateTime(input.bookingDate, '00:00');
        const duration: number = ex.durationMinutes !== null && ex.durationMinutes !== undefined ? ex.durationMinutes : getDiningDurationMinutes(2);
        const exEnd: Date = ex.bookingEnd ? new Date(ex.bookingEnd) : addMinutes(exStart, duration);
        const exEndWithBuffer: Date = ex.releaseTime ? new Date(ex.releaseTime) : addMinutes(exEnd, cleaningBuffer);

        // overlap rule: selectedStart < existingEndWithBuffer AND selectedEndWithBuffer > existingStart
        if (start < exEndWithBuffer && selectedEndWithBuffer > exStart) {
          throw new AppError(409, 'Selected table is not available for the chosen time');
        }
      }
    } else {
      // find an available table that fits the party and has no overlap
      const candidateTables = await transaction.restaurantTable.findMany({ where: { capacity: { gte: input.guests }, status: { not: TableStatus.blocked } }, orderBy: { capacity: 'asc' } });

      let found: typeof table | null = null;

      const occupyingStatuses = [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated];

      for (const t of candidateTables) {
        const existing = await transaction.booking.findMany({
          where: {
            tableId: t.id,
            bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`),
            status: { in: occupyingStatuses },
          },
          select: { bookingStart: true, bookingEnd: true, releaseTime: true, durationMinutes: true, tableId: true },
        });


        let conflict = false;
        const selectedEndWithBuffer = release; // release already includes cleaning buffer
        for (const ex of existing) {
          const exStart: Date = ex.bookingStart ? new Date(ex.bookingStart) : toDateTime(input.bookingDate, '00:00');
          const duration: number = ex.durationMinutes !== null && ex.durationMinutes !== undefined ? ex.durationMinutes : getDiningDurationMinutes(2);
          const exEnd: Date = ex.bookingEnd ? new Date(ex.bookingEnd) : addMinutes(exStart, duration);
          const exEndWithBuffer: Date = ex.releaseTime ? new Date(ex.releaseTime) : addMinutes(exEnd, cleaningBuffer);

          // overlap rule: selectedStart < existingEndWithBuffer AND selectedEndWithBuffer > existingStart
          if (start < exEndWithBuffer && selectedEndWithBuffer > exStart) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          found = t;
          break;
        }
      }

      if (!found) {
        throw new AppError(409, 'No tables available for selected time');
      }

      assignedTable = found;
    }

    const created = await transaction.booking.create({
      data: {
        id: input.id ?? undefined,
        bookingCode: input.bookingId ?? `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase().trim(),
        customerPhone: input.customerPhone,
        bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`),
        // store start/end/release/duration
        bookingStart: start,
        bookingEnd: end,
        releaseTime: release,
        durationMinutes: duration,
        graceExpiresAt: null,
        guests: input.guests,
        tableId: assignedTable?.id ?? input.tableId ?? null,
        tableNumber: assignedTable?.tableNumber ?? input.tableNumber ?? null,
        status: BookingStatus.confirmed,
        specialRequests: input.specialRequests,
        depositAmount: settings.defaultDepositAmount,
        paymentStatus: PaymentStatus.pending,
        customerId: input.customerId,
      },
    });

    if (assignedTable) {
      await transaction.restaurantTable.update({
        where: { id: assignedTable.id },
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
      orderBy: [{ bookingDate: 'desc' }, { bookingStart: 'desc' }],
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

  const tables = await prisma.restaurantTable.findMany({ where: { capacity: { gte: guests }, status: { not: TableStatus.blocked } }, orderBy: { capacity: 'asc' } });

  const allSlots = buildAvailableSlots(settings.openingTime, settings.closingTime, settings.timeSlotInterval).filter((slot) => {
    // ensure slot + duration + buffer fits within opening hours
    const start = toDateTime(bookingDate, slot);
    const duration = getDiningDurationMinutes(guests);
    const release = addMinutes(addMinutes(start, duration), 15);
    const openingDate = toDateTime(bookingDate, settings.openingTime);
    const closingDate = toDateTime(bookingDate, settings.closingTime);

    if (start < new Date() && bookingDate === new Date().toISOString().slice(0, 10)) return false;
    if (start < openingDate) return false;
    if (release > closingDate) return false;

    return true;
  });

  // fetch all bookings for the date with occupying statuses
  const occupyingStatuses = [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated];
  const existingBookings = await prisma.booking.findMany({
    where: {
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      status: { in: occupyingStatuses },
    },
    select: { bookingStart: true, bookingEnd: true, releaseTime: true, durationMinutes: true, tableId: true },
  });

  // group bookings by table
  const bookingsByTable = new Map<string, Array<{ start: Date; release: Date }>>();
  for (const b of existingBookings) {
    if (!b.tableId) continue;
    const s: Date = b.bookingStart ? new Date(b.bookingStart) : toDateTime(bookingDate, '00:00');
    const duration: number = b.durationMinutes !== null && b.durationMinutes !== undefined ? b.durationMinutes : getDiningDurationMinutes(2);
    const bEnd: Date = b.bookingEnd ? new Date(b.bookingEnd) : addMinutes(s, duration);
    const r: Date = b.releaseTime ? new Date(b.releaseTime) : addMinutes(bEnd, 15);
    const arr = bookingsByTable.get(b.tableId) ?? [];
    arr.push({ start: s, release: r });
    bookingsByTable.set(b.tableId, arr);
  }

  return allSlots.map((slot) => {
    const start = toDateTime(bookingDate, slot);
    const duration = getDiningDurationMinutes(guests);
    const release = addMinutes(addMinutes(start, duration), 15);

    let availableTables = 0;

    for (const t of tables) {
      const bookingsForTable = bookingsByTable.get(t.id) ?? [];
      const conflict = bookingsForTable.some((ib) => intervalsOverlap(start, release, ib.start, ib.release));
      if (!conflict) availableTables += 1;
    }

    return {
      time: slot,
      available: availableTables > 0,
      availableTables,
    };
  });
};

export const getOccupiedTableIds = async (bookingDate: string, bookingTime: string) => {
  const t = toDateTime(bookingDate, normalizeTime(bookingTime));
  const occupyingStatuses = [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated];

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      tableId: { not: null },
      status: { in: occupyingStatuses },
    },
    select: { bookingStart: true, bookingEnd: true, releaseTime: true, durationMinutes: true, tableId: true },
  });

  const occupied: string[] = [];
  for (const b of bookings) {
    const s: Date = b.bookingStart ? new Date(b.bookingStart) : toDateTime(bookingDate, '00:00');
    const duration: number = b.durationMinutes !== null && b.durationMinutes !== undefined ? b.durationMinutes : getDiningDurationMinutes(2);
    const bEnd: Date = b.bookingEnd ? new Date(b.bookingEnd) : addMinutes(s, duration);
    const r: Date = b.releaseTime ? new Date(b.releaseTime) : addMinutes(bEnd, 15);

    // consider booking occupied if the target time falls between start and end+buffer
    if (s <= t && t < r && b.tableId) {
      occupied.push(b.tableId);
    }
  }

  return occupied;
};

export const getAvailableTables = async (bookingDate: string, bookingTime: string, guests: number) => {
  const settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    throw new AppError(500, 'Restaurant settings not configured');
  }

  // Normalize time to HH:mm format
  const normalizedTime = normalizeTime(bookingTime);
  
  // Calculate booking duration and release time
  const start = toDateTime(bookingDate, normalizedTime);
  const duration = getDiningDurationMinutes(guests);
  const release = addMinutes(addMinutes(start, duration), 15); // +15 min cleaning buffer

  // Validate booking time is within opening hours
  const openingDate = toDateTime(bookingDate, settings.openingTime);
  const closingDate = toDateTime(bookingDate, settings.closingTime);

  if (start < openingDate || release > closingDate) {
    return []; // Time slot is outside operating hours
  }

  // Don't allow past times on current date
  if (start < new Date() && bookingDate === new Date().toISOString().slice(0, 10)) {
    return [];
  }

  // Get all tables that can accommodate the guest count
  const candidateTables = await prisma.restaurantTable.findMany({
    where: {
      capacity: { gte: guests },
      status: { not: TableStatus.blocked },
    },
    orderBy: { tableNumber: 'asc' },
  });

  // Get existing bookings for this date with occupying statuses
  const occupyingStatuses = [BookingStatus.confirmed, BookingStatus.arrived, BookingStatus.seated];
  const existingBookings = await prisma.booking.findMany({
    where: {
      bookingDate: new Date(`${bookingDate}T00:00:00.000Z`),
      status: { in: occupyingStatuses },
    },
    select: { bookingStart: true, bookingEnd: true, releaseTime: true, durationMinutes: true, tableId: true },
  });

  // Group bookings by table
  const bookingsByTable = new Map<string, Array<{ start: Date; release: Date }>>();
  for (const b of existingBookings) {
    if (!b.tableId) continue;
    const s: Date = b.bookingStart ? new Date(b.bookingStart) : toDateTime(bookingDate, '00:00');
    const dur: number = b.durationMinutes !== null && b.durationMinutes !== undefined ? b.durationMinutes : getDiningDurationMinutes(2);
    const bEnd: Date = b.bookingEnd ? new Date(b.bookingEnd) : addMinutes(s, dur);
    const r: Date = b.releaseTime ? new Date(b.releaseTime) : addMinutes(bEnd, 15);
    const arr = bookingsByTable.get(b.tableId) ?? [];
    arr.push({ start: s, release: r });
    bookingsByTable.set(b.tableId, arr);
  }

  // Filter tables - only return those without conflicts
  const availableTables = candidateTables.filter((table) => {
    const bookingsForTable = bookingsByTable.get(table.id) ?? [];
    const hasConflict = bookingsForTable.some((ib) => intervalsOverlap(start, release, ib.start, ib.release));
    return !hasConflict;
  });

  return availableTables;
};
