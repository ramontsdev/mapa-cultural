import { FindVerificationCodeByEmailUsecase } from '@/data/usecases/verificationCode/FindVerificationCodeByEmailUsecase';
import { makeVerificationCodePrismaRepository } from '@/main/factories/repositories/verificationCodePrismaRepositoryFactory';

export function makeFindVerificationCodeByEmailUsecase() {
  return new FindVerificationCodeByEmailUsecase(makeVerificationCodePrismaRepository());
}
