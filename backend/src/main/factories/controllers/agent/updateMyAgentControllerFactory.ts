import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { makeUpdateAgentMeUsecase } from '@/main/factories/usecases/agent/updateAgentMeUsecaseFactory';
import { UpdateMyAgentController } from '@/presentation/controllers/agent/UpdateMyAgentController';

export function makeUpdateMyAgentController() {
  return new UpdateMyAgentController(
    makeFindAgentByAppUserIdUsecase(),
    makeUpdateAgentMeUsecase(),
  );
}
