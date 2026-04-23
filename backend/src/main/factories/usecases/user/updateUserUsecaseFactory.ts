import { UpdateUserUsecase } from '@/data/usecases/user/UpdateUserUsecase';
import { makeUserPrismaRepository } from '@/main/factories/repositories/userPrismaRepositoryFactory';

export function makeUpdateUserUsecase() {
  return new UpdateUserUsecase(makeUserPrismaRepository());
}
