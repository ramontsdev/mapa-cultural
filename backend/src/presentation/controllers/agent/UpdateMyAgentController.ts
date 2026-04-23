import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';
import { IUpdateAgentMe } from '@/domain/usecases/agent/UpdateAgentMe';
import { badRequest, notFound, ok, unauthorized } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';
import { updateAgentMeSchema } from '@/presentation/validations/agent/updateAgentMeSchema';

export class UpdateMyAgentController implements IController {
  constructor(
    private readonly findAgentByAppUserId: IFindAgentByAppUserId,
    private readonly updateAgentMe: IUpdateAgentMe,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { account } = httpRequest;

    if (!account) {
      return unauthorized({ error: 'Não autorizado' });
    }

    const { success, data, error } = updateAgentMeSchema.safeParse(httpRequest.body ?? {});

    if (!success) {
      return badRequest({ error: 'Dados inválidos', details: error.flatten() });
    }

    const existing = await this.findAgentByAppUserId.findByAppUserId(account.userId);

    if (!existing) {
      return notFound({ error: 'Agente não encontrado' });
    }

    const updated = await this.updateAgentMe.updateMe({
      appUserId: account.userId,
      ...data,
    });

    return ok(updated);
  }
}

