"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRegistration,
  listMyRegistrations,
  type CreateRegistrationPayload,
} from "@/lib/api/registrations";
import { queryKeys } from "./query-keys";

export function useMyRegistrations(
  params: { page?: number; pageSize?: number; enabled?: boolean } = {},
) {
  const { enabled, ...queryParams } = params;
  return useQuery({
    queryKey: queryKeys.registrations.me(queryParams),
    queryFn: () => listMyRegistrations(queryParams),
    enabled: enabled ?? true,
  });
}

export function useCreateRegistration(opportunityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRegistrationPayload) =>
      createRegistration(opportunityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["registrations"] as const,
      });
    },
  });
}
