import { MediaOwnerType } from '@/main/db/prisma/generated/enums';

import { prismaClient } from './prismaClient';

export async function userOwnsMediaTarget(params: {
  userId: string;
  ownerType: MediaOwnerType;
  ownerId: string;
}): Promise<boolean> {
  const { userId, ownerType, ownerId } = params;

  if (ownerType === MediaOwnerType.AGENT) {
    const agent = await prismaClient.agent.findUnique({ where: { id: ownerId } });

    return !!agent && agent.appUserId === userId;
  }

  const myAgent = await prismaClient.agent.findFirst({ where: { appUserId: userId } });

  if (!myAgent) {
    return false;
  }

  if (ownerType === MediaOwnerType.SPACE) {
    const row = await prismaClient.space.findUnique({ where: { id: ownerId } });

    return !!row && row.agentId === myAgent.id;
  }

  if (ownerType === MediaOwnerType.PROJECT) {
    const row = await prismaClient.project.findUnique({ where: { id: ownerId } });

    return !!row && row.agentId === myAgent.id;
  }

  if (ownerType === MediaOwnerType.EVENT) {
    const row = await prismaClient.event.findUnique({ where: { id: ownerId } });

    return !!row && row.agentId === myAgent.id;
  }

  if (ownerType === MediaOwnerType.OPPORTUNITY) {
    const row = await prismaClient.opportunity.findUnique({ where: { id: ownerId } });

    return !!row && row.agentId === myAgent.id;
  }

  return false;
}

export async function findMediaForOwner(ownerType: MediaOwnerType, ownerId: string) {
  return prismaClient.mediaAsset.findMany({
    where: { ownerType, ownerId },
    orderBy: { sortOrder: 'asc' },
  });
}
