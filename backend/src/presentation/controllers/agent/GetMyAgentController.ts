import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { findMediaForOwner } from '@/infra/prisma/mediaOwnership';
import { MediaOwnerType } from '@/main/db/prisma/generated/enums';
import { notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetMyAgentController implements IController {
  constructor(
    private readonly findAgentByAppUserId: IFindAgentByAppUserId,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) {
      return unauthorized({ error: 'Não autorizado' });
    }

    const agent = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!agent) {
      return notFound({ error: 'Agente não encontrado' });
    }

    const mediaAssets = await findMediaForOwner(MediaOwnerType.AGENT, agent.id);

    return ok({ ...agent, mediaAssets });
  }
}

