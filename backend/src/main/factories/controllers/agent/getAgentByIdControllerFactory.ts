import { prismaClient } from '@/infra/prisma/prismaClient';
import { GetAgentByIdController } from '@/presentation/controllers/agent/GetAgentByIdController';

export function makeGetAgentByIdController() {
  return new GetAgentByIdController(prismaClient);
}

