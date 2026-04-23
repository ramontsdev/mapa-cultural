export type VerificationCodeModel = {
  id: string;
  code: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
