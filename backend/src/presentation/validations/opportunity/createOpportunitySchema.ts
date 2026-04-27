import { z } from 'zod';

import { optionalProfileUrl } from '@/presentation/validations/common/optionalProfileUrls';

export const createOpportunitySchema = z.object({
  name: z.string().min(2).max(255),
  shortDescription: z.string().min(1),
  registrationFrom: z.string().datetime(),
  registrationTo: z.string().datetime(),
  objectType: z.enum(['Event', 'Project']),
  objectId: z.string(),
  avatarUrl: optionalProfileUrl,
  coverUrl: optionalProfileUrl,
});

