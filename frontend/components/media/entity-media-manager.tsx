"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EntityMediaSections } from "@/components/media/entity-media-sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteMediaAsset, useUploadMediaAsset } from "@/hooks/api/use-media";
import { ApiError } from "@/lib/api/http";
import type {
  MediaAssetDTO,
  MediaKindApi,
  MediaOwnerTypeApi,
} from "@/lib/api/types";

export function EntityMediaManager({
  ownerType,
  ownerId,
  media,
}: {
  ownerType: MediaOwnerTypeApi;
  ownerId: string;
  media: MediaAssetDTO[] | undefined;
}) {
  const upload = useUploadMediaAsset(ownerType, ownerId);
  const del = useDeleteMediaAsset(ownerType, ownerId);
  const [kind, setKind] = useState<MediaKindApi>("IMAGE");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");

  const list = media ?? [];
  const useExternalVideo = kind === "VIDEO" && externalUrl.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (useExternalVideo) {
      try {
        await upload.mutateAsync({
          kind: "VIDEO",
          externalUrl: externalUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          title: title.trim() || undefined,
        });
        toast.success("Vídeo externo adicionado.");
        setExternalUrl("");
        setThumbnailUrl("");
        setTitle("");
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "Não foi possível salvar.",
        );
      }
      return;
    }

    if (!file) {
      toast.error("Selecione um arquivo ou informe URL de vídeo externo.");
      return;
    }

    try {
      await upload.mutateAsync({
        file,
        kind,
        title: title.trim() || undefined,
        thumbnailUrl:
          kind === "VIDEO" && thumbnailUrl.trim()
            ? thumbnailUrl.trim()
            : undefined,
      });
      toast.success("Arquivo enviado.");
      setFile(null);
      setThumbnailUrl("");
      setTitle("");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Não foi possível enviar.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mídias públicas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Imagens, vídeos e documentos são gravados no bucket AWS configurado no
          backend e aparecem na página pública.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {list.length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <EntityMediaSections media={list} />
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {list.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    [{m.kind}] {m.title || m.fileName || `${m.url.slice(0, 40)}…`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={del.isPending}
                    onClick={async () => {
                      try {
                        await del.mutateAsync(m.id);
                        toast.success("Removido.");
                      } catch (err) {
                        toast.error(
                          err instanceof ApiError
                            ? err.message
                            : "Não foi possível remover.",
                        );
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as MediaKindApi)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Imagem (galeria)</SelectItem>
                  <SelectItem value="VIDEO">Vídeo (arquivo ou link)</SelectItem>
                  <SelectItem value="DOCUMENT">Documento (PDF etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-title">Título / legenda (opcional)</Label>
              <Input
                id="media-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Portfólio 2025"
              />
            </div>
          </div>

          {kind === "VIDEO" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="media-external">
                  URL de vídeo externo (opcional — deixe vazio para enviar
                  arquivo)
                </Label>
                <Input
                  id="media-external"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-thumb">
                  URL da miniatura (opcional, útil para vídeos)
                </Label>
                <Input
                  id="media-thumb"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          ) : null}

          {!useExternalVideo ? (
            <div className="space-y-2">
              <Label htmlFor="media-file">Arquivo</Label>
              <Input
                id="media-file"
                type="file"
                accept={
                  kind === "IMAGE"
                    ? "image/*"
                    : kind === "VIDEO"
                      ? "video/*"
                      : ".pdf,.doc,.docx,.odt,.txt,application/pdf"
                }
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : null}

          <Button type="submit" disabled={upload.isPending} className="gap-2">
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
