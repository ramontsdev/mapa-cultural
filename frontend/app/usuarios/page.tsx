"use client";

import {
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Map as MapIcon,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { QueryState } from "@/components/api/QueryState";
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
import { useAgents } from "@/hooks/api/use-agents";
import { mapAgentToUser } from "@/lib/api/types";
import { sortListByMode, type ListSortBy } from "@/lib/list-sort";
import {
  AREA_ATUACAO_LABELS,
  USER_ROLE_LABELS,
  type AreaAtuacao,
} from "@/lib/types";

export default function UsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "mapa" | "tabelas">(
    "lista",
  );
  const [tipoAtuacao, setTipoAtuacao] = useState<string>("todos");
  const [areaAtuacao, setAreaAtuacao] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<ListSortBy>("recentes");

  const agentsQuery = useAgents({ q: searchQuery, pageSize: 50 });

  const usuarios = useMemo(() => {
    const items = agentsQuery.data?.items ?? [];
    return items.map(mapAgentToUser);
  }, [agentsQuery.data]);

  const filtered = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesTipo =
        tipoAtuacao === "todos" || usuario.tipoAtuacao === tipoAtuacao;
      const matchesArea =
        areaAtuacao === "todos" ||
        usuario.areasAtuacao.includes(areaAtuacao as AreaAtuacao);
      return matchesTipo && matchesArea;
    });
  }, [usuarios, tipoAtuacao, areaAtuacao]);

  const sorted = useMemo(
    () => sortListByMode(filtered, sortBy),
    [filtered, sortBy],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setTipoAtuacao("todos");
    setAreaAtuacao("todos");
    setSortBy("recentes");
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
            <span className="font-medium text-foreground">Agentes</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Agentes
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Visualizar como:
              </span>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "lista" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("lista")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
                <Button
                  variant={viewMode === "mapa" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mapa")}
                  className="gap-2"
                >
                  <MapIcon className="h-4 w-4" />
                  Mapa
                </Button>
                <Button
                  variant={viewMode === "tabelas" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("tabelas")}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Tabelas
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar agentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as ListSortBy)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Mais recentes primeiro</SelectItem>
                  <SelectItem value="antigos">Mais antigos primeiro</SelectItem>
                  <SelectItem value="nome">Nome A-Z</SelectItem>
                  <SelectItem value="nome-desc">Nome Z-A</SelectItem>
                </SelectContent>
              </Select>

              <span className="rounded-lg bg-muted px-4 py-2 text-sm font-medium">
                {filtered.length} Agentes encontrados
              </span>
            </div>

            <QueryState
              isLoading={agentsQuery.isLoading}
              error={agentsQuery.error}
              onRetry={() => agentsQuery.refetch()}
              isEmpty={viewMode === "lista" && sorted.length === 0}
              emptyMessage="Nenhum agente encontrado."
            >
              {viewMode === "lista" ? (
                <div className="space-y-4">
                  {sorted.map((usuario) => (
                    <Card
                      key={usuario.id}
                      className="overflow-hidden transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex items-center justify-center bg-muted p-6 md:w-48">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted-foreground/10">
                              <Users className="h-12 w-12 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  href={`/usuarios/${usuario.id}`}
                                  className="group"
                                >
                                  <h3 className="text-lg font-semibold text-primary group-hover:underline">
                                    {usuario.nome}
                                  </h3>
                                </Link>
                                <p className="text-sm text-secondary">
                                  Este agente atua de forma{" "}
                                  <span className="font-medium">
                                    {usuario.tipoAtuacao === "coletivo"
                                      ? "Coletivo"
                                      : "Individual"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {usuario.biografia && (
                              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                                {usuario.biografia}
                              </p>
                            )}

                            {usuario.areasAtuacao.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm font-medium">
                                  Áreas de Atuação (
                                  {usuario.areasAtuacao.length}
                                  ):
                                </span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {usuario.areasAtuacao.map((area) => (
                                    <span
                                      key={area}
                                      className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                                    >
                                      {AREA_ATUACAO_LABELS[area]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {usuario.roles.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm font-medium">
                                  Atribuições:
                                </span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {usuario.roles.map((role) => (
                                    <span
                                      key={role}
                                      className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground"
                                    >
                                      {USER_ROLE_LABELS[role]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4">
                              <Link href={`/usuarios/${usuario.id}`}>
                                <Button className="w-full bg-primary hover:bg-primary/90 md:w-auto">
                                  Acessar
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                  {viewMode === "mapa" ? (
                    <>
                      <MapIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">
                        Visualização em mapa será implementada com integração de
                        mapas
                      </p>
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="mx-auto h-16 w-16 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">
                        Visualização em tabela em desenvolvimento
                      </p>
                    </>
                  )}
                </div>
              )}
            </QueryState>
          </div>

          <aside
            className={`w-full lg:w-72 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">
                    Filtros de agente
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Tipo</h4>
                    <Select value={tipoAtuacao} onValueChange={setTipoAtuacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="coletivo">Coletivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium">Área de atuação</h4>
                    <Select value={areaAtuacao} onValueChange={setAreaAtuacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as áreas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {Object.entries(AREA_ATUACAO_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary"
                    onClick={clearFilters}
                  >
                    Limpar todos os filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
