import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';

import { prismaClient } from '../src/infra/prisma/prismaClient';

/**
 * Seed robusto para popular o banco com dados apresentáveis.
 * Foco no estado do Piauí para casar com o conteúdo demo da UI.
 */

const PASSWORD = 'SenhaForte123!';

type AreaAtuacao =
  | 'musica'
  | 'danca'
  | 'teatro'
  | 'artes_visuais'
  | 'literatura'
  | 'audiovisual'
  | 'cultura_popular'
  | 'patrimonio_cultural'
  | 'gastronomia'
  | 'artesanato';

type TipoLugar =
  | 'centro_cultural'
  | 'teatro'
  | 'museu'
  | 'galeria'
  | 'praca'
  | 'biblioteca'
  | 'cinema'
  | 'espaco_multiuso'
  | 'bar_cultural'
  | 'outro';

type TipoProjeto =
  | 'intercambio_cultural'
  | 'oficina'
  | 'festival'
  | 'exposicao'
  | 'producao'
  | 'pesquisa'
  | 'formacao';

type TipoOportunidade =
  | 'edital'
  | 'concurso'
  | 'premio'
  | 'oficina'
  | 'residencia'
  | 'bolsa'
  | 'patrocinio';

type ClassificacaoEtaria = 'livre' | '10' | '12' | '14' | '16' | '18';

// ----------------------------- helpers ----------------------------------

function buildMeta(
  base: string,
  meta: Record<string, string | number | boolean | undefined>,
): string {
  const entries = Object.entries(meta)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `[${key}]: ${value}`);
  const pieces = [base.trim(), ...entries].filter(Boolean);
  return pieces.join('\n');
}

function areas(list: AreaAtuacao[]): string {
  return list.join(',');
}

function toIsoDate(dateString: string, time: string): string {
  // Combina data `YYYY-MM-DD` com horário `HH:MM` interpretando como horário de Brasília
  // (UTC-3) e devolve um ISO string UTC.
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));
  return dt.toISOString();
}

function toOnlyDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// --------------------------- cleanup ------------------------------------

async function cleanDatabase() {
  console.info('🧹 Limpando o banco (TRUNCATE CASCADE)…');
  await prismaClient.$executeRawUnsafe(`
    TRUNCATE TABLE
      "registration",
      "registration_step",
      "opportunity",
      "event_occurrence",
      "event",
      "project",
      "space",
      "subsite",
      "agent",
      "usr",
      "verification_codes",
      "users"
    RESTART IDENTITY CASCADE;
  `);
}

// --------------------------- users/agents -------------------------------

type UserRole =
  | 'artista'
  | 'promotor_eventos'
  | 'empresario'
  | 'dono_estabelecimento'
  | 'produtor_cultural'
  | 'gestor_publico'
  | 'educador'
  | 'pesquisador';

type UserAgentSeed = {
  name: string;
  email: string;
  document: string;
  phone: string;
  // Dados do agente
  tipoAtuacao: 'individual' | 'coletivo';
  oQueFaz: string;
  biografia: string;
  cidade: string;
  estado: string;
  areas: AreaAtuacao[];
  roles: UserRole[];
  instagram?: string;
  website?: string;
};

type CreatedAgent = { userId: string; agentId: string; name: string; tipoAtuacao: 'individual' | 'coletivo' };

async function createUserWithAgent(seed: UserAgentSeed): Promise<CreatedAgent> {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const { user, agentId } = await prismaClient.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: seed.name,
        email: seed.email,
        document: seed.document,
        phone: seed.phone,
        password: hashed,
        isEmailVerified: true,
      },
    });

    const usr = await tx.usr.create({
      data: {
        authProvider: 0,
        authUid: user.id,
        email: user.email,
        lastLoginTimestamp: null,
        createTimestamp: new Date(),
        status: 1,
        profileId: null,
      },
    });

    const newAgentId = randomUUID();

    const shortDescription = buildMeta(seed.oQueFaz, {
      tipoAtuacao: seed.tipoAtuacao,
      cidade: seed.cidade,
      estado: seed.estado,
      telefone: seed.phone,
      email: seed.email,
      areas: areas(seed.areas),
      roles: seed.roles.join(','),
      instagram: seed.instagram,
      website: seed.website,
    });

    await tx.$executeRaw`
      INSERT INTO "agent" (
        "id", "app_user_id", "type", "name", "public_location", "location",
        "_geo_location", "short_description", "long_description",
        "create_timestamp", "status", "parent_id", "user_id",
        "update_timestamp", "subsite_id"
      ) VALUES (
        ${newAgentId},
        ${user.id},
        ${seed.tipoAtuacao === 'coletivo' ? 2 : 1},
        ${seed.name},
        ${true},
        '(0,0)'::point,
        ${''},
        ${shortDescription},
        ${seed.biografia},
        ${new Date()},
        ${1},
        ${null},
        ${usr.id},
        ${null},
        ${null}
      );
    `;

    await tx.usr.update({
      where: { id: usr.id },
      data: { profileId: newAgentId },
    });

    return { user, agentId: newAgentId };
  });

  return {
    userId: user.id,
    agentId,
    name: seed.name,
    tipoAtuacao: seed.tipoAtuacao,
  };
}

