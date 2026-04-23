import { makeJwtAdapter } from '@/main/factories/adapters/jwtAdapterFactory';
import { makeFindUserByIdUsecase } from '@/main/factories/usecases/user/findUserByIdUsecaseFactory';
import { AuthenticationMiddleware } from '@/presentation/middlewares/AuthenticationMiddleware';

export function makeAuthenticationMiddleware() {
  return new AuthenticationMiddleware(
    makeFindUserByIdUsecase(),
    makeJwtAdapter(),
  );
}
