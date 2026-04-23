"use client";

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getStatusOportunidade } from "@/lib/mock-data";
import {
  isMeuOportunidadeId,
  resolveOportunidadeById,
  subscribeMeusOportunidadesChanged,
} from "@/lib/meus-oportunidades-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_OPORTUNIDADE_LABELS,
  type AreaAtuacao,
  type TipoOportunidade,
} from "@/lib/types";
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
  Pencil,
  Share2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function OportunidadeDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(
    () => subscribeMeusOportunidadesChanged(() => setTick((t) => t + 1)),
    []
  );

  const oportunidade = useMemo(() => {
    void tick;
    return resolveOportunidadeById(id);
  }, [id, tick]);

  if (!oportunidade) {
    notFound();
  }

  const status = getStatusOportunidade(oportunidade);
  const possoEditar = isAuthenticated && isMeuOportunidadeId(id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 font-medium text-foreground">
              {oportunidade.nome}
            </span>
          </nav>
        </div>
      </div>

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
                  {oportunidade.descricao}
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                {oportunidade.link && status === "aberta" && (
                  <a
                    href={oportunidade.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full" size="lg">
                      Inscrever-se
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
                )}

                <Separator />

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

                {oportunidade.link && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Link Oficial
                        </p>
                        <a
                          href={oportunidade.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-primary hover:underline"
                        >
                          {oportunidade.link}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
