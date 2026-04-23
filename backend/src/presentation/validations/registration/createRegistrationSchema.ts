import { z } from 'zod';

export const createRegistrationSchema = z.object({
  category: z.string().nullable().optional(),
  proponentType: z.string().min(1),
  range: z.string().min(1),
});

