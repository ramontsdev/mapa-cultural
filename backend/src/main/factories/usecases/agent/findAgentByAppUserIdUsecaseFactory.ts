import { FindAgentByAppUserIdUsecase } from '@/data/usecases/agent/FindAgentByAppUserIdUsecase';
import { makeAgentPrismaRepository } from '@/main/factories/repositories/agentPrismaRepositoryFactory';

export function makeFindAgentByAppUserIdUsecase() {
  return new FindAgentByAppUserIdUsecase(makeAgentPrismaRepository());
}

