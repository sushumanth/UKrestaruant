import { z } from 'zod';

export const restaurantSettingsSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
  timeSlotInterval: z.number().int().positive(),
  defaultDepositAmount: z.number().nonnegative(),
  cancellationDeadlineHours: z.number().int().nonnegative(),
  autoReleaseMinutes: z.number().int().nonnegative(),
});

export const createTableSchema = z.object({
  id: z.string().optional(),
  tableNumber: z.number().int().positive(),
  capacity: z.number().int().positive(),
  status: z.enum(['available', 'booked', 'reserved', 'seated', 'blocked']).optional(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(['available', 'booked', 'reserved', 'seated', 'blocked']),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
});
