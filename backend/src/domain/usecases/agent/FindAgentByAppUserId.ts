import { AgentModel } from '@/domain/models/agentModel';

export interface IFindAgentByAppUserId {
  findByAppUserId(appUserId: string): Promise<AgentModel | null>;
}

