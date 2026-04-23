import { z } from 'zod';

export const confirmEmailSchema = z.object({
  code: z.string().min(1),
  email: z.email(),
});
