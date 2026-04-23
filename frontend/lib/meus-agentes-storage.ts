import {
  generateMeuRecursoId,
  MEUS_LOCAL_USER_ID,
  readJsonList,
  subscribeKey,
  writeJsonList,
} from "@/lib/meu-recurso-utils";
import { mockUsers } from "@/lib/mock-data";
import type {
  MeuAgenteRecord,
  MeuEspacoStatus,
  User,
} from "@/lib/types";

const KEY = "mapa-cultural-meus-agentes";
const EVT = "mapa-cultural-meus-agentes-changed";

export function listMeusAgentes(): MeuAgenteRecord[] {
  return readJsonList<MeuAgenteRecord>(KEY);
}

export function getMeuAgenteById(id: string): MeuAgenteRecord | null {
  return listMeusAgentes().find((r) => r.id === id) ?? null;
}

export function upsertMeuAgente(record: MeuAgenteRecord) {
  const all = listMeusAgentes();
  const i = all.findIndex((r) => r.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (i === -1) all.push(next);
  else all[i] = next;
  writeJsonList(KEY, all, EVT);
}

export function removeMeuAgente(id: string) {
  writeJsonList(
    KEY,
    listMeusAgentes().filter((r) => r.id !== id),
    EVT
  );
}

export function listAgentesPublicadosUsuario(): User[] {
  return listMeusAgentes()
    .filter((r) => r.status === "published")
    .map((r) => r.agente);
}

export function resolveAgenteById(id: string): User | null {
  const mock = mockUsers.find((u) => u.id === id);
  if (mock) return mock;
  return getMeuAgenteById(id)?.agente ?? null;
}

export function isMeuAgenteId(id: string): boolean {
  return getMeuAgenteById(id) !== null;
}

export function subscribeMeusAgentesChanged(cb: () => void) {
  return subscribeKey(KEY, EVT, cb);
}

export function buildNewMeuAgenteRecord(
  agente: Omit<User, "id" | "createdAt">,
  status: MeuEspacoStatus
): MeuAgenteRecord {
  const id = generateMeuRecursoId();
  const full: User = {
    ...agente,
    id,
    createdAt: new Date().toISOString(),
  };
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
    agente: full,
  };
}
