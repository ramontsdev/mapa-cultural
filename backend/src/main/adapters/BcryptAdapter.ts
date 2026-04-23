import bcrypt from 'bcryptjs';

import { IHashComparer } from '@/domain/cryptography/hashComparer';
import { IHasher } from '@/domain/cryptography/hasher';

export class BcryptAdapter implements IHashComparer, IHasher {
  constructor(private readonly salt: number) {}

  async compare(value: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(value, hash);

    return isValid;
  }

  async hash(value: string): Promise<string> {
    const hash = await bcrypt.hash(value, this.salt);

    return hash;
  }
}
