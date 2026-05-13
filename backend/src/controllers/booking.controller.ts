import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { bookingSchema, bookingStatusSchema } from '../validations/booking.validation';
import { createBooking, getAvailableSlots, getAvailableTables, getBookingById, getOccupiedTableIds, listBookings, updateBookingStatus } from '../services/booking.service';

export const placeBooking = asyncHandler(async (request: Request, response: Response) => {
  const payload = bookingSchema.parse(request.body);
  const booking = await createBooking(payload);
  return response.status(201).json({ booking });
});

export const getBookings = asyncHandler(async (request: Request, response: Response) => {
  const email = request.user?.role === 'customer' ? request.user.email : (request.query.email as string | undefined);

  const result = await listBookings({
    page: request.query.page as string | undefined,
    limit: request.query.limit as string | undefined,
    email,
  });

  return response.status(200).json(result);
});

export const getBooking = asyncHandler(async (request: Request, response: Response) => {
  const booking = await getBookingById(String(request.params.id));
  return response.status(200).json({ booking });
});

export const changeBookingStatus = asyncHandler(async (request: Request, response: Response) => {
  const payload = bookingStatusSchema.parse(request.body);
  const booking = await updateBookingStatus(String(request.params.id), payload.status);
  return response.status(200).json({ booking });
});

export const availableSlots = asyncHandler(async (request: Request, response: Response) => {
  const date = String(request.query.date ?? '');
  const guests = Number(request.query.guests ?? 1);
  const slots = await getAvailableSlots(date, guests);
  return response.status(200).json({ slots });
});

export const occupiedTables = asyncHandler(async (request: Request, response: Response) => {
  const tableIds = await getOccupiedTableIds(String(request.query.date ?? ''), String(request.query.time ?? ''));
  return response.status(200).json({ tableIds });
});

export const availableTables = asyncHandler(async (request: Request, response: Response) => {
  const date = String(request.query.date ?? '');
  const time = String(request.query.time ?? '');
  const guests = Number(request.query.guests ?? 1);
  const tables = await getAvailableTables(date, time, guests);
  return response.status(200).json({ tables });
});
