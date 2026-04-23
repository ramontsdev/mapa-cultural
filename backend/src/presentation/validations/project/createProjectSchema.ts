import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2).max(255),
  shortDescription: z.string().max(400).nullable().optional(),
  longDescription: z.string().nullable().optional(),
});

