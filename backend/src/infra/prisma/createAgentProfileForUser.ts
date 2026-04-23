import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@/infra/prisma/prismaClient';

export async function createAgentProfileForUser(params: {
  tx: PrismaClient;
  user: { id: string; name: string; email: string };
}): Promise<void> {
  const now = new Date();
  const txAny = params.tx as any;

  const usr = await txAny.usr.create({
    data: {
      authProvider: 0,
      authUid: params.user.id,
      email: params.user.email,
      lastLoginTimestamp: null,
      createTimestamp: now,
      status: 1,
      profileId: null,
    },
  });

  const agentId = randomUUID();

  await params.tx.$executeRaw`
    INSERT INTO "agent" (
      "id",
      "app_user_id",
      "type",
      "name",
      "public_location",
      "location",
      "_geo_location",
      "short_description",
      "long_description",
      "create_timestamp",
      "status",
      "parent_id",
      "user_id",
      "update_timestamp",
      "subsite_id"
    ) VALUES (
      ${agentId},
      ${params.user.id},
      ${1},
      ${params.user.name},
      ${false},
      '(0,0)'::point,
      ${''},
      ${null},
      ${null},
      ${now},
      ${1},
      ${null},
      ${usr.id},
      ${null},
      ${null}
    );
  `;

  await txAny.usr.update({
    where: { id: usr.id },
    data: { profileId: agentId },
  });
}

