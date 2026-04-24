import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateProjectController } from '@/main/factories/controllers/project/createProjectControllerFactory';
import { makeDeleteProjectController } from '@/main/factories/controllers/project/deleteProjectControllerFactory';
import { makeListMyProjectsController } from '@/main/factories/controllers/project/listMyProjectsControllerFactory';
import { makeListProjectsController } from '@/main/factories/controllers/project/listProjectsControllerFactory';
import { makeUpdateProjectController } from '@/main/factories/controllers/project/updateProjectControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetProjectByIdController } from '@/presentation/controllers/project/GetProjectByIdController';

export const projectRoutes = Router();

projectRoutes.get('/projects', adaptExpressRoute(makeListProjectsController()));

projectRoutes.get(
  '/projects/me',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeListMyProjectsController()),
);

projectRoutes.post(
  '/projects',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeCreateProjectController()),
);

projectRoutes.patch(
  '/projects/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeUpdateProjectController()),
);

projectRoutes.delete(
  '/projects/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(makeDeleteProjectController()),
);

projectRoutes.get('/projects/:id', adaptExpressRoute(new GetProjectByIdController()));
