export type UserRole = "STUDENT" | "ADMIN";

export type Session = {
  token: string;
  role: UserRole;
};

const TOKEN_KEY = "accessToken";
const ROLE_KEY = "userRole";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRole(): UserRole | null {
  if (!isBrowser()) return null;
  const value = window.localStorage.getItem(ROLE_KEY);
  if (value === "STUDENT" || value === "ADMIN") return value;
  return null;
}

export function getSession(): Session | null {
  const token = getToken();
  const role = getRole();
  if (!token || !role) return null;
  return { token, role };
}

export function setSession(token: string, role: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function homePathForRole(role: UserRole | null | undefined): string {
  return role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
}
