import { IFindAgentByAppUserIdRepository } from '@/data/protocols/repositories/agent/FindAgentByAppUserIdRepository';
import { IUpdateAgentMeRepository } from '@/data/protocols/repositories/agent/UpdateAgentMeRepository';
import { AgentModel } from '@/domain/models/agentModel';
import { UpdateAgentMeDTO } from '@/domain/usecases/agent/UpdateAgentMe';

import { PrismaClient } from './prismaClient';

export class AgentPrismaRepository implements
  IFindAgentByAppUserIdRepository,
  IUpdateAgentMeRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  private toModel(agent: any): AgentModel {
    return {
      id: agent.id,
      appUserId: agent.appUserId ?? null,
      name: agent.name,
      agentType: agent.agentType,
      publicLocation: agent.publicLocation ?? null,
      geoLocation: agent.geoLocation,
      shortDescription: agent.shortDescription ?? null,
      longDescription: agent.longDescription ?? null,
      createTimestamp: agent.createTimestamp,
      updateTimestamp: agent.updateTimestamp ?? null,
      status: agent.status,
    };
  }

  async findByAppUserId(appUserId: string): Promise<AgentModel | null> {
    const agent = await this.prismaClient.agent.findFirst({
      where: { appUserId },
    });

    return agent ? this.toModel(agent) : null;
  }

  async updateMe(data: UpdateAgentMeDTO): Promise<AgentModel> {
    const updated = await this.prismaClient.agent.update({
      where: { appUserId: data.appUserId },
      data: {
        name: data.name,
        publicLocation: data.publicLocation,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        updateTimestamp: new Date(),
      },
    });

    return this.toModel(updated);
  }
}

