import { randomUUID } from 'node:crypto';

import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { prismaClient } from '@/infra/prisma/prismaClient';
import { badRequest, created, notFound, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { createSpaceSchema } from '@/presentation/validations/space/createSpaceSchema';

export class CreateSpaceController implements IController {
  constructor(private readonly findAgentByAppUserId: IFindAgentByAppUserId) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) return unauthorized({ error: 'Não autorizado' });

    const { success, data, error } = createSpaceSchema.safeParse(httpRequest.body ?? {});

    if (!success) return badRequest({ error: 'Dados inválidos', details: error.flatten() });

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) return notFound({ error: 'Agente não encontrado' });

    const id = randomUUID();
    const now = new Date();

    await prismaClient.$executeRaw`
      INSERT INTO "space" (
        "id",
        "location",
        "_geo_location",
        "name",
        "public",
        "short_description",
        "long_description",
        "create_timestamp",
        "status",
        "type",
        "agent_id",
        "update_timestamp",
        "subsite_id",
        "parent_id"
      ) VALUES (
        ${id},
        '(0,0)'::point,
        ${''},
        ${data.name},
        ${data.isPublic ?? true},
        ${data.shortDescription ?? null},
        ${data.longDescription ?? null},
        ${now},
        ${1},
        ${1},
        ${agent.id},
        ${null},
        ${null},
        ${null}
      );
    `;

    const createdSpace = await prismaClient.space.findUnique({ where: { id } });

    return created(createdSpace);
  }
}

