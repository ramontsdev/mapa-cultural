import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateRegistrationController } from '@/presentation/controllers/registration/CreateRegistrationController';

export function makeCreateRegistrationController() {
  return new CreateRegistrationController(makeFindAgentByAppUserIdUsecase());
}

