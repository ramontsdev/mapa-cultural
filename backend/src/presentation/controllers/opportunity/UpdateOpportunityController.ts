import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, forbidden, notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { updateOpportunitySchema } from '@/presentation/validations/opportunity/updateOpportunitySchema';

export class UpdateOpportunityController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Oportunidade não encontrada' });

    const { success, data, error } = updateOpportunitySchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const row = await prismaClient.opportunity.findUnique({ where: { id } });

    if (!row) return notFound({ error: 'Oportunidade não encontrada' });

    if (row.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    const updated = await prismaClient.opportunity.update({
      where: { id },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
        updateTimestamp: new Date(),
      },
    });

    return ok(updated);
  }
}
