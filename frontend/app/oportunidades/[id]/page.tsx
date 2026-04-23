import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Lightbulb,
  Calendar,
  Award,
  ExternalLink,
  BadgeCheck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockOportunidades, getStatusOportunidade } from "@/lib/mock-data";
import {
  TIPO_OPORTUNIDADE_LABELS,
  AREA_ATUACAO_LABELS,
  type TipoOportunidade,
  type AreaAtuacao,
} from "@/lib/types";

interface OportunidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function OportunidadePage({ params }: OportunidadePageProps) {
  const { id } = await params;
  const oportunidade = mockOportunidades.find((o) => o.id === id);

  if (!oportunidade) {
    notFound();
  }

  const status = getStatusOportunidade(oportunidade);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case "aberta":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Inscrições Abertas
          </Badge>
        );
      case "futura":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Em Breve
          </Badge>
        );
      case "encerrada":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <XCircle className="mr-1 h-3 w-3" />
            Inscrições Encerradas
          </Badge>
        );
    }
  };

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
            <Link href="/oportunidades" className="hover:text-foreground">
              Oportunidades
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground line-clamp-1">
              {oportunidade.nome}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary/20">
                  <Lightbulb className="h-8 w-8 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                      {oportunidade.nome}
                    </h1>
                    {oportunidade.isOficial && (
                      <BadgeCheck className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {TIPO_OPORTUNIDADE_LABELS[oportunidade.tipo as TipoOportunidade]}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge()}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Sobre a Oportunidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {oportunidade.descricao}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos */}
            {oportunidade.requisitos && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{oportunidade.requisitos}</p>
                </CardContent>
              </Card>
            )}

            {/* Áreas de Interesse */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Interesse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {oportunidade.areasInteresse.map((area) => (
                    <Badge key={area} variant="secondary">
                      {AREA_ATUACAO_LABELS[area as AreaAtuacao]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {oportunidade.link && status === "aberta" && (
                  <a
                    href={oportunidade.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full" size="lg">
                      Inscrever-se
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {oportunidade.valorPremio && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Prêmio</p>
                      <p className="text-lg font-bold text-secondary">
                        R$ {oportunidade.valorPremio.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Período de Inscrição
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(oportunidade.dataInscricaoInicio)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      até {formatDate(oportunidade.dataInscricaoFim)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tipo</p>
                    <p className="text-sm text-muted-foreground">
                      {TIPO_OPORTUNIDADE_LABELS[oportunidade.tipo as TipoOportunidade]}
                    </p>
                  </div>
                </div>

                {oportunidade.link && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Link Oficial
                        </p>
                        <a
                          href={oportunidade.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {oportunidade.link}
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
