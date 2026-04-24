import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { DeleteSpaceController } from '@/presentation/controllers/space/DeleteSpaceController';

export function makeDeleteSpaceController() {
  return new DeleteSpaceController(makeFindAgentByAppUserIdUsecase());
}
