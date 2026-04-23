import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeCreateProjectController } from '@/main/factories/controllers/project/createProjectControllerFactory';
import { makeUpdateProjectController } from '@/main/factories/controllers/project/updateProjectControllerFactory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { GetProjectByIdController } from '@/presentation/controllers/project/GetProjectByIdController';

export const projectRoutes = Router();

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

projectRoutes.get('/projects/:id', adaptExpressRoute(new GetProjectByIdController()));

