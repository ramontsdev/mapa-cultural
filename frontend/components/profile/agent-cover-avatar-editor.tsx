"use client";

import { ImageIcon, Loader2, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUpdateMyAgent } from "@/hooks/api/use-agents";
import { useUploadMediaAsset } from "@/hooks/api/use-media";
import { ApiError } from "@/lib/api/http";

type AgentCoverAvatarEditorProps = {
  agentId: string;
  avatarUrl: string;
  coverUrl: string;
  onAvatarApplied: (url: string) => void;
  onCoverApplied: (url: string) => void;
};

export function AgentCoverAvatarEditor({
  agentId,
  avatarUrl,
  coverUrl,
  onAvatarApplied,
  onCoverApplied,
}: AgentCoverAvatarEditorProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"avatar" | "cover" | null>(null);

  const upload = useUploadMediaAsset("AGENT", agentId);
  const updateAgent = useUpdateMyAgent();

  const applyFile = async (
    file: File,
    role: "avatar" | "cover",
  ): Promise<void> => {
    setBusy(role);
    try {
      const asset = await upload.mutateAsync({
        file,
        kind: "IMAGE",
        title: role === "avatar" ? "Foto de perfil" : "Imagem de capa",
      });
      if (role === "avatar") {
        await updateAgent.mutateAsync({ avatarUrl: asset.url });
        onAvatarApplied(asset.url);
        toast.success("Foto de perfil atualizada.");
      } else {
        await updateAgent.mutateAsync({ coverUrl: asset.url });
        onCoverApplied(asset.url);
        toast.success("Imagem de capa atualizada.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          role === "avatar"
            ? "Não foi possível enviar a foto de perfil."
            : "Não foi possível enviar a imagem de capa.",
        );
      }
    } finally {
      setBusy(null);
    }
  };

  const onAvatarPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void applyFile(file, "avatar");
  };

  const onCoverPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void applyFile(file, "cover");
  };

  const coverTrim = coverUrl.trim();
  const avatarTrim = avatarUrl.trim();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Wrapper: avatar (-mt-12) fica acima da imagem, mas a barra da capa usa z-20 para receber cliques */}
      <div className="relative">
        <div className="h-36 bg-muted sm:h-44">
          {coverTrim ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverTrim}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-end gap-2 p-2">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCoverPick}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="pointer-events-auto shadow-sm"
            disabled={busy !== null}
            onClick={() => coverInputRef.current?.click()}
          >
            {busy === "cover" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Alterar capa
          </Button>
        </div>

        <div className="relative z-10 px-4 pb-4 pt-0">
          <div className="-mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="relative shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md sm:h-28 sm:w-28">
              {avatarTrim ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarTrim}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UserRound className="h-12 w-12 opacity-40" aria-hidden />
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarPick}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 pb-1 pt-2 sm:pt-0">
            <p className="text-sm text-muted-foreground">
              Envie uma imagem do seu dispositivo. Ela será armazenada na galeria
              do agente e aplicada como foto de perfil ou capa.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={busy !== null}
              onClick={() => avatarInputRef.current?.click()}
            >
              {busy === "avatar" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Alterar foto de perfil
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
