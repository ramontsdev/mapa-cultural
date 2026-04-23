import { BcryptAdapter } from '@/main/adapters/BcryptAdapter';

export function makeBcryptAdapter() {
  return new BcryptAdapter(12);
}
