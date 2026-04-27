import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createProjectSchema } from '@/presentation/validations/project/createProjectSchema';

export class CreateProjectController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const { success, data, error } = createProjectSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const createdProject = await prismaClient.project.create({
      data: {
        projectType: 1,
        name: data.name,
        shortDescription: data.shortDescription ?? null,
        longDescription: data.longDescription ?? null,
        avatarUrl: data.avatarUrl ?? null,
        coverUrl: data.coverUrl ?? null,
        updateTimestamp: null,
        startsOn: null,
        endsOn: null,
        createTimestamp: new Date(),
        status: 1,
        subsiteId: null,
        parentId: null,
        agentId: agent.id,
      },
    });

    return created(createdProject);
  }
}

