import { UserModel } from '@/domain/models/userModel';

export type UpdateUserDto = {
  id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface IUpdateUser {
  update(updateUserDto: UpdateUserDto): Promise<UserModel>;
}
