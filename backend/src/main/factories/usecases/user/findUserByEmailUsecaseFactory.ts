import { FindUserByEmailUsecase } from '@/data/usecases/user/FindUserByEmailUsecase';
import { makeUserPrismaRepository } from '@/main/factories/repositories/userPrismaRepositoryFactory';

export function makeFindUserByEmailUsecase() {
  return new FindUserByEmailUsecase(makeUserPrismaRepository());
}
