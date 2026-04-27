import { apiFetch } from "./http";
import type { Paginated, ProjectDTO } from "./types";

export type ListProjectsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listProjects(
  params: ListProjectsParams = {},
): Promise<Paginated<ProjectDTO>> {
  return apiFetch<Paginated<ProjectDTO>>("/projects", {
    method: "GET",
    query: params,
    auth: false,
  });
}

export function listMyProjects(
  params: { page?: number; pageSize?: number } = {},
): Promise<Paginated<ProjectDTO>> {
  return apiFetch<Paginated<ProjectDTO>>("/projects/me", {
    method: "GET",
    query: params,
  });
}

export function getProject(id: string): Promise<ProjectDTO> {
  return apiFetch<ProjectDTO>(`/projects/${id}`, {
    method: "GET",
    auth: false,
  });
}

export type CreateProjectPayload = {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectDTO> {
  return apiFetch<ProjectDTO>("/projects", {
    method: "POST",
    body: payload,
  });
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export function updateProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<ProjectDTO> {
  return apiFetch<ProjectDTO>(`/projects/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, {
    method: "DELETE",
  });
}
