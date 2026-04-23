import { VerificationCodeModel } from '@/domain/models/verificationCodeModel';
import { VerificationCodeParams } from '@/domain/usecases/verificationCode/FindVerificationCode';

export interface IFindVerificationCodeRepository {
  findCode(params: VerificationCodeParams): Promise<VerificationCodeModel | null>
}
