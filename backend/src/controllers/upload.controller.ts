import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { uploadImage } from '../services/upload.service';

export const uploadFile = asyncHandler(async (request: Request, response: Response) => {
  const file = request.file;
  const uploadedById = request.body?.uploadedById as string | undefined;
  const asset = await uploadImage(file as Express.Multer.File, uploadedById);
  return response.status(201).json({ asset });
});
