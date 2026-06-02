/**
 * Admin session (LexResolve-style localStorage + backend Bearer token).
 */

import { clearAdminToken, getStoredAdminToken, loginAdmin, setAdminToken } from "@/admin/api";

const SESSION_KEY = "cms_admin_session";

type Session = { username: string; loggedInAt: string };

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getStoredAdminToken() && localStorage.getItem(SESSION_KEY));
}

export async function login(username: string, password: string): Promise<void> {
  await loginAdmin(username, password);
  const session: Session = {
    username,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout(): void {
  clearAdminToken();
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "/login";
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** Sync session flag when token exists (e.g. after legacy login) */
export function ensureSession(username = "admin"): void {
  if (getStoredAdminToken() && !localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username, loggedInAt: new Date().toISOString() }),
    );
  }
}

export { setAdminToken };
