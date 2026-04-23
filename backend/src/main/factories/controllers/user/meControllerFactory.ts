import { makeFindUserByIdUsecase } from '@/main/factories/usecases/user/findUserByIdUsecaseFactory';
import { MeController } from '@/presentation/controllers/user/MeController';

export function makeMeController() {
  return new MeController(makeFindUserByIdUsecase());
}
