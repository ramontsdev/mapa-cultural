import { makeSESGatewayAdapter } from '@/main/factories/adapters/sesGatewayAdapterFactory';
import { makeFindUserByEmailUsecase } from '@/main/factories/usecases/user/findUserByEmailUsecaseFactory';
import { makeCreateVerificationCodeUsecase } from '@/main/factories/usecases/verificationCode/createVerificationCodeUsecaseFactory';
import { makeDeleteVerificationCodeUsecase } from '@/main/factories/usecases/verificationCode/deleteVerificationCodeUsecaseFactory';
import { makeFindVerificationCodeByEmailUsecase } from '@/main/factories/usecases/verificationCode/findVerificationCodeByEmailUsecaseFactory';
import { ForgotPasswordController } from '@/presentation/controllers/authentication/ForgotPasswordController';

export function makeForgotPasswordController() {
  return new ForgotPasswordController(
    makeFindUserByEmailUsecase(),
    makeFindVerificationCodeByEmailUsecase(),
    makeDeleteVerificationCodeUsecase(),
    makeCreateVerificationCodeUsecase(),
    makeSESGatewayAdapter(),
  );
}
