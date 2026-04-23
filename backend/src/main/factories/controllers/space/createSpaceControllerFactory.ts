import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateSpaceController } from '@/presentation/controllers/space/CreateSpaceController';

export function makeCreateSpaceController() {
  return new CreateSpaceController(makeFindAgentByAppUserIdUsecase());
}

