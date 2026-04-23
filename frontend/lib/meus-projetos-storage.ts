import {
  generateMeuRecursoId,
  MEUS_LOCAL_USER_ID,
  readJsonList,
  subscribeKey,
  writeJsonList,
} from "@/lib/meu-recurso-utils";
import { mockProjetos } from "@/lib/mock-data";
import type {
  MeuEspacoStatus,
  MeuProjetoRecord,
  Projeto,
} from "@/lib/types";

const KEY = "mapa-cultural-meus-projetos";
const EVT = "mapa-cultural-meus-projetos-changed";

export function listMeusProjetos(): MeuProjetoRecord[] {
  return readJsonList<MeuProjetoRecord>(KEY);
}

export function getMeuProjetoById(id: string): MeuProjetoRecord | null {
  return listMeusProjetos().find((r) => r.id === id) ?? null;
}

export function upsertMeuProjeto(record: MeuProjetoRecord) {
  const all = listMeusProjetos();
  const i = all.findIndex((r) => r.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (i === -1) all.push(next);
  else all[i] = next;
  writeJsonList(KEY, all, EVT);
}

export function removeMeuProjeto(id: string) {
  writeJsonList(
    KEY,
    listMeusProjetos().filter((r) => r.id !== id),
    EVT
  );
}

export function listProjetosPublicadosUsuario(): Projeto[] {
  return listMeusProjetos()
    .filter((r) => r.status === "published")
    .map((r) => r.projeto);
}

export function resolveProjetoById(id: string): Projeto | null {
  const mock = mockProjetos.find((p) => p.id === id);
  if (mock) return mock;
  return getMeuProjetoById(id)?.projeto ?? null;
}

export function isMeuProjetoId(id: string): boolean {
  return getMeuProjetoById(id) !== null;
}

export function subscribeMeusProjetosChanged(cb: () => void) {
  return subscribeKey(KEY, EVT, cb);
}

export function buildNewMeuProjetoRecord(
  projeto: Omit<Projeto, "id" | "createdById" | "createdAt" | "isOficial">,
  status: MeuEspacoStatus
): MeuProjetoRecord {
  const id = generateMeuRecursoId();
  const full: Projeto = {
    ...projeto,
    id,
    createdById: MEUS_LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    isOficial: false,
  };
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
    projeto: full,
  };
}
