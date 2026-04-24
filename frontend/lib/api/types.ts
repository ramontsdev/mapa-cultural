import {
  AREA_ATUACAO_LABELS,
  AreaAtuacao,
  ClassificacaoEtaria,
  Evento,
  Lugar,
  Oportunidade,
  Projeto,
  TIPO_LUGAR_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  TIPO_PROJETO_LABELS,
  TipoLugar,
  TipoOportunidade,
  TipoProjeto,
  USER_ROLE_LABELS,
  User,
  UserRole,
} from "@/lib/types";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  document: string;
  isEmailVerified: boolean;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentDTO = {
  id: string;
  appUserId: string | null;
  name: string;
  agentType: number;
  publicLocation: boolean | null;
  geoLocation: string;
  shortDescription: string | null;
  longDescription: string | null;
  createTimestamp: string;
  updateTimestamp: string | null;
  status: number;
  userId: string;
  parentId: string | null;
  subsiteId: string | null;
};

export type SpaceDTO = {
  id: string;
  name: string;
  isPublic: boolean;
  shortDescription: string | null;
  longDescription: string | null;
  geoLocation: string;
  createTimestamp: string;
  updateTimestamp: string | null;
  spaceType: number;
  agentId: string;
  parentId: string | null;
  subsiteId: string | null;
  status: number;
};

export type ProjectDTO = {
  id: string;
  name: string;
  projectType: number;
  shortDescription: string | null;
  longDescription: string | null;
  startsOn: string | null;
  endsOn: string | null;
  createTimestamp: string;
  updateTimestamp: string | null;
  status: number;
  agentId: string;
  parentId: string | null;
  subsiteId: string | null;
};

export type EventDTO = {
  id: string;
  name: string;
  eventType: number | null;
  shortDescription: string;
  longDescription: string | null;
  rules: string | null;
  createTimestamp: string;
  updateTimestamp: string | null;
  status: number;
  agentId: string;
  projectId: string | null;
  subsiteId: string | null;
  occurrences?: EventOccurrenceDTO[];
};

export type EventOccurrenceDTO = {
  id: string;
  eventId: string;
  spaceId: string;
  startsOn: string | null;
  endsOn: string | null;
  startsAt: string | null;
  endsAt: string | null;
  frequency: string | null;
  separation: number;
  count: number | null;
  until: string | null;
  description: string | null;
  price: string | null;
  priceInfo: string | null;
  timezoneName: string;
  rule: string;
  status: number;
  space?: SpaceDTO | null;
};

export type OpportunityDTO = {
  id: string;
  name: string;
  shortDescription: string;
  objectType: string;
  objectId: string;
  opportunityType: number;
  registrationFrom: string;
  registrationTo: string;
  publishedRegistrations: boolean;
  createTimestamp: string;
  updateTimestamp: string | null;
  status: number;
  agentId: string;
  parentId: string | null;
  subsiteId: string | null;
};

export type RegistrationDTO = {
  id: string;
  number: string | null;
  category: string | null;
  opportunityId: string;
  agentId: string;
  createTimestamp: string;
  status: number;
  proponentType: string;
  registrationRange: string;
};

export function safeParseAreas(value: string | null | undefined): AreaAtuacao[] {
  if (!value) return [];
  const pieces = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const valid = new Set(Object.keys(AREA_ATUACAO_LABELS));
  return pieces.filter((piece): piece is AreaAtuacao => valid.has(piece));
}

function safeParseRoles(value: string | null | undefined): UserRole[] {
  if (!value) return [];
  const pieces = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const valid = new Set(Object.keys(USER_ROLE_LABELS));
  return pieces.filter((piece): piece is UserRole => valid.has(piece));
}

const TIPO_LUGAR_VALUES = new Set<TipoLugar>(
  Object.keys(TIPO_LUGAR_LABELS) as TipoLugar[],
);

const TIPO_OPORTUNIDADE_VALUES = new Set<TipoOportunidade>(
  Object.keys(TIPO_OPORTUNIDADE_LABELS) as TipoOportunidade[],
);

const TIPO_PROJETO_VALUES = new Set<TipoProjeto>(
  Object.keys(TIPO_PROJETO_LABELS) as TipoProjeto[],
);

