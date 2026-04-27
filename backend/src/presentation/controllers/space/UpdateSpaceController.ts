import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, forbidden, notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { updateSpaceSchema } from '@/presentation/validations/space/updateSpaceSchema';

export class UpdateSpaceController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Espaço não encontrado' });

    const { success, data, error } = updateSpaceSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const space = await prismaClient.space.findUnique({ where: { id } });

    if (!space) return notFound({ error: 'Espaço não encontrado' });

    if (space.agentId !== agent.id) return forbidden({ error: 'Sem permissão' });

    const now = new Date();

    const updated = await prismaClient.space.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
        ...(data.longDescription !== undefined ? { longDescription: data.longDescription } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
        updateTimestamp: now,
      },
    });

    return ok(updated);
  }
}

