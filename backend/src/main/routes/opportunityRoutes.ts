import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateOpportunityController } from '@/main/factories/controllers/opportunity/createOpportunityControllerFactory';
import { makeCreateRegistrationController } from '@/main/factories/controllers/registration/createRegistrationControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetOpportunityByIdController } from '@/presentation/controllers/opportunity/GetOpportunityByIdController';

export const opportunityRoutes = Router();

opportunityRoutes.post(
  '/opportunities',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateOpportunityController()),
);

opportunityRoutes.get('/opportunities/:id', adaptExpressRoute(new GetOpportunityByIdController()));

opportunityRoutes.post(
  '/opportunities/:id/registrations',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateRegistrationController()),
);

