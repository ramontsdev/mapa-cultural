import { apiFetch } from "./http";
import type {
  MediaAssetDTO,
  MediaKindApi,
  MediaOwnerTypeApi,
} from "./types";

export type UploadMediaPayload = {
  file?: File;
  ownerType: MediaOwnerTypeApi;
  ownerId: string;
  kind: MediaKindApi;
  title?: string;
  caption?: string;
  thumbnailUrl?: string;
  /** Vídeo hospedado fora do S3 (YouTube, Vimeo, etc.) */
  externalUrl?: string;
};

export function uploadMediaAsset(
  payload: UploadMediaPayload,
): Promise<MediaAssetDTO> {
  const fd = new FormData();
  if (payload.file) {
    fd.append("file", payload.file);
  }
  fd.append("ownerType", payload.ownerType);
  fd.append("ownerId", payload.ownerId);
  fd.append("kind", payload.kind);
  if (payload.title) fd.append("title", payload.title);
  if (payload.caption) fd.append("caption", payload.caption);
  if (payload.thumbnailUrl) fd.append("thumbnailUrl", payload.thumbnailUrl);
  if (payload.externalUrl) fd.append("externalUrl", payload.externalUrl);

  return apiFetch<MediaAssetDTO>("/media", {
    method: "POST",
    body: fd,
    auth: true,
  });
}

export function deleteMediaAsset(id: string): Promise<void> {
  return apiFetch<void>(`/media/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
