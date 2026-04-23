import { UserModel } from '@/domain/models/userModel';

export interface IFindUserByIdRepository {
  findById(userId: string): Promise<UserModel | null>;
}
