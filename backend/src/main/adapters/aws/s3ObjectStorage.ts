import type { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { env } from '@/main/config/env';

function s3(): S3Client {
  return new S3Client({
    region: env.aws.region,
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    },
  });
}

export function buildPublicObjectUrl(key: string): string {
  const base = env.aws.s3PublicBaseUrl?.replace(/\/+$/, '');

  if (base) {
    return `${base}/${key}`;
  }

  return `https://${env.aws.bucketName}.s3.${env.aws.region}.amazonaws.com/${key}`;
}

export function buildMediaObjectKey(
  ownerType: string,
  ownerId: string,
  originalName: string,
): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);

  return `mapa-cultural/${ownerType.toLowerCase()}/${ownerId}/${randomUUID()}-${safe}`;
}

export async function uploadBufferToS3(params: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: env.aws.bucketName,
      Key: params.key,
      Body: params.buffer,
      ContentType: params.contentType,
    }),
  );
}

export async function deleteObjectFromS3(key: string): Promise<void> {
  await s3().send(
    new DeleteObjectCommand({
      Bucket: env.aws.bucketName,
      Key: key,
    }),
  );
}
