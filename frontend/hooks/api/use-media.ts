"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteMediaAsset,
  uploadMediaAsset,
  type UploadMediaPayload,
} from "@/lib/api/media";
import type { MediaOwnerTypeApi } from "@/lib/api/types";
import { queryKeys } from "./query-keys";

function invalidateEntityDetail(
  qc: ReturnType<typeof useQueryClient>,
  ownerType: MediaOwnerTypeApi,
  ownerId: string,
) {
  if (ownerType === "AGENT") {
    qc.invalidateQueries({ queryKey: queryKeys.agents.detail(ownerId) });
    qc.invalidateQueries({ queryKey: queryKeys.agents.me });
  } else if (ownerType === "SPACE") {
    qc.invalidateQueries({ queryKey: queryKeys.spaces.detail(ownerId) });
  } else if (ownerType === "PROJECT") {
    qc.invalidateQueries({ queryKey: queryKeys.projects.detail(ownerId) });
  } else if (ownerType === "EVENT") {
    qc.invalidateQueries({ queryKey: queryKeys.events.detail(ownerId) });
  } else if (ownerType === "OPPORTUNITY") {
    qc.invalidateQueries({ queryKey: queryKeys.opportunities.detail(ownerId) });
  }
}

export function useUploadMediaAsset(
  ownerType: MediaOwnerTypeApi,
  ownerId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<UploadMediaPayload, "ownerType" | "ownerId">) => {
      if (!ownerId) {
        return Promise.reject(new Error("ID da entidade ausente"));
      }
      return uploadMediaAsset({
        ...payload,
        ownerType,
        ownerId,
      });
    },
    onSuccess: () => {
      if (ownerId) invalidateEntityDetail(qc, ownerType, ownerId);
    },
  });
}

export function useDeleteMediaAsset(
  ownerType: MediaOwnerTypeApi,
  ownerId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteMediaAsset(mediaId),
    onSuccess: () => {
      if (ownerId) invalidateEntityDetail(qc, ownerType, ownerId);
    },
  });
}
