import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { ListMyRegistrationsController } from '@/presentation/controllers/registration/ListMyRegistrationsController';

export function makeListMyRegistrationsController() {
  return new ListMyRegistrationsController(makeFindAgentByAppUserIdUsecase());
}
