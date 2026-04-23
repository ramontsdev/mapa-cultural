import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateProjectController } from '@/presentation/controllers/project/CreateProjectController';

export function makeCreateProjectController() {
  return new CreateProjectController(makeFindAgentByAppUserIdUsecase());
}

