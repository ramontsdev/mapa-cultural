import { PrismaClient } from '@/infra/prisma/prismaClient';
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

    return ok(agent);
  }
}

