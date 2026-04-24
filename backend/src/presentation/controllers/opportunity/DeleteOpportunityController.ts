import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { forbidden, noContent, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class DeleteOpportunityController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Oportunidade não encontrada' });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const opportunity = await prismaClient.opportunity.findUnique({ where: { id } });

    if (!opportunity) return notFound({ error: 'Oportunidade não encontrada' });

    if (opportunity.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    await prismaClient.opportunity.delete({ where: { id } });

    return noContent();
  }
}
