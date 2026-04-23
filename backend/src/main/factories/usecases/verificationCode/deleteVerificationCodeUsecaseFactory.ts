import { DeleteVerificationCodeUsecase } from '@/data/usecases/verificationCode/DeleteVerificationCodeUsecase';
import { makeVerificationCodePrismaRepository } from '@/main/factories/repositories/verificationCodePrismaRepositoryFactory';

export function makeDeleteVerificationCodeUsecase() {
  return new DeleteVerificationCodeUsecase(makeVerificationCodePrismaRepository());
}
