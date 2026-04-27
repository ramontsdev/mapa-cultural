// Tipos para a plataforma Mapa Cultural

export type UserRole = 
  | "artista"
  | "promotor_eventos"
  | "empresario"
  | "dono_estabelecimento"
  | "produtor_cultural"
  | "gestor_publico"
  | "educador"
  | "pesquisador";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  artista: "Artista",
  promotor_eventos: "Promotor de Eventos",
  empresario: "Empresário",
  dono_estabelecimento: "Dono de Estabelecimento",
  produtor_cultural: "Produtor Cultural",
  gestor_publico: "Gestor Público",
  educador: "Educador",
  pesquisador: "Pesquisador",
};

export type AreaAtuacao =
  | "musica"
  | "danca"
  | "teatro"
  | "artes_visuais"
  | "literatura"
  | "audiovisual"
  | "cultura_popular"
  | "patrimonio_cultural"
  | "gastronomia"
  | "artesanato";

export const AREA_ATUACAO_LABELS: Record<AreaAtuacao, string> = {
  musica: "Música",
  danca: "Dança",
  teatro: "Teatro",
  artes_visuais: "Artes Visuais",
  literatura: "Literatura",
  audiovisual: "Audiovisual",
  cultura_popular: "Cultura Popular",
  patrimonio_cultural: "Patrimônio Cultural",
  gastronomia: "Gastronomia",
  artesanato: "Artesanato",
};

export interface User {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  /** URL da imagem de capa (banner) do perfil. */
  coverUrl?: string;
  roles: UserRole[];
  areasAtuacao: AreaAtuacao[];
  biografia?: string;
  oQueFaz?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  website?: string;
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  isBrasileiro: boolean;
  aceitouTermos: boolean;
  createdAt: string;
  tipoAtuacao: "individual" | "coletivo";
}

export type TipoLugar =
  | "centro_cultural"
  | "teatro"
  | "museu"
  | "galeria"
  | "praca"
  | "biblioteca"
  | "cinema"
  | "espaco_multiuso"
  | "bar_cultural"
  | "outro";

export const TIPO_LUGAR_LABELS: Record<TipoLugar, string> = {
  centro_cultural: "Centro Cultural",
  teatro: "Teatro",
  museu: "Museu",
  galeria: "Galeria de Arte",
  praca: "Praça",
  biblioteca: "Biblioteca",
  cinema: "Cinema",
  espaco_multiuso: "Espaço Multiuso",
  bar_cultural: "Bar/Casa de Shows",
  outro: "Outro",
};

export interface Lugar {
  id: string;
  nome: string;
  tipo: TipoLugar;
  descricao: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
  };
  acessibilidade: boolean;
  areasAtuacao: AreaAtuacao[];
  imagem?: string;
  avatarUrl?: string;
  coverUrl?: string;
  telefone?: string;
  email?: string;
  website?: string;
  horarioFuncionamento?: string;
  redesSociais?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  createdById: string;
  createdAt: string;
  isOficial: boolean;
}

/** Espaços criados pelo usuário (persistência local até existir API). */
export type MeuEspacoStatus = "draft" | "published";

export interface MeuEspacoRecord {
  id: string;
  status: MeuEspacoStatus;
  updatedAt: string;
  lugar: Lugar;
}

export type ClassificacaoEtaria = "livre" | "10" | "12" | "14" | "16" | "18";

export const CLASSIFICACAO_LABELS: Record<ClassificacaoEtaria, string> = {
  livre: "Livre",
  "10": "10 anos",
  "12": "12 anos",
  "14": "14 anos",
  "16": "16 anos",
  "18": "18 anos",
};

export interface Evento {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  horario: string;
  lugarId?: string;
  lugar?: Lugar;
  enderecoCustom?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
  };
  classificacao: ClassificacaoEtaria;
  entrada: "gratuito" | "pago";
  preco?: number;
  areasAtuacao: AreaAtuacao[];
  tags: string[];
  imagem?: string;
  avatarUrl?: string;
  coverUrl?: string;
  createdById: string;
  createdAt: string;
  isOficial: boolean;
}

// Tipos para Oportunidades
export type TipoOportunidade =
  | "edital"
  | "concurso"
  | "premio"
  | "oficina"
  | "residencia"
  | "bolsa"
  | "patrocinio";

export const TIPO_OPORTUNIDADE_LABELS: Record<TipoOportunidade, string> = {
  edital: "Edital",
  concurso: "Concurso",
  premio: "Prêmio",
  oficina: "Oficina",
  residencia: "Residência Artística",
  bolsa: "Bolsa",
  patrocinio: "Patrocínio",
};

export type StatusOportunidade = "aberta" | "encerrada" | "futura";

export interface Oportunidade {
  id: string;
  nome: string;
  tipo: TipoOportunidade;
  descricao: string;
  dataInscricaoInicio: string;
  dataInscricaoFim: string;
  areasInteresse: AreaAtuacao[];
  requisitos?: string;
  valorPremio?: number;
  link?: string;
  isOficial: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  createdById: string;
  createdAt: string;
}

// Tipos para Projetos
export type TipoProjeto =
  | "intercambio_cultural"
  | "oficina"
  | "festival"
  | "exposicao"
  | "producao"
  | "pesquisa"
  | "formacao";

export const TIPO_PROJETO_LABELS: Record<TipoProjeto, string> = {
  intercambio_cultural: "Intercâmbio Cultural",
  oficina: "Oficina",
  festival: "Festival",
  exposicao: "Exposição",
  producao: "Produção",
  pesquisa: "Pesquisa",
  formacao: "Formação",
};

export interface Projeto {
  id: string;
  nome: string;
  tipo: TipoProjeto;
  descricao: string;
  dataInicio?: string;
  dataFim?: string;
  areasAtuacao: AreaAtuacao[];
  responsavel: string;
  parceiros?: string[];
  isOficial: boolean;
  imagem?: string;
  avatarUrl?: string;
  coverUrl?: string;
  createdById: string;
  createdAt: string;
}

export type MeuEventoRecord = {
  id: string;
  status: MeuEspacoStatus;
  updatedAt: string;
  evento: Evento;
};

export type MeuOportunidadeRecord = {
  id: string;
  status: MeuEspacoStatus;
  updatedAt: string;
  oportunidade: Oportunidade;
};

export type MeuProjetoRecord = {
  id: string;
  status: MeuEspacoStatus;
  updatedAt: string;
  projeto: Projeto;
};

export type MeuAgenteRecord = {
  id: string;
  status: MeuEspacoStatus;
  updatedAt: string;
  agente: User;
};