function parseShortDescription(shortDescription: string | null | undefined) {
  if (!shortDescription) return { text: "", meta: {} as Record<string, string> };
  const meta: Record<string, string> = {};
  const lines = shortDescription.split("\n");
  const textLines: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*\[([a-zA-Z0-9_-]+)\]\s*:\s*(.+)$/);
    if (match) {
      meta[match[1]] = match[2].trim();
    } else {
      textLines.push(line);
    }
  }
  return { text: textLines.join("\n").trim(), meta };
}

export function formatMetadata(
  text: string,
  meta: Record<string, string | undefined>,
): string {
  const metaLines = Object.entries(meta)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `[${key}]: ${value}`);
  const trimmedText = text.trim();
  const pieces = [trimmedText, ...metaLines].filter(Boolean);
  return pieces.join("\n");
}

export function mapAgentToUser(agent: AgentDTO): User {
  const { text, meta } = parseShortDescription(agent.shortDescription);
  const tipoAtuacao = meta.tipoAtuacao === "coletivo" ? "coletivo" : "individual";
  return {
    id: agent.id,
    nome: agent.name,
    email: meta.email ?? "",
    biografia: agent.longDescription ?? text ?? "",
    oQueFaz: text || undefined,
    cidade: meta.cidade || undefined,
    estado: meta.estado || undefined,
    telefone: meta.telefone || undefined,
    website: meta.website || undefined,
    redesSociais: {
      instagram: meta.instagram,
      facebook: meta.facebook,
      twitter: meta.twitter,
    },
    roles: safeParseRoles(meta.roles),
    areasAtuacao: safeParseAreas(meta.areas),
    isBrasileiro: true,
    aceitouTermos: true,
    createdAt: agent.createTimestamp,
    tipoAtuacao,
  };
}

export function mapSpaceToLugar(space: SpaceDTO): Lugar {
  const { text, meta } = parseShortDescription(space.shortDescription);
  const tipoCandidate = (meta.tipo ?? "outro") as TipoLugar;
  const tipo: TipoLugar = TIPO_LUGAR_VALUES.has(tipoCandidate)
    ? tipoCandidate
    : "outro";
  return {
    id: space.id,
    nome: space.name,
    tipo,
    descricao: space.longDescription ?? text ?? "",
    endereco: {
      logradouro: meta.logradouro ?? "",
      numero: meta.numero ?? "",
      bairro: meta.bairro ?? "",
      cidade: meta.cidade ?? "",
      estado: meta.estado ?? "",
      cep: meta.cep ?? "",
    },
    coordenadas:
      meta.lat && meta.lng
        ? { lat: Number(meta.lat), lng: Number(meta.lng) }
        : undefined,
    acessibilidade: meta.acessibilidade === "true",
    areasAtuacao: safeParseAreas(meta.areas),
    telefone: meta.telefone,
    email: meta.email,
    website: meta.website,
    horarioFuncionamento: meta.horario,
    redesSociais: {
      instagram: meta.instagram,
      facebook: meta.facebook,
      twitter: meta.twitter,
      youtube: meta.youtube,
    },
    createdById: space.agentId,
    createdAt: space.createTimestamp,
    isOficial: false,
  };
}

function pickPrimaryOccurrence(
  occurrences: EventOccurrenceDTO[] | undefined,
): EventOccurrenceDTO | null {
  if (!occurrences || occurrences.length === 0) return null;
  const now = Date.now();
  const withStart = occurrences
    .map((occ) => {
      const start = occ.startsAt ?? occ.startsOn;
      return start
        ? { occ, startMs: new Date(start).getTime() }
        : { occ, startMs: Number.NaN };
    })
    .filter((entry) => !Number.isNaN(entry.startMs));

  if (withStart.length === 0) return occurrences[0];

  const upcoming = withStart
    .filter((entry) => entry.startMs >= now)
    .sort((a, b) => a.startMs - b.startMs)[0];
  if (upcoming) return upcoming.occ;

  const latestPast = withStart.sort((a, b) => b.startMs - a.startMs)[0];
  return latestPast.occ;
}

