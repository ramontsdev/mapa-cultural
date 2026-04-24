"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type QueryStateProps = {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
  children: ReactNode;
};

function extractErrorMessage(error: unknown): string {
  if (!error) return "Erro inesperado.";
  if (error instanceof Error) return error.message;
  return "Erro inesperado.";
}

export function QueryState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyMessage = "Nada por aqui ainda.",
  loadingMessage = "Carregando...",
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm">{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 py-10 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Não foi possível carregar os dados.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {extractErrorMessage(error)}
          </p>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
