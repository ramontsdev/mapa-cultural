import { prismaClient } from '@/infra/prisma/prismaClient';
import { notFound, ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetSpaceByIdController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Espaço não encontrado' });

    const space = await prismaClient.space.findUnique({ where: { id } });

    if (!space) return notFound({ error: 'Espaço não encontrado' });

    return ok(space);
  }
}

