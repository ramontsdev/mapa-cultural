import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { ListMyOpportunitiesController } from '@/presentation/controllers/opportunity/ListMyOpportunitiesController';

export function makeListMyOpportunitiesController() {
  return new ListMyOpportunitiesController(makeFindAgentByAppUserIdUsecase());
}
