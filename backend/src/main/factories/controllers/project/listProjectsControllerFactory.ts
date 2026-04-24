import { ListProjectsController } from '@/presentation/controllers/project/ListProjectsController';

export function makeListProjectsController() {
  return new ListProjectsController();
}