// --------------------------- spaces --------------------------------------

type SpaceSeed = {
  name: string;
  agentId: string;
  tipo: TipoLugar;
  oQueFaz: string;
  descricao: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  lat: number;
  lng: number;
  acessibilidade?: boolean;
  areas: AreaAtuacao[];
  telefone?: string;
  website?: string;
  horario?: string;
  instagram?: string;
};

const TIPO_LUGAR_TO_INT: Record<TipoLugar, number> = {
  centro_cultural: 1,
  teatro: 2,
  museu: 3,
  galeria: 4,
  praca: 5,
  biblioteca: 6,
  cinema: 7,
  espaco_multiuso: 8,
  bar_cultural: 9,
  outro: 10,
};

async function createSpace(seed: SpaceSeed): Promise<string> {
  const id = randomUUID();

  const shortDescription = buildMeta(seed.oQueFaz, {
    tipo: seed.tipo,
    logradouro: seed.logradouro,
    numero: seed.numero,
    bairro: seed.bairro,
    cidade: seed.cidade,
    estado: seed.estado,
    cep: seed.cep,
    lat: seed.lat.toString(),
    lng: seed.lng.toString(),
    acessibilidade: seed.acessibilidade ? 'true' : 'false',
    areas: areas(seed.areas),
    telefone: seed.telefone,
    website: seed.website,
    horario: seed.horario,
    instagram: seed.instagram,
  });

  await prismaClient.$executeRaw`
    INSERT INTO "space" (
      "id", "location", "_geo_location", "name", "public",
      "short_description", "long_description", "create_timestamp", "status",
      "type", "agent_id", "update_timestamp", "subsite_id", "parent_id"
    ) VALUES (
      ${id},
      '(0,0)'::point,
      ${''},
      ${seed.name},
      ${true},
      ${shortDescription},
      ${seed.descricao},
      ${new Date()},
      ${1},
      ${TIPO_LUGAR_TO_INT[seed.tipo]},
      ${seed.agentId},
      ${null},
      ${null},
      ${null}
    );
  `;

  return id;
}

// --------------------------- projects ------------------------------------

type ProjectSeed = {
  name: string;
  agentId: string;
  tipo: TipoProjeto;
  descricaoCurta: string;
  descricaoLonga: string;
  responsavel: string;
  parceiros?: string[];
  startsOn?: string;
  endsOn?: string;
  areas: AreaAtuacao[];
  imagem?: string;
};

async function createProject(seed: ProjectSeed): Promise<string> {
  const project = await prismaClient.project.create({
    data: {
      projectType: 1,
      name: seed.name,
      shortDescription: buildMeta(seed.descricaoCurta, {
        tipo: seed.tipo,
        responsavel: seed.responsavel,
        parceiros: seed.parceiros?.join(','),
        areas: areas(seed.areas),
        imagem: seed.imagem,
      }),
      longDescription: seed.descricaoLonga,
      updateTimestamp: null,
      startsOn: seed.startsOn ? toOnlyDate(seed.startsOn) : null,
      endsOn: seed.endsOn ? toOnlyDate(seed.endsOn) : null,
      createTimestamp: new Date(),
      status: 1,
      subsiteId: null,
      parentId: null,
      agentId: seed.agentId,
    },
  });

  return project.id;
}

// --------------------------- events --------------------------------------

type EventSeed = {
  name: string;
  agentId: string;
  projectId?: string | null;
  descricaoCurta: string;
  descricaoLonga: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string;
  horario: string; // HH:MM
  horarioFim?: string;
  classificacao: ClassificacaoEtaria;
  entrada: 'gratuito' | 'pago';
  preco?: number;
  areas: AreaAtuacao[];
  tags?: string[];
  imagem?: string;
  spaceId: string;
};

