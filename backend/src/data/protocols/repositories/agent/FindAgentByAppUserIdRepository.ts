import { AgentModel } from '@/domain/models/agentModel';

export interface IFindAgentByAppUserIdRepository {
  findByAppUserId(appUserId: string): Promise<AgentModel | null>;
}

