import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { ListMySpacesController } from '@/presentation/controllers/space/ListMySpacesController';

export function makeListMySpacesController() {
  return new ListMySpacesController(makeFindAgentByAppUserIdUsecase());
}
