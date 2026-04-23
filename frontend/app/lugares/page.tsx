"use client";

import { useAuth } from "@/components/auth-provider";
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
import { CreateEspacoDialog } from "@/components/lugares/create-espaco-dialog";
import { DraftCreatedDialog } from "@/components/recursos/draft-created-dialog";
import { sortListByMode, type ListSortBy } from "@/lib/list-sort";
import {
  listLugaresPublicadosUsuario,
  subscribeMeusEspacosChanged,
} from "@/lib/meus-espacos-storage";
import { mockLugares } from "@/lib/mock-data";
import {
  AREA_ATUACAO_LABELS,
  TIPO_LUGAR_LABELS,
  type AreaAtuacao,
  type TipoLugar,
} from "@/lib/types";
import {
  Accessibility,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  List,
  Map,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function LugaresPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [storageTick, setStorageTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "mapa">("lista");
  const [apenasOficiais, setApenasOficiais] = useState(false);
  const [possuiAcessibilidade, setPossuiAcessibilidade] = useState(false);
  const [tipoLugar, setTipoLugar] = useState<string>("todos");
  const [areaAtuacao, setAreaAtuacao] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<ListSortBy>("recentes");

  useEffect(() => subscribeMeusEspacosChanged(() => setStorageTick((t) => t + 1)), []);

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("criar") === "1") {
      setCreateOpen(true);
      router.replace("/lugares", { scroll: false });
    }
  }, [isAuthenticated, router]);

  const todosLugares = useMemo(() => {
    void storageTick;
    return [...mockLugares, ...listLugaresPublicadosUsuario()];
  }, [storageTick]);

  const filteredLugares = useMemo(() => {
    return todosLugares.filter((lugar) => {
      const matchesSearch =
        lugar.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lugar.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lugar.endereco.cidade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOficial = !apenasOficiais || lugar.isOficial;
      const matchesAcessibilidade =
        !possuiAcessibilidade || lugar.acessibilidade;
      const matchesTipo = tipoLugar === "todos" || lugar.tipo === tipoLugar;
      const matchesArea =
        areaAtuacao === "todos" ||
        lugar.areasAtuacao.includes(areaAtuacao as AreaAtuacao);

      return (
        matchesSearch &&
        matchesOficial &&
        matchesAcessibilidade &&
        matchesTipo &&
        matchesArea
      );
    });
  }, [
    todosLugares,
    searchQuery,
    apenasOficiais,
    possuiAcessibilidade,
    tipoLugar,
    areaAtuacao,
  ]);

  const sortedLugares = useMemo(
    () => sortListByMode(filteredLugares, sortBy),
    [filteredLugares, sortBy]
  );

  const clearFilters = () => {
    setSearchQuery("");
    setApenasOficiais(false);
    setPossuiAcessibilidade(false);
    setTipoLugar("todos");
    setAreaAtuacao("todos");
    setSortBy("recentes");
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
            <span className="font-medium text-foreground">Espaços</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Espaços
              </h1>
            </div>

            {isAuthenticated && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar espaço
              </Button>
            )}
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
                  placeholder="Buscar espaços..."
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
                {filteredLugares.length} Espaços encontrados
              </span>
            </div>

            {/* Places List */}
            {viewMode === "lista" ? (
              <div className="space-y-4">
                {sortedLugares.map((lugar) => (
                  <Card
                    key={lugar.id}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative h-48 w-full md:h-auto md:w-48">
                          <Image
                            src={lugar.imagem || "/placeholder.svg"}
                            alt={lugar.nome}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/lugares/${lugar.id}`}
                                className="group"
                              >
                                <h3 className="text-lg font-semibold text-primary group-hover:underline">
                                  {lugar.nome}
                                </h3>
                              </Link>
                              <p className="text-sm text-secondary">
                                Tipo:{" "}
                                {TIPO_LUGAR_LABELS[lugar.tipo as TipoLugar]}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {lugar.isOficial && (
                                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Oficial
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {lugar.endereco.logradouro}, {lugar.endereco.numero}{" "}
                            - {lugar.endereco.bairro} -{" "}
                            {lugar.endereco.cidade}/{lugar.endereco.estado} -
                            CEP: {lugar.endereco.cep}
                          </p>

                          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                            {lugar.descricao}
                          </p>

                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <strong>Acessibilidade:</strong>{" "}
                              {lugar.acessibilidade ? (
                                <span className="flex items-center gap-1 text-primary">
                                  <Accessibility className="h-4 w-4" />
                                  Sim
                                </span>
                              ) : (
                                "Não"
                              )}
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="text-sm font-medium">
                              Áreas de Atuação ({lugar.areasAtuacao.length}):
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {lugar.areasAtuacao.map((area) => (
                                <span
                                  key={area}
                                  className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary"
                                >
                                  {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <Link href={`/lugares/${lugar.id}`}>
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

                {filteredLugares.length === 0 && (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-lg text-muted-foreground">
                      Nenhum espaço encontrado
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
            className={`w-full lg:w-72 ${showFilters ? "block" : "hidden lg:block"
              }`}
          >
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">
                    Filtros de espaço
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
                    <h4 className="mb-3 text-sm font-medium">Status do espaço</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acessibilidade"
                          checked={possuiAcessibilidade}
                          onCheckedChange={(checked) =>
                            setPossuiAcessibilidade(checked as boolean)
                          }
                        />
                        <label htmlFor="acessibilidade" className="text-sm">
                          Possui acessibilidade
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="oficiais"
                          checked={apenasOficiais}
                          onCheckedChange={(checked) =>
                            setApenasOficiais(checked as boolean)
                          }
                        />
                        <label htmlFor="oficiais" className="text-sm">
                          Espaços oficiais
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Espaço */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Tipos de espaços</h4>
                    <Select value={tipoLugar} onValueChange={setTipoLugar}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {Object.entries(TIPO_LUGAR_LABELS).map(
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

      <CreateEspacoDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCriadoRascunho={(id) => {
          setLastCreatedId(id);
          setDraftDialogOpen(true);
        }}
        onCriadoPublicado={(id) => {
          router.push(`/lugares/${id}`);
        }}
      />

      <DraftCreatedDialog
        open={draftDialogOpen}
        onOpenChange={setDraftDialogOpen}
        titulo="Espaço criado em rascunho"
        nomeSecaoMeus="Meus espaços"
        verItemLabel="Ver espaço"
        onVer={() => {
          if (lastCreatedId) router.push(`/lugares/${lastCreatedId}`);
        }}
        onCompletarDepois={() => router.push("/lugares/meus")}
        onCompletarInformacoes={() => {
          if (lastCreatedId) router.push(`/lugares/${lastCreatedId}/editar`);
        }}
      />
    </div>
  );
}
