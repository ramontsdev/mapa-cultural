import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { DeleteProjectController } from '@/presentation/controllers/project/DeleteProjectController';

export function makeDeleteProjectController() {
  return new DeleteProjectController(makeFindAgentByAppUserIdUsecase());
}
