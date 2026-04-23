import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { UpdateEventController } from '@/presentation/controllers/event/UpdateEventController';

export function makeUpdateEventController() {
  return new UpdateEventController(makeFindAgentByAppUserIdUsecase());
}

