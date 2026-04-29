import type { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { deletarArquivoWs, salvarArquivoWs } from '@/main/adapters/storage/objectStorageWsClient';
import { env, useObjectStorageWs } from '@/main/config/env';

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

/**
 * Identificador `usuario` na API de object storage (preferir email).
 */
export function resolveAppStorageUsuario(
  email: string | null | undefined,
  userId: string,
): string {
  const e = email?.trim();

  if (e) return e;
  const f = env.objectStorage.usuarioFallback?.trim();

  if (f) return f;

  return `mapas-user-${userId}`;
}

export function buildMediaObjectKey(
  ownerType: string,
  ownerId: string,
  originalName: string,
): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);

  return `mapa-cultural/${ownerType.toLowerCase()}/${ownerId}/${randomUUID()}-${safe}`;
}

/** Divide chave lógica `mapa-cultural/.../file` em path (com / final) e nome para a API WS. */
export function splitKeyForObjectStorageWs(fullKey: string): { path: string; nome: string } {
  const normalized = fullKey.replace(/^\/+/, '');
  const i = normalized.lastIndexOf('/');

  if (i === -1) {
    return { path: '', nome: normalized };
  }

  const dir = normalized.slice(0, i + 1);
  const nome = normalized.slice(i + 1);
  const path = dir.endsWith('/') ? dir : `${dir}/`;

  return { path, nome };
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

/**
 * Upload de mídia: object-storage-ws (se configurado) ou S3.
 * @returns URL pública e chave persistida (`s3_key` no banco — para WS costuma ser `caminho` retornado).
 */
export async function uploadMediaBuffer(params: {
  key: string;
  buffer: Buffer;
  contentType: string;
  originalFilename: string;
  usuario: string;
}): Promise<{ publicUrl: string; storageKey: string }> {
  if (useObjectStorageWs()) {
    const { path, nome } = splitKeyForObjectStorageWs(params.key);
    const link = await salvarArquivoWs({
      nome,
      path,
      usuario: params.usuario,
      buffer: params.buffer,
      contentType: params.contentType,
      originalFileName: params.originalFilename,
    });
    const publicUrl = link.url!.trim();
    const storageKey = (link.caminho?.trim() || params.key).trim();

    return { publicUrl, storageKey };
  }

  await uploadBufferToS3({
    key: params.key,
    buffer: params.buffer,
    contentType: params.contentType,
  });

  return {
    publicUrl: buildPublicObjectUrl(params.key),
    storageKey: params.key,
  };
}

export async function deleteObjectFromS3(key: string): Promise<void> {
  await s3().send(
    new DeleteObjectCommand({
      Bucket: env.aws.bucketName,
      Key: key,
    }),
  );
}

/**
 * Remove objeto: WS (requer `usuario`) ou S3 direto.
 */
export async function deleteMediaObject(storageKey: string, usuario: string | undefined): Promise<void> {
  if (useObjectStorageWs()) {
    const u =
      usuario?.trim() ||
      env.objectStorage.usuarioFallback?.trim() ||
      '';

    if (!u) {
      throw new Error(
        'usuario obrigatório para object-storage-ws: passe usuario ou OBJECT_STORAGE_USUARIO_FALLBACK',
      );
    }

    await deletarArquivoWs({ caminho: storageKey, usuario: u });

    return;
  }

  await deleteObjectFromS3(storageKey);
}
