import { IFindUserByDocumentRepository } from '@/data/protocols/repositories/user/FindUserByDocumentRepository';
import { UserModel } from '@/domain/models/userModel';
import { IFindUserByDocument } from '@/domain/usecases/user/FindUserByDocument';

export class FindUserByDocumentUsecase implements IFindUserByDocument {
  constructor(private readonly userRepository: IFindUserByDocumentRepository) {}

  async findByDocument(document: string): Promise<UserModel | null> {
    const user = await this.userRepository.findByDocument(document);

    return user;
  }
}
