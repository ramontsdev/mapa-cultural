import { ICreateUserRepository } from '@/data/protocols/repositories/user/CreateUserRepository';
import { UserModel } from '@/domain/models/userModel';
import { CreateUserDTO, ICreateUser } from '@/domain/usecases/user/CreateUser';

export class CreateUserUsecase implements ICreateUser {
  constructor(private readonly userRepository: ICreateUserRepository) {}

  async create(createUserDTO: CreateUserDTO): Promise<UserModel> {
    const user = await this.userRepository.create(createUserDTO);

    return user;
  }
}
