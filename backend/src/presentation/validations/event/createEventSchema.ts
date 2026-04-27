import { z } from 'zod';

import { optionalProfileUrl } from '@/presentation/validations/common/optionalProfileUrls';

export const createEventSchema = z.object({
  name: z.string().min(2).max(255),
  shortDescription: z.string().max(400).optional(),
  longDescription: z.string().nullable().optional(),
  rules: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  avatarUrl: optionalProfileUrl,
  coverUrl: optionalProfileUrl,
});

