import { makeFindAgentByAppUserIdUsecase } from '@/main/factories/usecases/agent/findAgentByAppUserIdUsecaseFactory';
import { CreateEventOccurrenceController } from '@/presentation/controllers/eventOccurrence/CreateEventOccurrenceController';

export function makeCreateEventOccurrenceController() {
  return new CreateEventOccurrenceController(makeFindAgentByAppUserIdUsecase());
}

