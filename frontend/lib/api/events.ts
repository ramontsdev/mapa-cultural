import { apiFetch } from "./http";
import type { EventDTO, EventOccurrenceDTO, Paginated } from "./types";

export type ListEventsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listEvents(
  params: ListEventsParams = {},
): Promise<Paginated<EventDTO>> {
  return apiFetch<Paginated<EventDTO>>("/events", {
    method: "GET",
    query: params,
    auth: false,
  });
}

export function listMyEvents(
  params: { page?: number; pageSize?: number } = {},
): Promise<Paginated<EventDTO>> {
  return apiFetch<Paginated<EventDTO>>("/events/me", {
    method: "GET",
    query: params,
  });
}

export function getEvent(id: string): Promise<EventDTO> {
  return apiFetch<EventDTO>(`/events/${id}`, {
    method: "GET",
    auth: false,
  });
}

export type CreateEventPayload = {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  rules?: string;
  projectId?: string;
};

export function createEvent(payload: CreateEventPayload): Promise<EventDTO> {
  return apiFetch<EventDTO>("/events", {
    method: "POST",
    body: payload,
  });
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<EventDTO> {
  return apiFetch<EventDTO>(`/events/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteEvent(id: string): Promise<void> {
  return apiFetch<void>(`/events/${id}`, {
    method: "DELETE",
  });
}

export type CreateEventOccurrencePayload = {
  spaceId: string;
  rule: string;
  startsOn?: string;
  endsOn?: string;
  startsAt?: string;
  endsAt?: string;
  frequency?: string;
  separation?: number;
  count?: number;
  until?: string;
  description?: string;
  price?: string;
  priceInfo?: string;
  timezoneName?: string;
};

export function createEventOccurrence(
  eventId: string,
  payload: CreateEventOccurrencePayload,
): Promise<EventOccurrenceDTO> {
  return apiFetch<EventOccurrenceDTO>(`/events/${eventId}/occurrences`, {
    method: "POST",
    body: payload,
  });
}
