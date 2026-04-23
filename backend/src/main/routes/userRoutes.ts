import { Router } from 'express';

import { adaptExpressMiddleware } from '../adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '../adapters/express/expressRouteAdapter';
import { makeMeController } from '../factories/controllers/user/meControllerFactory';
import { makeAuthenticationMiddleware } from '../factories/middlewares/authenticationMiddlewareFactory';

export const userRoutes = Router();

userRoutes.get('/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeMeController()),
);
