import { z } from 'zod';

export const updateSpaceSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  isPublic: z.boolean().optional(),
  shortDescription: z.string().max(400).nullable().optional(),
  longDescription: z.string().nullable().optional(),
});

