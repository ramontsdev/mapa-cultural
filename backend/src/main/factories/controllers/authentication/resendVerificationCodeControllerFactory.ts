import { makeSESGatewayAdapter } from '@/main/factories/adapters/sesGatewayAdapterFactory';
import { makeFindUserByEmailUsecase } from '@/main/factories/usecases/user/findUserByEmailUsecaseFactory';
import { makeCreateVerificationCodeUsecase } from '@/main/factories/usecases/verificationCode/createVerificationCodeUsecaseFactory';
import { makeDeleteVerificationCodeUsecase } from '@/main/factories/usecases/verificationCode/deleteVerificationCodeUsecaseFactory';
import { makeFindVerificationCodeByEmailUsecase } from '@/main/factories/usecases/verificationCode/findVerificationCodeByEmailUsecaseFactory';
import { ResendVerificationCodeController } from '@/presentation/controllers/authentication/ResendVerificationCodeController';

export function makeResendVerificationCodeController() {
  return new ResendVerificationCodeController(
    makeFindUserByEmailUsecase(),
    makeFindVerificationCodeByEmailUsecase(),
    makeDeleteVerificationCodeUsecase(),
    makeCreateVerificationCodeUsecase(),
    makeSESGatewayAdapter(),
  );
}
