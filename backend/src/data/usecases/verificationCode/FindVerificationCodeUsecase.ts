import { IFindVerificationCodeRepository } from '@/data/protocols/repositories/verificationCode/FindVerificationCodeRepository';
import { VerificationCodeModel } from '@/domain/models/verificationCodeModel';
import { IFindVerificationCode, VerificationCodeParams } from '@/domain/usecases/verificationCode/FindVerificationCode';

export class FindVerificationCodeUsecase implements IFindVerificationCode {

  constructor(private readonly verificationCodeRepository: IFindVerificationCodeRepository) {}

  async find(params: VerificationCodeParams): Promise<VerificationCodeModel | null> {
    const verificationCode = await this.verificationCodeRepository.findCode(params);

    return verificationCode;
  }
}
