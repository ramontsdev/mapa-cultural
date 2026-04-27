"use client";

import { useAuth } from "@/components/auth-provider";
import { useMyAgent } from "@/hooks/api/use-agents";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FolderKanban,
  Home,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MapPin,
  Menu,
  Puzzle,
  Settings,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/oportunidades", label: "Oportunidades", icon: Lightbulb },
  { href: "/usuarios", label: "Agentes", icon: Users },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/lugares", label: "Espaços", icon: MapPin },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
];

function AccountMenuSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function AccountDropdownBody({
  logout,
  meuPerfilHref,
}: {
  logout: () => void;
  meuPerfilHref: string;
}) {
  return (
    <div className="flex max-h-[min(85vh,520px)] flex-col sm:max-h-[85vh] sm:flex-row">
      <div className="max-h-[55vh] flex-1 overflow-y-auto border-b border-border p-4 sm:max-h-none sm:border-r sm:border-b-0">
        <div className="flex flex-col gap-5">
          <AccountMenuSection title="Menu do painel de controle">
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link href="/perfil" className="flex w-full items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                Painel de Controle
              </Link>
            </DropdownMenuItem>
          </AccountMenuSection>
          <AccountMenuSection title="Editais e oportunidades">
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/oportunidades/meus"
                className="flex w-full items-center gap-3"
              >
                <Lightbulb className="h-4 w-4" />
                Minhas oportunidades
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/oportunidades"
                className="flex w-full items-center gap-3"
              >
                <ClipboardList className="h-4 w-4" />
                Minhas inscrições
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/oportunidades"
                className="flex w-full items-center gap-3"
              >
                <Star className="h-4 w-4" />
                Minhas avaliações
              </Link>
            </DropdownMenuItem>
          </AccountMenuSection>
          <AccountMenuSection title="Gerenciamento de entidades">
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/usuarios/meus"
                className="flex w-full items-center gap-3"
              >
                <Users className="h-4 w-4" />
                Meus Agentes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/lugares/meus"
                className="flex w-full items-center gap-3"
              >
                <Building2 className="h-4 w-4" />
                Meus Espaços
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/eventos/meus"
                className="flex w-full items-center gap-3"
              >
                <CalendarDays className="h-4 w-4" />
                Meus Eventos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
              <Link
                href="/projetos/meus"
                className="flex w-full items-center gap-3"
              >
                <FolderKanban className="h-4 w-4" />
                Meus Projetos
              </Link>
            </DropdownMenuItem>
          </AccountMenuSection>
        </div>
      </div>
      <div className="w-full shrink-0 overflow-y-auto p-4 sm:w-54">
        <AccountMenuSection title="Outras opções">
          <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
            <Link href="/perfil" className="flex w-full items-center gap-3">
              <Settings className="h-4 w-4" />
              Conta e Privacidade
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
            <Link href="/" className="flex w-full items-center gap-3">
              <Puzzle className="h-4 w-4" />
              Meus aplicativos
            </Link>
          </DropdownMenuItem>
        </AccountMenuSection>
        <DropdownMenuSeparator className="my-3" />
        <DropdownMenuItem asChild className="cursor-pointer px-2 py-2.5">
          <Link
            href={meuPerfilHref}
            className="flex w-full items-center gap-3 font-medium"
          >
            <Users className="h-4 w-4 text-primary" />
            <span className="text-primary">Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer px-2 py-2.5"
          onSelect={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          <LogOut className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Sair</span>
        </DropdownMenuItem>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const myAgentQuery = useMyAgent({ enabled: isAuthenticated });
  const meuPerfilHref =
    myAgentQuery.data?.id != null
      ? `/usuarios/${myAgentQuery.data.id}`
      : "/usuarios/meus";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary via-secondary to-accent">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight text-foreground">
              Mapa Cultural
            </h1>
            <p className="text-xs text-muted-foreground">da Cidade</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto gap-2 px-2 py-1.5 sm:px-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60">
                    <User className="h-4 w-4 text-primary" />
                  </span>
                  <span className="hidden font-medium text-primary sm:inline">
                    Minha conta
                  </span>
                  <ChevronDown className="hidden h-4 w-4 opacity-60 sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[min(calc(100vw-1rem),36rem)] overflow-hidden p-0 shadow-lg"
              >
                <AccountDropdownBody
                  logout={logout}
                  meuPerfilHref={meuPerfilHref}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/cadastro">
                <Button className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {isAuthenticated && (
              <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Minha conta
                </p>
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Gerenciamento de entidades
                  </p>
                  <Link
                    href="/usuarios/meus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    Meus Agentes
                  </Link>
                  <Link
                    href="/lugares/meus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Building2 className="h-5 w-5" />
                    Meus Espaços
                  </Link>
                  <Link
                    href="/eventos/meus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <CalendarDays className="h-5 w-5" />
                    Meus Eventos
                  </Link>
                  <Link
                    href="/projetos/meus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <FolderKanban className="h-5 w-5" />
                    Meus Projetos
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Editais e oportunidades
                  </p>
                  <Link
                    href="/oportunidades/meus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Lightbulb className="h-5 w-5" />
                    Minhas oportunidades
                  </Link>
                </div>
                <Link
                  href={meuPerfilHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-muted"
                >
                  <User className="h-5 w-5" />
                  Meu Perfil
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-primary"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
