import { IUpdateUserRepository } from '@/data/protocols/repositories/user/UpdateUserRepository';
import { UserModel } from '@/domain/models/userModel';
import { IUpdateUser, UpdateUserDto } from '@/domain/usecases/user/UpdateUser';

export class UpdateUserUsecase implements IUpdateUser {
  constructor(private readonly userRepository: IUpdateUserRepository) {}

  async update(updateUserDTO: UpdateUserDto): Promise<UserModel> {
    const user = await this.userRepository.update(updateUserDTO);

    return user;
  }
}
