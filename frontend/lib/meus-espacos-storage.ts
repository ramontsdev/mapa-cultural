import { mockLugares } from "@/lib/mock-data";
import type {
  AreaAtuacao,
  Lugar,
  MeuEspacoRecord,
  MeuEspacoStatus,
  TipoLugar,
} from "@/lib/types";

export const MEUS_ESPACOS_STORAGE_KEY = "mapa-cultural-meus-espacos";
export const MEUS_ESPACOS_CHANGED_EVENT = "mapa-cultural-meus-espacos-changed";

/** ID sintético para espaços criados localmente (sem API de usuário). */
export const MEUS_ESPACOS_LOCAL_USER_ID = "local-user";

function emptyEndereco(): Lugar["endereco"] {
  return {
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  };
}

export function generateMeuEspacoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `esp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readRaw(): MeuEspacoRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEUS_ESPACOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as MeuEspacoRecord[];
  } catch {
    return [];
  }
}

function writeRaw(records: MeuEspacoRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MEUS_ESPACOS_STORAGE_KEY,
      JSON.stringify(records)
    );
    window.dispatchEvent(new Event(MEUS_ESPACOS_CHANGED_EVENT));
  } catch {
    /* quota / private mode */
  }
}

export function listMeusEspacos(): MeuEspacoRecord[] {
  return readRaw();
}

export function getMeuEspacoById(id: string): MeuEspacoRecord | null {
  return readRaw().find((r) => r.id === id) ?? null;
}

export function upsertMeuEspaco(record: MeuEspacoRecord) {
  const all = readRaw();
  const i = all.findIndex((r) => r.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (i === -1) {
    all.push(next);
  } else {
    all[i] = next;
  }
  writeRaw(all);
}

export function removeMeuEspaco(id: string) {
  writeRaw(readRaw().filter((r) => r.id !== id));
}

export function createLugarFromQuickInput(input: {
  id: string;
  nome: string;
  tipo: TipoLugar;
  descricao: string;
  areasAtuacao: AreaAtuacao[];
}): Lugar {
  const now = new Date().toISOString();
  return {
    id: input.id,
    nome: input.nome,
    tipo: input.tipo,
    descricao: input.descricao,
    endereco: emptyEndereco(),
    acessibilidade: false,
    areasAtuacao: input.areasAtuacao,
    createdById: MEUS_ESPACOS_LOCAL_USER_ID,
    createdAt: now,
    isOficial: false,
  };
}

export function buildNewMeuEspacoRecord(
  input: {
    nome: string;
    tipo: TipoLugar;
    descricao: string;
    areasAtuacao: AreaAtuacao[];
  },
  status: MeuEspacoStatus
): MeuEspacoRecord {
  const id = generateMeuEspacoId();
  const lugar = createLugarFromQuickInput({ id, ...input });
  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
    lugar,
  };
}

/** Catálogo público: mocks + espaços publicados pelo usuário. */
export function listLugaresPublicadosUsuario(): Lugar[] {
  return listMeusEspacos()
    .filter((r) => r.status === "published")
    .map((r) => r.lugar);
}

/** Resolve espaço para exibição: mock ou registro local. */
export function resolveLugarById(id: string): Lugar | null {
  const mock = mockLugares.find((l) => l.id === id);
  if (mock) return mock;
  const rec = getMeuEspacoById(id);
  return rec?.lugar ?? null;
}

export function isMeuEspacoId(id: string): boolean {
  return getMeuEspacoById(id) !== null;
}

export function subscribeMeusEspacosChanged(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === MEUS_ESPACOS_STORAGE_KEY || e.key === null) cb();
  };
  const onLocal = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener(MEUS_ESPACOS_CHANGED_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MEUS_ESPACOS_CHANGED_EVENT, onLocal);
  };
}
