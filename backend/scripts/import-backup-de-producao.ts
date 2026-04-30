/**
 * Importa arquivos da tabela legado `file` (Mapas) para armazenamento + `media_asset`.
 *
 * Este script NÃO copia as tabelas relacionais (usr, agent, event, …). Para isso use antes:
 * `pnpm etl-mapas-prod-to-local` (lê SOURCE_DATABASE_URL, grava em DATABASE_URL).
 *
 * Aqui: leitura da tabela `file` na origem + INSERT em `media_asset` / `_media_import_state`
 * apenas no DATABASE_URL (destino).
 *
 * Pré-requisitos:
 * - Executar `pnpm etl-mapas-prod-to-local` (IDs determinísticos alinhados aos de `object_id`).
 * - Backup em disco; caminhos da coluna `path` relativos à raiz definida abaixo.
 *
 * Variáveis de ambiente:
 * - SOURCE_DATABASE_URL — opcional; padrão: DATABASE_URL. Use o Postgres legado se ainda
 *   não copiou a tabela `file` para o alvo. (Após ETL puro, `file` só existe na origem — defina SOURCE.)
 * - DATABASE_URL — banco Prisma (onde gravamos `media_asset` e `_media_import_state`).
 * - PUBLIC_FILES_ROOT — padrão: ./scripts/backup-de-producao/public-files (relativo ao cwd backend)
 *
 * Destino de mídia (um dos modos):
 * - Object Storage WS: OBJECT_STORAGE_BASE_URL + OBJECT_STORAGE_API_KEY e, para este script,
 *   IMPORT_MEDIA_STORAGE_USUARIO ou OBJECT_STORAGE_USUARIO_FALLBACK.
 * - S3 direto: AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *
 * - IMPORT_MEDIA_DRY_RUN=true — apenas lista o que faria (sem upload / sem insert)
 * - IMPORT_MEDIA_LIMIT — opcional; número máximo de linhas `file` processadas
 * - IMPORT_MEDIA_MAX_BYTES — opcional; não envia ficheiros acima deste tamanho (evita HTTP 500
 *   "Maximum upload size exceeded" no object-storage-ws); conta como skip, não como falha.
 * - IMPORT_MEDIA_FETCH_BASE_URL — opcional; URL base onde o path da tabela `file` é servido via HTTP
 *   (ex.: https://mapadacultura.pi.gov.br/files). Se o ficheiro não existir em disco, tenta GET e grava em
 *   PUBLIC_FILES_ROOT antes do upload (útil quando o backup em pasta está incompleto).
 * - IMPORT_MEDIA_FILTER_LEGACY_AGENT_ID — opcional; só processa linhas `file` desse agente legado (object_id),
 *   com object_type Agent (para testes rápidos).
 *
 * Idempotência: `_media_import_state` (legacy_file_id → media_asset.id). Se `media_asset` tiver sido
 * apagado mas o estado não, a entrada órfã é removida e o file volta a ser importado.
 *
 * Após importar ficheiros, o script alinha `avatar_url` e `cover_url` nas tabelas de entidades
 * a partir de `file.grp` no Mapas legado (`avatar` / `profile` → perfil; `header` / `cover` / `capa` → capa).
 * O ETL (`etl-mapas-prod-to-local`) deixa essas colunas a NULL; sem este passo o hero da UI fica só com placeholders.
 * A galeria continua a ser a lista de `media_asset` (ex.: `grp = gallery`): tem de existir ficheiro no backup
 * e o upload ter corrido com sucesso para cada linha `file`.
 * Erros por linha (storage, DB): o script continua e só encerra com código 1 se houver
 * falhas (após corrigir IAM/API/rede, rerode o mesmo comando).
 */

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Client } from 'pg';

import {
  buildMediaObjectKey,
  uploadMediaBuffer,
} from '../src/main/adapters/aws/s3ObjectStorage';
import { mediaStorageConfigured, useObjectStorageWs } from '../src/main/config/env';
import { MediaKind, MediaOwnerType } from '../src/main/db/prisma/generated/enums';
import { mediaOwnerUuidFromLegacyObject } from './lib/mapasLegacyIds';

const DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
]);

function reqEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Defina ${name}`);
  }
  return value;
}

function kindFromMime(mime: string | null | undefined, fileName: string): MediaKind {
  const m = (mime ?? '').trim().toLowerCase();
  if (m.startsWith('image/')) return MediaKind.IMAGE;
  if (m.startsWith('video/')) return MediaKind.VIDEO;
  if (DOCUMENT_MIMES.has(m)) return MediaKind.DOCUMENT;
  const ext = path.extname(fileName).toLowerCase();
  if (
    ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'].includes(ext)
  ) {
    return MediaKind.IMAGE;
  }
  if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) {
    return MediaKind.VIDEO;
  }
  if (['.pdf', '.doc', '.docx', '.odt', '.txt'].includes(ext)) {
    return MediaKind.DOCUMENT;
  }
  return MediaKind.DOCUMENT;
}

function ownerTypeFromLegacy(objectType: string): MediaOwnerType | null {
  const t = objectType.trim();
  if (t.includes('\\Entities\\Agent')) return MediaOwnerType.AGENT;
  if (t.includes('\\Entities\\Space')) return MediaOwnerType.SPACE;
  if (t.includes('\\Entities\\Project')) return MediaOwnerType.PROJECT;
  if (t.includes('\\Entities\\Event')) return MediaOwnerType.EVENT;
  if (t.includes('\\Entities\\Opportunity')) return MediaOwnerType.OPPORTUNITY;
  return null;
}

/**
 * Mapas Culturais (`file.grp`): `avatar` = foto de perfil; `header` = imagem de capa no perfil.
 * @see https://github.com/mapasculturais/mapasculturais/blob/develop/src/core/Entities/File.php
 */
function legacyImageGroupRole(grp: string | null | undefined): 'avatar' | 'cover' | null {
  const g = (grp ?? '').trim().toLowerCase();

  if (!g) return null;

  if (g === 'avatar' || g === 'profile' || g.startsWith('img:avatar')) return 'avatar';

  if (
    g === 'header' ||
    g === 'cover' ||
    g === 'capa' ||
    g === 'banner' ||
    g.startsWith('img:header')
  ) {
    return 'cover';
  }

  return null;
}

/** Preenche `avatar_url` / `cover_url` nas entidades com a URL pública já gravada em `media_asset`. */
async function resyncProfileAndCoverFromLegacyFileGroups(
  source: Client,
  target: Client,
): Promise<void> {
  const { rows: links } = await target.query<{
    legacy_file_id: number;
    url: string;
    kind: string;
    owner_type: string;
    owner_id: string;
  }>(`
    SELECT s.legacy_file_id, ma.url, ma.kind::text AS kind, ma.owner_type::text AS owner_type, ma.owner_id
    FROM _media_import_state s
    INNER JOIN media_asset ma ON ma.id = s.media_asset_id
    ORDER BY s.legacy_file_id ASC
  `);

  if (links.length === 0) return;

  const legacyIds = [...new Set(links.map((l) => l.legacy_file_id))];
  const { rows: fileRows } = await source.query<{ id: number; grp: string | null }>(
    `SELECT id, grp FROM file WHERE id = ANY($1::int[])`,
    [legacyIds],
  );
  const grpByLegacyId = new Map<number, string | null>(fileRows.map((f) => [f.id, f.grp]));

  let nAvatar = 0;
  let nCover = 0;

  for (const row of links) {
    if (row.kind !== 'IMAGE') continue;

    const role = legacyImageGroupRole(grpByLegacyId.get(row.legacy_file_id) ?? null);

    if (!role) continue;

    const col = role === 'avatar' ? 'avatar_url' : 'cover_url';
    const ot = row.owner_type.trim();

    let update: { rowCount: number | null };

    if (ot === 'AGENT') {
      update = await target.query(
        `UPDATE agent SET ${col} = $1 WHERE id = $2 AND ${col} IS NULL`,
        [row.url, row.owner_id],
      );
    } else if (ot === 'SPACE') {
      update = await target.query(
        `UPDATE space SET ${col} = $1 WHERE id = $2 AND ${col} IS NULL`,
        [row.url, row.owner_id],
      );
    } else if (ot === 'EVENT') {
      update = await target.query(
        `UPDATE event SET ${col} = $1 WHERE id = $2 AND ${col} IS NULL`,
        [row.url, row.owner_id],
      );
    } else if (ot === 'PROJECT') {
      update = await target.query(
        `UPDATE project SET ${col} = $1 WHERE id = $2 AND ${col} IS NULL`,
        [row.url, row.owner_id],
      );
    } else if (ot === 'OPPORTUNITY') {
      update = await target.query(
        `UPDATE opportunity SET ${col} = $1 WHERE id = $2 AND ${col} IS NULL`,
        [row.url, row.owner_id],
      );
    } else {
      continue;
    }

    if ((update.rowCount ?? 0) > 0) {
      if (role === 'avatar') nAvatar += 1;
      else nCover += 1;
    }
  }

  if (nAvatar > 0 || nCover > 0) {
    console.info(
      `[perfil] avatar_url/cover_url via file.grp (Mapas): +${nAvatar} perfis, +${nCover} capas`,
    );
  }
}

function resolveDiskPath(root: string, dbPath: string): string {
  const trimmed = dbPath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  const joined = path.resolve(root, trimmed);
  if (!joined.startsWith(path.resolve(root))) {
    throw new Error(`path fora da raiz: ${dbPath}`);
  }
  return joined;
}

async function readFileBuffer(absPath: string): Promise<Buffer> {
  return fs.readFile(absPath);
}

/** Tenta obter o ficheiro por HTTP quando não existe em `PUBLIC_FILES_ROOT` (ex.: backup incompleto, ficheiros ainda servidos pelo Mapas em `/files/`). */
async function tryFetchMissingFileToDisk(
  fetchBaseUrl: string,
  relativePath: string,
  absPath: string,
): Promise<boolean> {
  const base = fetchBaseUrl.replace(/\/+$/, '');
  const rel = relativePath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  const url = `${base}/${rel}`;

  let res: Response;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch {
    return false;
  }

  if (!res.ok) {
    return false;
  }

  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  if (buf.length === 0) {
    return false;
  }

  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, buf);
  return true;
}

async function assertLegacyFileTableExists(client: Client): Promise<void> {
  const r = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'file'
    ) AS exists
  `);
  if (!r.rows[0]?.exists) {
    throw new Error(
      'A tabela legada "file" não existe no banco de leitura. ' +
        'Opções: (1) Defina SOURCE_DATABASE_URL para o Postgres Mapas que contém "file". ' +
        '(2) Rode antes pnpm etl-mapas-prod-to-local se também precisar das outras tabelas no DATABASE_URL.',
    );
  }
}

