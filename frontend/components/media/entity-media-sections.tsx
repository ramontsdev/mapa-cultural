"use client";

import { FileDown, Play } from "lucide-react";
import Image from "next/image";

import type { MediaAssetDTO } from "@/lib/api/types";

function VideoTile({ item }: { item: MediaAssetDTO }) {
  const label = item.title || item.caption || "Vídeo";
  const thumb = item.thumbnailUrl;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center bg-muted">
            <Play className="h-14 w-14 text-muted-foreground/80" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
          <div className="rounded-full bg-background/90 p-3 shadow-md">
            <Play className="h-8 w-8 text-foreground" />
          </div>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-foreground">
        {label}
      </p>
    </a>
  );
}

function PhotoTile({ item }: { item: MediaAssetDTO }) {
  const label = item.caption || item.title;
  return (
    <div className="space-y-2">
      <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
        <Image
          src={item.url}
          alt={label || "Foto"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      {label ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}

export function EntityMediaSections({
  media,
}: {
  media: MediaAssetDTO[] | undefined;
}) {
  if (!media?.length) return null;

  const documents = media.filter((m) => m.kind === "DOCUMENT");
  const videos = media.filter((m) => m.kind === "VIDEO");
  const images = media.filter((m) => m.kind === "IMAGE");

  if (documents.length === 0 && videos.length === 0 && images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {documents.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Arquivos para download
          </h2>
          <ul className="space-y-3">
            {documents.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <FileDown className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
                  <span className="break-all">
                    {item.title || item.fileName || "Documento"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {videos.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Galeria de vídeo
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {videos.map((item) => (
              <VideoTile key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {images.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Galeria de fotos
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((item) => (
              <PhotoTile key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
