/**
 * Audita ficheiros da tabela `file` (Mapas) de um agente legado vs `PUBLIC_FILES_ROOT`.
 *
 * Uso (na pasta backend):
 *   AGENT_LEGACY_AUDIT_ID=6571 pnpm exec tsx --env-file .env scripts/audit-agent-files-in-backup.ts
 *
 * Variáveis: SOURCE_DATABASE_URL (ou DATABASE_URL), PUBLIC_FILES_ROOT (opcional).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Client } from 'pg';

function reqEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`Defina ${name}`);
  return value;
}

function resolveDiskPath(root: string, dbPath: string): string {
  const trimmed = dbPath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  const joined = path.resolve(root, trimmed);
  if (!joined.startsWith(path.resolve(root))) {
    throw new Error(`path fora da raiz: ${dbPath}`);
  }
  return joined;
}

async function main() {
  const legacyIdRaw = process.env.AGENT_LEGACY_AUDIT_ID?.trim();
  const legacyId =
    legacyIdRaw && !Number.isNaN(Number.parseInt(legacyIdRaw, 10))
      ? Number.parseInt(legacyIdRaw, 10)
      : null;

  if (legacyId == null) {
    throw new Error('Defina AGENT_LEGACY_AUDIT_ID (inteiro), ex.: 6571');
  }

  const sourceUrl = reqEnv(
    'SOURCE_DATABASE_URL',
    process.env.SOURCE_DATABASE_URL?.trim() || process.env.DATABASE_URL,
  );

  const backendRoot = path.resolve(__dirname, '..');
  const defaultRoot = path.join(backendRoot, 'scripts', 'backup-de-producao', 'public-files');
  const publicRoot = process.env.PUBLIC_FILES_ROOT?.trim()
    ? path.isAbsolute(process.env.PUBLIC_FILES_ROOT)
      ? process.env.PUBLIC_FILES_ROOT
      : path.resolve(process.cwd(), process.env.PUBLIC_FILES_ROOT)
    : defaultRoot;

  const source = new Client({ connectionString: sourceUrl });
  await source.connect();

  const { rows } = await source.query<{
    id: number;
    path: string;
    name: string | null;
    grp: string | null;
    mime_type: string | null;
  }>(
    `
    SELECT id, path, name, grp, mime_type
    FROM file
    WHERE object_type::text LIKE '%Agent%' AND object_id = $1
    ORDER BY id
    `,
    [legacyId],
  );

  await source.end();

  let present = 0;
  let absent = 0;

  console.info(`Agente legado object_id=${legacyId} — ${rows.length} linha(s) em "file"`);
  console.info(`PUBLIC_FILES_ROOT=${publicRoot}\n`);

  const fetchBase =
    process.env.IMPORT_MEDIA_FETCH_BASE_URL?.trim() || 'https://mapadacultura.pi.gov.br/files';

  for (const row of rows) {
    let abs: string;
    try {
      abs = resolveDiskPath(publicRoot, row.path);
    } catch (e) {
      console.warn(`[path inválido] file=${row.id} ${row.path}`, e);
      continue;
    }
    const st = await fs.stat(abs).catch(() => null);
    const ok = st?.isFile() ?? false;
    if (ok) present++;
    else absent++;

    const rel = row.path.replace(/^[/\\]+/, '').replace(/\\/g, '/');
    const url = `${fetchBase.replace(/\/+$/, '')}/${rel}`;

    console.info(
      `${ok ? 'OK ' : 'FALTA'} file=${row.id} grp=${row.grp ?? ''} path=${rel}\n` +
        `       disco: ${abs}\n` +
        `       GET:   ${url}`,
    );
  }

  console.info(
    `\nResumo: presentes=${present} ausentes=${absent}\n` +
      'Para importar: copie os ficheiros em falta para os paths acima, ou defina IMPORT_MEDIA_FETCH_BASE_URL e ' +
      'IMPORT_MEDIA_FILTER_LEGACY_AGENT_ID ao correr pnpm import-backup-de-producao (quando o HTTP legado responder 200).',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