async function createEventWithOccurrence(seed: EventSeed): Promise<string> {
  const shortDescription = buildMeta(seed.descricaoCurta, {
    classificacao: seed.classificacao,
    entrada: seed.entrada,
    preco: seed.entrada === 'pago' && seed.preco ? seed.preco.toFixed(2) : undefined,
    areas: areas(seed.areas),
    tags: seed.tags?.join(','),
    imagem: seed.imagem,
  });

  const event = await prismaClient.event.create({
    data: {
      eventType: 1,
      name: seed.name,
      shortDescription,
      longDescription: seed.descricaoLonga,
      rules: null,
      createTimestamp: new Date(),
      status: 1,
      agentId: seed.agentId,
      projectId: seed.projectId ?? null,
      updateTimestamp: null,
      subsiteId: null,
    },
  });

  const startIso = toIsoDate(seed.dataInicio, seed.horario);
  const endIso = seed.horarioFim
    ? toIsoDate(seed.dataFim ?? seed.dataInicio, seed.horarioFim)
    : null;

  await prismaClient.eventOccurrence.create({
    data: {
      startsOn: toOnlyDate(seed.dataInicio),
      endsOn: seed.dataFim ? toOnlyDate(seed.dataFim) : null,
      startsAt: new Date(startIso),
      endsAt: endIso ? new Date(endIso) : null,
      frequency: 'once',
      separation: 1,
      count: null,
      until: toOnlyDate(seed.dataFim ?? seed.dataInicio),
      description: null,
      price: seed.entrada === 'pago' && seed.preco ? seed.preco.toFixed(2) : null,
      priceInfo: seed.entrada === 'pago' ? 'Ingresso pago' : 'Gratuito',
      timezoneName: 'America/Sao_Paulo',
      eventId: event.id,
      spaceId: seed.spaceId,
      rule: JSON.stringify({
        frequency: 'once',
        startsOn: seed.dataInicio,
        startsAt: seed.horario,
      }),
      status: 1,
    },
  });

  return event.id;
}

// --------------------------- opportunities -------------------------------

type OpportunitySeed = {
  name: string;
  agentId: string;
  tipo: TipoOportunidade;
  descricao: string;
  registrationFrom: string;
  registrationTo: string;
  requisitos?: string;
  valorPremio?: number;
  link?: string;
  areas: AreaAtuacao[];
  objectType: 'Event' | 'Project';
  objectId: string;
};

const MAPAS_OBJECT_TYPE = {
  Event: 'MapasCulturais\\Entities\\Event',
  Project: 'MapasCulturais\\Entities\\Project',
} as const;

async function createOpportunity(seed: OpportunitySeed): Promise<string> {
  const shortDescription = buildMeta(seed.descricao, {
    tipo: seed.tipo,
    areas: areas(seed.areas),
    requisitos: seed.requisitos,
    valor: seed.valorPremio?.toFixed(2),
    link: seed.link,
  });

  const opportunity = await prismaClient.opportunity.create({
    data: {
      objectType: MAPAS_OBJECT_TYPE[seed.objectType],
      objectId: seed.objectId,
      opportunityType: 1,
      name: seed.name,
      shortDescription,
      registrationFrom: new Date(seed.registrationFrom),
      registrationTo: new Date(seed.registrationTo),
      publishedRegistrations: false,
      createTimestamp: new Date(),
      updateTimestamp: null,
      publishTimestamp: null,
      autoPublish: false,
      status: 1,
      registrationProponentTypes: [],
      parentId: null,
      agentId: seed.agentId,
      subsiteId: null,
    },
  });

  return opportunity.id;
}

// ----------------------------- main --------------------------------------

