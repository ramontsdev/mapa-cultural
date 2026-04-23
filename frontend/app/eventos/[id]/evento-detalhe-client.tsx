"use client";

import { MiniMapWrapper } from "@/app/lugares/[id]/mini-map-wrapper";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockLugares } from "@/lib/mock-data";
import { resolveAgenteById } from "@/lib/meus-agentes-storage";
import { resolveLugarById } from "@/lib/meus-espacos-storage";
import {
  isMeuEventoId,
  resolveEventoById,
  subscribeMeusEventosChanged,
} from "@/lib/meus-eventos-storage";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
  type Evento,
  type Lugar,
} from "@/lib/types";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Share2,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function enrichEvento(ev: Evento): Evento & { lugar?: Lugar } {
  const lugar =
    ev.lugarId != null && ev.lugarId !== ""
      ? mockLugares.find((l) => l.id === ev.lugarId) ??
        resolveLugarById(ev.lugarId) ??
        undefined
      : undefined;
  return { ...ev, lugar };
}

export function EventoDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeMeusEventosChanged(() => setTick((t) => t + 1)), []);

  const evento = useMemo(() => {
    void tick;
    const ev = resolveEventoById(id);
    if (!ev) return null;
    return enrichEvento(ev);
  }, [id, tick]);

  if (!evento) {
    notFound();
  }

  const organizador = resolveAgenteById(evento.createdById);
  const possoEditar = isAuthenticated && isMeuEventoId(id);

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
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{evento.nome}</span>
          </nav>
        </div>
      </div>

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
            {evento.imagem && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={evento.imagem}
                  alt={evento.nome}
                  fill
                  className="object-cover"
                />
                <div className="absolute left-4 top-4 rounded-lg bg-background px-4 py-2 shadow-lg">
                  <p className="text-3xl font-bold text-primary">
                    {new Date(evento.dataInicio).getDate()}
                  </p>
                  <p className="text-sm uppercase text-muted-foreground">
                    {new Date(evento.dataInicio).toLocaleDateString("pt-BR", {
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {evento.descricao}
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

            {organizador && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Organizador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/usuarios/${organizador.id}`}
                    className="group flex items-center gap-4"
                  >
                    {organizador.avatar && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image
                          src={organizador.avatar}
                          alt={organizador.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary">
                        {organizador.nome}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {organizador.tipoAtuacao === "coletivo"
                          ? "Coletivo"
                          : "Individual"}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(evento.dataInicio).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {evento.dataFim && evento.dataFim !== evento.dataInicio && (
                      <p className="text-sm text-muted-foreground">
                        até{" "}
                        {new Date(evento.dataFim).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">{evento.horario}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {evento.entrada === "gratuito"
                        ? "Entrada Gratuita"
                        : `R$ ${evento.preco?.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-background p-3">
                  <p className="text-sm text-muted-foreground">Classificação</p>
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

            {evento.lugar && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4 text-primary" />
                      Local
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/lugares/${evento.lugar.id}`}
                      className="group"
                    >
                      <h4 className="font-semibold text-primary group-hover:underline">
                        {evento.lugar.nome}
                      </h4>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {evento.lugar.endereco.logradouro},{" "}
                      {evento.lugar.endereco.numero}
                      <br />
                      {evento.lugar.endereco.bairro}
                      <br />
                      {evento.lugar.endereco.cidade} -{" "}
                      {evento.lugar.endereco.estado}
                    </p>
                  </CardContent>
                </Card>

                {evento.lugar.coordenadas && (
                  <Card>
                    <CardContent className="p-0">
                      <MiniMapWrapper
                        lat={evento.lugar.coordenadas.lat}
                        lng={evento.lugar.coordenadas.lng}
                        nome={evento.lugar.nome}
                        className="h-[250px]"
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!evento.lugar && evento.enderecoCustom && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    Local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {evento.enderecoCustom.logradouro},{" "}
                    {evento.enderecoCustom.numero}
                    <br />
                    {evento.enderecoCustom.bairro}
                    <br />
                    {evento.enderecoCustom.cidade} -{" "}
                    {evento.enderecoCustom.estado}
                  </p>
                  {evento.coordenadas && (
                    <div className="mt-4">
                      <MiniMapWrapper
                        lat={evento.coordenadas.lat}
                        lng={evento.coordenadas.lng}
                        nome={evento.nome}
                        className="h-[250px]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
