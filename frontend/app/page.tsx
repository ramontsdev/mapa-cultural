import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Building2,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers, mockLugares, getEventosComLugares } from "@/lib/mock-data";
import { AREA_ATUACAO_LABELS, type AreaAtuacao } from "@/lib/types";

export default function HomePage() {
  const eventos = getEventosComLugares();
  const proximosEventos = eventos.slice(0, 3);
  const lugaresDestaque = mockLugares.slice(0, 3);
  const agentesDestaque = mockUsers.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&h=1080&fit=crop"
            alt="Festival cultural"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-20 md:px-6 md:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Plataforma Colaborativa
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-background md:text-5xl lg:text-6xl">
              Boas vindas ao{" "}
              <span className="text-primary">Mapa Cultural</span>
            </h1>

            <p className="text-pretty text-lg leading-relaxed text-background/90 md:text-xl">
              Uma ferramenta de gestão cultural que conecta artistas, espaços e
              eventos da cidade. Cadastre seus projetos, descubra oportunidades
              e participe do movimento cultural!
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Cadastre-se Gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/eventos">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-background/30 bg-background/10 text-background hover:bg-background/20 sm:w-auto"
                >
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">
                {mockUsers.length * 180}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agentes Culturais
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary md:text-4xl">
                {mockLugares.length * 15}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Espaços Cadastrados
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent md:text-4xl">
                {eventos.length * 50}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Eventos Realizados
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary md:text-4xl">
                15+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cidades Participantes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fique por Dentro Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Fique por dentro!
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cadastre seus projetos, espaços e eventos. Faça parte você também!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card Eventos */}
            <Card className="group overflow-hidden border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop"
                  alt="Eventos culturais"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="rounded-full bg-primary p-2">
                    <CalendarDays className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-background">Eventos</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Descubra e divulgue eventos culturais da sua cidade. Shows,
                  exposições, festivais e muito mais.
                </p>
                <Link
                  href="/eventos"
                  className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Ver eventos
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Card Lugares */}
            <Card className="group overflow-hidden border-2 border-transparent transition-all hover:border-secondary/20 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
                  alt="Espaços culturais"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="rounded-full bg-secondary p-2">
                    <Building2 className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-background">Lugares</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Mapeie e conheça os espaços culturais. Teatros, museus, praças
                  e centros culturais da região.
                </p>
                <Link
                  href="/lugares"
                  className="mt-4 inline-flex items-center text-sm font-medium text-secondary hover:underline"
                >
                  Ver lugares
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Card Agentes */}
            <Card className="group overflow-hidden border-2 border-transparent transition-all hover:border-accent/20 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop"
                  alt="Agentes culturais"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="rounded-full bg-accent p-2">
                    <Users className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-background">Agentes</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Conecte-se com artistas, produtores e agentes culturais.
                  Amplie sua rede de contatos.
                </p>
                <Link
                  href="/usuarios"
                  className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:underline"
                >
                  Ver agentes
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Próximos Eventos
              </h2>
              <p className="mt-2 text-muted-foreground">
                Confira o que está acontecendo na cidade
              </p>
            </div>
            <Link href="/eventos">
              <Button variant="outline" className="hidden sm:inline-flex">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proximosEventos.map((evento) => (
              <Link key={evento.id} href={`/eventos/${evento.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative h-48">
                    <Image
                      src={evento.imagem || "/placeholder.svg"}
                      alt={evento.nome}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4">
                      <div className="rounded-lg bg-background px-3 py-2 text-center shadow-lg">
                        <p className="text-2xl font-bold text-primary">
                          {new Date(evento.dataInicio).getDate()}
                        </p>
                        <p className="text-xs uppercase text-muted-foreground">
                          {new Date(evento.dataInicio).toLocaleDateString(
                            "pt-BR",
                            { month: "short" }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">
                      {evento.nome}
                    </h3>
                    {evento.lugar && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {evento.lugar.nome}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evento.areasAtuacao.slice(0, 2).map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                        >
                          {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/eventos">
              <Button variant="outline">
                Ver todos os eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Lugares em Destaque */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Espaços Culturais
              </h2>
              <p className="mt-2 text-muted-foreground">
                Conheça os principais espaços da cidade
              </p>
            </div>
            <Link href="/lugares">
              <Button variant="outline" className="hidden sm:inline-flex">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lugaresDestaque.map((lugar) => (
              <Link key={lugar.id} href={`/lugares/${lugar.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative h-48">
                    <Image
                      src={lugar.imagem || "/placeholder.svg"}
                      alt={lugar.nome}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {lugar.isOficial && (
                      <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Oficial
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                      {lugar.nome}
                    </h3>
                    <p className="mt-1 text-sm text-secondary">
                      {lugar.tipo
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {lugar.endereco.cidade}, {lugar.endereco.estado}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-secondary py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <Music className="mx-auto h-12 w-12 text-primary-foreground/80" />
          <h2 className="mt-6 text-3xl font-bold text-primary-foreground md:text-4xl">
            Faça parte do Mapa Cultural!
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Cadastre-se gratuitamente e comece a divulgar seu trabalho, seus
            eventos e os espaços culturais da sua cidade.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="w-full bg-background text-foreground hover:bg-background/90 sm:w-auto"
              >
                Criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sobre">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              >
                Saiba mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Agentes em Destaque */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Agentes Culturais
              </h2>
              <p className="mt-2 text-muted-foreground">
                Conheça quem faz a cultura acontecer
              </p>
            </div>
            <Link href="/usuarios">
              <Button variant="outline" className="hidden sm:inline-flex">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agentesDestaque.map((usuario) => (
              <Link key={usuario.id} href={`/usuarios/${usuario.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                      <Image
                        src={usuario.avatar || "/placeholder.svg"}
                        alt={usuario.nome}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                      {usuario.nome}
                    </h3>
                    <p className="text-sm text-secondary">
                      {usuario.tipoAtuacao === "coletivo"
                        ? "Coletivo"
                        : "Individual"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {usuario.cidade}, {usuario.estado}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {usuario.areasAtuacao.slice(0, 2).map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
