import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { ListMyProjectsController } from '@/presentation/controllers/project/ListMyProjectsController';

export function makeListMyProjectsController() {
  return new ListMyProjectsController(makeFindAgentByAppUserIdUsecase());
}
