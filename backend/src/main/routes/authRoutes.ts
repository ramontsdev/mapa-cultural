import { Router } from 'express';

import { adaptExpressRoute } from '@/main/adapters/express/expressRouteAdapter';
import { makeConfirmEmailController } from '@/main/factories/controllers/authentication/confirmEmailControllerFactory';
import { makeForgotPasswordController } from '@/main/factories/controllers/authentication/forgotPasswordControllerFactory';
import { makeResendVerificationCodeController } from '@/main/factories/controllers/authentication/resendVerificationCodeControllerFactory';
import { makeResetPasswordController } from '@/main/factories/controllers/authentication/resetPasswordControllerFactory';
import { makeSignInController } from '@/main/factories/controllers/authentication/signInControllerFactory';
import { makeSignUpController } from '@/main/factories/controllers/authentication/signUpControllerFactory';

export const authRoutes = Router();

authRoutes.post('/sign-in', adaptExpressRoute(makeSignInController()));
authRoutes.post('/sign-up', adaptExpressRoute(makeSignUpController()));
authRoutes.post('/confirm-email', adaptExpressRoute(makeConfirmEmailController()));
authRoutes.post('/forgot-password', adaptExpressRoute(makeForgotPasswordController()));
authRoutes.post('/reset-password', adaptExpressRoute(makeResetPasswordController()));
authRoutes.post('/resend-verification-code', adaptExpressRoute(makeResendVerificationCodeController()));
