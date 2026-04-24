import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateOpportunityController } from '@/main/factories/controllers/opportunity/createOpportunityControllerFactory';
import { makeDeleteOpportunityController } from '@/main/factories/controllers/opportunity/deleteOpportunityControllerFactory';
import { makeListMyOpportunitiesController } from '@/main/factories/controllers/opportunity/listMyOpportunitiesControllerFactory';
import { makeListOpportunitiesController } from '@/main/factories/controllers/opportunity/listOpportunitiesControllerFactory';
import { makeCreateRegistrationController } from '@/main/factories/controllers/registration/createRegistrationControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetOpportunityByIdController } from '@/presentation/controllers/opportunity/GetOpportunityByIdController';

export const opportunityRoutes = Router();

opportunityRoutes.get('/opportunities', adaptExpressRoute(makeListOpportunitiesController()));

opportunityRoutes.get(
  '/opportunities/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeListMyOpportunitiesController()),
);

opportunityRoutes.post(
  '/opportunities',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateOpportunityController()),
);

opportunityRoutes.delete(
  '/opportunities/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeDeleteOpportunityController()),
);

opportunityRoutes.get('/opportunities/:id', adaptExpressRoute(new GetOpportunityByIdController()));

opportunityRoutes.post(
  '/opportunities/:id/registrations',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateRegistrationController()),
);
