import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateSpaceController } from '@/main/factories/controllers/space/createSpaceControllerFactory';
import { makeDeleteSpaceController } from '@/main/factories/controllers/space/deleteSpaceControllerFactory';
import { makeListMySpacesController } from '@/main/factories/controllers/space/listMySpacesControllerFactory';
import { makeListSpacesController } from '@/main/factories/controllers/space/listSpacesControllerFactory';
import { makeUpdateSpaceController } from '@/main/factories/controllers/space/updateSpaceControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetSpaceByIdController } from '@/presentation/controllers/space/GetSpaceByIdController';

export const spaceRoutes = Router();

spaceRoutes.get('/spaces', adaptExpressRoute(makeListSpacesController()));

spaceRoutes.get(
  '/spaces/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeListMySpacesController()),
);

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

spaceRoutes.delete(
  '/spaces/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeDeleteSpaceController()),
);

spaceRoutes.get('/spaces/:id', adaptExpressRoute(new GetSpaceByIdController()));
