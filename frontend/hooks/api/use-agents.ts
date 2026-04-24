"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAgent,
  getMyAgent,
  listAgents,
  updateMyAgent,
  type ListAgentsParams,
  type UpdateMyAgentPayload,
} from "@/lib/api/agents";
import { queryKeys } from "./query-keys";

export function useAgents(params: ListAgentsParams = {}) {
  return useQuery({
    queryKey: queryKeys.agents.list(params),
    queryFn: () => listAgents(params),
  });
}

export function useAgent(id: string | undefined | null) {
  return useQuery({
    queryKey: id ? queryKeys.agents.detail(id) : queryKeys.agents.detail(""),
    queryFn: () => getAgent(id as string),
    enabled: Boolean(id),
  });
}

export function useMyAgent(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.agents.me,
    queryFn: getMyAgent,
    enabled: options.enabled ?? true,
  });
}

export function useUpdateMyAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMyAgentPayload) => updateMyAgent(payload),
    onSuccess: (agent) => {
      queryClient.setQueryData(queryKeys.agents.me, agent);
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
  });
}
