import { IFindUserByIdRepository } from '@/data/protocols/repositories/user/FindUserByIdRepository';
import { UserModel } from '@/domain/models/userModel';
import { IFindUserById } from '@/domain/usecases/user/FindUserById';

export class FindUserByIdUsecase implements IFindUserById {
  constructor(private readonly userRepository: IFindUserByIdRepository) {}

  async findById(id: string): Promise<UserModel | null> {
    const user = await this.userRepository.findById(id);

    return user;
  }
}
