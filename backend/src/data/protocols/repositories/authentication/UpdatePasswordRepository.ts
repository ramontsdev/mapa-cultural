import { UpdatePasswordDTO } from '@/domain/usecases/authentication/UpdatePassword';

export interface IUpdatePasswordRepository {
  updatePassword(updatePasswordData: UpdatePasswordDTO): Promise<void>;
}
