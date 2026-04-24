import { apiFetch } from "./http";
import type { Paginated, SpaceDTO } from "./types";

export type ListSpacesParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listSpaces(
  params: ListSpacesParams = {},
): Promise<Paginated<SpaceDTO>> {
  return apiFetch<Paginated<SpaceDTO>>("/spaces", {
    method: "GET",
    query: params,
    auth: false,
  });
}

export function listMySpaces(
  params: { page?: number; pageSize?: number } = {},
): Promise<Paginated<SpaceDTO>> {
  return apiFetch<Paginated<SpaceDTO>>("/spaces/me", {
    method: "GET",
    query: params,
  });
}

export function getSpace(id: string): Promise<SpaceDTO> {
  return apiFetch<SpaceDTO>(`/spaces/${id}`, {
    method: "GET",
    auth: false,
  });
}

export type CreateSpacePayload = {
  name: string;
  isPublic?: boolean;
  shortDescription?: string;
  longDescription?: string;
};

export function createSpace(payload: CreateSpacePayload): Promise<SpaceDTO> {
  return apiFetch<SpaceDTO>("/spaces", {
    method: "POST",
    body: payload,
  });
}

export type UpdateSpacePayload = Partial<CreateSpacePayload>;

export function updateSpace(
  id: string,
  payload: UpdateSpacePayload,
): Promise<SpaceDTO> {
  return apiFetch<SpaceDTO>(`/spaces/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSpace(id: string): Promise<void> {
  return apiFetch<void>(`/spaces/${id}`, {
    method: "DELETE",
  });
}
