import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { UpdateProjectController } from '@/presentation/controllers/project/UpdateProjectController';

export function makeUpdateProjectController() {
  return new UpdateProjectController(makeFindAgentByAppUserIdUsecase());
}

