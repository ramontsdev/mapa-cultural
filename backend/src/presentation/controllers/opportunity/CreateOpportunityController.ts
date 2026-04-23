import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createOpportunitySchema } from '@/presentation/validations/opportunity/createOpportunitySchema';

const MAPAS_OBJECT_TYPE = {
  Event: 'MapasCulturais\\Entities\\Event',
  Project: 'MapasCulturais\\Entities\\Project',
} as const;

export class CreateOpportunityController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const { success, data, error } = createOpportunitySchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    if (data.objectType === 'Event') {
      const ev = await prismaClient.event.findUnique({ where: { id: data.objectId } });

      if (!ev) return notFound({ error: 'Evento não encontrado' });
    }

    if (data.objectType === 'Project') {
      const pr = await prismaClient.project.findUnique({ where: { id: data.objectId } });

      if (!pr) return notFound({ error: 'Projeto não encontrado' });
    }

    const createdOpportunity = await prismaClient.opportunity.create({
      data: {
        objectType: MAPAS_OBJECT_TYPE[data.objectType],
        objectId: data.objectId,
        opportunityType: 1,
        name: data.name,
        shortDescription: data.shortDescription,
        registrationFrom: new Date(data.registrationFrom),
        registrationTo: new Date(data.registrationTo),
        publishedRegistrations: false,
        createTimestamp: new Date(),
        updateTimestamp: null,
        publishTimestamp: null,
        autoPublish: false,
        status: 1,
        registrationProponentTypes: [],
        parentId: null,
        agentId: agent.id,
        subsiteId: null,
      },
    });

    return created(createdOpportunity);
  }
}

