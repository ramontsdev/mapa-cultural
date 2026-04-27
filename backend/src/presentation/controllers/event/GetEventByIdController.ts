import { findMediaForOwner } from '@/infra/prisma/mediaOwnership';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { MediaOwnerType } from '@/main/db/prisma/generated/enums';
import { notFound, ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetEventByIdController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Evento não encontrado' });

    const event = await prismaClient.event.findUnique({
      where: { id },
      include: {
        occurrences: {
          orderBy: [{ startsOn: 'asc' }, { startsAt: 'asc' }],
          include: { space: true },
        },
      },
    });

    if (!event) return notFound({ error: 'Evento não encontrado' });

    const mediaAssets = await findMediaForOwner(MediaOwnerType.EVENT, id);

    return ok({ ...event, mediaAssets });
  }
}

