import { VerificationCodeParams } from '@/domain/usecases/verificationCode/FindVerificationCode';

export interface IDeleteVerificationCodeRepository {
  deleteCode(params: VerificationCodeParams): Promise<void>
}
