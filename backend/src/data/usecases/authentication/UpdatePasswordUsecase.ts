import { IUpdatePasswordRepository } from '@/data/protocols/repositories/authentication/UpdatePasswordRepository';
import { IUpdatePassword, UpdatePasswordDTO } from '@/domain/usecases/authentication/UpdatePassword';

export class UpdatePasswordUsecase implements IUpdatePassword {
  constructor(private readonly updatePasswordRepository: IUpdatePasswordRepository) {}

  async updatePassword(updatePasswordData: UpdatePasswordDTO): Promise<void> {
    await this.updatePasswordRepository.updatePassword(updatePasswordData);
  }
}
