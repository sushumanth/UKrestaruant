import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';

export const sendBookingConfirmation = asyncHandler(async (_request: Request, response: Response) => {
  return response.status(202).json({ ok: true });
});
