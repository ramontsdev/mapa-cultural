"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  CalendarDays,
  MapPin,
  Users,
  Menu,
  X,
  User,
  Lightbulb,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/oportunidades", label: "Oportunidades", icon: Lightbulb },
  { href: "/usuarios", label: "Agentes", icon: Users },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/lugares", label: "Espaços", icon: MapPin },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
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

        {/* Auth Button */}
        <div className="flex items-center gap-2">
          <Link href="/cadastro">
            <Button className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

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
          </div>
        </nav>
      )}
    </header>
  );
}
