import type { Booking, RestaurantTable } from '@/types';

export const generateTimeSlots = (_date: string): { time: string; available: boolean; availableTables: number }[] => {
  const slots: { time: string; available: boolean; availableTables: number }[] = [];

  const windows = [
    { startHour: 11, endHour: 15 },
    { startHour: 18, endHour: 22 },
  ];

  for (const window of windows) {
    for (let hour = window.startHour; hour < window.endHour; hour += 1) {
      for (const minutes of [0, 15, 30, 45]) {
        const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const availableTables = Math.floor(Math.random() * 15) + 5;

        slots.push({
          time,
          available: availableTables > 0,
          availableTables,
        });
      }
    }
  }

  return slots;
};

export const findOptimalTable = (
  guests: number,
  tables: RestaurantTable[],
  existingBookings: Booking[],
  date: string,
  time: string
): RestaurantTable | null => {
  const normalizedTime = time.slice(0, 5);
  const availableTables = tables.filter((table) => {
    if (table.capacity < guests) return false;

    const isBooked = existingBookings.some(
      (booking) =>
        (booking.tableId === table.id || booking.tableNumber === table.tableNumber) &&
        booking.date === date &&
        booking.time.slice(0, 5) === normalizedTime &&
        ['confirmed', 'arrived', 'seated'].includes(booking.status)
    );

    return !isBooked && table.status !== 'blocked';
  });

  if (availableTables.length === 0) return null;

  availableTables.sort((a, b) => a.capacity - b.capacity);

  return availableTables[0];
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateBookingId = (): string => 'LR' + Math.random().toString(36).substr(2, 6).toUpperCase();

export const statusColors = {
  table: {
    available: 'bg-emerald-500',
    booked: 'bg-rose-500',
    reserved: 'bg-amber-500',
    seated: 'bg-blue-500',
    blocked: 'bg-slate-600',
  },
  booking: {
    pending: 'bg-amber-500',
    confirmed: 'bg-emerald-500',
    arrived: 'bg-blue-500',
    seated: 'bg-indigo-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-rose-500',
    no_show: 'bg-slate-700',
  },
} as const;

export const statusLabels = {
  table: {
    available: 'Available',
    booked: 'Booked',
    reserved: 'Reserved',
    seated: 'Seated',
    blocked: 'Blocked',
  },
  booking: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    arrived: 'Arrived',
    seated: 'Seated',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  },
} as const;