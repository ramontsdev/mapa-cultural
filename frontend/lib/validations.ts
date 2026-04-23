import { z } from "zod";

// Schema para cadastro de usuário
export const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  isBrasileiro: z.boolean().refine((val) => val === true, {
    message: "Você precisa confirmar que é brasileiro",
  }),
  aceitouTermos: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos",
  }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
});

export type CadastroFormData = z.infer<typeof cadastroSchema>;

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema para perfil de usuário
export const perfilSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  biografia: z.string().max(500, "Biografia deve ter no máximo 500 caracteres").optional(),
  oQueFaz: z.string().max(200, "Descrição deve ter no máximo 200 caracteres").optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  tipoAtuacao: z.enum(["individual", "coletivo"]),
  roles: z.array(z.string()).min(1, "Selecione pelo menos uma atribuição"),
  areasAtuacao: z.array(z.string()).min(1, "Selecione pelo menos uma área de atuação"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;

// Schema para lugar
export const lugarSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione um tipo"),
  descricao: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  logradouro: z.string().min(3, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  cep: z.string().min(8, "CEP inválido"),
  acessibilidade: z.boolean(),
  areasAtuacao: z.array(z.string()).min(1, "Selecione pelo menos uma área de atuação"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  horarioFuncionamento: z.string().optional(),
});

export type LugarFormData = z.infer<typeof lugarSchema>;

// Schema para evento
export const eventoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().optional(),
  horario: z.string().min(1, "Horário é obrigatório"),
  lugarId: z.string().optional(),
  usarEnderecoCustom: z.boolean(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  classificacao: z.enum(["livre", "10", "12", "14", "16", "18"]),
  entrada: z.enum(["gratuito", "pago"]),
  preco: z.number().optional(),
  areasAtuacao: z.array(z.string()).min(1, "Selecione pelo menos uma área"),
  tags: z.string().optional(),
});

export type EventoFormData = z.infer<typeof eventoSchema>;

// Schema para oportunidade
export const oportunidadeSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione um tipo"),
  descricao: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  dataInscricaoInicio: z.string().min(1, "Data de início das inscrições é obrigatória"),
  dataInscricaoFim: z.string().min(1, "Data de fim das inscrições é obrigatória"),
  areasInteresse: z.array(z.string()).min(1, "Selecione pelo menos uma área de interesse"),
  requisitos: z.string().optional(),
  valorPremio: z.number().optional(),
  link: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type OportunidadeFormData = z.infer<typeof oportunidadeSchema>;

// Schema para projeto
export const projetoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione um tipo"),
  descricao: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  areasAtuacao: z.array(z.string()).min(1, "Selecione pelo menos uma área"),
  responsavel: z.string().min(3, "Nome do responsável é obrigatório"),
  parceiros: z.string().optional(),
});

export type ProjetoFormData = z.infer<typeof projetoSchema>;
