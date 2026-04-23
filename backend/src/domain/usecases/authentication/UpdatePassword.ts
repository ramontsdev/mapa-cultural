export type UpdatePasswordDTO = {
  userId: string;
  password: string;
};

export interface IUpdatePassword {
  updatePassword(updatePasswordData: UpdatePasswordDTO): Promise<void>;
}
