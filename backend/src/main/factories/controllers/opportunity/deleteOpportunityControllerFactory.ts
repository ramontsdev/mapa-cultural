import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { DeleteOpportunityController } from '@/presentation/controllers/opportunity/DeleteOpportunityController';

export function makeDeleteOpportunityController() {
  return new DeleteOpportunityController(makeFindAgentByAppUserIdUsecase());
}
