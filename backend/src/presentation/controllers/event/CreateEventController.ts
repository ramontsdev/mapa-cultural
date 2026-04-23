import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createEventSchema } from '@/presentation/validations/event/createEventSchema';

export class CreateEventController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const { success, data, error } = createEventSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const createdEvent = await prismaClient.event.create({
      data: {
        eventType: 1,
        name: data.name,
        shortDescription: data.shortDescription ?? '',
        longDescription: data.longDescription ?? null,
        rules: data.rules ?? null,
        createTimestamp: new Date(),
        status: 1,
        agentId: agent.id,
        projectId: data.projectId ?? null,
        updateTimestamp: null,
        subsiteId: null,
      },
    });

    return created(createdEvent);
  }
}

