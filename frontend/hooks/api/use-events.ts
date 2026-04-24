"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEvent,
  createEventOccurrence,
  deleteEvent,
  getEvent,
  listEvents,
  listMyEvents,
  updateEvent,
  type CreateEventOccurrencePayload,
  type CreateEventPayload,
  type ListEventsParams,
  type UpdateEventPayload,
} from "@/lib/api/events";
import { queryKeys } from "./query-keys";

export function useEvents(params: ListEventsParams = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => listEvents(params),
  });
}

export function useMyEvents(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.events.me(params),
    queryFn: () => listMyEvents(params),
  });
}

export function useEvent(id: string | undefined | null) {
  return useQuery({
    queryKey: id ? queryKeys.events.detail(id) : queryKeys.events.detail(""),
    queryFn: () => getEvent(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => updateEvent(id, payload),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(id), event);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useCreateEventOccurrence(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventOccurrencePayload) =>
      createEventOccurrence(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(eventId),
      });
    },
  });
}
