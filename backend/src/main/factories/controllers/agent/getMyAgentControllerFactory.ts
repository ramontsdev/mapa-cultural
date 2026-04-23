import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { GetMyAgentController } from '@/presentation/controllers/agent/GetMyAgentController';

export function makeGetMyAgentController() {
  return new GetMyAgentController(makeFindAgentByAppUserIdUsecase());
}

