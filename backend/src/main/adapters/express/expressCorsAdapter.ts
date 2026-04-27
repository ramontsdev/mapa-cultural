import { NextFunction, Request, Response } from 'express';

import { env } from '@/main/config/env';

export function expressCors(request: Request, response: Response, next: NextFunction) {
  const allowedOrigins = env.allowedOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origin = request.header('origin');
  const isAllowed = !!origin && allowedOrigins.includes(origin);

  if (isAllowed) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.setHeader(
      'Access-Control-Allow-Headers',
      request.header('access-control-request-headers') || '*',
    );
    response.setHeader('Access-Control-Max-Age', '600');
  }

  if (request.method === 'OPTIONS') {
    response.status(204).end();

    return;
  }

  next();
}
