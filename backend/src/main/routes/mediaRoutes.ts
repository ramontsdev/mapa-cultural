import { Router } from 'express';

import { adaptExpressMiddleware } from '@/main/adapters/express/expressMiddlewareAdapter';
import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { uploadMemory } from '@/main/config/multerMemory';
import { makeAuthenticationMiddleware } from '@/main/factories/middlewares/authenticationMiddlewareFactory';
import { DeleteMediaController } from '@/presentation/controllers/media/DeleteMediaController';
import { UploadMediaController } from '@/presentation/controllers/media/UploadMediaController';

export const mediaRoutes = Router();

mediaRoutes.post(
  '/media',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  uploadMemory.single('file'),
  adaptExpressRoute(new UploadMediaController()),
);

mediaRoutes.delete(
  '/media/:id',
  adaptExpressMiddleware(makeAuthenticationMiddleware()),
  adaptExpressRoute(new DeleteMediaController()),
);
