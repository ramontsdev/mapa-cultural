"use client";

import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  FileText,
  FolderKanban,
  Pencil,
  Share2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMyAgent } from "@/hooks/api/use-agents";
import { useProject } from "@/hooks/api/use-projects";
import { mapProjectToProjeto } from "@/lib/api/types";
import {
  AREA_ATUACAO_LABELS,
  TIPO_PROJETO_LABELS,
  type AreaAtuacao,
  type TipoProjeto,
} from "@/lib/types";

export function ProjetoDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();

  const projectQuery = useProject(id);
  const meQuery = useMyAgent({ enabled: isAuthenticated });

  const projeto = useMemo(
    () => (projectQuery.data ? mapProjectToProjeto(projectQuery.data) : null),
    [projectQuery.data],
  );

  const possoEditar = useMemo(() => {
    if (!projectQuery.data || !meQuery.data) return false;
    return projectQuery.data.agentId === meQuery.data.id;
  }, [projectQuery.data, meQuery.data]);

  if (projectQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState isLoading={true}>{null}</QueryState>
      </div>
    );
  }

  if (projectQuery.error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState
          isLoading={false}
          error={projectQuery.error}
          onRetry={() => projectQuery.refetch()}
        >
          {null}
        </QueryState>
      </div>
    );
  }

  if (!projeto) {
    notFound();
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/projetos" className="hover:text-foreground">
              Projetos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 font-medium text-foreground">
              {projeto.nome}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        {possoEditar && (
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" className="gap-2" asChild>
              <Link href={`/projetos/${id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  {projeto.nome}
                </h1>
                {projeto.isOficial && (
                  <BadgeCheck className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-muted-foreground">
                {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Sobre o Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {projeto.descricao || "Sem descrição."}
                </p>
              </CardContent>
            </Card>

            {projeto.parceiros && projeto.parceiros.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Parceiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {projeto.parceiros.map((parceiro) => (
                      <Badge
                        key={parceiro}
                        variant="outline"
                        className="text-sm"
                      >
                        {parceiro}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Áreas de Atuação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {projeto.areasAtuacao.length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      Nenhuma área informada.
                    </span>
                  ) : (
                    projeto.areasAtuacao.map((area) => (
                      <Badge key={area} variant="secondary">
                        {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
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
                {projeto.responsavel && (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Responsável
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {projeto.responsavel}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex items-start gap-3">
                  <FolderKanban className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tipo</p>
                    <p className="text-sm text-muted-foreground">
                      {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
                    </p>
                  </div>
                </div>

                {(projeto.dataInicio || projeto.dataFim) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Período
                        </p>
                        {projeto.dataInicio && (
                          <p className="text-sm text-muted-foreground">
                            Início: {formatDate(projeto.dataInicio)}
                          </p>
                        )}
                        {projeto.dataFim && (
                          <p className="text-sm text-muted-foreground">
                            Término: {formatDate(projeto.dataFim)}
                          </p>
                        )}
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
