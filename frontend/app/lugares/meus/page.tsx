"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listMeusEspacos,
  subscribeMeusEspacosChanged,
} from "@/lib/meus-espacos-storage";
import { TIPO_LUGAR_LABELS } from "@/lib/types";
import type { MeuEspacoRecord } from "@/lib/types";
import { Building2, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TabKey = "published" | "draft";

export default function MeusEspacosPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<TabKey>("draft");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");

  useEffect(() => subscribeMeusEspacosChanged(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const records = useMemo(() => {
    void tick;
    return listMeusEspacos();
  }, [tick]);

  const filtered = useMemo(() => {
    let list = records.filter((r) =>
      tab === "published" ? r.status === "published" : r.status === "draft"
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.lugar.nome.toLowerCase().includes(q) ||
          r.lugar.descricao.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === "name") {
        return a.lugar.nome.localeCompare(b.lugar.nome, "pt-BR");
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    return sorted;
  }, [records, tab, search, sort]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

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
                  Adicione e gerencie seus espaços culturais. Rascunhos ficam
                  salvos neste dispositivo até publicar.
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
                <Link href="/lugares">
                  <span className="hidden sm:inline">Catálogo público</span>
                  <span className="sm:hidden">Catálogo</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="published">Publicados</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

          <ListaMeusEspacos
            items={filtered}
            emptyLabel={
              tab === "published"
                ? "Nenhum espaço publicado."
                : "Nenhum rascunho."
            }
          />
        </Tabs>
      </div>
    </div>
  );
}

function ListaMeusEspacos({
  items,
  emptyLabel,
}: {
  items: MeuEspacoRecord[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                <Building2 className="text-muted-foreground h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {r.lugar.nome}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Tipo: {TIPO_LUGAR_LABELS[r.lugar.tipo].toUpperCase()}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Atualizado em{" "}
                  {new Date(r.updatedAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="outline" asChild>
                <Link href={`/lugares/${r.id}`}>
                  Acessar
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/lugares/${r.id}/editar`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
