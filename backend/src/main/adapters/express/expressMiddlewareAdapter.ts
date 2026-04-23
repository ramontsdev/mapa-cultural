import { NextFunction, Request, Response } from 'express';

import { HttpRequest } from '@/presentation/protocols/http';
import { IMiddleware } from '@/presentation/protocols/middleware';

export function adaptExpressMiddleware(middleware: IMiddleware) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const httpRequest: HttpRequest = {
      headers: request.headers as Record<string, string>,
      query: request.query as Record<string, string>,
      params: request.params as Record<string, string>,
      account: request.metadata?.account,
      body: request.body,
    };

    const httpResponse = await middleware.handle(httpRequest);

    if (httpResponse.statusCode >= 300) {
      response.status(httpResponse.statusCode).json(httpResponse.body);

      return;
    }

    request.metadata = {
      ...request.metadata,
      ...httpResponse.body,
    };

    next();
  };
}
