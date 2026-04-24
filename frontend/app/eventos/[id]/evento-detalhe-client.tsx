"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Pencil,
  Share2,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyAgent } from "@/hooks/api/use-agents";
import { useEvent } from "@/hooks/api/use-events";
import { mapEventToEvento } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
} from "@/lib/types";

export function EventoDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();

  const eventQuery = useEvent(id);
  const meQuery = useMyAgent({ enabled: isAuthenticated });

  const evento = eventQuery.data ? mapEventToEvento(eventQuery.data) : null;
  const possoEditar =
    isAuthenticated &&
    eventQuery.data &&
    meQuery.data &&
    eventQuery.data.agentId === meQuery.data.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/eventos" className="hover:text-foreground">
              Eventos
            </Link>
            {evento && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {evento.nome}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <QueryState
        isLoading={eventQuery.isLoading}
        error={eventQuery.error}
        onRetry={() => eventQuery.refetch()}
        isEmpty={!evento}
        emptyMessage="Evento não encontrado"
      >
        {evento && (
          <>
            <div className="border-b border-border bg-card">
              <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Link href="/eventos">
                      <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary p-2">
                        <CalendarDays className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            {evento.nome}
                          </h1>
                          {evento.isOficial && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              <CheckCircle2 className="h-3 w-3" />
                              Oficial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {possoEditar && (
                      <Button variant="secondary" className="gap-2" asChild>
                        <Link href={`/eventos/${id}/editar`}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Evento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-muted-foreground">
                        {evento.descricao || "Sem descrição."}
                      </p>
                    </CardContent>
                  </Card>

                  {evento.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-primary" />
                          Tags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {evento.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {evento.areasAtuacao.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Linguagens</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {evento.areasAtuacao.map((area) => (
                            <span
                              key={area}
                              className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary"
                            >
                              {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="space-y-4 p-6">
                      {evento.dataInicio && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <CalendarDays className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(evento.dataInicio).toLocaleDateString(
                                "pt-BR",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            {evento.dataFim &&
                              evento.dataFim !== evento.dataInicio && (
                                <p className="text-sm text-muted-foreground">
                                  até{" "}
                                  {new Date(evento.dataFim).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "numeric",
                                      month: "long",
                                    },
                                  )}
                                </p>
                              )}
                          </div>
                        </div>
                      )}

                      {evento.horario && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <p className="font-medium text-foreground">
                            {evento.horario}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Ticket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {evento.entrada === "gratuito"
                              ? "Entrada Gratuita"
                              : evento.preco
                              ? `R$ ${evento.preco.toFixed(2)}`
                              : "Pago"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-background p-3">
                        <p className="text-sm text-muted-foreground">
                          Classificação
                        </p>
                        <p className="font-medium text-foreground">
                          {
                            CLASSIFICACAO_LABELS[
                              evento.classificacao as ClassificacaoEtaria
                            ]
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
