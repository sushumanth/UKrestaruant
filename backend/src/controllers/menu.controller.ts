import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { menuItemSchema } from '../validations/menu.validation';
import { createMenuItem, deleteMenuItem, getMenuItemById, listMenuItems, updateMenuItem } from '../services/menu.service';

export const getMenu = asyncHandler(async (request: Request, response: Response) => {
  const result = await listMenuItems({
    page: request.query.page as string | undefined,
    limit: request.query.limit as string | undefined,
    search: request.query.search as string | undefined,
    category: request.query.category as string | undefined,
    isActive: request.query.isActive as string | undefined,
  });

  return response.status(200).json(result);
});

export const getMenuById = asyncHandler(async (request: Request, response: Response) => {
  const item = await getMenuItemById(String(request.params.id));
  return response.status(200).json({ item });
});

export const addMenuItem = asyncHandler(async (request: Request, response: Response) => {
  const payload = menuItemSchema.parse(request.body);
  const item = await createMenuItem(payload);
  return response.status(201).json({ item });
});

export const editMenuItem = asyncHandler(async (request: Request, response: Response) => {
  const payload = menuItemSchema.partial().parse(request.body);
  const item = await updateMenuItem(String(request.params.id), payload);
  return response.status(200).json({ item });
});

export const removeMenuItem = asyncHandler(async (request: Request, response: Response) => {
  await deleteMenuItem(String(request.params.id));
  return response.status(204).send();
});
