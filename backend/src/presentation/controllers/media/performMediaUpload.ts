import { prismaClient } from '@/infra/prisma/prismaClient';
import {
  buildMediaObjectKey,
  buildPublicObjectUrl,
  uploadBufferToS3,
} from '@/main/adapters/aws/s3ObjectStorage';
import { MediaKind, MediaOwnerType } from '@/main/db/prisma/generated/enums';
import { validateFileForKind } from '@/presentation/helpers/uploadMediaValidation';
import type { HttpUploadedFile } from '@/presentation/protocols/http';
import type { UploadMediaForm } from '@/presentation/validations/media/uploadMediaFormSchema';

export async function persistUploadedMedia(params: {
  data: UploadMediaForm;
  ownerType: MediaOwnerType;
  kind: MediaKind;
  file: HttpUploadedFile;
  nextOrder: number;
}) {
  const { data, ownerType, kind, file, nextOrder } = params;
  const errMsg = validateFileForKind(kind, file);

  if (errMsg) {
    return { ok: false as const, error: errMsg };
  }

  const key = buildMediaObjectKey(data.ownerType, data.ownerId, file.originalname);

  await uploadBufferToS3({
    key,
    buffer: file.buffer,
    contentType: file.mimetype,
  });

  const publicUrl = buildPublicObjectUrl(key);

  const created = await prismaClient.mediaAsset.create({
    data: {
      ownerType,
      ownerId: data.ownerId,
      kind,
      url: publicUrl,
      thumbnailUrl: kind === MediaKind.VIDEO ? (data.thumbnailUrl ?? null) : null,
      title: data.title ?? file.originalname,
      caption: data.caption ?? null,
      fileName: file.originalname,
      mimeType: file.mimetype,
      s3Key: key,
      sortOrder: nextOrder,
    },
  });

  return { ok: true as const, created };
}

export async function persistExternalVideoMedia(params: {
  data: UploadMediaForm;
  ownerType: MediaOwnerType;
  nextOrder: number;
}) {
  const { data, ownerType, nextOrder } = params;

  const created = await prismaClient.mediaAsset.create({
    data: {
      ownerType,
      ownerId: data.ownerId,
      kind: MediaKind.VIDEO,
      url: data.externalUrl!,
      thumbnailUrl: data.thumbnailUrl ?? null,
      title: data.title ?? null,
      caption: data.caption ?? null,
      fileName: null,
      mimeType: null,
      s3Key: null,
      sortOrder: nextOrder,
    },
  });

  return created;
}
