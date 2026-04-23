import {
  generateMeuRecursoId,
  MEUS_LOCAL_USER_ID,
  readJsonList,
  subscribeKey,
  writeJsonList,
} from "@/lib/meu-recurso-utils";
import { mockOportunidades } from "@/lib/mock-data";
import type {
  MeuEspacoStatus,
  MeuOportunidadeRecord,
  Oportunidade,
} from "@/lib/types";

const KEY = "mapa-cultural-meus-oportunidades";
const EVT = "mapa-cultural-meus-oportunidades-changed";

export function listMeusOportunidades(): MeuOportunidadeRecord[] {
  return readJsonList<MeuOportunidadeRecord>(KEY);
}

export function getMeuOportunidadeById(id: string): MeuOportunidadeRecord | null {
  return listMeusOportunidades().find((r) => r.id === id) ?? null;
}

export function upsertMeuOportunidade(record: MeuOportunidadeRecord) {
  const all = listMeusOportunidades();
  const i = all.findIndex((r) => r.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (i === -1) all.push(next);
  else all[i] = next;
  writeJsonList(KEY, all, EVT);
}

export function removeMeuOportunidade(id: string) {
  writeJsonList(
    KEY,
    listMeusOportunidades().filter((r) => r.id !== id),
    EVT
  );
}

export function listOportunidadesPublicadasUsuario(): Oportunidade[] {
  return listMeusOportunidades()
    .filter((r) => r.status === "published")
    .map((r) => r.oportunidade);
}

export function resolveOportunidadeById(id: string): Oportunidade | null {
  const mock = mockOportunidades.find((o) => o.id === id);
  if (mock) return mock;
  return getMeuOportunidadeById(id)?.oportunidade ?? null;
}

export function isMeuOportunidadeId(id: string): boolean {
  return getMeuOportunidadeById(id) !== null;
}

export function subscribeMeusOportunidadesChanged(cb: () => void) {
  return subscribeKey(KEY, EVT, cb);
}

export function buildNewMeuOportunidadeRecord(
  oportunidade: Omit<
    Oportunidade,
    "id" | "createdById" | "createdAt" | "isOficial"
  >,
  status: MeuEspacoStatus
): MeuOportunidadeRecord {
  const id = generateMeuRecursoId();
  const full: Oportunidade = {
    ...oportunidade,
    id,
    createdById: MEUS_LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    isOficial: false,
  };
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
    oportunidade: full,
  };
}
