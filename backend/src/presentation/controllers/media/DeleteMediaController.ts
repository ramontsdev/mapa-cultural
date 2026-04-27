import { userOwnsMediaTarget } from '@/infra/prisma/mediaOwnership';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { deleteObjectFromS3 } from '@/main/adapters/aws/s3ObjectStorage';
import {
  forbidden,
  noContent,
  notFound,
  serverError,
  unauthorized,
} from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class DeleteMediaController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) {
      return unauthorized({ error: 'Não autorizado' });
    }

    const id = httpRequest.params?.id;

    if (!id) {
      return notFound({ error: 'Mídia não encontrada' });
    }

    const row = await prismaClient.mediaAsset.findUnique({ where: { id } });

    if (!row) {
      return notFound({ error: 'Mídia não encontrada' });
    }

    const allowed = await userOwnsMediaTarget({
      userId: account.userId,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
    });

    if (!allowed) {
      return forbidden({ error: 'Sem permissão para remover esta mídia.' });
    }

    try {
      if (row.s3Key) {
        await deleteObjectFromS3(row.s3Key);
      }

      await prismaClient.mediaAsset.delete({ where: { id } });

      return noContent();
    } catch (e) {
      console.error(e);

      return serverError('Falha ao remover mídia.');
    }
  }
}
