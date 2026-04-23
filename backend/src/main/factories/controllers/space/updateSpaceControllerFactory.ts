import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { UpdateSpaceController } from '@/presentation/controllers/space/UpdateSpaceController';

export function makeUpdateSpaceController() {
  return new UpdateSpaceController(makeFindAgentByAppUserIdUsecase());
}

