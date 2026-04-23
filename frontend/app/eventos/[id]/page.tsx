import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Ticket,
  Users,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventosComLugares, mockUsers } from "@/lib/mock-data";
import {
  AREA_ATUACAO_LABELS,
  CLASSIFICACAO_LABELS,
  type AreaAtuacao,
  type ClassificacaoEtaria,
} from "@/lib/types";
import { MiniMapWrapper } from "./mini-map-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const eventos = getEventosComLugares();
  const evento = eventos.find((e) => e.id === id);

  if (!evento) {
    notFound();
  }

  const organizador = mockUsers.find((u) => u.id === evento.createdById);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
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

      {/* Header */}
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
                  <div className="flex items-center gap-2">
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
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Image */}
            {evento.imagem && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={evento.imagem}
                  alt={evento.nome}
                  fill
                  className="object-cover"
                />
                {/* Date Badge */}
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

            {/* Description */}
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

            {/* Tags */}
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

            {/* Linguagens / Áreas */}
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

            {/* Organizador */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-4 p-6">
                {/* Date and Time */}
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

                {/* Entry */}
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

                {/* Classification */}
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

            {/* Location */}
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

                {/* Map */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
