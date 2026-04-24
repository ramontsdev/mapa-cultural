"use client";

import { ChevronRight, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { QueryState } from "@/components/api/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyAgent } from "@/hooks/api/use-agents";
import { mapAgentToUser } from "@/lib/api/types";

export default function MeusAgentesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const agentQuery = useMyAgent({ enabled: isAuthenticated });
  const agent = agentQuery.data ? mapAgentToUser(agentQuery.data) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/usuarios" className="hover:text-foreground">
              Agentes
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Meu perfil</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Meu perfil
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie seu agente público no Mapa Cultural.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState
          isLoading={agentQuery.isLoading || isAuthLoading}
          error={agentQuery.error}
          onRetry={() => agentQuery.refetch()}
          isEmpty={!agent}
          emptyMessage="Nenhum perfil encontrado para este usuário."
        >
          {agent ? (
            <Card>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Users className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {agent.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {agent.tipoAtuacao === "coletivo"
                        ? "Coletivo"
                        : "Individual"}
                    </p>
                    {agent.biografia ? (
                      <p className="mt-2 max-w-prose text-sm text-muted-foreground line-clamp-3">
                        {agent.biografia}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/usuarios/${agent.id}`}>
                      Ver página pública
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/usuarios/${agent.id}/editar`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar perfil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </QueryState>
      </div>
    </div>
  );
}
