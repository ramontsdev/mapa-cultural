import { JwtAdapter } from '@/main/adapters/JwtAdapter';
import { env } from '@/main/config/env';

export function makeJwtAdapter() {
  return new JwtAdapter(env.jwtSecret);
}
