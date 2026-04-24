import { z } from "zod";

// Schema para cadastro de usuário
export const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  documento: z
    .string()
    .min(11, "Informe um CPF válido")
    .max(20, "Documento muito longo"),
  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmarSenha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
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
  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Confirmação de e-mail
export const confirmarEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  codigo: z.string().min(4, "Código inválido"),
});

export type ConfirmarEmailFormData = z.infer<typeof confirmarEmailSchema>;

// Esqueci minha senha
export const esqueciSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type EsqueciSenhaFormData = z.infer<typeof esqueciSenhaSchema>;

// Redefinir senha
export const redefinirSenhaSchema = z
  .object({
    email: z.string().email("Email inválido"),
    codigo: z.string().min(4, "Código inválido"),
    senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmarSenha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;

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

const tipoLugarZ = z.enum([
  "centro_cultural",
  "teatro",
  "museu",
  "galeria",
  "praca",
  "biblioteca",
  "cinema",
  "espaco_multiuso",
  "bar_cultural",
  "outro",
]);

const areaAtuacaoZ = z.enum([
  "musica",
  "danca",
  "teatro",
  "artes_visuais",
  "literatura",
  "audiovisual",
  "cultura_popular",
  "patrimonio_cultural",
  "gastronomia",
  "artesanato",
]);

/** Formulário rápido do modal “Criar espaço”. */
export const criarEspacoRapidoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: tipoLugarZ,
  areasAtuacao: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de atuação"),
  descricao: z
    .string()
    .min(10, "Use pelo menos 10 caracteres na descrição")
    .max(400, "Máximo 400 caracteres"),
});

export type CriarEspacoRapidoFormData = z.infer<typeof criarEspacoRapidoSchema>;

/** Edição completa do espaço (rascunho ou publicado). */
export const espacoEdicaoFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: tipoLugarZ,
  descricao: z
    .string()
    .min(10, "Use pelo menos 10 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
  areasAtuacao: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de atuação"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  logradouro: z.string(),
  numero: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string(),
  cep: z.string(),
  acessibilidade: z.boolean(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  horarioFuncionamento: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
});

export type EspacoEdicaoFormData = z.infer<typeof espacoEdicaoFormSchema>;

export function validateEspacoForPublish(
  data: EspacoEdicaoFormData
): string | null {
  if (data.logradouro.trim().length < 3) {
    return "Informe o logradouro para publicar.";
  }
  if (data.cidade.trim().length < 2) {
    return "Informe o município para publicar.";
  }
  if (data.estado.trim().length !== 2) {
    return "Informe a UF com 2 letras para publicar.";
  }
  if (data.cep.replace(/\D/g, "").length < 8) {
    return "Informe um CEP válido para publicar.";
  }
  return null;
}

const classificacaoEtariaZ = z.enum([
  "livre",
  "10",
  "12",
  "14",
  "16",
  "18",
]);

const tipoOportunidadeZ = z.enum([
  "edital",
  "concurso",
  "premio",
  "oficina",
  "residencia",
  "bolsa",
  "patrocinio",
]);

const tipoProjetoZ = z.enum([
  "intercambio_cultural",
  "oficina",
  "festival",
  "exposicao",
  "producao",
  "pesquisa",
  "formacao",
]);

export const criarEventoRapidoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z
    .string()
    .min(10, "Use pelo menos 10 caracteres")
    .max(400, "Máximo 400 caracteres"),
  dataInicio: z.string().min(1, "Informe a data do evento"),
  horario: z.string().min(1, "Informe o horário"),
  classificacao: classificacaoEtariaZ,
  entrada: z.enum(["gratuito", "pago"]),
  preco: z.string().optional(),
  areasAtuacao: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de atuação"),
});

export type CriarEventoRapidoFormData = z.infer<typeof criarEventoRapidoSchema>;

export const criarOportunidadeRapidoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: tipoOportunidadeZ,
  descricao: z
    .string()
    .min(10, "Use pelo menos 10 caracteres")
    .max(400, "Máximo 400 caracteres"),
  dataInscricaoInicio: z.string().min(1, "Informe a data de início"),
  dataInscricaoFim: z.string().min(1, "Informe a data de fim"),
  areasInteresse: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de interesse"),
});

export type CriarOportunidadeRapidoFormData = z.infer<
  typeof criarOportunidadeRapidoSchema
>;

export const criarProjetoRapidoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: tipoProjetoZ,
  descricao: z
    .string()
    .min(10, "Use pelo menos 10 caracteres")
    .max(400, "Máximo 400 caracteres"),
  responsavel: z.string().min(2, "Informe o responsável"),
  areasAtuacao: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de atuação"),
});

export type CriarProjetoRapidoFormData = z.infer<
  typeof criarProjetoRapidoSchema
>;

export const criarAgenteRapidoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipoAtuacao: z.enum(["individual", "coletivo"]),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  biografia: z
    .string()
    .min(10, "Use pelo menos 10 caracteres")
    .max(500, "Máximo 500 caracteres"),
  areasAtuacao: z
    .array(areaAtuacaoZ)
    .min(1, "Adicione pelo menos uma área de atuação"),
});

export type CriarAgenteRapidoFormData = z.infer<typeof criarAgenteRapidoSchema>;

/** Edição de evento salvo em “Meus eventos” (local). */
export const meuEventoEdicaoSchema = criarEventoRapidoSchema.extend({
  dataFim: z.string().optional(),
  lugarId: z.string().optional(),
  tags: z.string().optional(),
  imagem: z
    .string()
    .optional()
    .refine(
      (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
      "URL da imagem inválida"
    ),
});

export type MeuEventoEdicaoFormData = z.infer<typeof meuEventoEdicaoSchema>;

/** Edição de oportunidade (local). */
export const meuOportunidadeEdicaoSchema = criarOportunidadeRapidoSchema.extend({
  requisitos: z.string().max(2000).optional(),
  valorPremio: z.string().optional(),
  link: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type MeuOportunidadeEdicaoFormData = z.infer<
  typeof meuOportunidadeEdicaoSchema
>;

/** Edição de projeto (local). */
export const meuProjetoEdicaoSchema = criarProjetoRapidoSchema.extend({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  parceiros: z.string().optional(),
  imagem: z
    .string()
    .optional()
    .refine(
      (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
      "URL da imagem inválida"
    ),
});

export type MeuProjetoEdicaoFormData = z.infer<typeof meuProjetoEdicaoSchema>;

/** Edição de agente (local). */
export const meuAgenteEdicaoSchema = criarAgenteRapidoSchema.extend({
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  oQueFaz: z.string().max(200).optional(),
});

export type MeuAgenteEdicaoFormData = z.infer<typeof meuAgenteEdicaoSchema>;

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
