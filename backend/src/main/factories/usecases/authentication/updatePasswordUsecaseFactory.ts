import { UpdatePasswordUsecase } from '@/data/usecases/authentication/UpdatePasswordUsecase';

import { makeUserPrismaRepository } from '../../repositories/userPrismaRepositoryFactory';

export function makeUpdatePasswordUsecase() {
  return new UpdatePasswordUsecase(makeUserPrismaRepository());
}
