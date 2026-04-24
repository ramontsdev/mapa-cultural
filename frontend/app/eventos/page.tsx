"use client";

import {
  CalendarDays,
  ChevronRight,
  Filter,
  ImageIcon,
  List,
  Map as MapIcon,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { CreateEventoDialog } from "@/components/recursos/create-evento-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/api/use-events";
import { mapEventToEvento } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
} from "@/lib/types";

type SortEventos = "recentes" | "antigos" | "nome" | "nome-desc";

function toDayKey(dataInicio: string): string {
  if (!dataInicio) return "";
  const parsed = new Date(dataInicio);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey: string): Date | null {
  const parts = dayKey.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function compareEventosForSort(
  a: { dataInicio: string; nome: string },
  b: { dataInicio: string; nome: string },
  sortBy: SortEventos,
): number {
  switch (sortBy) {
    case "recentes": {
      const da = new Date(a.dataInicio).getTime();
      const db = new Date(b.dataInicio).getTime();
      if (da !== db) return db - da;
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    case "antigos": {
      const da = new Date(a.dataInicio).getTime();
      const db = new Date(b.dataInicio).getTime();
      if (da !== db) return da - db;
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    case "nome":
      return a.nome.localeCompare(b.nome, "pt-BR");
    case "nome-desc":
      return b.nome.localeCompare(a.nome, "pt-BR");
    default:
      return 0;
  }
}

export default function EventosPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "mapa">("lista");
  const [apenasOficiais, setApenasOficiais] = useState(false);
  const [classificacao, setClassificacao] = useState<string>("todos");
  const [areaAtuacao, setAreaAtuacao] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortEventos>("recentes");

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("criar") === "1") {
      setCreateOpen(true);
      router.replace("/eventos", { scroll: false });
    }
  }, [isAuthenticated, router]);

  const eventsQuery = useEvents({
    q: searchQuery.trim() || undefined,
    pageSize: 50,
  });

  const eventos = useMemo(
    () => (eventsQuery.data?.items ?? []).map(mapEventToEvento),
    [eventsQuery.data],
  );

  const filteredEventos = useMemo(() => {
    return eventos.filter((evento) => {
      const matchesOficial = !apenasOficiais || evento.isOficial;
      const matchesClassificacao =
        classificacao === "todos" || evento.classificacao === classificacao;
      const matchesArea =
        areaAtuacao === "todos" ||
        evento.areasAtuacao.includes(areaAtuacao as AreaAtuacao);

      return matchesOficial && matchesClassificacao && matchesArea;
    });
  }, [eventos, apenasOficiais, classificacao, areaAtuacao]);

  const eventosAgrupados = useMemo(() => {
    const sorted = [...filteredEventos].sort((a, b) =>
      compareEventosForSort(a, b, sortBy),
    );
    const grupos: Record<string, typeof filteredEventos> = {};
    const dateOrder: string[] = [];
    sorted.forEach((evento) => {
      const data = toDayKey(evento.dataInicio) || "sem-data";
      if (!grupos[data]) {
        grupos[data] = [];
        dateOrder.push(data);
      }
      grupos[data].push(evento);
    });
    return dateOrder.map((data) => [data, grupos[data]] as const);
  }, [filteredEventos, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setApenasOficiais(false);
    setClassificacao("todos");
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
            <span className="font-medium text-foreground">Eventos</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <CalendarDays className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Eventos
              </h1>
            </div>

            {isAuthenticated && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar evento
              </Button>
            )}
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
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
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
                onValueChange={(v) => setSortBy(v as SortEventos)}
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
                {filteredEventos.length} Eventos encontrados
              </span>
            </div>

            {viewMode === "lista" ? (
              <QueryState
                isLoading={eventsQuery.isLoading}
                error={eventsQuery.error}
                onRetry={() => eventsQuery.refetch()}
                isEmpty={filteredEventos.length === 0}
                emptyMessage="Nenhum evento encontrado"
              >
                <div className="space-y-8">
                  {eventosAgrupados.map(([data, eventosData]) => {
                    const parsedDay =
                      data !== "sem-data" ? parseDayKey(data) : null;
                    return (
                      <div key={data}>
                        {parsedDay && (
                          <div className="mb-4 flex items-baseline gap-4 border-b border-border pb-3">
                            <div className="flex items-baseline gap-3">
                              <span className="text-4xl font-bold leading-none text-foreground">
                                {parsedDay.getDate()}
                              </span>
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-medium capitalize text-foreground">
                                  {parsedDay.toLocaleDateString("pt-BR", {
                                    month: "long",
                                  })}
                                </span>
                                <span className="text-xs capitalize text-muted-foreground">
                                  {parsedDay.toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {eventosData.map((evento) => (
                            <Card
                              key={evento.id}
                              className="overflow-hidden transition-shadow hover:shadow-md"
                            >
                              <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                  <div className="relative h-48 w-full shrink-0 bg-muted md:h-auto md:w-56">
                                    {evento.imagem ? (
                                      <Image
                                        src={evento.imagem}
                                        alt={evento.nome}
                                        fill
                                        sizes="(min-width: 768px) 224px, 100vw"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 p-5">
                                    <Link
                                      href={`/eventos/${evento.id}`}
                                      className="group"
                                    >
                                      <h3 className="text-lg font-semibold text-primary group-hover:underline">
                                        {evento.nome}
                                      </h3>
                                    </Link>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                      {evento.dataInicio && (
                                        <span className="flex items-center gap-1">
                                          <CalendarDays className="h-4 w-4" />
                                          {new Date(evento.dataInicio).toLocaleDateString("pt-BR")}
                                          {evento.horario ? ` às ${evento.horario}` : ""}
                                        </span>
                                      )}
                                      {evento.lugar?.nome && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4" />
                                          {evento.lugar.nome}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                      <span>
                                        <strong>Classificação:</strong>{" "}
                                        {
                                          CLASSIFICACAO_LABELS[
                                            evento.classificacao as ClassificacaoEtaria
                                          ]
                                        }
                                      </span>
                                      <span>
                                        <strong>Entrada:</strong>{" "}
                                        {evento.entrada === "gratuito"
                                          ? "Gratuito"
                                          : evento.preco
                                          ? `R$ ${evento.preco.toFixed(2)}`
                                          : "Pago"}
                                      </span>
                                    </div>

                                    {evento.tags.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {evento.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="mt-4">
                                      <Link href={`/eventos/${evento.id}`}>
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
                      </div>
                    );
                  })}
                </div>
              </QueryState>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <MapIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Visualização em mapa será implementada com integração de mapas
                </p>
              </div>
            )}
          </div>

          <aside
            className={`w-full lg:w-72 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">
                    Filtros de eventos
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
                    <h4 className="mb-3 text-sm font-medium">Status do evento</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="oficiais"
                        checked={apenasOficiais}
                        onCheckedChange={(checked) =>
                          setApenasOficiais(checked as boolean)
                        }
                      />
                      <label htmlFor="oficiais" className="text-sm">
                        Eventos oficiais
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium">
                      Classificação Etária
                    </h4>
                    <Select
                      value={classificacao}
                      onValueChange={setClassificacao}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {Object.entries(CLASSIFICACAO_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium">Linguagens</h4>
                    <Select value={areaAtuacao} onValueChange={setAreaAtuacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as linguagens" />
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

      <CreateEventoDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCriado={(id) => router.push(`/eventos/${id}`)}
      />
    </div>
  );
}
