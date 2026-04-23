import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateSpaceController } from '@/main/factories/controllers/space/createSpaceControllerFactory';
import { makeUpdateSpaceController } from '@/main/factories/controllers/space/updateSpaceControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetSpaceByIdController } from '@/presentation/controllers/space/GetSpaceByIdController';

export const spaceRoutes = Router();

spaceRoutes.post(
  '/spaces',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateSpaceController()),
);

spaceRoutes.patch(
  '/spaces/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeUpdateSpaceController()),
);

spaceRoutes.get('/spaces/:id', adaptExpressRoute(new GetSpaceByIdController()));

