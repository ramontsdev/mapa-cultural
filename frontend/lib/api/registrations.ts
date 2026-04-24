import { apiFetch } from "./http";
import type { Paginated, RegistrationDTO } from "./types";

export function listMyRegistrations(
  params: { page?: number; pageSize?: number } = {},
): Promise<Paginated<RegistrationDTO>> {
  return apiFetch<Paginated<RegistrationDTO>>("/registrations/me", {
    method: "GET",
    query: params,
  });
}

export type CreateRegistrationPayload = {
  proponentType: string;
  range: string;
  category?: string;
};

export function createRegistration(
  opportunityId: string,
  payload: CreateRegistrationPayload,
): Promise<RegistrationDTO> {
  return apiFetch<RegistrationDTO>(
    `/opportunities/${opportunityId}/registrations`,
    {
      method: "POST",
      body: payload,
    },
  );
}
