/**
 * Copia dados do PostgreSQL legado Mapas (IDs inteiros, PostGIS) para o banco alvo
 * do Prisma (IDs texto UUID determinísticos, `point` + `_geo_location` texto).
 *
 * Variáveis de ambiente:
 * - SOURCE_DATABASE_URL — Postgres de produção / staging legado (leitura)
 * - DATABASE_URL — banco local alvo (escrita), após `pnpm prisma:migrate`
 * - ETL_DEFAULT_USER_PASSWORD — senha inicial bcrypt para todos os `users` criados (padrão seguro só dev)
 * - ETL_SKIP_DRAFT_EVENTS — se `true`, não migra eventos cujo `status` não está em ETL_MAPAS_PUBLISHED_STATUS (padrão: `1`, publicado no Mapas).
 * - ETL_MAPAS_PUBLISHED_STATUS — lista separada por vírgula de valores `status` considerados publicados (ex.: `1` ou `1,2`).
 *
 * Metadados Doctrine (`agent_meta`, `event_meta`): email público, telefone, redes e alguns campos de evento
 * são fundidos em `short_description` no formato `[chave]: valor` esperado pelo frontend.
 * Ordem sugerida: 1) este script 2) `pnpm import-backup-de-producao`
 *
 * O mapeamento de IDs segue `scripts/lib/mapasLegacyIds.ts` (UUID v5 local).
 */

import { randomInt } from 'node:crypto';

import bcrypt from 'bcryptjs';
import { Client } from 'pg';

import {
  legacyIds,
  mediaOwnerUuidFromLegacyObject,
} from './lib/mapasLegacyIds';
import {
  loadMetaByOwner,
  mergeAgentMetaIntoShortDescription,
  mergeEventMetaIntoShortDescription,
} from './lib/mapasMetaMerge';

const SOURCE = process.env.SOURCE_DATABASE_URL;
const TARGET = process.env.DATABASE_URL;

function reqEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Defina ${name} no ambiente ou no .env`);
  }
  return value;
}

function parseJsonLoose(raw: unknown, fallback: unknown): unknown {
  if (raw == null || raw === '') return fallback;
  if (typeof raw === 'object') return raw;
  const s = String(raw).trim();
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function opportunistObjectIdString(
  objectType: string,
  legacyObjectId: number | null,
): string {
  if (legacyObjectId == null) return '';
  const mapped = mediaOwnerUuidFromLegacyObject(objectType, legacyObjectId);
  return mapped ?? String(legacyObjectId);
}

/** 11 dígitos aleatórios para `users.document` (CPF-like); evita colisão com tentativas simples. */
function randomNumericDocument(used: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    let s = '';
    for (let i = 0; i < 11; i++) s += String(randomInt(0, 10));
    if (!used.has(s)) {
      used.add(s);
      return s;
    }
  }
  throw new Error('Não foi possível gerar document numérico único após várias tentativas');
}

function displayNameFromUsrEmail(email: string | null | undefined): string {
  const e = String(email ?? '').trim();
  if (!e) return 'Usuário Mapas';
  const local = e.split('@')[0]?.trim();
  return local || 'Usuário Mapas';
}

/**
 * `users.email` é UNIQUE. Na origem, vários `usr` podem partilhar o mesmo email.
 * O primeiro mantém o email; duplicados usam `local+mapasusr{legacyId}@dominio`.
 */
function jwtAccountEmailForUsr(
  rawEmail: string | null | undefined,
  legacyUsrId: number,
  seenLower: Set<string>,
): string {
  const trimmed = String(rawEmail ?? '').trim();
  const base = trimmed || `sem-email-usr${legacyUsrId}@mapas-etl.invalid`;
  const lower = base.toLowerCase();

  if (!seenLower.has(lower)) {
    seenLower.add(lower);
    return base;
  }

  const at = base.lastIndexOf('@');

  if (at > 0) {
    const local = base.slice(0, at);
    const domain = base.slice(at);
    const adjusted = `${local}+mapasusr${legacyUsrId}${domain}`;
    seenLower.add(adjusted.toLowerCase());
    return adjusted;
  }

  const fallback = `mapas-usr-${legacyUsrId}@mapas-etl.invalid`;
  seenLower.add(fallback.toLowerCase());
  return fallback;
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
  const sourceUrl = reqEnv('SOURCE_DATABASE_URL', SOURCE);
  const targetUrl = reqEnv('DATABASE_URL', TARGET);

  console.info('--- ETL Mapas → Prisma ---');
  console.info(`Origem (SOURCE_DATABASE_URL): ${summarizePgUrl(sourceUrl)}`);
  console.info(`Destino (DATABASE_URL):       ${summarizePgUrl(targetUrl)}`);
  console.info(
    'Este script grava usr, users, agent, space, project, event, oportunidades, inscrições, etc. no destino.\n',
  );

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });

  await source.connect();
  await target.connect();

  const agentMetaByOwner = await loadMetaByOwner(source, 'agent_meta');
  const eventMetaByOwner = await loadMetaByOwner(source, 'event_meta');

  const skipDraftEvents = process.env.ETL_SKIP_DRAFT_EVENTS === 'true';
  const publishedStatuses = new Set(
    (process.env.ETL_MAPAS_PUBLISHED_STATUS ?? '1')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n)),
  );

  if (skipDraftEvents) {
    console.info(
      `ETL_SKIP_DRAFT_EVENTS: eventos com status fora de [${[...publishedStatuses].join(', ')}] serão omitidos (e suas ocorrências).\n`,
    );
  }

  console.info('Truncando tabelas Mapas + auth local no alvo…');
  await target.query(`
    TRUNCATE TABLE
      "registration",
      "registration_step",
      "media_asset",
      "event_occurrence",
      "event",
      "opportunity",
      "project",
      "space",
      "subsite",
      "agent",
      "usr",
      "verification_codes",
      "users"
    RESTART IDENTITY CASCADE;
  `);

  const su = await source.query(`SELECT * FROM usr ORDER BY id`);

  const defaultPassword =
    process.env.ETL_DEFAULT_USER_PASSWORD?.trim() ||
    'MapasMigracaoTemp2026!Alterar';
  if (!process.env.ETL_DEFAULT_USER_PASSWORD?.trim()) {
    console.warn(
      'ETL_DEFAULT_USER_PASSWORD não definida: usando senha padrão de desenvolvimento; defina no .env em ambientes reais.',
    );
  }
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const usedDocuments = new Set<string>();
  const seenUserEmailsLower = new Set<string>();
  const profileAgentLegacyIds = new Set<number>(
    su.rows
      .map((u: { profile_id: number | null }) => u.profile_id)
      .filter((id): id is number => id != null),
  );

  for (const row of su.rows) {
    const userId = legacyIds.jwtUser(row.id);
    const document = randomNumericDocument(usedDocuments);
    const name = displayNameFromUsrEmail(row.email);
    const emailForJwt = jwtAccountEmailForUsr(row.email, row.id, seenUserEmailsLower);
    const origEmail = String(row.email ?? '').trim();
    if (origEmail && emailForJwt !== origEmail) {
      console.warn(`[usr id=${row.id}] email duplicado na origem; conta JWT: ${emailForJwt}`);
    }

    await target.query(
      `INSERT INTO users (id, name, document, email, is_email_verified, password, phone, created_at, updated_at)
       VALUES ($1,$2,$3,$4,false,$5,NULL, NOW(), NOW())`,
      [userId, name, document, emailForJwt, passwordHash],
    );
  }
  console.info(`users (JWT): ${su.rows.length} linhas`);

  for (const row of su.rows) {
    const id = legacyIds.usr(row.id);
    await target.query(
      `INSERT INTO usr (id, auth_provider, auth_uid, email, last_login_timestamp, create_timestamp, status, profile_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NULL)`,
      [
        id,
        row.auth_provider,
        row.auth_uid,
        row.email,
        row.last_login_timestamp,
        row.create_timestamp,
        row.status,
      ],
    );
  }
  console.info(`usr: ${su.rows.length} linhas`);

  const sa = await source.query(
    `SELECT id, parent_id, user_id, type, name, location::text AS loc_t,
            COALESCE(ST_AsText(_geo_location::geometry), '') AS geo_wkt,
            short_description, long_description, create_timestamp, status,
            public_location, update_timestamp, subsite_id
     FROM agent ORDER BY id`,
  );

  for (const row of sa.rows) {
    const id = legacyIds.agent(row.id);
    const parentId =
      row.parent_id != null ? legacyIds.agent(row.parent_id) : null;
    const userId = legacyIds.usr(row.user_id);
    const appUserId = profileAgentLegacyIds.has(row.id)
      ? legacyIds.jwtUser(row.user_id)
      : null;
    const loc =
      row.loc_t && String(row.loc_t).trim()
        ? String(row.loc_t)
        : '(0,0)';
    const geo = row.geo_wkt ? String(row.geo_wkt) : '';

    const mergedShort = mergeAgentMetaIntoShortDescription(
      String(row.short_description ?? ''),
      agentMetaByOwner.get(row.id),
    );

    await target.query(
      `INSERT INTO agent (
        id, type, name, public_location, location, _geo_location,
        short_description, long_description, avatar_url, cover_url,
        create_timestamp, status, parent_id, user_id, update_timestamp, subsite_id, app_user_id
      ) VALUES (
        $1,$2,$3,$4, $5::point, $6,
        $7,$8, NULL, NULL,
        $9,$10,$11,$12,$13, $14, $15
      )`,
      [
        id,
        row.type,
        row.name,
        row.public_location,
        loc,
        geo,
        mergedShort,
        row.long_description,
        row.create_timestamp,
        row.status,
        parentId,
        userId,
        row.update_timestamp,
        null,
        appUserId,
      ],
    );
  }
  console.info(`agent: ${sa.rows.length} linhas`);

  for (const row of su.rows) {
    if (row.profile_id == null) continue;
    const uid = legacyIds.usr(row.id);
    const aid = legacyIds.agent(row.profile_id);
    await target.query(`UPDATE usr SET profile_id = $1 WHERE id = $2`, [aid, uid]);
  }

  const ss = await source.query(`SELECT * FROM subsite ORDER BY id`);
  for (const row of ss.rows) {
    const id = legacyIds.subsite(row.id);
    const agentId = legacyIds.agent(row.agent_id);
    const verified = parseJsonLoose(row.verified_seals, null);
    await target.query(
      `INSERT INTO subsite (id, name, create_timestamp, status, agent_id, url, alias_url, verified_seals, namespace)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)`,
      [
        id,
        row.name,
        row.create_timestamp,
        row.status,
        agentId,
        row.url,
        row.alias_url ?? null,
        verified == null ? null : JSON.stringify(verified),
        row.namespace,
      ],
    );
  }
  console.info(`subsite: ${ss.rows.length} linhas`);

  for (const row of sa.rows) {
    if (row.subsite_id == null) continue;
    const aid = legacyIds.agent(row.id);
    const sid = legacyIds.subsite(row.subsite_id);
    await target.query(`UPDATE agent SET subsite_id = $1 WHERE id = $2`, [sid, aid]);
  }

  const sp = await source.query(
    `SELECT id, parent_id, location::text AS loc_t,
            COALESCE(ST_AsText(_geo_location::geometry), '') AS geo_wkt,
            name, short_description, long_description, create_timestamp, status,
            type, agent_id, public, update_timestamp, subsite_id
     FROM space ORDER BY id`,
  );
  for (const row of sp.rows) {
    const id = legacyIds.space(row.id);
    const parentId =
      row.parent_id != null ? legacyIds.space(row.parent_id) : null;
    const agentId = legacyIds.agent(row.agent_id);
    const subsiteId =
      row.subsite_id != null ? legacyIds.subsite(row.subsite_id) : null;
    const loc =
      row.loc_t && String(row.loc_t).trim()
        ? String(row.loc_t)
        : '(0,0)';
    const geo = row.geo_wkt ? String(row.geo_wkt) : '';

    await target.query(
      `INSERT INTO space (
        id, location, _geo_location, name, public,
        short_description, long_description, avatar_url, cover_url,
        create_timestamp, status, type, agent_id, update_timestamp, subsite_id, parent_id
      ) VALUES (
        $1, $2::point, $3, $4, $5,
        $6, $7, NULL, NULL,
        $8, $9, $10, $11, $12, $13, $14
      )`,
      [
        id,
        loc,
        geo,
        row.name,
        row.public,
        row.short_description,
        row.long_description,
        row.create_timestamp,
        row.status,
        row.type,
        agentId,
        row.update_timestamp,
        subsiteId,
        parentId,
      ],
    );
  }
  console.info(`space: ${sp.rows.length} linhas`);

  const pj = await source.query(`SELECT * FROM project ORDER BY id`);
  for (const row of pj.rows) {
    const id = legacyIds.project(row.id);
    const agentId = legacyIds.agent(row.agent_id);
    const subsiteId =
      row.subsite_id != null ? legacyIds.subsite(row.subsite_id) : null;
    const parentId =
      row.parent_id != null ? legacyIds.project(row.parent_id) : null;

    await target.query(
      `INSERT INTO project (
        id, type, name, short_description, long_description, avatar_url, cover_url,
        update_timestamp, starts_on, ends_on, create_timestamp, status, subsite_id, parent_id, agent_id
      ) VALUES ($1,$2,$3,$4,$5, NULL, NULL, $6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        row.type,
        row.name,
        row.short_description,
        row.long_description,
        row.update_timestamp,
        row.starts_on,
        row.ends_on,
        row.create_timestamp,
        row.status,
        subsiteId,
        parentId,
        agentId,
      ],
    );
  }
  console.info(`project: ${pj.rows.length} linhas`);

  const migratedLegacyEventIds = new Set<number>();
  let eventsSkippedDraft = 0;

  const ev = await source.query(`SELECT * FROM event ORDER BY id`);
  for (const row of ev.rows) {
    if (skipDraftEvents && !publishedStatuses.has(Number(row.status))) {
      eventsSkippedDraft += 1;
      continue;
    }

    migratedLegacyEventIds.add(row.id);

    const id = legacyIds.event(row.id);
    const agentId = legacyIds.agent(row.agent_id);
    const projectId =
      row.project_id != null ? legacyIds.project(row.project_id) : null;
    const subsiteId =
      row.subsite_id != null ? legacyIds.subsite(row.subsite_id) : null;
    const shortDesc = mergeEventMetaIntoShortDescription(
      String(row.short_description ?? ''),
      eventMetaByOwner.get(row.id),
    );

    await target.query(
      `INSERT INTO event (
        id, type, name, short_description, long_description, rules,
        avatar_url, cover_url, create_timestamp, status, agent_id, project_id, update_timestamp, subsite_id
      ) VALUES ($1,$2,$3,$4,$5,$6, NULL, NULL, $7,$8,$9,$10,$11,$12)`,
      [
        id,
        row.type,
        row.name,
        shortDesc,
        row.long_description,
        row.rules,
        row.create_timestamp,
        row.status,
        agentId,
        projectId,
        row.update_timestamp,
        subsiteId,
      ],
    );
  }
  console.info(`event: ${migratedLegacyEventIds.size} linhas`);
  if (skipDraftEvents && eventsSkippedDraft > 0) {
    console.info(
      `event: ${eventsSkippedDraft} omitidos (rascunho / não publicados na origem).`,
    );
  }

  let occurrencesSkippedOrphans = 0;
  const eo = await source.query(`SELECT * FROM event_occurrence ORDER BY id`);
  for (const row of eo.rows) {
    if (!migratedLegacyEventIds.has(row.event_id)) {
      occurrencesSkippedOrphans += 1;
      continue;
    }

    const id = legacyIds.eventOccurrence(row.id);
    const eventId = legacyIds.event(row.event_id);
    const spaceId = legacyIds.space(row.space_id);

    await target.query(
      `INSERT INTO event_occurrence (
        id, starts_on, ends_on, starts_at, ends_at, frequency, separation, count, until,
        description, price, priceinfo, timezone_name, event_id, space_id, rule, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        id,
        row.starts_on,
        row.ends_on,
        row.starts_at,
        row.ends_at,
        row.frequency,
        row.separation ?? 1,
        row.count,
        row.until,
        row.description,
        row.price,
        row.priceinfo,
        row.timezone_name ?? 'Etc/UTC',
        eventId,
        spaceId,
        row.rule,
        row.status ?? 1,
      ],
    );
  }
  const eventOccurrencesInserted = eo.rows.length - occurrencesSkippedOrphans;
  console.info(`event_occurrence: ${eventOccurrencesInserted} linhas`);
  if (occurrencesSkippedOrphans > 0) {
    console.info(
      `event_occurrence: ${occurrencesSkippedOrphans} omitidas (evento pai não migrado ou rascunho filtrado).`,
    );
  }

  const op = await source.query(
    `SELECT id, parent_id, agent_id, type, name, short_description,
            registration_from, registration_to, published_registrations,
            registration_categories, create_timestamp, update_timestamp, status, subsite_id, object_type, object_id,
            publish_timestamp, auto_publish, registration_proponent_types, registration_ranges
     FROM opportunity ORDER BY id`,
  );
  for (const row of op.rows) {
    const id = legacyIds.opportunity(row.id);
    const agentId = legacyIds.agent(row.agent_id);
    const parentId =
      row.parent_id != null ? legacyIds.opportunity(row.parent_id) : null;
    const subsiteId =
      row.subsite_id != null ? legacyIds.subsite(row.subsite_id) : null;
    const objectIdStr = opportunistObjectIdString(row.object_type, row.object_id);
    const regCat = parseJsonLoose(row.registration_categories, null);
    const regRanges = parseJsonLoose(row.registration_ranges, null);
    const regPropTypes = parseJsonLoose(
      row.registration_proponent_types,
      {},
    );

    const regFrom = row.registration_from ?? row.create_timestamp;
    const regTo = row.registration_to ?? row.create_timestamp;

    await target.query(
      `INSERT INTO opportunity (
        id, object_type, object_id, type, name, short_description,
        avatar_url, cover_url, registration_from, registration_to, published_registrations,
        registration_categories, create_timestamp, update_timestamp, publish_timestamp, auto_publish, status,
        registration_proponent_types, registration_ranges, parent_id, agent_id, subsite_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6, NULL, NULL, $7,$8,$9,
        $10::jsonb,$11,$12,$13,$14,$15,
        $16::jsonb,$17::jsonb,$18,$19,$20
      )`,
      [
        id,
        String(row.object_type ?? ''),
        objectIdStr,
        row.type,
        row.name,
        row.short_description ?? '',
        regFrom,
        regTo,
        row.published_registrations ?? false,
        regCat == null ? null : JSON.stringify(regCat),
        row.create_timestamp,
        row.update_timestamp,
        row.publish_timestamp,
        row.auto_publish ?? false,
        row.status,
        JSON.stringify(regPropTypes),
        regRanges == null ? null : JSON.stringify(regRanges),
        parentId,
        agentId,
        subsiteId,
      ],
    );
  }
  console.info(`opportunity: ${op.rows.length} linhas`);

  const st = await source.query(`SELECT * FROM registration_step ORDER BY id`);
  for (const row of st.rows) {
    const id = legacyIds.registrationStep(row.id);
    const opportunityId = legacyIds.opportunity(row.opportunity_id);
    const meta =
      typeof row.metadata === 'object'
        ? row.metadata
        : parseJsonLoose(row.metadata, {});

    await target.query(
      `INSERT INTO registration_step (id, name, display_order, opportunity_id, metadata, create_timestamp, update_timestamp)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
      [
        id,
        row.name,
        row.display_order ?? 0,
        opportunityId,
        JSON.stringify(meta),
        row.create_timestamp,
        row.update_timestamp,
      ],
    );
  }
  console.info(`registration_step: ${st.rows.length} linhas`);

  const rg = await source.query(`SELECT * FROM registration ORDER BY id`);
  for (const row of rg.rows) {
    const id = legacyIds.registration(row.id);
    const opportunityId = legacyIds.opportunity(row.opportunity_id);
    const agentId = legacyIds.agent(row.agent_id);
    const subsiteId =
      row.subsite_id != null ? legacyIds.subsite(row.subsite_id) : null;
    const agentsData = parseJsonLoose(row.agents_data, null);
    const spaceData = parseJsonLoose(row.space_data, null);
    const valuersExc = parseJsonLoose(row.valuers_exceptions_list, []);
    const editableFields = parseJsonLoose(row.editable_fields, null);

    await target.query(
      `INSERT INTO registration (
        id, number, category, opportunity_id, agent_id, create_timestamp, sent_timestamp,
        agents_data, consolidated_result, space_data, status, proponent_type, range,
        valuers_exceptions_list, valuers, subsite_id, score, eligible, editable_until,
        edit_sent_timestamp, editable_fields, update_timestamp
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8::jsonb,$9,$10::jsonb,$11,$12,$13,
        $14::jsonb, $15::jsonb, $16,$17,$18,$19,
        $20,$21::jsonb,$22
      )`,
      [
        id,
        row.number,
        row.category,
        opportunityId,
        agentId,
        row.create_timestamp,
        row.sent_timestamp,
        agentsData == null ? null : JSON.stringify(agentsData),
        row.consolidated_result,
        spaceData == null ? null : JSON.stringify(spaceData),
        row.status,
        row.proponent_type ?? '',
        row.range ?? '',
        JSON.stringify(valuersExc),
        '[]',
        subsiteId,
        row.score,
        row.eligible,
        row.editable_until,
        row.edit_sent_timestamp,
        editableFields == null ? null : JSON.stringify(editableFields),
        row.update_timestamp,
      ],
    );
  }
  console.info(`registration: ${rg.rows.length} linhas`);

  await source.end();
  await target.end();

  console.info('ETL concluído. Dados relacionais estão em DATABASE_URL (ver linhas acima por tabela).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
