/**

 * Browser: always same-origin `/api` (proxied to backend — no CORS).

 * SSR: uses VITE_API_URL or http://localhost:3001.

 */

export function getApiBase(): string {

  if (typeof window !== "undefined") {

    return "";

  }

  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;

  if (fromEnv?.trim()) {

    return fromEnv.replace(/\/$/, "");

  }

  return "http://localhost:3001";

}



export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };



const TOKEN_KEY = "admin_token";



/** Session token from login — safe for SSR/hydration checks. */

export function getStoredAdminToken(): string | null {

  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(TOKEN_KEY);

}



export function setAdminToken(token: string): void {

  sessionStorage.setItem(TOKEN_KEY, token);

  sessionStorage.removeItem("admin_api_key");

}



export function clearAdminToken(): void {

  sessionStorage.removeItem(TOKEN_KEY);

  sessionStorage.removeItem("admin_api_key");

}



function apiUrl(path: string): string {

  const base = getApiBase();

  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${base}/api/v1${normalized}`;

}



/** Public URL for an uploaded path (e.g. /uploads/abc.jpg) */

export function resolveUploadUrl(url: string): string {

  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {

    return url;

  }

  const base = getApiBase();

  return `${base}${url.startsWith("/") ? url : `/${url}`}`;

}



export async function loginAdmin(email: string, password: string): Promise<void> {

  const res = await fetch(apiUrl("/auth/login"), {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ email: email.trim(), password }),

  });



  let json: ApiResponse<{ token: string; username: string }>;

  try {

    json = (await res.json()) as ApiResponse<{ token: string; username: string }>;

  } catch {

    throw new Error("API unreachable — start backend: npm run dev:api");

  }



  if (res.status === 404) {

    throw new Error(

      "Login endpoint not found — stop the old backend on port 3001 and run: npm run dev:api",

    );

  }



  if (!res.ok || !json.success) {

    const message = !json.success ? json.error : `Login failed (${res.status})`;

    throw new Error(message);

  }



  setAdminToken(json.data.token);

}



export async function adminFetch<T>(

  path: string,

  options: RequestInit = {},

): Promise<T> {

  const token = getStoredAdminToken();

  if (!token) {

    throw new Error("Not authenticated. Sign in at /admin/login.");

  }



  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {

    headers.set("Content-Type", "application/json");

  }



  const res = await fetch(apiUrl(path), { ...options, headers });

  const json = (await res.json()) as ApiResponse<T>;



  if (!res.ok || !json.success) {

    const message = !json.success ? json.error : `Request failed (${res.status})`;

    throw new Error(message);

  }



  return json.data;

}



/** Upload one or more images to backend (saved under /uploads, stored in MySQL as URL paths) */

export async function adminUploadImages(files: File[]): Promise<string[]> {

  const token = getStoredAdminToken();

  if (!token) {

    throw new Error("Not authenticated. Sign in at /admin/login.");

  }

  if (!files.length) return [];



  const form = new FormData();

  for (const file of files) {

    form.append("images", file);

  }



  const res = await fetch(apiUrl("/uploads"), {

    method: "POST",

    headers: { Authorization: `Bearer ${token}` },

    body: form,

  });



  const json = (await res.json()) as ApiResponse<{ urls: string[] }>;

  if (!res.ok || !json.success) {

    const message = !json.success ? json.error : `Upload failed (${res.status})`;

    throw new Error(message);

  }

  return json.data.urls;

}



export async function requestPasswordReset(
  email: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{
  message: string;
  resetUrl?: string | null;
  expiresAt?: string;
}> {
  const res = await fetch(apiUrl("/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      newPassword,
      confirmPassword,
    }),
  });
  const json = (await res.json()) as ApiResponse<{
    message: string;
    resetUrl?: string | null;
    expiresAt?: string;
  }>;
  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error : "Could not start password reset");
  }
  return json.data;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const res = await fetch(apiUrl("/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const json = (await res.json()) as ApiResponse<{ updated: boolean }>;
  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error : "Password reset failed");
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await adminFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function checkHealth(): Promise<{ status: string; database: string }> {

  const res = await fetch(apiUrl("/health"));

  if (!res.ok) {

    throw new Error(`API health check failed (${res.status})`);

  }

  let json: ApiResponse<{ status: string; database: string }>;

  try {

    json = (await res.json()) as ApiResponse<{ status: string; database: string }>;

  } catch {

    throw new Error("API unreachable — start backend: npm run dev:api");

  }

  if (!json.success) throw new Error("API unreachable");

  return json.data;

}


