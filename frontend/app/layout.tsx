import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mapa Cultural - Conectando a Cultura da Cidade",
  description:
    "Plataforma colaborativa para mapeamento de agentes culturais, espaços e eventos da cidade. Cadastre-se e faça parte do movimento cultural!",
  keywords: ["cultura", "eventos", "artistas", "espaços culturais", "mapa cultural"],
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} min-h-screen font-sans antialiased flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
