import { z } from 'zod';

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative().optional(),
});

export const orderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5).optional(),
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
  stripePaymentIntentId: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});
