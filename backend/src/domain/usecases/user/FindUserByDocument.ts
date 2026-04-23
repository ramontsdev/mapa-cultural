import { UserModel } from '../../models/userModel';

export interface IFindUserByDocument {
  findByDocument(document: string): Promise<UserModel | null>;
}
