import { apiFetch } from "./http";
import type { OpportunityDTO, Paginated } from "./types";

export type ListOpportunitiesParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listOpportunities(
  params: ListOpportunitiesParams = {},
): Promise<Paginated<OpportunityDTO>> {
  return apiFetch<Paginated<OpportunityDTO>>("/opportunities", {
    method: "GET",
    query: params,
    auth: false,
  });
}

export function listMyOpportunities(
  params: { page?: number; pageSize?: number } = {},
): Promise<Paginated<OpportunityDTO>> {
  return apiFetch<Paginated<OpportunityDTO>>("/opportunities/me", {
    method: "GET",
    query: params,
  });
}

export function getOpportunity(id: string): Promise<OpportunityDTO> {
  return apiFetch<OpportunityDTO>(`/opportunities/${id}`, {
    method: "GET",
    auth: false,
  });
}

export type CreateOpportunityPayload = {
  name: string;
  shortDescription: string;
  registrationFrom: string;
  registrationTo: string;
  objectType: "Event" | "Project";
  objectId: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export type UpdateOpportunityPayload = {
  name?: string;
  shortDescription?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export function createOpportunity(
  payload: CreateOpportunityPayload,
): Promise<OpportunityDTO> {
  return apiFetch<OpportunityDTO>("/opportunities", {
    method: "POST",
    body: payload,
  });
}

export function deleteOpportunity(id: string): Promise<void> {
  return apiFetch<void>(`/opportunities/${id}`, {
    method: "DELETE",
  });
}

export function updateOpportunity(
  id: string,
  payload: UpdateOpportunityPayload,
): Promise<OpportunityDTO> {
  return apiFetch<OpportunityDTO>(`/opportunities/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
