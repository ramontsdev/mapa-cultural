import type { Buffer } from 'node:buffer';
import path from 'node:path';

import { env } from '@/main/config/env';

export type LinkDto = {
  url?: string;
  caminho?: string;
};

/** Resposta GET `/arquivo/buscar/path` (OpenAPI: `CaminhoDto`). */
export type CaminhoDto = {
  caminhos?: string[];
};

function buscarPathDebugEnabled(): boolean {
  return process.env.OBJECT_STORAGE_BUSCAR_DEBUG?.trim() === 'true';
}

function extractCaminhosFromBuscarPathJson(text: string): string[] {
  if (!text?.trim()) return [];

  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const raw = j.caminhos ?? j.Caminhos;

    if (Array.isArray(raw)) {
      return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
    }
  } catch {
    /* ignore */
  }

  return [];
}

function objectStorageOrigin(): string {
  const base = env.objectStorage.baseUrl;

  if (!base) {
    throw new Error('OBJECT_STORAGE_BASE_URL não configurada');
  }

  return base;
}

function apiKeyHeader(): Record<string, string> {
  const key = env.objectStorage.apiKey;

  if (!key) {
    throw new Error('OBJECT_STORAGE_API_KEY não configurada');
  }

  return { 'X-API-KEY': key };
}

function chainFetchErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts: string[] = [err.message];
  let c: unknown = (err as Error & { cause?: unknown }).cause;

  for (let depth = 0; depth < 5 && c != null; depth++) {
    if (c instanceof Error) {
      parts.push(c.message);
      c = (c as Error & { cause?: unknown }).cause;
    } else if (typeof c === 'object' && c !== null && 'code' in c) {
      parts.push(String((c as { code?: string }).code));
      break;
    } else {
      parts.push(String(c));
      break;
    }
  }

  return parts.filter(Boolean).join(' — ');
}

async function fetchWithStorageContext(
  url: string,
  init: RequestInit,
  context: string,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new Error(`${context}: ${chainFetchErrorMessage(e)}`);
  }
}

async function readErrorBody(res: Response): Promise<string> {
  const text = await res.text();

  try {
    const j = JSON.parse(text) as LinkDto & { message?: string };

    if (j.message) return j.message;
    if (j.caminho || j.url) return JSON.stringify(j);
  } catch {
    /* ignore */
  }

  return text.slice(0, 500);
}

/**
 * Parâmetro query `nome` da API: o OpenAPI usa exemplo sem extensão (`relatorio_financeiro`);
 * o serviço costuma derivar a extensão do multipart. Se enviarmos `foo.jpg`, o objeto final pode
 * ficar `foo.jpg.jpg`.
 */
function nomeQueryParamForSalvarApi(nomeComOuSemExt: string): string {
  const base = path.basename(nomeComOuSemExt);
  const ext = path.extname(base);

  if (!ext) {
    return base;
  }

  if (base.toLowerCase().endsWith('.tar.gz')) {
    return base.slice(0, -'.tar.gz'.length);
  }

  if (base.toLowerCase().endsWith('.tar.bz2')) {
    return base.slice(0, -'.tar.bz2'.length);
  }

  return base.slice(0, -ext.length);
}

/**
 * PUT /arquivo/salvar — multipart `arquivo` + query nome, path, usuario, opcional retentionDias, provider.
 */
export async function salvarArquivoWs(params: {
  nome: string;
  path: string;
  usuario: string;
  buffer: Buffer;
  contentType: string;
  originalFileName: string;
}): Promise<LinkDto> {
  const u = new URL(`${objectStorageOrigin()}/arquivo/salvar`);

  u.searchParams.set('nome', nomeQueryParamForSalvarApi(params.nome));
  u.searchParams.set('path', params.path);
  u.searchParams.set('usuario', params.usuario);

  if (env.objectStorage.retentionDias) {
    u.searchParams.set('retentionDias', env.objectStorage.retentionDias);
  }

  u.searchParams.set('provider', env.objectStorage.provider);

  const blob = new Blob([new Uint8Array(params.buffer)], { type: params.contentType });
  const form = new FormData();

  form.append('arquivo', blob, params.originalFileName);

  const res = await fetchWithStorageContext(
    u.toString(),
    {
      method: 'PUT',
      headers: apiKeyHeader(),
      body: form,
    },
    'object-storage-ws salvar (rede/TLS)',
  );

  const text = await res.text();
  let body: LinkDto = {};

  try {
    body = text ? (JSON.parse(text) as LinkDto) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    const detail = text ? text.slice(0, 400) : res.statusText;

    throw new Error(`object-storage-ws salvar: HTTP ${res.status} — ${detail}`);
  }

  if (!body.url?.trim()) {
    throw new Error('object-storage-ws salvar: resposta sem url');
  }

  return body;
}

/**
 * GET `/arquivo/buscar/path` — lista caminhos completos de objetos sob o prefixo `caminho`.
 */
export async function buscarArquivosPorPathWs(caminhoPrefix: string): Promise<string[]> {
  const u = new URL(`${objectStorageOrigin()}/arquivo/buscar/path`);

  u.searchParams.set('caminho', caminhoPrefix);
  u.searchParams.set('provider', env.objectStorage.provider);

  const res = await fetchWithStorageContext(
    u.toString(),
    {
      method: 'GET',
      headers: { Accept: 'application/json', ...apiKeyHeader() },
    },
    'object-storage-ws buscar/path (rede/TLS)',
  );

  const text = await res.text();

  if (buscarPathDebugEnabled()) {
    console.error(
      `[object-storage-ws buscar/path] HTTP ${res.status} caminho=${JSON.stringify(caminhoPrefix)} body_len=${text.length}`,
    );

    if (text.length > 0 && text.length < 4000) {
      console.error(`[object-storage-ws buscar/path] body=${text.slice(0, 2000)}`);
    }
  }

  const caminhos = extractCaminhosFromBuscarPathJson(text);

  if (res.status === 404) {
    return caminhos;
  }

  if (!res.ok) {
    const detail = text ? text.slice(0, 400) : res.statusText;

    throw new Error(`object-storage-ws buscar/path: HTTP ${res.status} — ${detail}`);
  }

  return caminhos;
}

/**
 * DELETE /arquivo/deletar — query caminho, usuario, provider.
 */
export async function deletarArquivoWs(params: {
  caminho: string;
  usuario: string;
}): Promise<void> {
  const u = new URL(`${objectStorageOrigin()}/arquivo/deletar`);

  u.searchParams.set('caminho', params.caminho);
  u.searchParams.set('usuario', params.usuario);
  u.searchParams.set('provider', env.objectStorage.provider);

  const res = await fetchWithStorageContext(
    u.toString(),
    {
      method: 'DELETE',
      headers: apiKeyHeader(),
    },
    'object-storage-ws deletar (rede/TLS)',
  );

  if (res.status === 204) {
    return;
  }

  if (res.status === 404) {
    return;
  }

  const err = await readErrorBody(res);

  throw new Error(`object-storage-ws deletar: HTTP ${res.status} — ${err}`);
}
