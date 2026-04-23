import { UserModel } from '@/domain/models/userModel';

export type CreateUserDTO = {
  name: string;
  email: string;
  document: string;
  password: string;
};

export interface ICreateUser {
  create(createUserDTO: CreateUserDTO): Promise<UserModel>;
}
