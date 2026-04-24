"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  Lightbulb,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { CreateOportunidadeDialog } from "@/components/recursos/create-oportunidade-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useOpportunities } from "@/hooks/api/use-opportunities";
import { mapOpportunityToOportunidade } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  type AreaAtuacao,
  type Oportunidade,
  type TipoOportunidade,
} from "@/lib/types";

const FILTER_TODOS = "__todos__";

type SortOportunidades = "recentes" | "antigos" | "nome" | "nome-desc" | "encerramento";

function statusFrom(o: Oportunidade): "aberta" | "futura" | "encerrada" {
  const now = Date.now();
  const from = new Date(o.dataInscricaoInicio).getTime();
  const to = new Date(o.dataInscricaoFim).getTime();
  if (now < from) return "futura";
  if (now > to) return "encerrada";
  return "aberta";
}

export default function OportunidadesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOportunidades>("recentes");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tipoFilter, setTipoFilter] = useState<string>(FILTER_TODOS);
  const [areaFilter, setAreaFilter] = useState<string>(FILTER_TODOS);
  const [showOnlyOficiais, setShowOnlyOficiais] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("criar") === "1") {
      setCreateOpen(true);
      router.replace("/oportunidades", { scroll: false });
    }
  }, [isAuthenticated, router]);

  const oppsQuery = useOpportunities({
    q: searchQuery.trim() || undefined,
    pageSize: 50,
  });

  const oportunidades = useMemo(
    () => (oppsQuery.data?.items ?? []).map(mapOpportunityToOportunidade),
    [oppsQuery.data],
  );

  const filteredOportunidades = useMemo(() => {
    let result = [...oportunidades];

    if (statusFilter.length > 0) {
      result = result.filter((o) => statusFilter.includes(statusFrom(o)));
    }

    if (tipoFilter !== FILTER_TODOS) {
      result = result.filter((o) => o.tipo === tipoFilter);
    }

    if (areaFilter !== FILTER_TODOS) {
      result = result.filter((o) =>
        o.areasInteresse.includes(areaFilter as AreaAtuacao),
      );
    }

    if (showOnlyOficiais) {
      result = result.filter((o) => o.isOficial);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "encerramento":
          return (
            new Date(a.dataInscricaoFim).getTime() -
            new Date(b.dataInscricaoFim).getTime()
          );
        case "nome":
          return a.nome.localeCompare(b.nome, "pt-BR");
        case "nome-desc":
          return b.nome.localeCompare(a.nome, "pt-BR");
        case "antigos":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "recentes":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [oportunidades, sortBy, statusFilter, tipoFilter, areaFilter, showOnlyOficiais]);

  const clearFilters = () => {
    setStatusFilter([]);
    setTipoFilter(FILTER_TODOS);
    setAreaFilter(FILTER_TODOS);
    setShowOnlyOficiais(false);
    setSortBy("recentes");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aberta":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Inscrições Abertas
          </Badge>
        );
      case "futura":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Em Breve
          </Badge>
        );
      case "encerrada":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <XCircle className="mr-1 h-3 w-3" />
            Encerrada
          </Badge>
        );
    }
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
        <h3 className="mb-3 font-semibold text-primary">Status das oportunidades</h3>
        <div className="space-y-2">
          {[
            { value: "aberta", label: "Inscrições abertas" },
            { value: "encerrada", label: "Inscrições encerradas" },
            { value: "futura", label: "Inscrições futuras" },
          ].map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={statusFilter.includes(status.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setStatusFilter([...statusFilter, status.value]);
                  } else {
                    setStatusFilter(
                      statusFilter.filter((s) => s !== status.value),
                    );
                  }
                }}
              />
              <label
                htmlFor={`status-${status.value}`}
                className="text-sm text-muted-foreground"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="oficiais"
          checked={showOnlyOficiais}
          onCheckedChange={(checked) => setShowOnlyOficiais(checked as boolean)}
        />
        <label htmlFor="oficiais" className="text-sm text-muted-foreground">
          Editais oficiais
        </label>
        <BadgeCheck className="h-4 w-4 text-primary" />
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-primary">Tipo de oportunidade</h3>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_TODOS}>Todos os tipos</SelectItem>
            {Object.entries(TIPO_OPORTUNIDADE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-primary">Área de interesse</h3>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione as áreas de interesse" />
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
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Oportunidades</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Oportunidades
              </h1>
            </div>

            {isAuthenticated && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar oportunidade
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOportunidades)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes primeiro</SelectItem>
                <SelectItem value="antigos">Mais antigos primeiro</SelectItem>
                <SelectItem value="encerramento">
                  Encerramento próximo
                </SelectItem>
                <SelectItem value="nome">Nome A-Z</SelectItem>
                <SelectItem value="nome-desc">Nome Z-A</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredOportunidades.length} Oportunidades encontradas
            </span>
          </div>
        </div>

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
                <SheetTitle>Filtros de oportunidades</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <QueryState
              isLoading={oppsQuery.isLoading}
              error={oppsQuery.error}
              onRetry={() => oppsQuery.refetch()}
              isEmpty={filteredOportunidades.length === 0}
              emptyMessage="Nenhuma oportunidade encontrada"
            >
              <div className="space-y-4">
                {filteredOportunidades.map((oportunidade) => {
                  const status = statusFrom(oportunidade);
                  return (
                    <Card key={oportunidade.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                              <Lightbulb className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                              <Link
                                href={`/oportunidades/${oportunidade.id}`}
                                className="text-lg font-semibold text-primary hover:underline"
                              >
                                {oportunidade.nome}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                TIPO:{" "}
                                <span className="text-primary">
                                  {
                                    TIPO_OPORTUNIDADE_LABELS[
                                      oportunidade.tipo as TipoOportunidade
                                    ]
                                  }
                                </span>
                              </p>
                            </div>
                          </div>
                          {oportunidade.isOficial && (
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <div className="mb-3">{getStatusBadge(status)}</div>

                        {status === "encerrada" && (
                          <p className="mb-3 text-sm text-destructive">
                            As inscrições encerraram no dia{" "}
                            {formatDate(oportunidade.dataInscricaoFim)}
                          </p>
                        )}

                        {status === "aberta" && (
                          <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Inscrições até {formatDate(oportunidade.dataInscricaoFim)}
                          </p>
                        )}

                        {status === "futura" && (
                          <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Inscrições a partir de{" "}
                            {formatDate(oportunidade.dataInscricaoInicio)}
                          </p>
                        )}

                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                          {oportunidade.descricao}
                        </p>

                        {oportunidade.valorPremio && (
                          <p className="mb-3 flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-secondary" />
                            <span className="font-medium">
                              Prêmio: R${" "}
                              {oportunidade.valorPremio.toLocaleString("pt-BR")}
                            </span>
                          </p>
                        )}

                        {oportunidade.areasInteresse.length > 0 && (
                          <div className="mb-4">
                            <p className="mb-1 text-xs text-muted-foreground">
                              ÁREAS DE INTERESSE: ({oportunidade.areasInteresse.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {oportunidade.areasInteresse.map((area) => (
                                <span
                                  key={area}
                                  className="text-xs text-primary"
                                >
                                  {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link href={`/oportunidades/${oportunidade.id}`}>
                          <Button className="w-full">
                            Acessar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </QueryState>
          </div>

          <aside className="hidden w-72 shrink-0 md:block">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="mb-6 text-lg font-semibold text-primary">
                  Filtros de oportunidades
                </h2>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <CreateOportunidadeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCriado={(id) => router.push(`/oportunidades/${id}`)}
      />
    </div>
  );
}
