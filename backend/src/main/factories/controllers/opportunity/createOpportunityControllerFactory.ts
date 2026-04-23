import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateOpportunityController } from '@/presentation/controllers/opportunity/CreateOpportunityController';

export function makeCreateOpportunityController() {
  return new CreateOpportunityController(makeFindAgentByAppUserIdUsecase());
}

