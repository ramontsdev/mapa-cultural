import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  FolderKanban,
  Calendar,
  User,
  Users,
  BadgeCheck,
  FileText,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockProjetos } from "@/lib/mock-data";
import {
  TIPO_PROJETO_LABELS,
  AREA_ATUACAO_LABELS,
  type TipoProjeto,
  type AreaAtuacao,
} from "@/lib/types";

interface ProjetoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjetoPage({ params }: ProjetoPageProps) {
  const { id } = await params;
  const projeto = mockProjetos.find((p) => p.id === id);

  if (!projeto) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
            <Link href="/projetos" className="hover:text-foreground">
              Projetos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground line-clamp-1">
              {projeto.nome}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Image */}
      {projeto.imagem && (
        <div className="relative h-64 w-full md:h-96">
          <Image
            src={projeto.imagem}
            alt={projeto.nome}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white md:text-4xl">
                  {projeto.nome}
                </h1>
                {projeto.isOficial && (
                  <BadgeCheck className="h-6 w-6 text-white" />
                )}
              </div>
              <p className="mt-2 text-white/80">
                {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header sem imagem */}
        {!projeto.imagem && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20">
                <FolderKanban className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                    {projeto.nome}
                  </h1>
                  {projeto.isOficial && (
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground">
                  {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Sobre o Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {projeto.descricao}
                </p>
              </CardContent>
            </Card>

            {/* Parceiros */}
            {projeto.parceiros && projeto.parceiros.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Parceiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {projeto.parceiros.map((parceiro) => (
                      <Badge key={parceiro} variant="outline" className="text-sm">
                        {parceiro}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Áreas de Atuação */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Atuação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {projeto.areasAtuacao.map((area) => (
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
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Responsável</p>
                    <p className="text-sm text-muted-foreground">
                      {projeto.responsavel}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <FolderKanban className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tipo</p>
                    <p className="text-sm text-muted-foreground">
                      {TIPO_PROJETO_LABELS[projeto.tipo as TipoProjeto]}
                    </p>
                  </div>
                </div>

                {(projeto.dataInicio || projeto.dataFim) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Período</p>
                        {projeto.dataInicio && (
                          <p className="text-sm text-muted-foreground">
                            Início: {formatDate(projeto.dataInicio)}
                          </p>
                        )}
                        {projeto.dataFim && (
                          <p className="text-sm text-muted-foreground">
                            Término: {formatDate(projeto.dataFim)}
                          </p>
                        )}
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