async function ensureStateTable(target: Client): Promise<void> {
  await target.query(`
    CREATE TABLE IF NOT EXISTS _media_import_state (
      legacy_file_id INTEGER PRIMARY KEY,
      media_asset_id TEXT NOT NULL UNIQUE
    );
  `);
}

function summarizeErr(err: unknown): string {
  if (err && typeof err === 'object' && 'name' in err && 'message' in err) {
    const o = err as { name?: string; message?: string; Code?: string };
    const code = o.Code ? ` ${o.Code}` : '';
    return `${o.name ?? 'Error'}${code}: ${String(o.message).split('\n')[0]}`;
  }
  return String(err);
}

function isS3AccessDenied(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
  return (
    o.name === 'AccessDenied' ||
    o.Code === 'AccessDenied' ||
    (o.$metadata?.httpStatusCode === 403 && String((err as { message?: string }).message).includes('not authorized'))
  );
}

function isObjectStorageForbidden(err: unknown): boolean {
  const msg = summarizeErr(err);
  return (
    msg.includes('HTTP 403') ||
    (msg.includes('403') && msg.includes('object-storage-ws')) ||
    msg.toLowerCase().includes('forbidden')
  );
}

function resolveImportMediaUsuario(): string {
  const u =
    process.env.IMPORT_MEDIA_STORAGE_USUARIO?.trim() ||
    process.env.OBJECT_STORAGE_USUARIO_FALLBACK?.trim();
  if (!u) {
    throw new Error(
      'Modo object-storage-ws: defina IMPORT_MEDIA_STORAGE_USUARIO ou OBJECT_STORAGE_USUARIO_FALLBACK',
    );
  }
  return u;
}

