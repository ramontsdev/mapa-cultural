import { apiFetch } from "./http";
import type { AgentDTO, Paginated } from "./types";

export type ListAgentsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listAgents(
  params: ListAgentsParams = {},
): Promise<Paginated<AgentDTO>> {
  return apiFetch<Paginated<AgentDTO>>("/agents", {
    method: "GET",
    query: params,
    auth: false,
  });
}

export function getAgent(id: string): Promise<AgentDTO> {
  return apiFetch<AgentDTO>(`/agents/${id}`, {
    method: "GET",
    auth: false,
  });
}

export function getMyAgent(): Promise<AgentDTO> {
  return apiFetch<AgentDTO>("/agents/me", { method: "GET" });
}

export type UpdateMyAgentPayload = {
  name?: string;
  publicLocation?: boolean;
  shortDescription?: string;
  longDescription?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export function updateMyAgent(
  payload: UpdateMyAgentPayload,
): Promise<AgentDTO> {
  return apiFetch<AgentDTO>("/agents/me", {
    method: "PATCH",
    body: payload,
  });
}
