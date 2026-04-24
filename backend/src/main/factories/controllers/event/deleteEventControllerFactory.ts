import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { DeleteEventController } from '@/presentation/controllers/event/DeleteEventController';

export function makeDeleteEventController() {
  return new DeleteEventController(makeFindAgentByAppUserIdUsecase());
}
