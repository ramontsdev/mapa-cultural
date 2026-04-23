import { UserModel } from '../../models/userModel';

export interface IFindUserById {
  findById(id: string): Promise<UserModel | null>;
}
