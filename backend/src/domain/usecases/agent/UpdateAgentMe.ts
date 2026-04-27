import { AgentModel } from '@/domain/models/agentModel';

export type UpdateAgentMeDTO = {
  appUserId: string;
  name?: string;
  publicLocation?: boolean | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export interface IUpdateAgentMe {
  updateMe(data: UpdateAgentMeDTO): Promise<AgentModel>;
}

