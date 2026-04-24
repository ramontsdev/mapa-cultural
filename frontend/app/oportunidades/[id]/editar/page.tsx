"use client";

import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { QueryState } from "@/components/api/QueryState";
import { useAuth } from "@/components/auth-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyAgent } from "@/hooks/api/use-agents";
import {
  useDeleteOpportunity,
  useOpportunity,
} from "@/hooks/api/use-opportunities";
import { ApiError } from "@/lib/api/http";
import { mapOpportunityToOportunidade } from "@/lib/api/types";

export default function EditarMeuOportunidadePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const opportunityQuery = useOpportunity(id);
  const meQuery = useMyAgent({ enabled: isAuthenticated });
  const deleteMutation = useDeleteOpportunity();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/cadastro");
  }, [isAuthenticated, isAuthLoading, router]);

  const canEdit = useMemo(() => {
    if (!opportunityQuery.data || !meQuery.data) return false;
    return opportunityQuery.data.agentId === meQuery.data.id;
  }, [opportunityQuery.data, meQuery.data]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Oportunidade excluída.");
      router.push("/oportunidades/meus");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Não foi possível excluir.",
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecionando…
      </div>
    );
  }

  const oportunidade = opportunityQuery.data
    ? mapOpportunityToOportunidade(opportunityQuery.data)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/oportunidades/meus" className="hover:text-foreground">
              Minhas oportunidades
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Gerenciar</span>
          </nav>
        </div>
      </div>

      <QueryState
        isLoading={opportunityQuery.isLoading || meQuery.isLoading}
        error={opportunityQuery.error ?? meQuery.error}
        onRetry={() => opportunityQuery.refetch()}
        isEmpty={!opportunityQuery.data}
        emptyMessage="Oportunidade não encontrada"
      >
        {opportunityQuery.data && !canEdit && (
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Você não tem permissão para gerenciar esta oportunidade.
              </CardContent>
            </Card>
          </div>
        )}
        {opportunityQuery.data && oportunidade && canEdit && (
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar oportunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{oportunidade.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="whitespace-pre-wrap">
                    {oportunidade.descricao || "—"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  A edição detalhada de oportunidades ainda não está disponível.
                  Você pode excluir e recriar caso precise alterar dados.
                </p>
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/oportunidades/${id}`}>Voltar</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="ml-auto"
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryState>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir oportunidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
