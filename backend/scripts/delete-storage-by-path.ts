/**
 * Apaga objetos no object-storage-ws com DELETE `/arquivo/deletar`.
 *
 * Fonte principal (padrão): linhas em `media_asset` do `DATABASE_URL` (`.env`) com `s3_key` preenchido.
 * Assim usas exatamente as chaves que o import/upload gravaram, sem depender de `/arquivo/buscar/path`.
 *
 * Filtro por prefixo de chave (recomendado):
 * - argumentos: `pnpm delete-storage-by-path -- --dry-run mapa-cultural/space mapa-cultural/event`
 * - ou `OBJECT_STORAGE_DELETE_PREFIXES` / `OBJECT_STORAGE_DELETE_PREFIX`
 * Para apagar **todas** as mídias com `s3_key` no banco: `STORAGE_DELETE_ALL_MEDIA_KEYS=true` (perigoso).
 *
 * Modo alternativo (órfãos / sem DB): `STORAGE_DELETE_LIST_VIA_API=true` ou `--via-api` — lista via
 * GET `/arquivo/buscar/path` (com recursão e variantes `etipi/` ↔ `mapa-cultural/`).
 *
 * Pré-requisitos WS: `OBJECT_STORAGE_BASE_URL`, `OBJECT_STORAGE_API_KEY`.
 * Usuário no delete: `OBJECT_STORAGE_DELETE_USUARIO` | `IMPORT_MEDIA_STORAGE_USUARIO` | `OBJECT_STORAGE_USUARIO_FALLBACK`.
 *
 * Após delete no storage com sucesso: opcional remover linhas `media_asset` com
 * `STORAGE_DELETE_REMOVE_MEDIA_ROWS=true`.
 *
 * Opções: `--dry-run` | `-n`; `OBJECT_STORAGE_PROVIDER`; `OBJECT_STORAGE_BUSCAR_DEBUG=true` (só modo API).
 */

import {
  buscarArquivosPorPathWs,
  deletarArquivoWs,
} from '@/main/adapters/storage/objectStorageWsClient';
import { useObjectStorageWs } from '@/main/config/env';
import { prismaClient } from '@/infra/prisma/prismaClient';

function reqEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Defina ${name}`);
  }

  return value.trim();
}

function parseCli(): {
  dryRun: boolean;
  viaApi: boolean;
  positionalPrefixes: string[];
} {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let viaApi = false;
  const positionalPrefixes: string[] = [];

  for (const a of argv) {
    if (a === '--dry-run' || a === '-n') {
      dryRun = true;
    } else if (a === '--via-api') {
      viaApi = true;
    } else if (!a.startsWith('-')) {
      positionalPrefixes.push(a);
    }
  }

  if (process.env.STORAGE_DELETE_LIST_VIA_API === 'true') {
    viaApi = true;
  }

  return { dryRun, viaApi, positionalPrefixes };
}

/** Evita coincidências tipo `.../space` com `.../spaces`; barra final para convenções de prefixo. */
function normalizeListPrefix(raw: string): string {
  let s = raw.trim().replace(/\/+/g, '/').replace(/^\/+/, '');

  if (!s) {
    throw new Error('Prefixo vazio após normalização');
  }

  if (!s.endsWith('/')) {
    s += '/';
  }

  return s;
}

function prefixesFromEnv(): string[] {
  const multi =
    process.env.OBJECT_STORAGE_DELETE_PREFIXES?.split(/[,\r\n]+/).map((p) => p.trim()).filter(Boolean) ??
    [];

  if (multi.length > 0) {
    return multi;
  }

  const one = process.env.OBJECT_STORAGE_DELETE_PREFIX?.trim();

  return one ? [one] : [];
}

function resolvePrefixes(positional: string[]): string[] {
  if (positional.length > 0) {
    return positional.map(normalizeListPrefix);
  }

  const fromEnv = prefixesFromEnv().map(normalizeListPrefix);

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  return [];
}

/** Mesmas chaves que `buildMediaObjectKey`: `mapa-cultural/...` sem `etipi/`. */
function alternateStoragePrefixes(normalizedDirPrefix: string): string[] {
  const p = normalizedDirPrefix.trim().replace(/\/+/g, '/');
  const ordered: string[] = [p];
  const bare = p.replace(/^\/+/, '');

  if (bare.startsWith('etipi/mapa-cultural/')) {
    ordered.push(bare.slice('etipi/'.length));
  }

  if (bare.startsWith('mapa-cultural/')) {
    ordered.push(`etipi/${bare}`);
  }

  const seen = new Set<string>();
  const out: string[] = [];

  for (const x of ordered) {
    const n = x.endsWith('/') ? x : `${x}/`;

    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }

  return out;
}

function ensureDirPrefix(dir: string): string {
  const s = dir.trim().replace(/\/+/g, '/').replace(/^\/+/, '');

  return s.endsWith('/') ? s : `${s}/`;
}

function looksLikeFileKey(fullPath: string): boolean {
  const base = fullPath.split('/').pop() ?? '';

  if (!base.includes('.')) {
    return false;
  }

  if (base.startsWith('.')) {
    return base.length > 1;
  }

  const ext = base.slice(base.lastIndexOf('.'));

  return /^\.[a-z0-9]{1,12}$/i.test(ext);
}

async function listAllFilesUnderPrefix(seedDirPrefix: string): Promise<string[]> {
  const files = new Set<string>();
  const queue: string[] = [ensureDirPrefix(seedDirPrefix)];
  const queuedDirs = new Set<string>();

  while (queue.length > 0) {
    const dirPrefix = queue.shift()!;

    if (queuedDirs.has(dirPrefix)) continue;
    queuedDirs.add(dirPrefix);

    const items = await buscarArquivosPorPathWs(dirPrefix);

    for (const raw of items) {
      const item = raw.trim().replace(/\/+/g, '/');

      if (!item) continue;

      if (item.endsWith('/')) {
        const d = ensureDirPrefix(item);

        if (!queuedDirs.has(d)) queue.push(d);
        continue;
      }

      if (looksLikeFileKey(item)) {
        files.add(item);
        continue;
      }

      const asDir = ensureDirPrefix(item);

      if (!queuedDirs.has(asDir)) queue.push(asDir);
    }
  }

  return [...files];
}

async function collectFilesForLogicalPrefix(logicalPrefix: string): Promise<string[]> {
  const variants = alternateStoragePrefixes(logicalPrefix);
  const acc = new Set<string>();
  let foundWith: string | undefined;

  for (const v of variants) {
    const listed = await listAllFilesUnderPrefix(v);

    if (listed.length === 0) {
      continue;
    }

    foundWith ??= v;

    for (const f of listed) {
      acc.add(f);
    }
  }

  if (foundWith && variants.length > 1) {
    console.log(`[buscar/path] objetos encontrados com prefixo ${JSON.stringify(foundWith)}`);
  }

  return [...acc];
}

/** Bases sem barra final, para `startsWith(base + '/')` ou igualdade. */
function expandPrefixMatchers(logicalPrefixes: string[]): string[] {
  const bases = new Set<string>();

  for (const p of logicalPrefixes) {
    for (const v of alternateStoragePrefixes(p)) {
      bases.add(v.replace(/\/+$/, '').replace(/^\/+/, ''));
    }
  }

  return [...bases];
}

function s3KeyMatchesAnyPrefix(key: string, bases: string[]): boolean {
  const k = key.trim().replace(/^\/+/, '');

  return bases.some((base) => k === base || k.startsWith(`${base}/`));
}

function summarizeDatabaseUrl(url: string): string {
  try {
    const u = new URL(url);

    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return '(DATABASE_URL inválida)';
  }
}

function storageUsuario(): string {
  return reqEnv(
    'OBJECT_STORAGE_DELETE_USUARIO ou IMPORT_MEDIA_STORAGE_USUARIO ou OBJECT_STORAGE_USUARIO_FALLBACK',
    process.env.OBJECT_STORAGE_DELETE_USUARIO?.trim() ||
      process.env.IMPORT_MEDIA_STORAGE_USUARIO?.trim() ||
      process.env.OBJECT_STORAGE_USUARIO_FALLBACK?.trim(),
  );
}

async function main(): Promise<void> {
  if (!useObjectStorageWs()) {
    throw new Error(
      'Configure OBJECT_STORAGE_BASE_URL e OBJECT_STORAGE_API_KEY (modo object-storage-ws).',
    );
  }

  const { dryRun, viaApi, positionalPrefixes } = parseCli();
  const usuario = storageUsuario();

  if (viaApi) {
    await runViaApi({ dryRun, positionalPrefixes, usuario });
    return;
  }

  await runFromMediaAsset({ dryRun, positionalPrefixes, usuario });
}

async function runFromMediaAsset(params: {
  dryRun: boolean;
  positionalPrefixes: string[];
  usuario: string;
}): Promise<void> {
  const { dryRun, positionalPrefixes, usuario } = params;

  reqEnv('DATABASE_URL', process.env.DATABASE_URL);

  const dbUrl = process.env.DATABASE_URL!.trim();

  console.log(`[prisma] DATABASE_URL → ${summarizeDatabaseUrl(dbUrl)}`);

  const prefixes = resolvePrefixes(positionalPrefixes);
  const allowAll = process.env.STORAGE_DELETE_ALL_MEDIA_KEYS === 'true';

  if (prefixes.length === 0 && !allowAll) {
    throw new Error(
      'Defina prefixos (args ou OBJECT_STORAGE_DELETE_PREFIX*) ou STORAGE_DELETE_ALL_MEDIA_KEYS=true para todas as linhas com s3_key.',
    );
  }

  const prefixBases = prefixes.length > 0 ? expandPrefixMatchers(prefixes) : [];

  try {
    const rows = await prismaClient.mediaAsset.findMany({
      where: { s3Key: { not: null } },
      select: { id: true, s3Key: true },
    });

    const withKey = rows.filter((r): r is { id: string; s3Key: string } => !!r.s3Key?.trim());

    const filtered =
      prefixBases.length > 0
        ? withKey.filter((r) => s3KeyMatchesAnyPrefix(r.s3Key, prefixBases))
        : withKey;

    const byKey = new Map<string, string[]>();

    for (const r of filtered) {
      const k = r.s3Key.trim();
      const arr = byKey.get(k) ?? [];

      arr.push(r.id);
      byKey.set(k, arr);
    }

    const uniqueKeys = [...byKey.keys()].sort((a, b) => b.length - a.length);

    if (uniqueKeys.length === 0) {
      console.log('Nenhum media_asset com s3_key a apagar para este filtro.');
      return;
    }

    console.log(
      `[media_asset] ${uniqueKeys.length} chave(s) única(s); ${filtered.length} linha(s) (prefixos: ${prefixes.length ? prefixes.map((p) => JSON.stringify(p)).join(', ') : 'todos'}).`,
    );

    if (dryRun) {
      for (const c of uniqueKeys) {
        const n = byKey.get(c)!.length;

        console.log(`  [dry-run] deletaria storage: ${c}${n > 1 ? ` (${n} linhas DB)` : ''}`);
      }

      return;
    }

    const removeRows = process.env.STORAGE_DELETE_REMOVE_MEDIA_ROWS === 'true';

    let ok = 0;
    const failures: { caminho: string; message: string }[] = [];
    const deletedKeys: string[] = [];

    for (const caminho of uniqueKeys) {
      try {
        await deletarArquivoWs({ caminho, usuario });
        ok += 1;
        deletedKeys.push(caminho);
        console.log(`  deletado (storage): ${caminho}`);
      } catch (e) {
        failures.push({
          caminho,
          message: e instanceof Error ? e.message : String(e),
        });
        console.error(`  falha: ${caminho} — ${failures[failures.length - 1].message}`);
      }
    }

    console.log(`Concluído (storage): ${ok}/${uniqueKeys.length} apagados com sucesso.`);

    if (removeRows && deletedKeys.length > 0) {
      let removed = 0;

      for (const key of deletedKeys) {
        const ids = byKey.get(key)!;
        const r = await prismaClient.mediaAsset.deleteMany({ where: { id: { in: ids } } });

        removed += r.count;
      }

      console.log(`[media_asset] removidas ${removed} linha(s) (STORAGE_DELETE_REMOVE_MEDIA_ROWS).`);
    }

    if (failures.length > 0) {
      throw new Error(`${failures.length} falha(s) ao deletar no storage (ver logs acima).`);
    }
  } finally {
    await prismaClient.$disconnect();
  }
}

async function runViaApi(params: {
  dryRun: boolean;
  positionalPrefixes: string[];
  usuario: string;
}): Promise<void> {
  const { dryRun, positionalPrefixes, usuario } = params;
  const prefixes = resolvePrefixes(positionalPrefixes);

  if (prefixes.length === 0) {
    throw new Error(
      'Modo --via-api: informe prefixos (args ou OBJECT_STORAGE_DELETE_PREFIX*) para listar na API.',
    );
  }

  const allCaminhos: string[] = [];
  const seen = new Set<string>();

  for (const prefix of prefixes) {
    console.log(
      `[buscar/path] prefixo lógico=${JSON.stringify(prefix)} (variações: ${alternateStoragePrefixes(prefix).join(' | ')})`,
    );

    const found = await collectFilesForLogicalPrefix(prefix);

    for (const c of found) {
      if (!seen.has(c)) {
        seen.add(c);
        allCaminhos.push(c);
      }
    }
  }

  if (allCaminhos.length === 0) {
    console.log('Nenhum arquivo listado para os prefixos indicados (API).');
    console.log(
      'Dica: `media_asset.s3_key` ou OBJECT_STORAGE_BUSCAR_DEBUG=true; ou use o modo padrão (sem --via-api).',
    );

    return;
  }

  const sorted = [...allCaminhos].sort((a, b) => b.length - a.length);

  console.log(`Encontrados no total: ${sorted.length} objeto(s) (${prefixes.length} prefixo(s)).`);

  if (dryRun) {
    for (const c of sorted) {
      console.log(`  [dry-run] deletaria: ${c}`);
    }

    return;
  }

  let ok = 0;
  const failures: { caminho: string; message: string }[] = [];

  for (const caminho of sorted) {
    try {
      await deletarArquivoWs({ caminho, usuario });
      ok += 1;
      console.log(`  deletado: ${caminho}`);
    } catch (e) {
      failures.push({
        caminho,
        message: e instanceof Error ? e.message : String(e),
      });
      console.error(`  falha: ${caminho} — ${failures[failures.length - 1].message}`);
    }
  }

  console.log(`Concluído: ${ok}/${sorted.length} apagados com sucesso.`);

  if (failures.length > 0) {
    throw new Error(`${failures.length} falha(s) ao deletar (ver logs acima).`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
