/** Ordenação comum em listas com `createdAt` e `nome` (cadastro / título). */
export type ListSortBy = "recentes" | "antigos" | "nome" | "nome-desc";

export function compareListSort(
  a: { createdAt: string; nome: string },
  b: { createdAt: string; nome: string },
  sortBy: ListSortBy
): number {
  switch (sortBy) {
    case "recentes": {
      const d =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (d !== 0) return d;
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    case "antigos": {
      const d =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (d !== 0) return d;
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    case "nome": {
      const n = a.nome.localeCompare(b.nome, "pt-BR");
      if (n !== 0) return n;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    case "nome-desc": {
      const n = b.nome.localeCompare(a.nome, "pt-BR");
      if (n !== 0) return n;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }
}

export function sortListByMode<T extends { createdAt: string; nome: string }>(
  items: T[],
  sortBy: ListSortBy
): T[] {
  return [...items].sort((a, b) => compareListSort(a, b, sortBy));
}
