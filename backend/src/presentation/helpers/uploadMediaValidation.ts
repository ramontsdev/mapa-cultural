import { MediaKind } from '@/main/db/prisma/generated/enums';

import type { HttpUploadedFile } from '../protocols/http';

export const DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
]);

export function validateFileForKind(
  kind: MediaKind,
  file: HttpUploadedFile,
): string | null {
  if (kind === MediaKind.IMAGE && !file.mimetype.startsWith('image/')) {
    return 'Para imagens, envie um arquivo de imagem.';
  }

  if (kind === MediaKind.VIDEO && !file.mimetype.startsWith('video/')) {
    return 'Para vídeos enviados como arquivo, use um vídeo (ex.: mp4, webm).';
  }

  if (kind === MediaKind.DOCUMENT && !DOCUMENT_MIMES.has(file.mimetype)) {
    return 'Documento não suportado. Use PDF, DOC, DOCX, ODT ou TXT.';
  }

  return null;
}
