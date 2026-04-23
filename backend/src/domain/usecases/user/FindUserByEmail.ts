import { UserModel } from '@/domain/models/userModel';

export interface IFindUserByEmail {
  findByEmail(email: string): Promise<UserModel | null>;
}
