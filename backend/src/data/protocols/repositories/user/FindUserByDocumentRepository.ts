import { UserModel } from '@/domain/models/userModel';

export interface IFindUserByDocumentRepository {
  findByDocument(document: string): Promise<UserModel | null>;
}
