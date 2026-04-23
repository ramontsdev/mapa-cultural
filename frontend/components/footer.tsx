import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mapa Cultural</h3>
                <p className="text-xs text-background/70">da Cidade</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-background/80">
              Plataforma colaborativa para mapeamento de agentes culturais,
              espaços e eventos da cidade.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="mb-4 font-semibold">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Home
              </Link>
              <Link
                href="/eventos"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Eventos
              </Link>
              <Link
                href="/lugares"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Lugares
              </Link>
              <Link
                href="/usuarios"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Agentes
              </Link>
            </nav>
          </div>

          {/* Cadastre-se */}
          <div>
            <h4 className="mb-4 font-semibold">Participe</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/cadastro"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Criar conta
              </Link>
              <Link
                href="/cadastro"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Cadastrar lugar
              </Link>
              <Link
                href="/cadastro"
                className="text-sm text-background/80 transition-colors hover:text-background"
              >
                Cadastrar evento
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div>
            <h4 className="mb-4 font-semibold">Contato</h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contato@mapacultural.com"
                className="flex items-center gap-2 text-sm text-background/80 transition-colors hover:text-background"
              >
                <Mail className="h-4 w-4" />
                contato@mapacultural.com
              </a>
              <a
                href="tel:+5586999999999"
                className="flex items-center gap-2 text-sm text-background/80 transition-colors hover:text-background"
              >
                <Phone className="h-4 w-4" />
                (86) 99999-9999
              </a>
              <div className="mt-2 flex gap-3">
                <a
                  href="#"
                  className="rounded-full bg-background/10 p-2 transition-colors hover:bg-background/20"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-background/10 p-2 transition-colors hover:bg-background/20"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-background/20 pt-6 text-center text-sm text-background/60">
          <p>2026 Mapa Cultural. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
