import { z } from 'zod';

export const updatePasswordSchema = z.object({
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});
