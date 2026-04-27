import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, forbidden, notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { updateEventSchema } from '@/presentation/validations/event/updateEventSchema';

export class UpdateEventController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Evento não encontrado' });

    const { success, data, error } = updateEventSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const event = await prismaClient.event.findUnique({ where: { id } });

    if (!event) return notFound({ error: 'Evento não encontrado' });

    if (event.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    const updated = await prismaClient.event.update({
      where: { id },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        rules: data.rules,
        projectId: data.projectId,
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
        updateTimestamp: new Date(),
      },
    });

    return ok(updated);
  }
}

