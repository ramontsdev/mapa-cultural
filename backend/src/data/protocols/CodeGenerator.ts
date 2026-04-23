export interface ICodeGenerator {
  generate(value?: string): Promise<string>;
}
