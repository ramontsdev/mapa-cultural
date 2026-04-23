"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface MiniMapProps {
  lat: number;
  lng: number;
  nome: string;
  className?: string;
}

export function MiniMap({ lat, lng, nome, className = "" }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Import Leaflet only on client side
    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      // Dynamic import of Leaflet
      const L = (await import("leaflet")).default;

      // Import CSS
      await import("leaflet/dist/leaflet.css");

      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
      });

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Custom icon
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background: linear-gradient(135deg, #0d9488, #d97706);
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <svg 
              style="transform: rotate(45deg); width: 18px; height: 18px; color: white;"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Add marker
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>${nome}</strong>`)
        .openPopup();

      mapInstanceRef.current = map;

      // Fix map size issues
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, nome]);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div ref={mapRef} className="h-full w-full min-h-[250px]" />
      {/* Fallback while loading */}
      <noscript>
        <div className="flex h-full min-h-[250px] items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm">
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </p>
          </div>
        </div>
      </noscript>
    </div>
  );
}

// Static map fallback for SSR
export function StaticMapPlaceholder({ nome }: { nome: string }) {
  return (
    <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted">
      <div className="text-center text-muted-foreground">
        <MapPin className="mx-auto h-12 w-12" />
        <p className="mt-2 font-medium">{nome}</p>
        <p className="text-sm">Carregando mapa...</p>
      </div>
    </div>
  );
}
