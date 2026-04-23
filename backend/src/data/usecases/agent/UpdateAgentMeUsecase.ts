import { IUpdateAgentMeRepository } from '@/data/protocols/repositories/agent/UpdateAgentMeRepository';
import { AgentModel } from '@/domain/models/agentModel';
import { IUpdateAgentMe, UpdateAgentMeDTO } from '@/domain/usecases/agent/UpdateAgentMe';

export class UpdateAgentMeUsecase implements IUpdateAgentMe {
  constructor(
    private readonly updateAgentMeRepository: IUpdateAgentMeRepository,
  ) {}

  async updateMe(data: UpdateAgentMeDTO): Promise<AgentModel> {
    return this.updateAgentMeRepository.updateMe(data);
  }
}

