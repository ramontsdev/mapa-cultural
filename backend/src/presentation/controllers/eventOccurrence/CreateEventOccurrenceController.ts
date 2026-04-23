import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, forbidden, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createEventOccurrenceSchema } from '@/presentation/validations/eventOccurrence/createEventOccurrenceSchema';

export class CreateEventOccurrenceController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const eventId = httpRequest.params?.id;

    if (!eventId) return notFound({ error: 'Evento não encontrado' });

    const { success, data, error } = createEventOccurrenceSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const event = await prismaClient.event.findUnique({ where: { id: eventId } });

    if (!event) return notFound({ error: 'Evento não encontrado' });
    if (event.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    const space = await prismaClient.space.findUnique({ where: { id: data.spaceId } });

    if (!space) return notFound({ error: 'Espaço não encontrado' });
    if (space.agentId !== agent.id) return forbidden({ error: 'Sem permissão para este espaço' });

    const occurrence = await prismaClient.eventOccurrence.create({
      data: {
        startsOn: data.startsOn ? new Date(data.startsOn) : null,
        endsOn: data.endsOn ? new Date(data.endsOn) : null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        frequency: data.frequency ?? null,
        separation: data.separation ?? 1,
        count: data.count ?? null,
        until: data.until ? new Date(data.until) : null,
        description: data.description ?? null,
        price: data.price ?? null,
        priceInfo: data.priceInfo ?? null,
        timezoneName: data.timezoneName ?? 'Etc/UTC',
        eventId,
        spaceId: data.spaceId,
        rule: data.rule,
        status: data.status ?? 1,
      },
    });

    return created(occurrence);
  }
}

