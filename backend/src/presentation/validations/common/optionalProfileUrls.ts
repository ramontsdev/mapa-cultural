import { z } from 'zod';

const MAX_URL = 4096;

/** URL https ou limpar com "" / null (útil em PATCH). */
export const optionalProfileUrl = z.preprocess(
  (val) => {
    if (val === '' || val === null) return null;
    if (val === undefined) return undefined;
    return val;
  },
  z.union([z.string().url().max(MAX_URL), z.null()]).optional(),
);
