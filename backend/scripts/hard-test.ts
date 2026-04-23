import 'dotenv/config';

import { prismaClient } from '../src/infra/prisma/prismaClient';

type Json = Record<string, any>;

const EMAIL = 'ramontsdev+mapateste@gmail.com';
const DOC = '00000000000';
const PASS = 'SenhaForte123!';

const PORT = process.env.PORT || '4500';
const ROOT = `http://localhost:${PORT}`;
const BASE = `http://localhost:${PORT}/api`;

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function request<T = any>(path: string, init?: RequestInit & { json?: Json }) {
  const url = `${BASE}${path}`;

  const headers = new Headers(init?.headers);
  if (init?.json) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, {
    ...init,
    headers,
    body: init?.json ? JSON.stringify(init.json) : init?.body,
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = text && isJson ? (JSON.parse(text) as T) : (undefined as T);

  return { res, body, text };
}

async function ensureServerUp() {
  const res = await fetch(`${ROOT}/health`);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Backend não respondeu em ${ROOT}/health (status ${res.status}). Body: ${text}`);
  }
}

async function getLatestEmailVerificationCode(email: string) {
  return await prismaClient.verificationCode.findFirst({
    where: { email, type: 'EMAIL_VERIFICATION' },
    orderBy: { createdAt: 'desc' },
  });
}

async function main() {
  console.info(`BASE: ${BASE}`);
  await ensureServerUp();

  console.info('1) sign-up');
  const signUp = await request('/sign-up', {
    method: 'POST',
    json: {
      name: 'Mapa Teste',
      email: EMAIL,
      document: DOC,
      password: PASS,
      passwordConfirmation: PASS,
    },
  });

  const signUpAlreadyExists =
    signUp.res.status === 400 &&
    typeof (signUp.body as any)?.error === 'string' &&
    String((signUp.body as any).error).toLowerCase().includes('já existe');

  const signUpEmailDenied =
    signUp.res.status === 500 && signUp.text.includes('AccessDenied') && signUp.text.includes('ses:SendEmail');

  if (!signUp.res.ok && !signUpAlreadyExists && !signUpEmailDenied) {
    throw new Error(`sign-up falhou (${signUp.res.status}): ${signUp.text}`);
  }

  if (signUpAlreadyExists) {
    console.info('   (usuário já existe; seguindo)');
  }

  if (signUpEmailDenied) {
    console.info('   (SES sem permissão; usuário e code podem ter sido criados mesmo assim. Seguindo)');
  }

  console.info('2) buscar verificationCode no banco');
  let verification = await getLatestEmailVerificationCode(EMAIL);

  if (!verification) {
    console.info('   não achei code; tentando /resend-verification-code');
    const resend = await request('/resend-verification-code', {
      method: 'POST',
      json: { email: EMAIL },
    });
    if (!resend.res.ok && !(resend.res.status === 409 && resend.text.includes('E-mail já verificado'))) {
      throw new Error(`resend-verification-code falhou (${resend.res.status}): ${resend.text}`);
    }

    if (resend.res.ok) {
      await sleep(200);
      verification = await getLatestEmailVerificationCode(EMAIL);
    }
  }

  if (verification) {
    console.info('3) confirm-email');
    const confirm = await request('/confirm-email', {
      method: 'POST',
      json: { email: EMAIL, code: verification.code },
    });

    if (!confirm.res.ok && confirm.res.status !== 409) {
      // 409 pode acontecer se já estiver confirmado dependendo da implementação
      throw new Error(`confirm-email falhou (${confirm.res.status}): ${confirm.text}`);
    }
  } else {
    const user = await prismaClient.user.findUnique({ where: { email: EMAIL } });
    if (!user) throw new Error('Usuário não existe no banco e não há verificationCode.');
    if (!user.isEmailVerified) throw new Error('Usuário não está verificado e não foi possível obter verificationCode.');
    console.info('3) confirm-email (pulado: usuário já verificado e sem code pendente)');
  }

  console.info('4) sign-in');
  const signIn = await request<{ accessToken: string }>('/sign-in', {
    method: 'POST',
    json: { email: EMAIL, password: PASS },
  });
  if (!signIn.res.ok) {
    throw new Error(`sign-in falhou (${signIn.res.status}): ${signIn.text}`);
  }

  const token = signIn.body.accessToken;
  if (!token) throw new Error('Token não retornado no sign-in.');

  const authHeader = { Authorization: `Bearer ${token}` };

  console.info('5) GET /agents/me');
  const myAgent = await request('/agents/me', { headers: authHeader });
  if (!myAgent.res.ok) {
    throw new Error(`agents/me falhou (${myAgent.res.status}): ${myAgent.text}`);
  }
  const agentId = (myAgent.body as any).id as string;

  console.info('6) POST /spaces');
  const space = await request('/spaces', {
    method: 'POST',
    headers: authHeader,
    json: { name: 'Espaço Teste', isPublic: true, shortDescription: 'Curta', longDescription: 'Longa' },
  });
  if (!space.res.ok) throw new Error(`spaces falhou (${space.res.status}): ${space.text}`);
  const spaceId = (space.body as any).id as string;

  console.info('7) POST /projects');
  const project = await request('/projects', {
    method: 'POST',
    headers: authHeader,
    json: { name: 'Projeto Teste', shortDescription: 'Curta', longDescription: 'Longa' },
  });
  if (!project.res.ok) throw new Error(`projects falhou (${project.res.status}): ${project.text}`);
  const projectId = (project.body as any).id as string;

  console.info('8) POST /events');
  const event = await request('/events', {
    method: 'POST',
    headers: authHeader,
    json: { name: 'Evento Teste', shortDescription: 'Resumo', longDescription: 'Detalhes', rules: null, projectId },
  });
  if (!event.res.ok) throw new Error(`events falhou (${event.res.status}): ${event.text}`);
  const eventId = (event.body as any).id as string;

  console.info('9) POST /events/:id/occurrences');
  const occ = await request(`/events/${eventId}/occurrences`, {
    method: 'POST',
    headers: authHeader,
    json: { spaceId, rule: 'R1', timezoneName: 'Etc/UTC' },
  });
  if (!occ.res.ok) throw new Error(`occurrences falhou (${occ.res.status}): ${occ.text}`);

  console.info('10) POST /opportunities');
  const opp = await request('/opportunities', {
    method: 'POST',
    headers: authHeader,
    json: {
      name: 'Edital Teste',
      shortDescription: 'Chamada',
      registrationFrom: '2026-01-01T00:00:00.000Z',
      registrationTo: '2026-12-31T00:00:00.000Z',
      objectType: 'Event',
      objectId: eventId,
    },
  });
  if (!opp.res.ok) throw new Error(`opportunities falhou (${opp.res.status}): ${opp.text}`);
  const oppId = (opp.body as any).id as string;

  console.info('11) POST /opportunities/:id/registrations');
  const reg = await request(`/opportunities/${oppId}/registrations`, {
    method: 'POST',
    headers: authHeader,
    json: { category: null, proponentType: 'PF', range: 'A' },
  });
  if (!reg.res.ok) throw new Error(`registrations falhou (${reg.res.status}): ${reg.text}`);

  console.info('\nOK!');
  console.info(JSON.stringify({ email: EMAIL, agentId, spaceId, projectId, eventId, oppId, registrationId: (reg.body as any).id }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaClient.$disconnect().catch(() => undefined);
  });

