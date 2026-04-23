import { makeBcryptAdapter } from '@/main/factories/adapters/bcryptAdapterFactory';
import { makeJwtAdapter } from '@/main/factories/adapters/jwtAdapterFactory';
import { makeFindUserByEmailUsecase } from '@/main/factories/usecases/user/findUserByEmailUsecaseFactory';
import { SignInController } from '@/presentation/controllers/authentication/SignInController';

export function makeSignInController() {
  return new SignInController(
    makeFindUserByEmailUsecase(),
    makeBcryptAdapter(),
    makeJwtAdapter(),
  );
}
