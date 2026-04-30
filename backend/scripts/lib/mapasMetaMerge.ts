import type { Client } from 'pg';

const ALLOWED_META_TABLES = new Set(['agent_meta', 'event_meta', 'space_meta']);

/** Mesma regra que `parseShortDescription` no frontend — linhas `[chave]: valor`. */
export function parseShortDescriptionLines(shortDescription: string | null | undefined): {
  text: string;
  meta: Record<string, string>;
} {
  if (!shortDescription) {
    return { text: '', meta: {} };
  }

  const meta: Record<string, string> = {};
  const lines = shortDescription.split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*\[([a-zA-Z0-9_-]+)\]\s*:\s*(.+)$/);

    if (match) {
      meta[match[1]] = match[2].trim();
    } else {
      textLines.push(line);
    }
  }

  return { text: textLines.join('\n').trim(), meta };
}

export function formatMetadata(text: string, meta: Record<string, string | undefined>): string {
  const metaLines = Object.entries(meta)
    .filter(
      ([, value]) => value !== undefined && value !== null && String(value).trim() !== '',
    )
    .map(([key, value]) => `[${key}]: ${String(value).trim()}`);
  const trimmedText = text.trim();
  const pieces = [trimmedText, ...metaLines].filter(Boolean);

  return pieces.join('\n');
}

/** Chaves usuais do Mapas Culturais (`agent_meta.key`) → chaves da UI (`types.ts` / `mapAgentToUser`). */
const AGENT_META_TO_UI: Record<string, string> = {
  emailPublico: 'email',
  telefone1: 'telefone',
  telefone2: 'telefone',
  telefonePublico: 'telefone',
  site: 'website',
  sitePrincipal: 'website',
  facebook: 'facebook',
  instagram: 'instagram',
  twitter: 'twitter',
  youtube: 'youtube',
  linkedin: 'linkedin',
  pinterest: 'pinterest',
  flickr: 'flickr',
  vimeo: 'vimeo',
  tiktok: 'tiktok',
};

export function mergeAgentMetaIntoShortDescription(
  baseShort: string,
  legacyMeta: Record<string, string> | undefined,
): string {
  const { text, meta: fromLines } = parseShortDescriptionLines(baseShort);
  const merged = { ...fromLines };

  if (legacyMeta) {
    for (const [legacyKey, raw] of Object.entries(legacyMeta)) {
      const v = String(raw ?? '').trim();

      if (!v) continue;

      const uiKey = AGENT_META_TO_UI[legacyKey] ?? legacyKey;

      if (!merged[uiKey]) merged[uiKey] = v;
    }
  }

  return formatMetadata(text, merged);
}

/** Subconjunto de `event_meta` que a UI interpreta via `parseShortDescription`. */
const EVENT_META_TO_UI: Record<string, string> = {
  classificacaoEtaria: 'classificacao',
  classificacao_etaria: 'classificacao',
  price: 'preco',
};

export function mergeEventMetaIntoShortDescription(
  baseShort: string,
  legacyMeta: Record<string, string> | undefined,
): string {
  const { text, meta: fromLines } = parseShortDescriptionLines(baseShort);
  const merged = { ...fromLines };

  if (legacyMeta) {
    for (const [legacyKey, raw] of Object.entries(legacyMeta)) {
      const v = String(raw ?? '').trim();

      if (!v) continue;

      const uiKey = EVENT_META_TO_UI[legacyKey];

      if (uiKey && !merged[uiKey]) merged[uiKey] = v;
    }
  }

  return formatMetadata(text, merged);
}

function quoteIdent(ident: string): string {
  return `"${ident.replace(/"/g, '""')}"`;
}

/**
 * Lê `agent_meta`, `event_meta`, etc. (Mapas Doctrine: owner + key + value).
 * Colunas comuns: `object_id` ou `owner_id`, `key`, `value`.
 */
export async function loadMetaByOwner(
  client: Client,
  tableName: string,
): Promise<Map<number, Record<string, string>>> {
  const map = new Map<number, Record<string, string>>();

  if (!ALLOWED_META_TABLES.has(tableName)) {
    throw new Error(`Tabela meta não permitida: ${tableName}`);
  }

  try {
    const { rows: colRows } = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [tableName],
    );
    const cols = new Set(colRows.map((r) => r.column_name));
    const ownerCol = cols.has('object_id')
      ? 'object_id'
      : cols.has('owner_id')
        ? 'owner_id'
        : null;

    if (!ownerCol || !cols.has('key')) {
      console.warn(
        `[etl] ${tableName}: faltam colunas object_id/owner_id ou key; metadados ignorados.`,
      );

      return map;
    }

    const valueCol = cols.has('value') ? 'value' : cols.has('val') ? 'val' : null;

    if (!valueCol) {
      console.warn(`[etl] ${tableName}: sem coluna value; metadados ignorados.`);

      return map;
    }

    const keyCol = [...cols].find((c) => c.toLowerCase() === 'key') ?? 'key';
    const q = `SELECT ${quoteIdent(ownerCol)}::int AS oid, ${quoteIdent(keyCol)}::text AS k, ${quoteIdent(valueCol)}::text AS v FROM ${quoteIdent(tableName)}`;
    const { rows } = await client.query<{ oid: number; k: string; v: string | null }>(q);

    for (const r of rows) {
      if (r.oid == null || Number.isNaN(Number(r.oid))) continue;
      const entry = map.get(r.oid) ?? {};

      entry[String(r.k)] = r.v ?? '';
      map.set(r.oid, entry);
    }

    console.info(`[etl] ${tableName}: ${map.size} entidade(s) com pelo menos uma chave meta`);
  } catch (e) {
    console.warn(
      `[etl] Não foi possível ler ${tableName}:`,
      e instanceof Error ? e.message : e,
    );
  }

  return map;
}
