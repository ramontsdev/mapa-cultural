import { AgentPrismaRepository } from '@/infra/prisma/AgentPrismaRepository';
import { prismaClient } from '@/infra/prisma/prismaClient';

export function makeAgentPrismaRepository() {
  return new AgentPrismaRepository(prismaClient);
}

