import { prismaClient } from '@/infra/prisma/prismaClient';
import { notFound, ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class GetProjectByIdController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const id = httpRequest.params?.id;

    if (!id) return notFound({ error: 'Projeto não encontrado' });

    const project = await prismaClient.project.findUnique({ where: { id } });

    if (!project) return notFound({ error: 'Projeto não encontrado' });

    return ok(project);
  }
}

