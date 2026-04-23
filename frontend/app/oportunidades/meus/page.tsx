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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listMeusOportunidades,
  subscribeMeusOportunidadesChanged,
} from "@/lib/meus-oportunidades-storage";
import { TIPO_OPORTUNIDADE_LABELS } from "@/lib/types";
import type { MeuOportunidadeRecord } from "@/lib/types";
import { ChevronRight, Lightbulb, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TabKey = "published" | "draft";

export default function MeusOportunidadesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<TabKey>("draft");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");

  useEffect(
    () => subscribeMeusOportunidadesChanged(() => setTick((t) => t + 1)),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, router]);

  const records = useMemo(() => {
    void tick;
    return listMeusOportunidades();
  }, [tick]);

  const filtered = useMemo(() => {
    let list = records.filter((r) =>
      tab === "published" ? r.status === "published" : r.status === "draft"
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.oportunidade.nome.toLowerCase().includes(q) ||
          r.oportunidade.descricao.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "name") {
        return a.oportunidade.nome.localeCompare(b.oportunidade.nome, "pt-BR");
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
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
            <Link href="/oportunidades" className="hover:text-foreground">
              Oportunidades
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">
              Minhas oportunidades
            </span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Minhas oportunidades
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rascunhos e publicações ficam salvos neste dispositivo.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" asChild>
                <Link href="/oportunidades?criar=1">
                  <Plus className="h-4 w-4" />
                  Nova oportunidade
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/oportunidades">Catálogo</Link>
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
                placeholder="Buscar"
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

          <ListaMeusOportunidades
            items={filtered}
            emptyLabel={
              tab === "published"
                ? "Nenhuma oportunidade publicada."
                : "Nenhum rascunho."
            }
          />
        </Tabs>
      </div>
    </div>
  );
}

function ListaMeusOportunidades({
  items,
  emptyLabel,
}: {
  items: MeuOportunidadeRecord[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
                <Lightbulb className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {r.oportunidade.nome}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {TIPO_OPORTUNIDADE_LABELS[r.oportunidade.tipo]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
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
                <Link href={`/oportunidades/${r.id}`}>
                  Acessar
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/oportunidades/${r.id}/editar`}>
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
