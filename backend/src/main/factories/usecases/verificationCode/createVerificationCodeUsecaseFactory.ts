import { CreateVerificationCodeUsecase } from '@/data/usecases/verificationCode/CreateVerificationCodeUsecase';
import { makeCodeGeneratorAdapter } from '@/main/factories/adapters/codeGeneratorAdapterFactory';
import { makeVerificationCodePrismaRepository } from '@/main/factories/repositories/verificationCodePrismaRepositoryFactory';

export function makeCreateVerificationCodeUsecase() {
  return new CreateVerificationCodeUsecase(makeVerificationCodePrismaRepository(), makeCodeGeneratorAdapter());
}
