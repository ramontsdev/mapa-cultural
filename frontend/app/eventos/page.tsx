"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Search,
  List,
  Map,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { getEventosComLugares } from "@/lib/mock-data";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
} from "@/lib/types";

export default function EventosPage() {
  const eventos = getEventosComLugares();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "mapa">("lista");
  const [apenasOficiais, setApenasOficiais] = useState(false);
  const [classificacao, setClassificacao] = useState<string>("todos");
  const [areaAtuacao, setAreaAtuacao] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);

  const filteredEventos = useMemo(() => {
    return eventos.filter((evento) => {
      const matchesSearch =
        evento.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evento.descricao.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOficial = !apenasOficiais || evento.isOficial;
      const matchesClassificacao =
        classificacao === "todos" || evento.classificacao === classificacao;
      const matchesArea =
        areaAtuacao === "todos" ||
        evento.areasAtuacao.includes(areaAtuacao as AreaAtuacao);

      return (
        matchesSearch && matchesOficial && matchesClassificacao && matchesArea
      );
    });
  }, [eventos, searchQuery, apenasOficiais, classificacao, areaAtuacao]);

  // Agrupar eventos por data
  const eventosAgrupados = useMemo(() => {
    const grupos: Record<string, typeof filteredEventos> = {};
    filteredEventos.forEach((evento) => {
      const data = evento.dataInicio;
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(evento);
    });
    return Object.entries(grupos).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [filteredEventos]);

  const clearFilters = () => {
    setSearchQuery("");
    setApenasOficiais(false);
    setClassificacao("todos");
    setAreaAtuacao("todos");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
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

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Eventos
            </h1>
          </div>

          {/* View Toggle and Search */}
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
                  <Map className="h-4 w-4" />
                  Mapa
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Count */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <Select defaultValue="recentes">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Mais recentes primeiro</SelectItem>
                  <SelectItem value="antigos">Mais antigos primeiro</SelectItem>
                  <SelectItem value="nome">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>

              <span className="rounded-lg bg-muted px-4 py-2 text-sm font-medium">
                {filteredEventos.length} Eventos encontrados
              </span>
            </div>

            {/* Events List */}
            {viewMode === "lista" ? (
              <div className="space-y-8">
                {eventosAgrupados.map(([data, eventosData]) => (
                  <div key={data}>
                    {/* Date Header */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">
                          {new Date(data).getDate()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(data).toLocaleDateString("pt-BR", {
                            month: "long",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                          })}
                        </p>
                      </div>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Events for this date */}
                    <div className="space-y-4 pl-0 md:pl-20">
                      {eventosData.map((evento) => (
                        <Card
                          key={evento.id}
                          className="overflow-hidden transition-shadow hover:shadow-md"
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              {/* Image */}
                              <div className="relative h-48 w-full md:h-auto md:w-48">
                                <Image
                                  src={evento.imagem || "/placeholder.svg"}
                                  alt={evento.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-5">
                                <Link
                                  href={`/eventos/${evento.id}`}
                                  className="group"
                                >
                                  <h3 className="text-lg font-semibold text-primary group-hover:underline">
                                    {evento.nome}
                                  </h3>
                                </Link>

                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    {new Date(evento.dataInicio).toLocaleDateString(
                                      "pt-BR"
                                    )}{" "}
                                    às {evento.horario}
                                  </span>
                                  {evento.lugar && (
                                    <Link
                                      href={`/lugares/${evento.lugar.id}`}
                                      className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                      <MapPin className="h-4 w-4" />
                                      {evento.lugar.nome}
                                    </Link>
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
                                      : `R$ ${evento.preco?.toFixed(2)}`}
                                  </span>
                                </div>

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
                ))}

                {filteredEventos.length === 0 && (
                  <div className="py-12 text-center">
                    <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-lg text-muted-foreground">
                      Nenhum evento encontrado
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <Map className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Visualização em mapa será implementada com integração de mapas
                </p>
              </div>
            )}
          </div>

          {/* Filters Sidebar */}
          <aside
            className={`w-full lg:w-72 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
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
                  {/* Status */}
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

                  {/* Classificação */}
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
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Área de Atuação */}
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
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
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
