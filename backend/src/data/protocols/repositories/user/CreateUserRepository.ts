import { UserModel } from '@/domain/models/userModel';
import { CreateUserDTO } from '@/domain/usecases/user/CreateUser';

export interface ICreateUserRepository {
  create(data: CreateUserDTO): Promise<UserModel>;
}
