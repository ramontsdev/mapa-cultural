import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateEventController } from '@/main/factories/controllers/event/createEventControllerFactory';
import { makeUpdateEventController } from '@/main/factories/controllers/event/updateEventControllerFactory';
import { makeCreateEventOccurrenceController } from '@/main/factories/controllers/eventOccurrence/createEventOccurrenceControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetEventByIdController } from '@/presentation/controllers/event/GetEventByIdController';

export const eventRoutes = Router();

eventRoutes.post(
  '/events',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateEventController()),
);

eventRoutes.patch(
  '/events/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeUpdateEventController()),
);

eventRoutes.get('/events/:id', adaptExpressRoute(new GetEventByIdController()));

eventRoutes.post(
  '/events/:id/occurrences',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateEventOccurrenceController()),
);

