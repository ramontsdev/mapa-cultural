import { AgentModel } from '@/domain/models/agentModel';
import { UpdateAgentMeDTO } from '@/domain/usecases/agent/UpdateAgentMe';

export interface IUpdateAgentMeRepository {
  updateMe(data: UpdateAgentMeDTO): Promise<AgentModel>;
}

