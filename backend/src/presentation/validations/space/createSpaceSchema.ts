import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().min(2).max(255),
  isPublic: z.boolean().optional(),
  shortDescription: z.string().max(400).nullable().optional(),
  longDescription: z.string().nullable().optional(),
});

