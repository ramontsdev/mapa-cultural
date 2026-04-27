import { findMediaForOwner } from '@/infra/prisma/mediaOwnership';
import { PrismaClient } from '@/infra/prisma/prismaClient';
import { MediaOwnerType } from '@/main/db/prisma/generated/enums';
import { notFound, ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetAgentByIdController implements IController {
  constructor(private readonly prismaClient: PrismaClient) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const id = httpRequest.params?.id;

    if (!id) {
      return notFound({ error: 'Agente não encontrado' });
    }

    const agent = await this.prismaClient.agent.findUnique({ where: { id } });

    if (!agent) {
      return notFound({ error: 'Agente não encontrado' });
    }

    const mediaAssets = await findMediaForOwner(MediaOwnerType.AGENT, id);

    return ok({ ...agent, mediaAssets });
  }
}

