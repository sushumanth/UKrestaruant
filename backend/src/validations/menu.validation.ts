import { z } from 'zod';

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.string().trim().min(1),
  imageUrl: z.string().url(),
  rating: z.number().min(0).max(5).default(0),
  prepTime: z.number().int().nonnegative().default(0),
  isVeg: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
