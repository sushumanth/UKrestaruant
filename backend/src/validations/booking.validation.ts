import { z } from 'zod';

export const bookingSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  bookingDate: z.string().date(),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().positive(),
  tableId: z.string().optional(),
  tableNumber: z.number().int().positive().optional(),
  specialRequests: z.string().max(1000).optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show']),
});
