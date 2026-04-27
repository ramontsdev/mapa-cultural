"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createOpportunity,
  deleteOpportunity,
  getOpportunity,
  listMyOpportunities,
  listOpportunities,
  updateOpportunity,
  type CreateOpportunityPayload,
  type ListOpportunitiesParams,
  type UpdateOpportunityPayload,
} from "@/lib/api/opportunities";
import { queryKeys } from "./query-keys";

export function useOpportunities(params: ListOpportunitiesParams = {}) {
  return useQuery({
    queryKey: queryKeys.opportunities.list(params),
    queryFn: () => listOpportunities(params),
  });
}

export function useMyOpportunities(
  params: { page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.opportunities.me(params),
    queryFn: () => listMyOpportunities(params),
  });
}

export function useOpportunity(id: string | undefined | null) {
  return useQuery({
    queryKey: id
      ? queryKeys.opportunities.detail(id)
      : queryKeys.opportunities.detail(""),
    queryFn: () => getOpportunity(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOpportunityPayload) =>
      createOpportunity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
  });
}

export function useUpdateOpportunity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOpportunityPayload) =>
      updateOpportunity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.opportunities.detail(id),
      });
    },
  });
}
