import { z } from 'zod';

export const uploadQuerySchema = z.object({
  uploadedById: z.string().optional(),
});
