"use client";

import {
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Lightbulb,
  Loader2,
  Pencil,
  Share2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMyAgent } from "@/hooks/api/use-agents";
import { useOpportunity } from "@/hooks/api/use-opportunities";
import {
  useCreateRegistration,
  useMyRegistrations,
} from "@/hooks/api/use-registrations";
import { ApiError } from "@/lib/api/http";
import { mapOpportunityToOportunidade } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  type AreaAtuacao,
  type Oportunidade,
  type TipoOportunidade,
} from "@/lib/types";

function statusFrom(o: Oportunidade): "aberta" | "futura" | "encerrada" {
  const now = Date.now();
  const from = new Date(o.dataInscricaoInicio).getTime();
  const to = new Date(o.dataInscricaoFim).getTime();
  if (now < from) return "futura";
  if (now > to) return "encerrada";
  return "aberta";
}

export function OportunidadeDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();

  const opportunityQuery = useOpportunity(id);
  const meQuery = useMyAgent({ enabled: isAuthenticated });
  const myRegistrationsQuery = useMyRegistrations({
    pageSize: 100,
    enabled: isAuthenticated,
  });
  const createRegistration = useCreateRegistration(id);

  const oportunidade = opportunityQuery.data
    ? mapOpportunityToOportunidade(opportunityQuery.data)
    : null;

  const possoEditar =
    isAuthenticated &&
    opportunityQuery.data &&
    meQuery.data &&
    opportunityQuery.data.agentId === meQuery.data.id;

  const jaInscrito =
    (myRegistrationsQuery.data?.items ?? []).some(
      (r) => r.opportunityId === id,
    );

  const status = oportunidade ? statusFrom(oportunidade) : null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const getStatusBadge = () => {
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
            Inscrições Encerradas
          </Badge>
        );
      default:
        return null;
    }
  };

  const onInscrever = async () => {
    if (!isAuthenticated) {
      toast.info("Faça login para se inscrever.");
      return;
    }
    try {
      await createRegistration.mutateAsync({
        proponentType: "individual",
        range: "default",
      });
      toast.success("Inscrição realizada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível realizar a inscrição.",
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
            <Link href="/oportunidades" className="hover:text-foreground">
              Oportunidades
            </Link>
            {oportunidade && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="line-clamp-1 font-medium text-foreground">
                  {oportunidade.nome}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <QueryState
        isLoading={opportunityQuery.isLoading}
        error={opportunityQuery.error}
        onRetry={() => opportunityQuery.refetch()}
        isEmpty={!oportunidade}
        emptyMessage="Oportunidade não encontrada"
      >
        {oportunidade && (
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
              {possoEditar && (
                <Button variant="secondary" className="gap-2" asChild>
                  <Link href={`/oportunidades/${id}/editar`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary/20">
                      <Lightbulb className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                          {oportunidade.nome}
                        </h1>
                        {oportunidade.isOficial && (
                          <BadgeCheck className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {
                          TIPO_OPORTUNIDADE_LABELS[
                            oportunidade.tipo as TipoOportunidade
                          ]
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">{getStatusBadge()}</div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Sobre a Oportunidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {oportunidade.descricao || "Sem descrição."}
                    </p>
                  </CardContent>
                </Card>

                {oportunidade.requisitos && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Requisitos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {oportunidade.requisitos}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {oportunidade.areasInteresse.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Áreas de Interesse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {oportunidade.areasInteresse.map((area) => (
                          <Badge key={area} variant="secondary">
                            {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="space-y-4 p-6">
                    {status === "aberta" && !possoEditar && (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={onInscrever}
                        disabled={
                          createRegistration.isPending || jaInscrito
                        }
                      >
                        {createRegistration.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inscrevendo…
                          </>
                        ) : jaInscrito ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Inscrito
                          </>
                        ) : (
                          "Inscrever-se"
                        )}
                      </Button>
                    )}
                    {oportunidade.link && (
                      <a
                        href={oportunidade.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="w-full">
                          Ver link oficial
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {oportunidade.valorPremio != null && (
                      <>
                        <div className="flex items-start gap-3">
                          <Award className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Prêmio
                            </p>
                            <p className="text-lg font-bold text-secondary">
                              R${" "}
                              {oportunidade.valorPremio.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Período de Inscrição
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(oportunidade.dataInscricaoInicio)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          até {formatDate(oportunidade.dataInscricaoFim)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Tipo</p>
                        <p className="text-sm text-muted-foreground">
                          {
                            TIPO_OPORTUNIDADE_LABELS[
                              oportunidade.tipo as TipoOportunidade
                            ]
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
