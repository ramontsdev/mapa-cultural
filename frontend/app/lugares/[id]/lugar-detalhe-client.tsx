"use client";

import { MiniMapWrapper } from "@/app/lugares/[id]/mini-map-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventosComLugares } from "@/lib/mock-data";
import {
  isMeuEspacoId,
  resolveLugarById,
  subscribeMeusEspacosChanged,
} from "@/lib/meus-espacos-storage";
import {
  AREA_ATUACAO_LABELS,
  TIPO_LUGAR_LABELS,
  type AreaAtuacao,
  type TipoLugar,
} from "@/lib/types";
import {
  Accessibility,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function LugarDetalhePageClient() {
  const params = useParams();
  const id = params.id as string;
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeMeusEspacosChanged(() => setTick((t) => t + 1)), []);

  const lugar = useMemo(() => {
    void tick;
    return resolveLugarById(id);
  }, [id, tick]);

  if (!lugar) {
    notFound();
  }

  const eventos = getEventosComLugares().filter(
    (evento) => evento.lugarId === lugar.id
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/lugares" className="hover:text-foreground">
              Espaços
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{lugar.nome}</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/lugares">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Building2 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                      {lugar.nome}
                    </h1>
                    {lugar.isOficial && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Oficial
                      </span>
                    )}
                  </div>
                  <p className="text-secondary">
                    {TIPO_LUGAR_LABELS[lugar.tipo as TipoLugar]}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isMeuEspacoId(lugar.id) && (
                <Button variant="outline" className="gap-2" asChild>
                  <Link href={`/lugares/${lugar.id}/editar`}>
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
            {lugar.imagem && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={lugar.imagem}
                  alt={lugar.nome}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Sobre o Espaço</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {lugar.descricao || "Sem descrição."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Áreas de Atuação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lugar.areasAtuacao.length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      Nenhuma área informada.
                    </span>
                  ) : (
                    lugar.areasAtuacao.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary"
                      >
                        {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                      </span>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {eventos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Eventos neste local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventos.map((evento) => (
                      <Link
                        key={evento.id}
                        href={`/eventos/${evento.id}`}
                        className="group flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      >
                        {evento.imagem && (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={evento.imagem}
                              alt={evento.nome}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary">
                            {evento.nome}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(evento.dataInicio).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}{" "}
                            às {evento.horario}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {lugar.coordenadas && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <MiniMapWrapper
                    lat={lugar.coordenadas.lat}
                    lng={lugar.coordenadas.lng}
                    nome={lugar.nome}
                    className="h-[250px]"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {lugar.endereco.logradouro || "—"},{" "}
                  {lugar.endereco.numero || "S/N"}
                  <br />
                  {lugar.endereco.bairro || "—"}
                  <br />
                  {lugar.endereco.cidade || "—"} -{" "}
                  {lugar.endereco.estado || "—"}
                  <br />
                  CEP: {lugar.endereco.cep || "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lugar.telefone && (
                  <a
                    href={`tel:${lugar.telefone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {lugar.telefone}
                  </a>
                )}
                {lugar.email && (
                  <a
                    href={`mailto:${lugar.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {lugar.email}
                  </a>
                )}
                {lugar.website && (
                  <a
                    href={lugar.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {lugar.redesSociais?.instagram && (
                  <p className="text-sm text-muted-foreground">
                    Instagram: {lugar.redesSociais.instagram}
                  </p>
                )}
                {lugar.horarioFuncionamento && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {lugar.horarioFuncionamento}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Accessibility className="h-4 w-4" />
                  <span>
                    Acessibilidade:{" "}
                    {lugar.acessibilidade ? (
                      <span className="font-medium text-primary">Sim</span>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
