export interface IDecrypter {
  decrypt(token: string): Promise<Record<string, unknown> | null>;
}