/** Gigabytes decimais (10⁹ bytes), para log de migração. */
function bytesToGbString(bytes: number): string {
  if (bytes <= 0) return '0.000';
  return (bytes / 1e9).toFixed(3);
}

/** Log seguro: host/porta/db (sem credenciais). */
function summarizePgUrl(connectionString: string): string {
  try {
    const u = new URL(connectionString);
    const db = decodeURIComponent((u.pathname || '/').replace(/^\//, '') || 'postgres');
    const port = u.port || '5432';
    return `${u.hostname}:${port}/${db}`;
  } catch {
    return '(URL inválida)';
  }
}

async function main() {
  const databaseUrl = reqEnv('DATABASE_URL', process.env.DATABASE_URL);
  const sourceUrl =
    process.env.SOURCE_DATABASE_URL?.trim() || databaseUrl;
  const dryRun = process.env.IMPORT_MEDIA_DRY_RUN === 'true';
  const limitRaw = process.env.IMPORT_MEDIA_LIMIT;
  const limit =
    limitRaw && limitRaw !== '' ? Number.parseInt(limitRaw, 10) : null;

  const backendRoot = path.resolve(__dirname, '..');
  const defaultFilesRoot = path.join(
    backendRoot,
    'scripts',
    'backup-de-producao',
    'public-files',
  );
  const envRoot = process.env.PUBLIC_FILES_ROOT?.trim();
  const publicRoot = envRoot
    ? path.isAbsolute(envRoot)
      ? envRoot
      : path.resolve(process.cwd(), envRoot)
    : defaultFilesRoot;

  await fs.access(publicRoot).catch(() => {
    throw new Error(
      `Pasta de arquivos inexistente: ${publicRoot}. Ajuste PUBLIC_FILES_ROOT.`,
    );
  });

  if (!dryRun) {
    if (!mediaStorageConfigured()) {
      throw new Error(
        'Armazenamento não configurado: OBJECT_STORAGE_BASE_URL + OBJECT_STORAGE_API_KEY ou AWS_BUCKET_NAME (+ credenciais).',
      );
    }
    if (useObjectStorageWs()) {
      reqEnv('OBJECT_STORAGE_BASE_URL', process.env.OBJECT_STORAGE_BASE_URL);
      reqEnv('OBJECT_STORAGE_API_KEY', process.env.OBJECT_STORAGE_API_KEY);
    } else {
      reqEnv('AWS_BUCKET_NAME', process.env.AWS_BUCKET_NAME);
      reqEnv('AWS_REGION', process.env.AWS_REGION);
      reqEnv('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID);
      reqEnv('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY);
    }
  }

  const storageUsuarioForImport = dryRun
    ? ''
    : useObjectStorageWs()
      ? resolveImportMediaUsuario()
      : 'import-backup-s3';

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: databaseUrl });
  await source.connect();
  await target.connect();
  await ensureStateTable(target);

  const maxBytesRaw = process.env.IMPORT_MEDIA_MAX_BYTES?.trim();
  const maxBytes =
    maxBytesRaw && maxBytesRaw !== '' && !Number.isNaN(Number.parseInt(maxBytesRaw, 10))
      ? Number.parseInt(maxBytesRaw, 10)
      : null;

  const { rows: orphanPre } = await target.query<{ c: string }>(`
    SELECT COUNT(*)::text AS c
    FROM _media_import_state s
    LEFT JOIN media_asset m ON m.id = s.media_asset_id
    WHERE m.id IS NULL
  `);
  const orphanPreCount = Number.parseInt(orphanPre[0]?.c ?? '0', 10);
  if (orphanPreCount > 0) {
    console.warn(
      `Atenção: ${orphanPreCount} linha(s) em _media_import_state sem linha em media_asset (órfãs). ` +
        'Causa típica: TRUNCATE ou DELETE em media_asset sem limpar o estado. ' +
        'Durante esta execução, cada file correspondente volta a ser importado após remover a entrada órfã.',
    );
  }
  if (maxBytes != null && maxBytes > 0) {
    console.info(
      `Limite de tamanho: IMPORT_MEDIA_MAX_BYTES=${maxBytes} — ficheiros maiores são ignorados (skip).`,
    );
  }

  console.info('--- Import mídia (só tabela `file` → storage + `media_asset` no destino) ---');
  console.info(`Origem (leitura "file"): ${summarizePgUrl(sourceUrl)}`);
  console.info(`Destino (DATABASE_URL):   ${summarizePgUrl(databaseUrl)} — gravações: media_asset, _media_import_state`);
  console.info(
    'Dados relacionais (usr, agent, event, …) vêm do script etl-mapas-prod-to-local, não deste.\n',
  );
  if (sourceUrl === databaseUrl) {
    console.warn(
      'Aviso: SOURCE_DATABASE_URL não definido — lendo "file" do mesmo banco que DATABASE_URL. ' +
        'O schema Prisma local em geral não tem a tabela "file"; nesse caso defina SOURCE_DATABASE_URL para o Mapas legado.',
    );
  }
  await assertLegacyFileTableExists(source);

  const filterAgentRaw = process.env.IMPORT_MEDIA_FILTER_LEGACY_AGENT_ID?.trim();
  const filterLegacyAgentId =
    filterAgentRaw && filterAgentRaw !== '' && !Number.isNaN(Number.parseInt(filterAgentRaw, 10))
      ? Number.parseInt(filterAgentRaw, 10)
      : null;
  if (filterLegacyAgentId != null) {
    console.info(
      `Filtro: IMPORT_MEDIA_FILTER_LEGACY_AGENT_ID=${filterLegacyAgentId} — só ficheiros Agent com esse object_id.\n`,
    );
  }

  const fetchBaseUrl = process.env.IMPORT_MEDIA_FETCH_BASE_URL?.trim() ?? '';
  if (fetchBaseUrl) {
    console.info(
      `HTTP fallback: IMPORT_MEDIA_FETCH_BASE_URL — ficheiros em falta no disco serão pedidos por GET.\n`,
    );
  }

  const agentFileWhere =
    filterLegacyAgentId != null
      ? `WHERE f.object_type::text LIKE '%Agent%' AND f.object_id = ${filterLegacyAgentId}`
      : '';

  const fileQuery =
    limit != null && !Number.isNaN(limit)
      ? `
    WITH ordered AS (
      SELECT f.*,
        ROW_NUMBER() OVER (PARTITION BY object_type, object_id ORDER BY id) - 1 AS sort_order
      FROM file f
      ${agentFileWhere}
    )
    SELECT id, path, name, mime_type, description, object_type::text AS object_type,
           object_id, create_timestamp, grp, sort_order
    FROM ordered
    ORDER BY id
    LIMIT $1
  `
      : `
    WITH ordered AS (
      SELECT f.*,
        ROW_NUMBER() OVER (PARTITION BY object_type, object_id ORDER BY id) - 1 AS sort_order
      FROM file f
      ${agentFileWhere}
    )
    SELECT id, path, name, mime_type, description, object_type::text AS object_type,
           object_id, create_timestamp, grp, sort_order
    FROM ordered
    ORDER BY id
  `;

  const { rows: files } = await source.query<{
    id: number;
    path: string;
    name: string | null;
    mime_type: string | null;
    description: string | null;
    object_type: string;
    object_id: number;
    create_timestamp: Date;
    grp: string | null;
    sort_order: number;
  }>(fileQuery, limit != null && !Number.isNaN(limit) ? [limit] : []);

  let ok = 0;
  let missingOwner = 0;
  let missingFile = 0;
  let dup = 0;
  let skippedMaxBytes = 0;
  let stateOrphanRemoved = 0;
  let fetchedFromHttp = 0;
  let uploadOrDbErrors = 0;
  let loggedStorageHint = false;
  let bytesImportadosOk = 0;

  for (const row of files) {
    const ownerType = ownerTypeFromLegacy(row.object_type);
    if (!ownerType) {
      missingOwner++;
      console.warn(`[skip] object_type não suportado: ${row.object_type} file=${row.id}`);
      continue;
    }

    const ownerId = mediaOwnerUuidFromLegacyObject(
      row.object_type,
      row.object_id,
    );
    if (!ownerId) {
      missingOwner++;
      console.warn(`[skip] owner não mapeado file=${row.id}`);
      continue;
    }

    const stateRow = await target.query<{ media_asset_id: string; has_asset: boolean | null }>(
      `
      SELECT s.media_asset_id, (m.id IS NOT NULL) AS has_asset
      FROM _media_import_state s
      LEFT JOIN media_asset m ON m.id = s.media_asset_id
      WHERE s.legacy_file_id = $1
      `,
      [row.id],
    );
    if (stateRow.rows.length > 0) {
      const { media_asset_id: mid, has_asset: hasAsset } = stateRow.rows[0];
      if (hasAsset) {
        dup++;
        continue;
      }
      await target.query(`DELETE FROM _media_import_state WHERE legacy_file_id = $1`, [row.id]);
      stateOrphanRemoved++;
      console.warn(
        `[state-órfão] file=${row.id}: removida entrada _media_import_state (media_asset ${mid} inexistente) — nova tentativa de importação`,
      );
    }

    let absPath: string;
    try {
      absPath = resolveDiskPath(publicRoot, row.path);
    } catch (e) {
      missingFile++;
      console.warn(`[path] file=${row.id}`, e);
      continue;
    }

    let stat = await fs.stat(absPath).catch(() => null);
    if (!stat?.isFile() && fetchBaseUrl) {
      const rel = row.path.replace(/^[/\\]+/, '').replace(/\\/g, '/');
      const okFetch = await tryFetchMissingFileToDisk(fetchBaseUrl, rel, absPath);
      if (okFetch) {
        fetchedFromHttp++;
        console.info(`[fetch] file=${row.id} ok path=${rel}`);
        stat = await fs.stat(absPath).catch(() => null);
      }
    }
    if (!stat?.isFile()) {
      missingFile++;
      console.warn(`[missing] file=${row.id} path=${absPath}`);
      continue;
    }

    if (maxBytes != null && maxBytes > 0 && stat.size > maxBytes) {
      skippedMaxBytes++;
      if (skippedMaxBytes <= 5 || skippedMaxBytes % 50 === 0) {
        console.warn(
          `[skip-tamanho] file=${row.id} bytes=${stat.size} limite=${maxBytes} path=${absPath}`,
        );
      }
      continue;
    }

    const originalName = row.name?.trim() || path.basename(row.path);
    const kind = kindFromMime(row.mime_type, originalName);
    const mime =
      row.mime_type?.trim() ||
      (kind === MediaKind.IMAGE
        ? 'image/jpeg'
        : kind === MediaKind.VIDEO
          ? 'video/mp4'
          : 'application/octet-stream');

    const sortOrder = row.sort_order;

    if (dryRun) {
      console.info(`[dry-run] #${row.id} -> ${ownerType} ${ownerId} ${absPath}`);
      ok++;
      bytesImportadosOk += stat.size;
      continue;
    }

    try {
      const buf = await readFileBuffer(absPath);
      const key = buildMediaObjectKey(ownerType, ownerId, originalName);
      const { publicUrl, storageKey } = await uploadMediaBuffer({
        key,
        buffer: buf,
        contentType: mime,
        originalFilename: originalName,
        usuario: storageUsuarioForImport,
      });
      const mediaId = randomUUID();

      await target.query(
        `INSERT INTO media_asset (
        id, owner_type, owner_id, kind, url, thumbnail_url, title, caption,
        file_name, mime_type, s3_key, sort_order, create_timestamp
      ) VALUES (
        $1, $2::"MediaOwnerType", $3, $4::"MediaKind", $5, NULL, $6, $7,
        $8, $9, $10, $11, $12
      )`,
        [
          mediaId,
          ownerType,
          ownerId,
          kind,
          publicUrl,
          originalName,
          row.description ?? null,
          originalName,
          mime,
          storageKey,
          sortOrder,
          row.create_timestamp ?? new Date(),
        ],
      );

      await target.query(
        `INSERT INTO _media_import_state (legacy_file_id, media_asset_id) VALUES ($1, $2)`,
        [row.id, mediaId],
      );

      ok++;
      bytesImportadosOk += buf.length;
      if (ok % 50 === 0) {
        console.info(`… ${ok} importados (~${bytesToGbString(bytesImportadosOk)} GB acumulado)`);
      }
    } catch (err) {
      uploadOrDbErrors++;
      const msg = summarizeErr(err);
      console.warn(`[erro] file=${row.id} path=${absPath} :: ${msg}`);
      if (isS3AccessDenied(err) && !loggedStorageHint) {
        loggedStorageHint = true;
        console.warn(
          '      S3: conceda s3:PutObject no bucket/prefixo (ex.: arn:aws:s3:::NOME_DO_BUCKET/mapa-cultural/*).',
        );
      }
      if (isObjectStorageForbidden(err) && !loggedStorageHint) {
        loggedStorageHint = true;
        console.warn(
          '      Object Storage WS: verifique X-API-KEY e permissões do serviço (HTTP 403).',
        );
      }
    }
  }

  const mediaAssetTotal = await target
    .query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM media_asset`)
    .then((r) => r.rows[0]?.c ?? '?');
  const importStateTotal = await target
    .query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM _media_import_state`)
    .then((r) => r.rows[0]?.c ?? '?');
  const orphanPostCount = await target
    .query<{ c: string }>(`
      SELECT COUNT(*)::text AS c
      FROM _media_import_state s
      LEFT JOIN media_asset m ON m.id = s.media_asset_id
      WHERE m.id IS NULL
    `)
    .then((r) => Number.parseInt(r.rows[0]?.c ?? '0', 10));

  if (!dryRun) {
    try {
      await resyncProfileAndCoverFromLegacyFileGroups(source, target);
    } catch (e) {
      console.warn('[perfil] sincronização avatar/capa:', summarizeErr(e));
    }
  }

  await source.end();
  await target.end();

  console.info('---');
  const gb = bytesToGbString(bytesImportadosOk);
  const extraParts: string[] = [];
  if (stateOrphanRemoved > 0) extraParts.push(`estado_órfão_removido=${stateOrphanRemoved}`);
  if (skippedMaxBytes > 0) extraParts.push(`skip_tamanho=${skippedMaxBytes}`);
  if (fetchedFromHttp > 0) extraParts.push(`fetch_http=${fetchedFromHttp}`);
  const extra = extraParts.length > 0 ? ` ${extraParts.join(' ')}` : '';

  console.info(
    `Importação concluída: ok=${ok} (~${gb} GB) já_importados=${dup} sem_owner=${missingOwner} arquivo_ausente=${missingFile}` +
      extra +
      `${!dryRun && uploadOrDbErrors > 0 ? ` falhas_storage_db=${uploadOrDbErrors}` : ''}${dryRun ? ' (dry-run)' : ''}`,
  );
  console.info(
    `Destino ${summarizePgUrl(databaseUrl)} — total media_asset=${mediaAssetTotal}, linhas _media_import_state=${importStateTotal}` +
      `${orphanPostCount > 0 ? `, estado_órfão_restante=${orphanPostCount} (file legado ausente?)` : ''}`,
  );

  if (!dryRun && uploadOrDbErrors > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
