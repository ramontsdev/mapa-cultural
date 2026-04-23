import { UserModel } from '@/domain/models/userModel';
import { UpdateUserDto } from '@/domain/usecases/user/UpdateUser';

export interface IUpdateUserRepository {
  update(updateUserData: UpdateUserDto): Promise<UserModel>;
}
