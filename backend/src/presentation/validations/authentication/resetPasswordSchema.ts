import { z } from 'zod';

export const resetPasswordSchema = z.object({
  code: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});
