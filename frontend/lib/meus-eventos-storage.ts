import {
  generateMeuRecursoId,
  MEUS_LOCAL_USER_ID,
  readJsonList,
  subscribeKey,
  writeJsonList,
} from "@/lib/meu-recurso-utils";
import { mockEventos } from "@/lib/mock-data";
import type {
  Evento,
  MeuEspacoStatus,
  MeuEventoRecord,
} from "@/lib/types";

const KEY = "mapa-cultural-meus-eventos";
const EVT = "mapa-cultural-meus-eventos-changed";

export function listMeusEventos(): MeuEventoRecord[] {
  return readJsonList<MeuEventoRecord>(KEY);
}

export function getMeuEventoById(id: string): MeuEventoRecord | null {
  return listMeusEventos().find((r) => r.id === id) ?? null;
}

export function upsertMeuEvento(record: MeuEventoRecord) {
  const all = listMeusEventos();
  const i = all.findIndex((r) => r.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (i === -1) all.push(next);
  else all[i] = next;
  writeJsonList(KEY, all, EVT);
}

export function removeMeuEvento(id: string) {
  writeJsonList(
    KEY,
    listMeusEventos().filter((r) => r.id !== id),
    EVT
  );
}

export function listEventosPublicadosUsuario(): Evento[] {
  return listMeusEventos()
    .filter((r) => r.status === "published")
    .map((r) => r.evento);
}

export function resolveEventoById(id: string): Evento | null {
  const mock = mockEventos.find((e) => e.id === id);
  if (mock) return mock;
  return getMeuEventoById(id)?.evento ?? null;
}

export function isMeuEventoId(id: string): boolean {
  return getMeuEventoById(id) !== null;
}

export function subscribeMeusEventosChanged(cb: () => void) {
  return subscribeKey(KEY, EVT, cb);
}

export function buildNewMeuEventoRecord(
  evento: Omit<Evento, "id" | "createdById" | "createdAt" | "isOficial" | "tags"> & {
    tags?: string[];
  },
  status: MeuEspacoStatus
): MeuEventoRecord {
  const id = generateMeuRecursoId();
  const full: Evento = {
    ...evento,
    id,
    tags: evento.tags ?? [],
    createdById: MEUS_LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    isOficial: false,
  };
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
    evento: full,
  };
}
