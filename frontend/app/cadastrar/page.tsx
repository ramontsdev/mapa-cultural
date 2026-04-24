"use client";

import {
  CalendarDays,
  ChevronRight,
  FolderKanban,
  Lightbulb,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    href: "/lugares?criar=1",
    icon: MapPin,
    title: "Espaço",
    description: "Cadastre um espaço cultural (teatro, museu, praça, etc).",
  },
  {
    href: "/eventos?criar=1",
    icon: CalendarDays,
    title: "Evento",
    description: "Cadastre shows, exposições, festivais e demais eventos.",
  },
  {
    href: "/oportunidades?criar=1",
    icon: Lightbulb,
    title: "Oportunidade",
    description: "Cadastre editais, concursos, prêmios e inscrições abertas.",
  },
  {
    href: "/projetos?criar=1",
    icon: FolderKanban,
    title: "Projeto",
    description: "Cadastre projetos culturais, pesquisas e iniciativas.",
  },
];

export default function CadastrarPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Cadastrar</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            O que você quer cadastrar?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha o tipo de conteúdo que deseja adicionar ao Mapa Cultural.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.href} className="h-full">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <Button asChild className="mt-auto">
                  <Link href={item.href}>Começar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
