import { apiFetch } from "./http";
import { AppUser } from "./types";

export type SignInPayload = { email: string; password: string };
export type SignInResponse = { accessToken: string };

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  return apiFetch<SignInResponse>("/sign-in", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export type SignUpPayload = {
  name: string;
  email: string;
  document: string;
  password: string;
  passwordConfirmation: string;
};

export async function signUp(payload: SignUpPayload): Promise<AppUser> {
  return apiFetch<AppUser>("/sign-up", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function confirmEmail(payload: {
  email: string;
  code: string;
}): Promise<void> {
  await apiFetch<void>("/confirm-email", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function resendVerificationCode(payload: {
  email: string;
}): Promise<void> {
  await apiFetch<void>("/resend-verification-code", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function forgotPassword(payload: { email: string }): Promise<void> {
  await apiFetch<void>("/forgot-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
}): Promise<void> {
  await apiFetch<void>("/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function fetchMe(): Promise<AppUser> {
  return apiFetch<AppUser>("/me", { method: "GET" });
}
