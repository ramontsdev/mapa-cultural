import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateEventController } from '@/presentation/controllers/event/CreateEventController';

export function makeCreateEventController() {
  return new CreateEventController(makeFindAgentByAppUserIdUsecase());
}

