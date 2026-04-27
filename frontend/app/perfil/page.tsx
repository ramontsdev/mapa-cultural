"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { useMyAgent } from "@/hooks/api/use-agents";

export default function PerfilPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const myAgentQuery = useMyAgent({ enabled: isAuthenticated });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace("/cadastro");
      return;
    }
    if (myAgentQuery.isLoading) return;
    if (myAgentQuery.data?.id) {
      router.replace(`/usuarios/${myAgentQuery.data.id}`);
      return;
    }
    router.replace("/usuarios/meus");
  }, [
    isAuthLoading,
    isAuthenticated,
    myAgentQuery.data?.id,
    myAgentQuery.isLoading,
    router,
  ]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Redirecionando…
    </div>
  );
}
