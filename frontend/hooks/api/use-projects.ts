"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProject,
  listMyProjects,
  listProjects,
  updateProject,
  type CreateProjectPayload,
  type ListProjectsParams,
  type UpdateProjectPayload,
} from "@/lib/api/projects";
import { queryKeys } from "./query-keys";

export function useProjects(params: ListProjectsParams = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => listProjects(params),
  });
}

export function useMyProjects(
  params: { page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.projects.me(params),
    queryFn: () => listMyProjects(params),
  });
}

export function useProject(id: string | undefined | null) {
  return useQuery({
    queryKey: id
      ? queryKeys.projects.detail(id)
      : queryKeys.projects.detail(""),
    queryFn: () => getProject(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => updateProject(id, payload),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
