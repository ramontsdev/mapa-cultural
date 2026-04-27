import { findMediaForOwner } from '@/infra/prisma/mediaOwnership';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { MediaOwnerType } from '@/main/db/prisma/generated/enums';
import { notFound, ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetOpportunityByIdController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Oportunidade não encontrada' });

    const opportunity = await prismaClient.opportunity.findUnique({ where: { id } });

    if (!opportunity) return notFound({ error: 'Oportunidade não encontrada' });

    const mediaAssets = await findMediaForOwner(MediaOwnerType.OPPORTUNITY, id);

    return ok({ ...opportunity, mediaAssets });
  }
}

