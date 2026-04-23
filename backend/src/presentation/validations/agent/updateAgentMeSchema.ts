import { z } from 'zod';

export const updateAgentMeSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  publicLocation: z.boolean().nullable().optional(),
  shortDescription: z.string().max(400).nullable().optional(),
  longDescription: z.string().nullable().optional(),
});

