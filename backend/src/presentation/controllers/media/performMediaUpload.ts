import { prismaClient } from '@/infra/prisma/prismaClient';
import { buildMediaObjectKey, uploadMediaBuffer } from '@/main/adapters/aws/s3ObjectStorage';
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
  storageUsuario: string;
}) {
  const { data, ownerType, kind, file, nextOrder, storageUsuario } = params;
  const errMsg = validateFileForKind(kind, file);

  if (errMsg) {
    return { ok: false as const, error: errMsg };
  }

  const key = buildMediaObjectKey(data.ownerType, data.ownerId, file.originalname);

  const { publicUrl, storageKey } = await uploadMediaBuffer({
    key,
    buffer: file.buffer,
    contentType: file.mimetype,
    originalFilename: file.originalname,
    usuario: storageUsuario,
  });

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
      s3Key: storageKey,
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
