import { z } from 'zod';

import { optionalProfileUrl } from '@/presentation/validations/common/optionalProfileUrls';

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  shortDescription: z.string().max(400).nullable().optional(),
  longDescription: z.string().nullable().optional(),
  avatarUrl: optionalProfileUrl,
  coverUrl: optionalProfileUrl,
});

