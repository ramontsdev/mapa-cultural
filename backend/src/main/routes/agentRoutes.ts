import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeGetAgentByIdController } from '@/main/factories/controllers/agent/getAgentByIdControllerFactory';
import { makeGetMyAgentController } from '@/main/factories/controllers/agent/getMyAgentControllerFactory';
import { makeUpdateMyAgentController } from '@/main/factories/controllers/agent/updateMyAgentControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';

export const agentRoutes = Router();

agentRoutes.get(
  '/agents/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeGetMyAgentController()),
);

agentRoutes.patch(
  '/agents/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeUpdateMyAgentController()),
);

agentRoutes.get('/agents/:id', adaptExpressRoute(makeGetAgentByIdController()));

