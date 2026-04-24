"use client";

import { ChevronRight, FileText, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyRegistrations } from "@/hooks/api/use-registrations";

const STATUS_LABELS: Record<number, string> = {
  0: "Rascunho",
  1: "Enviada",
  2: "Aprovada",
  3: "Recusada",
  10: "Pendente",
};

export default function MinhasInscricoesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const registrationsQuery = useMyRegistrations({
    pageSize: 100,
    enabled: isAuthenticated,
  });
  const items = registrationsQuery.data?.items ?? [];

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

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
            <span className="font-medium text-foreground">
              Minhas inscrições
            </span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <FileText className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Minhas inscrições
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe as oportunidades em que você se inscreveu.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <QueryState
          isLoading={registrationsQuery.isLoading}
          error={registrationsQuery.error}
          onRetry={() => registrationsQuery.refetch()}
          isEmpty={items.length === 0}
          emptyMessage="Você ainda não se inscreveu em nenhuma oportunidade."
        >
          <div className="space-y-3">
            {items.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Lightbulb className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Inscrição {r.number ?? r.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {STATUS_LABELS[r.status] ?? r.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enviada em{" "}
                        {new Date(r.createTimestamp).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/oportunidades/${r.opportunityId}`}>
                      Ver oportunidade
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </QueryState>
      </div>
    </div>
  );
}
