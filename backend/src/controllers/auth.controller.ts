import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { loginSchema, registerSchema, createStaffSchema, updateStaffSchema } from '../validations/auth.validation';
import { deleteStaffMember, getCurrentUser, listStaffMembers, loginUser, registerUser, createStaffMember, updateStaffMember } from '../services/auth.service';

export const register = asyncHandler(async (request: Request, response: Response) => {
  const payload = registerSchema.parse(request.body);
  const result = await registerUser(payload);
  return response.status(201).json(result);
});

export const login = asyncHandler(async (request: Request, response: Response) => {
  const payload = loginSchema.parse(request.body);
  const result = await loginUser(payload);
  return response.status(200).json(result);
});

export const me = asyncHandler(async (request: Request, response: Response) => {
  if (!request.user) {
    return response.status(401).json({ message: 'Unauthorized' });
  }

  const user = await getCurrentUser(request.user.id);
  return response.status(200).json({ user });
});

export const createStaff = asyncHandler(async (request: Request, response: Response) => {
  const payload = createStaffSchema.parse(request.body);
  const result = await createStaffMember(payload);
  return response.status(201).json(result);
});

export const listStaff = asyncHandler(async (_request: Request, response: Response) => {
  const items = await listStaffMembers();
  return response.status(200).json({ items });
});

export const updateStaff = asyncHandler(async (request: Request, response: Response) => {
  const payload = updateStaffSchema.parse(request.body);
  const item = await updateStaffMember(String(request.params.id), payload);
  return response.status(200).json({ item });
});

export const removeStaff = asyncHandler(async (request: Request, response: Response) => {
  if (request.user?.id === String(request.params.id)) {
    return response.status(400).json({ message: 'You cannot delete your own account.' });
  }

  await deleteStaffMember(String(request.params.id));
  return response.status(204).send();
});
