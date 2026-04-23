import { UpdateAgentMeUsecase } from '@/data/usecases/agent/UpdateAgentMeUsecase';
import { makeAgentPrismaRepository } from '@/main/factories/repositories/agentPrismaRepositoryFactory';

export function makeUpdateAgentMeUsecase() {
  return new UpdateAgentMeUsecase(makeAgentPrismaRepository());
}

