import { FindUserByIdUsecase } from '@/data/usecases/user/FindUserByIdUsecase';
import { makeUserPrismaRepository } from '@/main/factories/repositories/userPrismaRepositoryFactory';

export function makeFindUserByIdUsecase() {
  return new FindUserByIdUsecase(makeUserPrismaRepository());
}
