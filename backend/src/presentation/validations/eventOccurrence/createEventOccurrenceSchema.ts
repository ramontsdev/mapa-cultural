import { z } from 'zod';

export const createEventOccurrenceSchema = z.object({
  spaceId: z.string(),
  startsOn: z.string().datetime().nullable().optional(),
  endsOn: z.string().datetime().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  frequency: z.string().nullable().optional(),
  separation: z.number().int().positive().optional(),
  count: z.number().int().positive().nullable().optional(),
  until: z.string().datetime().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  priceInfo: z.string().nullable().optional(),
  timezoneName: z.string().optional(),
  rule: z.string().min(1),
  status: z.number().int().optional(),
});

