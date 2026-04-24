import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeListMyRegistrationsController } from '@/main/factories/controllers/registration/listMyRegistrationsControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';

export const registrationRoutes = Router();

registrationRoutes.get(
  '/registrations/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeListMyRegistrationsController()),
);
