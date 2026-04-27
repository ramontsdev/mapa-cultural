import { z } from 'zod';

import { optionalProfileUrl } from '@/presentation/validations/common/optionalProfileUrls';

export const updateOpportunitySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  shortDescription: z.string().min(1).optional(),
  avatarUrl: optionalProfileUrl,
  coverUrl: optionalProfileUrl,
});
