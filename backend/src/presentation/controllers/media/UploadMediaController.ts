import { userOwnsMediaTarget } from '@/infra/prisma/mediaOwnership';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { env } from '@/main/config/env';
import { MediaKind, MediaOwnerType } from '@/main/db/prisma/generated/enums';
import {
  badRequest,
  forbidden,
  ok,
  serverError,
  unauthorized,
} from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { uploadMediaFormSchema } from '@/presentation/validations/media/uploadMediaFormSchema';

import { persistExternalVideoMedia, persistUploadedMedia } from './performMediaUpload';

export class UploadMediaController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) {
      return unauthorized({ error: 'Não autorizado' });
    }

    if (!env.aws.bucketName?.trim()) {
      return badRequest({
        error: 'Bucket S3 não configurado. Defina AWS_BUCKET_NAME no .env.',
      });
    }

    const parsed = uploadMediaFormSchema.safeParse(httpRequest.body ?? {});

    if (!parsed.success) {
      return badRequest({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const data = parsed.data;
    const file = httpRequest.file;
    const isExternalVideo =
      data.kind === 'VIDEO' && !!data.externalUrl && !file;

    if (!isExternalVideo && !file) {
      return badRequest({ error: 'Arquivo obrigatório (ou informe externalUrl para vídeo externo).' });
    }

    if (isExternalVideo && file) {
      return badRequest({ error: 'Use arquivo ou URL externa de vídeo, não ambos.' });
    }

    const ownerType = data.ownerType as MediaOwnerType;
    const kind = data.kind as MediaKind;
    const allowed = await userOwnsMediaTarget({
      userId: account.userId,
      ownerType,
      ownerId: data.ownerId,
    });

    if (!allowed) {
      return forbidden({ error: 'Sem permissão para anexar mídia a este registro.' });
    }

    const maxAgg = await prismaClient.mediaAsset.aggregate({
      where: { ownerType, ownerId: data.ownerId },
      _max: { sortOrder: true },
    });
    const nextOrder = (maxAgg._max.sortOrder ?? -1) + 1;

    try {
      if (isExternalVideo) {
        const created = await persistExternalVideoMedia({ data, ownerType, nextOrder });

        return ok(created);
      }

      const result = await persistUploadedMedia({
        data,
        ownerType,
        kind,
        file: file!,
        nextOrder,
      });

      if (!result.ok) {
        return badRequest({ error: result.error });
      }

      return ok(result.created);
    } catch (e) {
      console.error(e);

      return serverError('Falha ao enviar arquivo para o armazenamento.');
    }
  }
}
