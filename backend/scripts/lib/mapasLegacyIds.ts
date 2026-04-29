import { createHash } from 'node:crypto';

/** Namespace fixo (UUID v4 literal) usado só para derivar IDs determinísticos na migração Mapas int → texto. */
const MAPAS_LEGACY_NAMESPACE = 'a67f8c90-1b2d-5e3f-8c4d-2e1f0a9b8c7d';

function uuidBytesToString(bytes: Buffer): string {
  const b = Buffer.from(bytes.subarray(0, 16));
  b[6] = (b[6]! & 0x0f) | 0x50; // version 5
  b[8] = (b[8]! & 0x3f) | 0x80; // variant RFC 4122
  const hex = b.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * UUID v5 (SHA-1) compatível com RFC 4122, sem dependência `uuid`.
 * `scope` diferencia tabelas (usr, agent, file row context para mídia, etc.).
 */
export function legacyRowUuid(scope: string, legacyId: number): string {
  const ns = MAPAS_LEGACY_NAMESPACE.replace(/-/g, '');
  const nsBuf = Buffer.from(ns, 'hex');
  const nameBuf = Buffer.from(`${scope}:${legacyId}`, 'utf8');
  const hash = createHash('sha1').update(Buffer.concat([nsBuf, nameBuf])).digest();
  return uuidBytesToString(hash);
}

/** IDs de entidades Mapas alinhados ao ETL (`etl-mapas-prod-to-local.ts`). */
export const legacyIds = {
  usr: (id: number) => legacyRowUuid('usr', id),
  agent: (id: number) => legacyRowUuid('agent', id),
  subsite: (id: number) => legacyRowUuid('subsite', id),
  space: (id: number) => legacyRowUuid('space', id),
  project: (id: number) => legacyRowUuid('project', id),
  event: (id: number) => legacyRowUuid('event', id),
  eventOccurrence: (id: number) => legacyRowUuid('event_occurrence', id),
  opportunity: (id: number) => legacyRowUuid('opportunity', id),
  registrationStep: (id: number) => legacyRowUuid('registration_step', id),
  registration: (id: number) => legacyRowUuid('registration', id),
  /** Conta JWT (`users`) — um registro por `usr` legado; liga a `agent.app_user_id` no perfil. */
  jwtUser: (legacyUsrId: number) => legacyRowUuid('mapas_jwt_user', legacyUsrId),
};

/**
 * Mesmo esquema de UUID usado em `owner_id` do `import-backup-de-producao.ts`
 * para arquivo ligado a entidade (object_id inteiro legado).
 */
export function mediaOwnerUuidFromLegacyObject(
  objectType: string,
  legacyObjectId: number,
): string | null {
  const t = objectType.trim();
  if (t.includes('\\Entities\\Agent')) return legacyIds.agent(legacyObjectId);
  if (t.includes('\\Entities\\Space')) return legacyIds.space(legacyObjectId);
  if (t.includes('\\Entities\\Project')) return legacyIds.project(legacyObjectId);
  if (t.includes('\\Entities\\Event')) return legacyIds.event(legacyObjectId);
  if (t.includes('\\Entities\\Opportunity')) return legacyIds.opportunity(legacyObjectId);
  return null;
}
