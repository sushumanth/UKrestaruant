import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { createCategory, listCategories } from '../services/category.service';
import { categorySchema } from '../validations/category.validation';

export const getCategories = asyncHandler(async (_request: Request, response: Response) => {
  const result = await listCategories();
  return response.status(200).json(result);
});

export const addCategory = asyncHandler(async (request: Request, response: Response) => {
  const payload = categorySchema.parse(request.body);
  const item = await createCategory(payload.name);
  return response.status(201).json({ item });
});