async function main() {
  console.info('🌱 Iniciando seed…');
  console.info(`   DATABASE_URL = ${process.env.DATABASE_URL}\n`);

  await cleanDatabase();

  console.info('👤 Criando usuários/agentes…');
  const mariaClara = await createUserWithAgent({
    name: 'Maria Clara Silva',
    email: 'maria.clara@mapacultural.test',
    document: '11122233301',
    phone: '(86) 99911-0001',
    tipoAtuacao: 'individual',
    oQueFaz: 'Este agente atua de forma Individual',
    biografia:
      'Artista multidisciplinar com 15 anos de experiência em projetos culturais comunitários. Dedico minha vida à preservação e divulgação da cultura popular brasileira.',
    cidade: 'Teresina',
    estado: 'PI',
    areas: ['musica', 'danca', 'cultura_popular'],
    roles: ['artista', 'educador'],
    instagram: 'mariaclarasilvapi',
    website: 'https://mariaclarasilva.art',
  });

  const coletivoRaizes = await createUserWithAgent({
    name: 'Coletivo Raízes do Piauí',
    email: 'coletivo.raizes@mapacultural.test',
    document: '22233344455',
    phone: '(86) 99911-0002',
    tipoAtuacao: 'coletivo',
    oQueFaz: 'Este agente atua de forma Coletivo',
    biografia:
      'Coletivo cultural fundado em 2016, dedicado à promoção e valorização da cultura piauiense através de eventos, oficinas e projetos educacionais.',
    cidade: 'Parnaíba',
    estado: 'PI',
    areas: ['musica', 'danca', 'teatro', 'cultura_popular'],
    roles: ['produtor_cultural', 'promotor_eventos'],
    instagram: 'coletivoraizespi',
  });

  const joaoPedro = await createUserWithAgent({
    name: 'João Pedro Oliveira',
    email: 'joao.pedro@mapacultural.test',
    document: '33344455566',
    phone: '(86) 99911-0003',
    tipoAtuacao: 'individual',
    oQueFaz: 'Este agente atua de forma Individual',
    biografia:
      'Artista visual piauiense com obras expostas em galerias de todo o Brasil. Pesquisador de manifestações do patrimônio cultural do sertão.',
    cidade: 'Teresina',
    estado: 'PI',
    areas: ['artes_visuais', 'patrimonio_cultural'],
    roles: ['artista', 'pesquisador'],
    instagram: 'joaopedro.art',
  });

  const anaLuiza = await createUserWithAgent({
    name: 'Ana Luiza Santos',
    email: 'ana.luiza@mapacultural.test',
    document: '44455566677',
    phone: '(89) 99911-0004',
    tipoAtuacao: 'individual',
    oQueFaz: 'Este agente atua de forma Individual',
    biografia:
      'Escritora e atriz. Autora de três livros de poesia e diretora de espetáculos infantis que já circularam pelos interiores do Piauí.',
    cidade: 'Floriano',
    estado: 'PI',
    areas: ['literatura', 'teatro'],
    roles: ['artista', 'pesquisador', 'educador'],
    instagram: 'analuiza.escreve',
  });

  const ciaSertao = await createUserWithAgent({
    name: 'Cia Sertão Brincante',
    email: 'ciasertao@mapacultural.test',
    document: '55566677788',
    phone: '(89) 99911-0005',
    tipoAtuacao: 'coletivo',
    oQueFaz: 'Este agente atua de forma Coletivo',
    biografia:
      'Companhia de teatro e dança especializada em manifestações da cultura popular nordestina: bumba-meu-boi, reisado, cavalo-piancó e mais.',
    cidade: 'Picos',
    estado: 'PI',
    areas: ['teatro', 'danca', 'cultura_popular'],
    roles: ['artista', 'produtor_cultural'],
    instagram: 'ciasertaobrincante',
  });

  const rafaelMendes = await createUserWithAgent({
    name: 'Rafael Mendes',
    email: 'rafael.mendes@mapacultural.test',
    document: '66677788899',
    phone: '(86) 99911-0006',
    tipoAtuacao: 'individual',
    oQueFaz: 'Este agente atua de forma Individual',
    biografia:
      'Cineasta e músico independente. Documentarista de mestres da cultura popular e produtor de trilhas sonoras com influência do sertão.',
    cidade: 'Teresina',
    estado: 'PI',
    areas: ['audiovisual', 'musica'],
    roles: ['artista', 'produtor_cultural'],
    instagram: 'rafaelmendes.filma',
  });

  console.info('🏠 Criando espaços (lugares)…');
  const barDoBlues = await createSpace({
    name: 'Bar do Blues',
    agentId: mariaClara.agentId,
    tipo: 'bar_cultural',
    oQueFaz: 'Bar cultural temático com programação semanal de blues e jazz ao vivo.',
    descricao:
      'Um dos points da noite teresinense, reúne músicos autorais e grandes nomes do blues brasileiro em shows de quinta a sábado.',
    logradouro: 'Rua Grande',
    numero: '550',
    bairro: 'Centro',
    cidade: 'Teresina',
    estado: 'PI',
    cep: '64000-120',
    lat: -5.0892,
    lng: -42.8019,
    acessibilidade: true,
    areas: ['musica', 'cultura_popular'],
    telefone: '(86) 3221-1000',
    website: 'https://bardoblues.pi',
    horario: 'Qui–Sáb, 19h às 02h',
    instagram: 'bardoblues.pi',
  });

  const casaCulturaParnaiba = await createSpace({
    name: 'Casa da Cultura de Parnaíba',
    agentId: coletivoRaizes.agentId,
    tipo: 'centro_cultural',
    oQueFaz: 'Centro cultural com salão de eventos, salas de oficinas e ateliês em uma casa histórica restaurada.',
    descricao:
      'Pólo cultural do litoral piauiense. Sediou dezenas de festivais populares, oficinas comunitárias e encontros de mestres da cultura popular.',
    logradouro: 'Rua da Alegria',
    numero: '250',
    bairro: 'Centro',
    cidade: 'Parnaíba',
    estado: 'PI',
    cep: '64200-110',
    lat: -2.9056,
    lng: -41.7761,
    acessibilidade: true,
    areas: ['musica', 'danca', 'teatro', 'cultura_popular'],
    telefone: '(86) 3322-4000',
    horario: 'Ter–Dom, 9h às 21h',
    instagram: 'casaculturaparnaiba',
  });

  const teatro4Setembro = await createSpace({
    name: 'Teatro 4 de Setembro',
    agentId: coletivoRaizes.agentId,
    tipo: 'teatro',
    oQueFaz: 'Teatro histórico de Teresina, referência nas artes cênicas do Piauí.',
    descricao:
      'Fundado no início do século XX, o Teatro 4 de Setembro sedia temporadas de teatro, música e dança, com capacidade para 500 pessoas.',
    logradouro: 'Praça Pedro II',
    numero: 's/n',
    bairro: 'Centro',
    cidade: 'Teresina',
    estado: 'PI',
    cep: '64000-090',
    lat: -5.0881,
    lng: -42.8028,
    acessibilidade: true,
    areas: ['teatro', 'danca', 'musica'],
    telefone: '(86) 3221-0909',
    horario: 'Conforme programação',
  });

  const galeriaArtePiaui = await createSpace({
    name: 'Galeria Arte Piauí',
    agentId: joaoPedro.agentId,
    tipo: 'galeria',
    oQueFaz: 'Galeria independente de arte contemporânea que apoia artistas piauienses emergentes.',
    descricao:
      'Espaço com três salas expositivas, ateliê-escola e café. Abriga de 6 a 8 exposições individuais por ano, com foco em jovens artistas.',
    logradouro: 'Rua das Artes',
    numero: '88',
    bairro: 'Jóquei',
    cidade: 'Teresina',
    estado: 'PI',
    cep: '64049-310',
    lat: -5.0767,
    lng: -42.7902,
    acessibilidade: true,
    areas: ['artes_visuais'],
    website: 'https://galeriaartepi.com.br',
    horario: 'Ter–Sáb, 10h às 19h',
    instagram: 'galeriaartepiaui',
  });

  const bibliotecaParque = await createSpace({
    name: 'Biblioteca Parque de Teresina',
    agentId: anaLuiza.agentId,
    tipo: 'biblioteca',
    oQueFaz: 'Biblioteca pública com acervo digital, auditório e programação cultural gratuita.',
    descricao:
      'Biblioteca com acervo de mais de 30 mil títulos, auditório com capacidade para 200 pessoas e sala de leitura infantil. Palco de festivais literários e saraus.',
    logradouro: 'Av. Dom Severino',
    numero: '2000',
    bairro: 'Fátima',
    cidade: 'Teresina',
    estado: 'PI',
    cep: '64049-370',
    lat: -5.0801,
    lng: -42.7828,
    acessibilidade: true,
    areas: ['literatura', 'audiovisual'],
    telefone: '(86) 3216-3000',
    horario: 'Seg–Sáb, 8h às 21h',
  });

  const museuPiaui = await createSpace({
    name: 'Museu do Piauí',
    agentId: joaoPedro.agentId,
    tipo: 'museu',
    oQueFaz: 'Museu histórico com acervo sobre formação do estado, culturas populares e artes visuais.',
    descricao:
      'Sediado em um casarão do século XIX no centro de Teresina, mantém exposições permanentes de artesanato, objetos históricos e pinturas.',
    logradouro: 'Praça Marechal Deodoro',
    numero: 's/n',
    bairro: 'Centro',
    cidade: 'Teresina',
    estado: 'PI',
    cep: '64000-160',
    lat: -5.0873,
    lng: -42.8035,
    acessibilidade: true,
    areas: ['patrimonio_cultural', 'artes_visuais', 'cultura_popular'],
    horario: 'Ter–Dom, 9h às 18h',
  });

  console.info('📁 Criando projetos…');
  const festivalEncontro = await createProject({
    name: 'Festival Encontro de Culturas',
    agentId: coletivoRaizes.agentId,
    tipo: 'festival',
    descricaoCurta:
      'Festival anual que reúne manifestações culturais dos 12 territórios de desenvolvimento do Piauí.',
    descricaoLonga:
      'O Festival Encontro de Culturas é realizado há 6 edições no Piauí, promovendo circulação de mestres, oficinas, rodas de conversa e apresentações artísticas em uma semana de programação intensa e gratuita.',
    responsavel: 'Coletivo Raízes do Piauí',
    parceiros: ['Casa da Cultura de Parnaíba', 'Secretaria de Cultura do Piauí'],
    startsOn: '2026-08-10',
    endsOn: '2026-08-17',
    areas: ['musica', 'danca', 'teatro', 'cultura_popular'],
    imagem:
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
  });

  const oficinasItinerantes = await createProject({
    name: 'Oficinas Itinerantes de Cultura Popular',
    agentId: ciaSertao.agentId,
    tipo: 'oficina',
    descricaoCurta:
      'Circuito de oficinas gratuitas em municípios do interior do Piauí sobre manifestações populares.',
    descricaoLonga:
      'As Oficinas Itinerantes levam mestres da cultura popular às escolas e centros culturais dos municípios do interior do Piauí. A proposta é formar novas gerações de brincantes e preservar saberes tradicionais.',
    responsavel: 'Cia Sertão Brincante',
    parceiros: ['Secretaria de Educação do Piauí', 'IPHAN Piauí'],
    startsOn: '2026-03-01',
    endsOn: '2026-11-30',
    areas: ['teatro', 'danca', 'cultura_popular'],
    imagem:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
  });

  const mapeamentoGrios = await createProject({
    name: 'Mapeamento dos Griôs do Piauí',
    agentId: anaLuiza.agentId,
    tipo: 'pesquisa',
    descricaoCurta:
      'Pesquisa de campo para cadastrar mestres e mestras da oralidade em todo o estado.',
    descricaoLonga:
      'Projeto de pesquisa-ação que percorre os 224 municípios do Piauí para identificar, entrevistar e produzir um livro-reportagem sobre os griôs do sertão piauiense.',
    responsavel: 'Ana Luiza Santos',
    parceiros: ['Universidade Federal do Piauí', 'Associação dos Griôs do Nordeste'],
    startsOn: '2026-02-01',
    endsOn: '2027-01-31',
    areas: ['literatura', 'patrimonio_cultural', 'cultura_popular'],
    imagem:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
  });

  const residenciaDelta = await createProject({
    name: 'Residência Artística do Delta',
    agentId: rafaelMendes.agentId,
    tipo: 'intercambio_cultural',
    descricaoCurta:
      'Programa de residência para cineastas e músicos no Delta do Parnaíba.',
    descricaoLonga:
      'A Residência Artística do Delta seleciona anualmente 10 artistas para um intercâmbio de 30 dias na região do Delta do Parnaíba. Durante a residência, os participantes desenvolvem um curta-metragem ou uma peça musical com comunidades ribeirinhas.',
    responsavel: 'Rafael Mendes',
    parceiros: ['Casa da Cultura de Parnaíba'],
    startsOn: '2026-09-01',
    endsOn: '2026-10-01',
    areas: ['audiovisual', 'musica'],
    imagem:
      'https://images.unsplash.com/photo-1489844097929-c8d5b91c456e?auto=format&fit=crop&w=1200&q=80',
  });

  const circuitoTeatral = await createProject({
    name: 'Circuito Teatral do Nordeste',
    agentId: ciaSertao.agentId,
    tipo: 'producao',
    descricaoCurta:
      'Circuito que leva espetáculos de cultura popular para capitais e interiores do Nordeste.',
    descricaoLonga:
      'Temporada itinerante com 25 apresentações em 9 estados do Nordeste ao longo de 4 meses. Conta com roda de conversa com o público após cada espetáculo.',
    responsavel: 'Cia Sertão Brincante',
    parceiros: ['Secretarias de Cultura dos Estados do Nordeste'],
    startsOn: '2026-06-01',
    endsOn: '2026-09-30',
    areas: ['teatro', 'danca'],
  });

  console.info('🎶 Criando eventos com ocorrências…');
  await createEventWithOccurrence({
    name: 'Noite de Blues - Edição Especial',
    agentId: mariaClara.agentId,
    projectId: null,
    descricaoCurta:
      'Show especial com convidados para celebrar 10 anos do Bar do Blues, com quarteto acústico e banda completa.',
    descricaoLonga:
      'Edição especial em celebração ao aniversário do Bar do Blues. Programação com blues acústico na primeira parte e banda elétrica em seguida. Espaço climatizado, com venda de drinks autorais e comida regional.',
    dataInicio: '2026-04-25',
    horario: '21:00',
    horarioFim: '23:30',
    classificacao: '18',
    entrada: 'pago',
    preco: 25,
    areas: ['musica', 'cultura_popular'],
    tags: ['blues', 'música ao vivo', 'show'],
    imagem:
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    spaceId: barDoBlues,
  });

  await createEventWithOccurrence({
    name: 'Oficina de Percussão Nordestina',
    agentId: coletivoRaizes.agentId,
    projectId: oficinasItinerantes,
    descricaoCurta:
      'Oficina aberta para iniciantes e intermediários sobre os ritmos do Nordeste: maracatu, coco, ciranda e baião.',
    descricaoLonga:
      'A oficina é ministrada por mestres da cultura popular do Nordeste e aborda a percussão tradicional em diferentes ritmos regionais. Ao final, acontece um cortejo musical no pátio da Casa da Cultura. Traga seu instrumento ou use um dos disponíveis.',
    dataInicio: '2026-05-09',
    horario: '14:00',
    horarioFim: '18:00',
    classificacao: 'livre',
    entrada: 'gratuito',
    areas: ['musica', 'cultura_popular'],
    tags: ['percussão', 'oficina', 'nordeste'],
    imagem:
      'https://images.unsplash.com/photo-1519683109079-d5f539e1542f?auto=format&fit=crop&w=1200&q=80',
    spaceId: casaCulturaParnaiba,
  });

  await createEventWithOccurrence({
    name: 'Espetáculo "Raízes do Sertão"',
    agentId: ciaSertao.agentId,
    projectId: circuitoTeatral,
    descricaoCurta:
      'Montagem cênica que mistura teatro, dança e música ao vivo inspirada nas manifestações populares do sertão piauiense.',
    descricaoLonga:
      'Com elenco de 12 artistas, o espetáculo "Raízes do Sertão" é um mergulho poético pelas manifestações populares. Trilha sonora ao vivo com instrumentação regional. Duração: 80 minutos, sem intervalo.',
    dataInicio: '2026-05-15',
    horario: '20:00',
    horarioFim: '21:30',
    classificacao: '10',
    entrada: 'pago',
    preco: 40,
    areas: ['teatro', 'danca', 'cultura_popular'],
    tags: ['teatro', 'dança', 'sertão'],
    imagem:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
    spaceId: teatro4Setembro,
  });

  await createEventWithOccurrence({
    name: 'Exposição "Arte Piauiense Contemporânea"',
    agentId: joaoPedro.agentId,
    projectId: null,
    descricaoCurta:
      'Mostra coletiva com 40 obras de 15 artistas visuais do Piauí, entre pinturas, esculturas e instalações.',
    descricaoLonga:
      'A exposição reúne 15 artistas piauienses contemporâneos, entre nomes consolidados e emergentes. Visitação gratuita, com mediação educativa agendada para escolas durante a semana.',
    dataInicio: '2026-05-20',
    dataFim: '2026-06-20',
    horario: '10:00',
    horarioFim: '19:00',
    classificacao: 'livre',
    entrada: 'gratuito',
    areas: ['artes_visuais'],
    tags: ['exposição', 'arte contemporânea', 'coletiva'],
    imagem:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    spaceId: galeriaArtePiaui,
  });

  await createEventWithOccurrence({
    name: 'Festival Literário de Teresina',
    agentId: anaLuiza.agentId,
    projectId: mapeamentoGrios,
    descricaoCurta:
      'Três dias de programação com lançamentos de livros, mesas-redondas e saraus de poesia piauiense.',
    descricaoLonga:
      'O Festival Literário de Teresina conta com participação de 20 autores, rodas de conversa sobre literatura nordestina, saraus de poesia e feira de editoras independentes do Nordeste.',
    dataInicio: '2026-05-30',
    dataFim: '2026-06-01',
    horario: '19:00',
    horarioFim: '22:00',
    classificacao: 'livre',
    entrada: 'gratuito',
    areas: ['literatura'],
    tags: ['literatura', 'sarau', 'festival'],
    imagem:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80',
    spaceId: bibliotecaParque,
  });

  await createEventWithOccurrence({
    name: 'Sarau Musical ao Pôr do Sol',
    agentId: rafaelMendes.agentId,
    projectId: residenciaDelta,
    descricaoCurta:
      'Encontro musical colaborativo no mirante da Casa da Cultura, com participação de artistas locais.',
    descricaoLonga:
      'O Sarau ao Pôr do Sol é um encontro colaborativo de artistas locais e convidados em que a trilha sonora é construída ao vivo, acompanhando a luz dourada do fim da tarde em Parnaíba. Traga seu violão!',
    dataInicio: '2026-06-10',
    horario: '17:30',
    horarioFim: '19:30',
    classificacao: 'livre',
    entrada: 'gratuito',
    areas: ['musica'],
    tags: ['sarau', 'mpb', 'pôr do sol'],
    imagem:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    spaceId: casaCulturaParnaiba,
  });

  const eventNoiteBlues = await prismaClient.event.findFirst({
    where: { name: 'Noite de Blues - Edição Especial' },
  });

  const eventExposicao = await prismaClient.event.findFirst({
    where: { name: 'Exposição "Arte Piauiense Contemporânea"' },
  });

  console.info('📣 Criando oportunidades…');
  if (eventNoiteBlues) {
    await createOpportunity({
      name: 'Prêmio Mestres da Cultura Piauiense 2026',
      agentId: mariaClara.agentId,
      tipo: 'premio',
      descricao:
        'Prêmio anual que reconhece o trabalho de 10 mestres e mestras da cultura tradicional do Piauí. Inscrições abertas para autoindicação e indicação por terceiros.',
      registrationFrom: '2026-04-01T00:00:00.000Z',
      registrationTo: '2026-06-30T23:59:59.000Z',
      requisitos:
        'Ser morador de algum município do Piauí e atuar há pelo menos 10 anos em manifestação tradicional.',
      valorPremio: 10000,
      link: 'https://mapacultural.pi.gov.br/premios/mestres-2026',
      areas: ['cultura_popular', 'musica', 'danca'],
      objectType: 'Event',
      objectId: eventNoiteBlues.id,
    });
  }

  await createOpportunity({
    name: 'Bolsa de Pesquisa em Culturas Populares',
    agentId: anaLuiza.agentId,
    tipo: 'bolsa',
    descricao:
      'Bolsa de 12 meses para pesquisadores/as que desenvolvam projetos sobre culturas populares do Piauí. Oferecida em parceria com universidades federais.',
    registrationFrom: '2026-05-01T00:00:00.000Z',
    registrationTo: '2026-07-15T23:59:59.000Z',
    requisitos:
      'Graduação concluída e projeto de pesquisa aprovado por instituição parceira.',
    valorPremio: 24000,
    link: 'https://mapacultural.pi.gov.br/bolsas/pesquisa',
    areas: ['literatura', 'patrimonio_cultural', 'cultura_popular'],
    objectType: 'Project',
    objectId: mapeamentoGrios,
  });

  await createOpportunity({
    name: 'Edital Cultura Viva Piauí 2026',
    agentId: coletivoRaizes.agentId,
    tipo: 'edital',
    descricao:
      'Chamamento público para selecionar 30 projetos de coletivos, pontos e pontões de cultura. Apoio de até R$ 80 mil por projeto.',
    registrationFrom: '2026-03-15T00:00:00.000Z',
    registrationTo: '2026-05-15T23:59:59.000Z',
    requisitos:
      'Coletivos formalizados ou via entidade proponente. Projetos devem acontecer no Piauí com ações entre 2026 e 2027.',
    valorPremio: 80000,
    link: 'https://mapacultural.pi.gov.br/editais/cultura-viva-2026',
    areas: ['musica', 'danca', 'teatro', 'artes_visuais', 'cultura_popular'],
    objectType: 'Project',
    objectId: festivalEncontro,
  });

  if (eventExposicao) {
    await createOpportunity({
      name: 'Residência Artística Casa da Cultura',
      agentId: coletivoRaizes.agentId,
      tipo: 'residencia',
      descricao:
        'Residência de 30 dias em Parnaíba para artistas visuais e performers trabalharem coletivamente em uma obra coletiva.',
      registrationFrom: '2026-04-15T00:00:00.000Z',
      registrationTo: '2026-06-15T23:59:59.000Z',
      requisitos:
        'Artistas com portfólio de pelo menos 3 anos de atuação. Serão selecionados 8 residentes com ajuda de custo e hospedagem.',
      valorPremio: 5000,
      link: 'https://casaculturaparnaiba.pi/residencia-2026',
      areas: ['artes_visuais', 'audiovisual'],
      objectType: 'Event',
      objectId: eventExposicao.id,
    });
  }

  console.info('\n✅ Seed concluído com sucesso!\n');

  const [agentsCount, spacesCount, eventsCount, projectsCount, opportunitiesCount] =
    await Promise.all([
      prismaClient.agent.count(),
      prismaClient.space.count(),
      prismaClient.event.count(),
      prismaClient.project.count(),
      prismaClient.opportunity.count(),
    ]);

  console.info('📊 Totais no banco:');
  console.info(`   Agentes.......: ${agentsCount}`);
  console.info(`   Espaços.......: ${spacesCount}`);
  console.info(`   Eventos.......: ${eventsCount}`);
  console.info(`   Projetos......: ${projectsCount}`);
  console.info(`   Oportunidades.: ${opportunitiesCount}`);
  console.info(`\n🔐 Senha padrão para todos os usuários: ${PASSWORD}`);
  console.info('📧 Emails criados:');
  for (const agent of [
    mariaClara,
    coletivoRaizes,
    joaoPedro,
    anaLuiza,
    ciaSertao,
    rafaelMendes,
  ]) {
    console.info(`   - ${agent.name}`);
  }
}

main()
  .catch((err) => {
    console.error('❌ Falha no seed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaClient.$disconnect().catch(() => undefined);
  });
