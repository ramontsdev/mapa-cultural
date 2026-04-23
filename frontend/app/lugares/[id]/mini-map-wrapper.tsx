"use client";

import dynamic from "next/dynamic";
import { StaticMapPlaceholder } from "@/components/mini-map";

const MiniMap = dynamic(
  () => import("@/components/mini-map").then((mod) => mod.MiniMap),
  {
    ssr: false,
    loading: () => <StaticMapPlaceholder nome="Carregando..." />,
  }
);

interface MiniMapWrapperProps {
  lat: number;
  lng: number;
  nome: string;
  className?: string;
}

export function MiniMapWrapper({ lat, lng, nome, className }: MiniMapWrapperProps) {
  return <MiniMap lat={lat} lng={lng} nome={nome} className={className} />;
}
