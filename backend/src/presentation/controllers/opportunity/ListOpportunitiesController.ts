import { prismaClient } from '@/infra/prisma/prismaClient';
import { ok } from '@/presentation/helpers/httpHelpers';
import { IController } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

export class ListOpportunitiesController implements IController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const query = (httpRequest.query ?? {}) as Record<string, string | undefined>;

    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const q = (query.q ?? '').trim();

    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      prismaClient.opportunity.findMany({
        where,
        orderBy: { createTimestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prismaClient.opportunity.count({ where }),
    ]);

    return ok({ items, total, page, pageSize });
  }
}
