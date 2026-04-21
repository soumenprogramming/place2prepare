import { apiRequest } from "./client";

export type AuthApiResponse = {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
};

export function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthApiResponse>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<AuthApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerAdmin(payload: {
  fullName: string;
  email: string;
  password: string;
  setupKey: string;
}) {
  return apiRequest<AuthApiResponse>("/api/v1/auth/admin/register", {
    method: "POST",
    body: payload,
  });
}

export function requestPasswordReset(payload: { email: string }) {
  return apiRequest<{ message: string }>(
    "/api/v1/auth/password/reset-request",
    { method: "POST", body: payload }
  );
}

export function confirmPasswordReset(payload: {
  token: string;
  newPassword: string;
}) {
  return apiRequest<{ message: string }>(
    "/api/v1/auth/password/reset-confirm",
    { method: "POST", body: payload }
  );
}

export async function logoutUser(token?: string): Promise<void> {
  try {
    await apiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
      token: token ?? null,
      body: {},
    });
  } catch {
    // Logout must not block the UI; the client will clear local state regardless.
  }
}
