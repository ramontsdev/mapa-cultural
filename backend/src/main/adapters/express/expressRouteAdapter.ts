import { Request, Response } from 'express';

import { IController } from '@/presentation/protocols/controller';
import { HttpRequest } from '@/presentation/protocols/http';

export function adaptExpressRoute(controller: IController) {
  return async (request: Request, response: Response) => {
    const httpRequest: HttpRequest = {
      body: request.body,
      headers: request.headers as Record<string, string>,
      query: request.query as Record<string, string>,
      params: request.params as Record<string, string>,
      account: request.metadata?.account,
    };

    const httpResponse = await controller.handle(httpRequest);

    response.status(httpResponse.statusCode).json(httpResponse.body);
  };
}
