import { ListAgentsController } from '@/presentation/controllers/agent/ListAgentsController';

export function makeListAgentsController() {
  return new ListAgentsController();
}
