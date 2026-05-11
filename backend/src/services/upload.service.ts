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

const toS3UploadError = (error: unknown, bucket: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('The AWS Access Key Id you provided does not exist')) {
    return new AppError(500, 'AWS credentials are invalid. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env.');
  }

  if (errorMessage.includes('not authorized to perform: s3:PutObject')) {
    return new AppError(500, `AWS IAM user is missing permission: s3:PutObject on bucket ${bucket}.`);
  }

  return new AppError(500, `Image upload to S3 failed: ${errorMessage}`);
};

export const uploadImage = async (file: Express.Multer.File, uploadedById?: string) => {
  if (!file) {
    throw new AppError(400, 'File is required');
  }

  const fileExtension = file.originalname.includes('.') ? file.originalname.split('.').pop() ?? '' : '';
  const safeName = sanitizeFileName(file.originalname.replace(/\.[^.]+$/, ''));
  const key = `uploads/${randomUUID()}-${safeName}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
  } catch (error) {
    throw toS3UploadError(error, env.AWS_S3_BUCKET);
  }

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
