import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, forbidden, notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { updateProjectSchema } from '@/presentation/validations/project/updateProjectSchema';

export class UpdateProjectController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Projeto não encontrado' });

    const { success, data, error } = updateProjectSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const project = await prismaClient.project.findUnique({ where: { id } });

    if (!project) return notFound({ error: 'Projeto não encontrado' });

    if (project.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    const updated = await prismaClient.project.update({
      where: { id },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
        updateTimestamp: new Date(),
      },
    });

    return ok(updated);
  }
}

