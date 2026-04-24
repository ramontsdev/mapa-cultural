"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PerfilPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/usuarios/meus");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Redirecionando…
    </div>
  );
}
