import express, { NextFunction, Request, Response } from 'express';

import { expressCors } from '@/main/adapters/express/expressCorsAdapter';

import { env } from './config/env';
import { agentRoutes } from './routes/agentRoutes';
import { authRoutes } from './routes/authRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { mediaRoutes } from './routes/mediaRoutes';
import { opportunityRoutes } from './routes/opportunityRoutes';
import { projectRoutes } from './routes/projectRoutes';
import { registrationRoutes } from './routes/registrationRoutes';
import { spaceRoutes } from './routes/spaceRoutes';
import { userRoutes } from './routes/userRoutes';

const app = express();

app.use(expressCors);
app.use(express.json());

app.get('/health', (_request: Request, response: Response) => {
  response.status(200).json({ status: 'OK' });
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error('--------------------------------------');
  console.error(error.message);
  console.error('--------------------------------------');
  response.status(500).json({ error: 'Internal Server Error' });
});

app.use('/api', [
  authRoutes,
  userRoutes,
  agentRoutes,
  spaceRoutes,
  projectRoutes,
  eventRoutes,
  opportunityRoutes,
  registrationRoutes,
  mediaRoutes,
]);

app.listen(env.port, () => {
  console.info(`Server is running on port ${env.port}`);
});

export { app };
