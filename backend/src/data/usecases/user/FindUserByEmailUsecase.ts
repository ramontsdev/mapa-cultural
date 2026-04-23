import { IFindUserByEmailRepository } from '@/data/protocols/repositories/user/FindUserByEmailRepository';
import { UserModel } from '@/domain/models/userModel';
import { IFindUserByEmail } from '@/domain/usecases/user/FindUserByEmail';

export class FindUserByEmailUsecase implements IFindUserByEmail {
  constructor(private readonly userRepository: IFindUserByEmailRepository) {}

  async findByEmail(email: string): Promise<UserModel | null> {
    const user = await this.userRepository.findByEmail(email);

    return user;
  }
}
