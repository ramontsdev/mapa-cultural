import { CreateUserUsecase } from '@/data/usecases/user/CreateUserUsecase';
import { makeUserPrismaRepository } from '@/main/factories/repositories/userPrismaRepositoryFactory';

export function makeCreateUserUsecase() {
  return new CreateUserUsecase(makeUserPrismaRepository());
}
