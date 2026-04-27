import { z } from 'zod';

function trimEmpty(v: unknown) {
  if (typeof v === 'string' && v.trim() === '') {
    return undefined;
  }

  return v;
}

export const uploadMediaFormSchema = z.object({
  ownerType: z.enum(['AGENT', 'SPACE', 'PROJECT', 'EVENT', 'OPPORTUNITY']),
  ownerId: z.string().uuid(),
  kind: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  title: z.preprocess(trimEmpty, z.string().max(512).optional()),
  caption: z.preprocess(trimEmpty, z.string().optional()),
  thumbnailUrl: z.preprocess(trimEmpty, z.string().url().optional()),
  externalUrl: z.preprocess(trimEmpty, z.string().url().optional()),
});

export type UploadMediaForm = z.infer<typeof uploadMediaFormSchema>;
