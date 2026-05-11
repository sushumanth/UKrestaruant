import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { createTableSchema, restaurantSettingsSchema, updateTableStatusSchema } from '../validations/restaurant.validation';
import { createTable, deleteTable, getRestaurantSettings, listTables, updateRestaurantSettings, updateTableStatus } from '../services/restaurant.service';

export const getSettings = asyncHandler(async (_request: Request, response: Response) => {
  const settings = await getRestaurantSettings();
  return response.status(200).json({ settings });
});

export const saveSettings = asyncHandler(async (request: Request, response: Response) => {
  const payload = restaurantSettingsSchema.parse(request.body);
  const settings = await updateRestaurantSettings(payload);
  return response.status(200).json({ settings });
});

export const getTables = asyncHandler(async (_request: Request, response: Response) => {
  const tables = await listTables();
  return response.status(200).json({ tables });
});

export const addTable = asyncHandler(async (request: Request, response: Response) => {
  const payload = createTableSchema.parse(request.body);
  const table = await createTable(payload);
  return response.status(201).json({ table });
});

export const patchTableStatus = asyncHandler(async (request: Request, response: Response) => {
  const payload = updateTableStatusSchema.parse(request.body);
  const table = await updateTableStatus(String(request.params.id), payload.status, payload.timeSlot ?? null);
  return response.status(200).json({ table });
});

export const removeTable = asyncHandler(async (request: Request, response: Response) => {
  await deleteTable(String(request.params.id));
  return response.status(204).send();
});
