import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { ListMyEventsController } from '@/presentation/controllers/event/ListMyEventsController';

export function makeListMyEventsController() {
  return new ListMyEventsController(makeFindAgentByAppUserIdUsecase());
}