function extractOccurrenceInfo(
  occurrence: EventOccurrenceDTO | null,
): { dataInicio: string; dataFim?: string; horario: string } {
  if (!occurrence) return { dataInicio: "", horario: "" };

  const startISO = occurrence.startsAt ?? occurrence.startsOn ?? "";
  const endISO = occurrence.endsAt ?? occurrence.endsOn ?? undefined;

  let horario = "";
  if (occurrence.startsAt) {
    const startDate = new Date(occurrence.startsAt);
    if (!Number.isNaN(startDate.getTime())) {
      horario = startDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return { dataInicio: startISO, dataFim: endISO, horario };
}

export function mapEventToEvento(event: EventDTO): Evento {
  const { text, meta } = parseShortDescription(event.shortDescription);
  const classificacaoCandidate = (meta.classificacao ?? "livre") as ClassificacaoEtaria;
  const allowedClassificacoes = new Set<ClassificacaoEtaria>([
    "livre",
    "10",
    "12",
    "14",
    "16",
    "18",
  ]);
  const classificacao = allowedClassificacoes.has(classificacaoCandidate)
    ? classificacaoCandidate
    : "livre";

  const occurrence = pickPrimaryOccurrence(event.occurrences);
  const occurrenceInfo = extractOccurrenceInfo(occurrence);
  const occurrenceSpace = occurrence?.space ?? null;
  const lugar = occurrenceSpace ? mapSpaceToLugar(occurrenceSpace) : undefined;

  return {
    id: event.id,
    nome: event.name,
    descricao: event.longDescription ?? text ?? "",
    dataInicio: occurrenceInfo.dataInicio || meta.dataInicio || "",
    dataFim: occurrenceInfo.dataFim ?? meta.dataFim,
    horario: occurrenceInfo.horario || meta.horario || "",
    lugarId: lugar?.id,
    lugar,
    classificacao,
    entrada: meta.entrada === "pago" ? "pago" : "gratuito",
    preco: meta.preco ? Number(meta.preco) : undefined,
    areasAtuacao: safeParseAreas(meta.areas),
    tags: (meta.tags ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    imagem: meta.imagem || undefined,
    createdById: event.agentId,
    createdAt: event.createTimestamp,
    isOficial: false,
  };
}

export function mapOpportunityToOportunidade(
  opportunity: OpportunityDTO,
): Oportunidade {
  const { text, meta } = parseShortDescription(opportunity.shortDescription);
  const tipoCandidate = (meta.tipo ?? "edital") as TipoOportunidade;
  const tipo: TipoOportunidade = TIPO_OPORTUNIDADE_VALUES.has(tipoCandidate)
    ? tipoCandidate
    : "edital";
  return {
    id: opportunity.id,
    nome: opportunity.name,
    tipo,
    descricao: text,
    dataInscricaoInicio: opportunity.registrationFrom,
    dataInscricaoFim: opportunity.registrationTo,
    areasInteresse: safeParseAreas(meta.areas),
    requisitos: meta.requisitos,
    valorPremio: meta.valor ? Number(meta.valor) : undefined,
    link: meta.link,
    isOficial: false,
    createdById: opportunity.agentId,
    createdAt: opportunity.createTimestamp,
  };
}

export function mapProjectToProjeto(project: ProjectDTO): Projeto {
  const { text, meta } = parseShortDescription(project.shortDescription);
  const tipoCandidate = (meta.tipo ?? "producao") as TipoProjeto;
  const tipo: TipoProjeto = TIPO_PROJETO_VALUES.has(tipoCandidate)
    ? tipoCandidate
    : "producao";
  return {
    id: project.id,
    nome: project.name,
    tipo,
    descricao: project.longDescription ?? text ?? "",
    dataInicio: project.startsOn ?? undefined,
    dataFim: project.endsOn ?? undefined,
    areasAtuacao: safeParseAreas(meta.areas),
    responsavel: meta.responsavel ?? "",
    parceiros: meta.parceiros
      ? meta.parceiros.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
    isOficial: false,
    createdById: project.agentId,
    createdAt: project.createTimestamp,
  };
}
