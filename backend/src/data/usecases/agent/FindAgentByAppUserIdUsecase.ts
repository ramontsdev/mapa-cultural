import { IFindAgentByAppUserIdRepository } from '@/data/protocols/repositories/agent/FindAgentByAppUserIdRepository';
import { AgentModel } from '@/domain/models/agentModel';
import { IFindAgentByAppUserId } from '@/domain/usecases/agent/FindAgentByAppUserId';

export class FindAgentByAppUserIdUsecase implements IFindAgentByAppUserId {
  constructor(
    private readonly findAgentByAppUserIdRepository: IFindAgentByAppUserIdRepository,
  ) {}

  async findByAppUserId(appUserId: string): Promise<AgentModel | null> {
    return this.findAgentByAppUserIdRepository.findByAppUserId(appUserId);
  }
}

