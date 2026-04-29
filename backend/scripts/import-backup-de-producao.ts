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
 *
 * Idempotência: tabela `_media_import_state` (legacy_file_id → media_asset.id).
 *
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

  const fileQuery =
    limit != null && !Number.isNaN(limit)
      ? `
    WITH ordered AS (
      SELECT f.*,
        ROW_NUMBER() OVER (PARTITION BY object_type, object_id ORDER BY id) - 1 AS sort_order
      FROM file f
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

    const already = await target.query(
      `SELECT 1 FROM _media_import_state WHERE legacy_file_id = $1`,
      [row.id],
    );
    if (already.rows.length > 0) {
      dup++;
      continue;
    }

    let absPath: string;
    try {
      absPath = resolveDiskPath(publicRoot, row.path);
    } catch (e) {
      missingFile++;
      console.warn(`[path] file=${row.id}`, e);
      continue;
    }

    const stat = await fs.stat(absPath).catch(() => null);
    if (!stat?.isFile()) {
      missingFile++;
      console.warn(`[missing] file=${row.id} path=${absPath}`);
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

  await source.end();
  await target.end();

  console.info('---');
  const gb = bytesToGbString(bytesImportadosOk);
  console.info(
    `Importação concluída: ok=${ok} (~${gb} GB) já_importados=${dup} sem_owner=${missingOwner} arquivo_ausente=${missingFile}` +
      `${!dryRun && uploadOrDbErrors > 0 ? ` falhas_storage_db=${uploadOrDbErrors}` : ''}${dryRun ? ' (dry-run)' : ''}`,
  );
  console.info(
    `Destino ${summarizePgUrl(databaseUrl)} — total media_asset=${mediaAssetTotal}, linhas _media_import_state=${importStateTotal}`,
  );

  if (!dryRun && uploadOrDbErrors > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
