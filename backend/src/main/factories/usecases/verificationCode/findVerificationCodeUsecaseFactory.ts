import { FindVerificationCodeUsecase } from '@/data/usecases/verificationCode/FindVerificationCodeUsecase';
import { makeVerificationCodePrismaRepository } from '@/main/factories/repositories/verificationCodePrismaRepositoryFactory';

export function makeFindVerificationCodeUsecase() {
  return new FindVerificationCodeUsecase(makeVerificationCodePrismaRepository());
}
