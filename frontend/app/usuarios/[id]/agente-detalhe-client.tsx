"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isMeuAgenteId,
  resolveAgenteById,
  subscribeMeusAgentesChanged,
} from "@/lib/meus-agentes-storage";
import {
  AREA_ATUACAO_LABELS,
  USER_ROLE_LABELS,
  type AreaAtuacao,
  type UserRole,
} from "@/lib/types";
import { ChevronRight, Globe, Mail, MapPin, Pencil, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function AgenteDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(
    () => subscribeMeusAgentesChanged(() => setTick((t) => t + 1)),
    []
  );

  const usuario = useMemo(() => {
    void tick;
    return resolveAgenteById(id);
  }, [id, tick]);

  if (!usuario) {
    notFound();
  }

  const possoEditar = isAuthenticated && isMeuAgenteId(id);

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
            <span className="line-clamp-1 font-medium text-foreground">
              {usuario.nome}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-muted">
              <Image
                src={usuario.avatar || "/placeholder.svg"}
                alt={usuario.nome}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {usuario.nome}
              </h1>
              <p className="text-muted-foreground">
                Atuação{" "}
                {usuario.tipoAtuacao === "coletivo" ? "coletiva" : "individual"}
              </p>
              {(usuario.cidade || usuario.estado) && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {[usuario.cidade, usuario.estado].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
          </div>
          {possoEditar && (
            <Button variant="secondary" className="gap-2" asChild>
              <Link href={`/usuarios/${id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar perfil
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {usuario.biografia && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {usuario.biografia}
                  </p>
                </CardContent>
              </Card>
            )}

            {usuario.oQueFaz && (
              <Card>
                <CardHeader>
                  <CardTitle>O que faz</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{usuario.oQueFaz}</p>
                </CardContent>
              </Card>
            )}

            {usuario.areasAtuacao.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Áreas de atuação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {usuario.areasAtuacao.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
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
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a
                    href={`mailto:${usuario.email}`}
                    className="text-primary hover:underline"
                  >
                    {usuario.email}
                  </a>
                </p>
                {usuario.telefone && (
                  <p className="text-muted-foreground">{usuario.telefone}</p>
                )}
                {usuario.website && (
                  <p className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={usuario.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Site
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>

            {usuario.roles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Atribuições</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {usuario.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {USER_ROLE_LABELS[role as UserRole]}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
