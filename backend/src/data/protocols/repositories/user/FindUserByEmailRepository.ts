import { UserModel } from '@/domain/models/userModel';

export interface IFindUserByEmailRepository {
  findByEmail(email: string): Promise<UserModel | null>
}
