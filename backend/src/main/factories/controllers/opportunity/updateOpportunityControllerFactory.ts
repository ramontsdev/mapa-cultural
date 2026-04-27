import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { UpdateOpportunityController } from '@/presentation/controllers/opportunity/UpdateOpportunityController';

export function makeUpdateOpportunityController() {
  return new UpdateOpportunityController(makeFindAgentByAppUserIdUsecase());
}
