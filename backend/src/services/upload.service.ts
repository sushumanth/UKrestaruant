import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma';
import { buildPublicS3Url, s3Client } from '../config/aws';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { serializeAsset } from '../utils/serializers';

const sanitizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'upload';

export const uploadImage = async (file: Express.Multer.File, uploadedById?: string) => {
  if (!file) {
    throw new AppError(400, 'File is required');
  }

  const fileExtension = file.originalname.includes('.') ? file.originalname.split('.').pop() ?? '' : '';
  const safeName = sanitizeFileName(file.originalname.replace(/\.[^.]+$/, ''));
  const key = `uploads/${randomUUID()}-${safeName}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = buildPublicS3Url(key);

  const asset = await prisma.asset.create({
    data: {
      url,
      key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedById,
    },
  });

  return serializeAsset(asset);
};
