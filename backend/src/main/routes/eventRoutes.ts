import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateEventController } from '@/main/factories/controllers/event/createEventControllerFactory';
import { makeDeleteEventController } from '@/main/factories/controllers/event/deleteEventControllerFactory';
import { makeListEventsController } from '@/main/factories/controllers/event/listEventsControllerFactory';
import { makeListMyEventsController } from '@/main/factories/controllers/event/listMyEventsControllerFactory';
import { makeUpdateEventController } from '@/main/factories/controllers/event/updateEventControllerFactory';
import { makeCreateEventOccurrenceController } from '@/main/factories/controllers/eventOccurrence/createEventOccurrenceControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetEventByIdController } from '@/presentation/controllers/event/GetEventByIdController';

export const eventRoutes = Router();

eventRoutes.get('/events', adaptExpressRoute(makeListEventsController()));

eventRoutes.get(
  '/events/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeListMyEventsController()),
);

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

eventRoutes.delete(
  '/events/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeDeleteEventController()),
);

eventRoutes.get('/events/:id', adaptExpressRoute(new GetEventByIdController()));

eventRoutes.post(
  '/events/:id/occurrences',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateEventOccurrenceController()),
);
