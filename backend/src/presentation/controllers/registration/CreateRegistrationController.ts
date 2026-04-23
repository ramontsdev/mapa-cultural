import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createRegistrationSchema } from '@/presentation/validations/registration/createRegistrationSchema';

export class CreateRegistrationController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const opportunityId = httpRequest.params?.id;

    if (!opportunityId) return notFound({ error: 'Oportunidade não encontrada' });

    const { success, data, error } = createRegistrationSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const opportunity = await prismaClient.opportunity.findUnique({ where: { id: opportunityId } });

    if (!opportunity) return notFound({ error: 'Oportunidade não encontrada' });

    const registration = await prismaClient.registration.create({
      data: {
        number: null,
        category: data.category ?? null,
        opportunityId: opportunity.id,
        agentId: agent.id,
        createTimestamp: new Date(),
        sentTimestamp: null,
        consolidatedResult: null,
        status: 1,
        proponentType: data.proponentType,
        registrationRange: data.range,
        valuersExceptionsList: [],
        valuers: [],
        subsiteId: null,
        score: null,
        eligible: null,
        editableUntil: null,
        editSentTimestamp: null,
        updateTimestamp: null,
      },
    });

    return created(registration);
  }
}

