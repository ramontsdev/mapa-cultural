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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { compareListSort, type ListSortBy } from "@/lib/list-sort";
import { mockProjetos } from "@/lib/mock-data";
import {
  AREA_ATUACAO_LABELS,
  TIPO_PROJETO_LABELS,
  type AreaAtuacao,
  type TipoProjeto,
} from "@/lib/types";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Filter,
  FolderKanban,
  Plus,
  Search,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

/** Valor sentinela para o Select (Radix não permite `value=""` em SelectItem). */
const FILTER_TODOS = "__todos__";

export default function ProjetosPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ListSortBy>("recentes");
  const [tipoFilter, setTipoFilter] = useState<string>(FILTER_TODOS);
  const [areaFilter, setAreaFilter] = useState<string>(FILTER_TODOS);
  const [showOnlyOficiais, setShowOnlyOficiais] = useState(false);

  const filteredProjetos = useMemo(() => {
    let result = [...mockProjetos];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(query) ||
          p.descricao.toLowerCase().includes(query) ||
          p.responsavel.toLowerCase().includes(query)
      );
    }

    // Tipo filter
    if (tipoFilter !== FILTER_TODOS) {
      result = result.filter((p) => p.tipo === tipoFilter);
    }

    // Area filter
    if (areaFilter !== FILTER_TODOS) {
      result = result.filter((p) =>
        p.areasAtuacao.includes(areaFilter as AreaAtuacao)
      );
    }

    // Oficiais filter
    if (showOnlyOficiais) {
      result = result.filter((p) => p.isOficial);
    }

    result.sort((a, b) => compareListSort(a, b, sortBy));

    return result;
  }, [searchQuery, sortBy, tipoFilter, areaFilter, showOnlyOficiais]);

  const clearFilters = () => {
    setTipoFilter(FILTER_TODOS);
    setAreaFilter(FILTER_TODOS);
    setShowOnlyOficiais(false);
    setSortBy("recentes");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-primary">Status do projeto</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="oficiais"
            checked={showOnlyOficiais}
            onCheckedChange={(checked) => setShowOnlyOficiais(checked as boolean)}
          />
          <label htmlFor="oficiais" className="text-sm text-muted-foreground">
            Projetos oficiais
          </label>
          <BadgeCheck className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-primary">Tipos de projetos</h3>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_TODOS}>Todos os tipos</SelectItem>
            {Object.entries(TIPO_PROJETO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-primary">Área de atuação</h3>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione as áreas de atuação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_TODOS}>Todas as áreas</SelectItem>
            {Object.entries(AREA_ATUACAO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Limpar todos os filtros
      </Button>
    </div>
  );

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
            <span className="font-medium text-foreground">Projetos</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <FolderKanban className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Projetos
              </h1>
            </div>

            {isAuthenticated && (
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar projeto
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Search and Sort */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as ListSortBy)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes primeiro</SelectItem>
                <SelectItem value="antigos">Mais antigos primeiro</SelectItem>
                <SelectItem value="nome">Nome A-Z</SelectItem>
                <SelectItem value="nome-desc">Nome Z-A</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredProjetos.length} Projetos encontrados
            </span>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="mb-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filtros de projeto</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Projetos List */}
          <div className="flex-1 space-y-4">
            {filteredProjetos.map((projeto) => (
              <Card key={projeto.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {projeto.imagem && (
                      <div className="relative h-48 w-full md:h-auto md:w-64 shrink-0">
                        <Image
                          src={projeto.imagem}
                          alt={projeto.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {!projeto.imagem && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                              <FolderKanban className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/projetos/${projeto.id}`}
                              className="text-lg font-semibold text-primary hover:underline"
                            >
                              {projeto.nome}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              TIPO:{" "}
                              <span className="text-primary">
                                {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          ID: {projeto.id}
                          {projeto.isOficial && (
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>

                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {projeto.descricao}
                      </p>

                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Responsável: {projeto.responsavel}</span>
                      </div>

                      {(projeto.dataInicio || projeto.dataFim) && (
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {projeto.dataInicio && formatDate(projeto.dataInicio)}
                            {projeto.dataFim && ` - ${formatDate(projeto.dataFim)}`}
                          </span>
                        </div>
                      )}

                      {projeto.parceiros && projeto.parceiros.length > 0 && (
                        <p className="mb-3 text-sm text-muted-foreground">
                          <span className="font-medium">Parceiros:</span>{" "}
                          {projeto.parceiros.join(", ")}
                        </p>
                      )}

                      <div className="mb-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          ÁREAS DE ATUAÇÃO: ({projeto.areasAtuacao.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {projeto.areasAtuacao.map((area, index) => (
                            <Link
                              key={area}
                              href={`/projetos?area=${area}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                              {index < projeto.areasAtuacao.length - 1 ? "," : ""}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link href={`/projetos/${projeto.id}`}>
                        <Button className="w-full md:w-auto">
                          Acessar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProjetos.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 font-semibold text-foreground">
                    Nenhum projeto encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros ou a busca
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-72 shrink-0 md:block">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="mb-6 text-lg font-semibold text-primary">
                  Filtros de projeto
                </h2>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
