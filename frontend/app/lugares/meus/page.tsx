"use client";

import { Building2, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteSpace, useMySpaces } from "@/hooks/api/use-spaces";
import { mapSpaceToLugar } from "@/lib/api/types";
import { ApiError } from "@/lib/api/http";
import { TIPO_LUGAR_LABELS } from "@/lib/types";

export default function MeusEspacosPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const spacesQuery = useMySpaces({ pageSize: 100 });
  const deleteMutation = useDeleteSpace();

  const items = useMemo(() => {
    const list = spacesQuery.data?.items ?? [];
    return list.map((space) => ({ space, lugar: mapSpaceToLugar(space) }));
  }, [spacesQuery.data]);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        ({ lugar }) =>
          lugar.nome.toLowerCase().includes(q) ||
          lugar.descricao.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "name") {
        return a.lugar.nome.localeCompare(b.lugar.nome, "pt-BR");
      }
      const au = a.space.updateTimestamp ?? a.space.createTimestamp;
      const bu = b.space.updateTimestamp ?? b.space.createTimestamp;
      return new Date(bu).getTime() - new Date(au).getTime();
    });
  }, [items, search, sort]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  const onDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Espaço excluído.");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Não foi possível excluir.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/lugares" className="hover:text-foreground">
              Espaços
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Meus espaços</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Meus espaços
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Espaços culturais que você cadastrou.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" asChild>
                <Link href="/lugares?criar=1">
                  <Plus className="h-4 w-4" />
                  Novo espaço
                </Link>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/lugares">Catálogo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por palavras-chave"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as "updated" | "name")}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Modificados recentemente</SelectItem>
              <SelectItem value="name">Nome A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <QueryState
          isLoading={spacesQuery.isLoading}
          error={spacesQuery.error}
          onRetry={() => spacesQuery.refetch()}
          isEmpty={filtered.length === 0}
          emptyMessage="Você ainda não cadastrou nenhum espaço."
        >
          <div className="space-y-4">
            {filtered.map(({ space, lugar }) => (
              <Card key={space.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                      <Building2 className="text-muted-foreground h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {lugar.nome}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Tipo: {TIPO_LUGAR_LABELS[lugar.tipo].toUpperCase()}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Atualizado em{" "}
                        {new Date(
                          space.updateTimestamp ?? space.createTimestamp,
                        ).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button variant="outline" asChild>
                      <Link href={`/lugares/${space.id}`}>
                        Acessar
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/lugares/${space.id}/editar`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(space.id, lugar.nome)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </QueryState>
      </div>
    </div>
  );
}
