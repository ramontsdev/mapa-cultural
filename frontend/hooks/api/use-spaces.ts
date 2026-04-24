"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSpace,
  deleteSpace,
  getSpace,
  listMySpaces,
  listSpaces,
  updateSpace,
  type CreateSpacePayload,
  type ListSpacesParams,
  type UpdateSpacePayload,
} from "@/lib/api/spaces";
import { queryKeys } from "./query-keys";

export function useSpaces(params: ListSpacesParams = {}) {
  return useQuery({
    queryKey: queryKeys.spaces.list(params),
    queryFn: () => listSpaces(params),
  });
}

export function useMySpaces(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.spaces.me(params),
    queryFn: () => listMySpaces(params),
  });
}

export function useSpace(id: string | undefined | null) {
  return useQuery({
    queryKey: id ? queryKeys.spaces.detail(id) : queryKeys.spaces.detail(""),
    queryFn: () => getSpace(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSpacePayload) => createSpace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all });
    },
  });
}

export function useUpdateSpace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSpacePayload) => updateSpace(id, payload),
    onSuccess: (space) => {
      queryClient.setQueryData(queryKeys.spaces.detail(id), space);
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces.all });
    },
  });
}
