/**
 * LexResolve-style CMS client (Lawyer-application-deploy compatible).
 * Base URL: VITE_APPS_SCRIPT_URL or /api/content (proxied to backend in dev).
 */

import { getStoredAdminToken } from "@/admin/api";

export type ContentType = "article" | "topic" | "book" | "podcast" | "about";
export type ContentStatus = "draft" | "published";

export type Article = {
  id: string;
  type?: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  topicIds?: string[];
  featuredImage?: string;
  galleryImages?: string[];
  pdfUrl?: string;
  author?: string;
  publishDate?: string;
  status: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Topic = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  articleCount?: number;
  status: ContentStatus;
};

export type Book = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  author?: string;
  coverImage?: string;
  buyLink?: string;
  publicationDate?: string;
  publisher?: string;
  isbn?: string;
  status: ContentStatus;
};

export type Podcast = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: string;
  episodeNumber?: number;
  guestName?: string;
  coverImage?: string;
  platformLinks?: Record<string, string>;
  status: ContentStatus;
};

export type About = {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  status: ContentStatus;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

function contentBase(): string {
  const fromEnv = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return "/api/content";
  const api = import.meta.env.VITE_API_URL as string | undefined;
  return `${(api || "http://localhost:3001").replace(/\/$/, "")}/api/content`;
}

function cacheKey(type: ContentType, includeDrafts: boolean) {
  return `${type}:${includeDrafts ? "all" : "pub"}`;
}

export function clearCache(type?: ContentType) {
  if (!type) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${type}:`)) cache.delete(key);
  }
}

function authHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as T & { success?: boolean; data?: T; error?: string };
  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

async function parseList<T>(res: Response): Promise<T[]> {
  const json = await res.json();
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object" && "success" in json && json.success && Array.isArray(json.data)) {
    return json.data as T[];
  }
  if (json && typeof json === "object" && "error" in json) {
    throw new Error(String((json as { error: string }).error));
  }
  throw new Error("Invalid list response");
}

async function parseSingle<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (json && typeof json === "object" && "success" in json && json.success && json.data) {
    return json.data as T;
  }
  if (json && typeof json === "object" && "id" in json) {
    return json as T;
  }
  if (json && typeof json === "object" && "error" in json) {
    throw new Error(String((json as { error: string }).error));
  }
  throw new Error("Invalid response");
}

export async function getAll<T>(type: ContentType, includeDrafts = false): Promise<T[]> {
  const key = cacheKey(type, includeDrafts);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as T[];

  const base = contentBase();
  const status = includeDrafts ? "all" : "published";
  const res = await fetch(`${base}?action=list&type=${type}&status=${status}`, {
    cache: "no-store",
  });
  const data = await parseList<T>(res);
  cache.set(key, { at: Date.now(), data });
  return data;
}

export async function getById<T>(type: ContentType, id: string): Promise<T | null> {
  const base = contentBase();
  const res = await fetch(`${base}?action=single&type=${type}&id=${encodeURIComponent(id)}&status=all`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  return parseSingle<T>(res);
}

export async function getBySlug<T>(type: ContentType, slug: string): Promise<T | null> {
  const base = contentBase();
  const res = await fetch(
    `${base}?action=single&type=${type}&slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (res.status === 404) return null;
  return parseSingle<T>(res);
}

export async function save<T extends { id?: string; type?: string }>(
  type: ContentType,
  item: T,
  isUpdate: boolean,
): Promise<T> {
  const base = contentBase();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  let res: Response;
  if (isUpdate && item.id) {
    res = await fetch(`${base}/${type}/${item.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(item),
    });
  } else {
    res = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...item, type }),
    });
  }

  const json = await parseJson<{ success: boolean; data: T }>(res);
  clearCache(type);
  return (json as { data: T }).data ?? (json as unknown as T);
}

export async function remove(type: ContentType, id: string): Promise<void> {
  const base = contentBase();
  const res = await fetch(`${base}/${type}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseJson(res);
  clearCache(type);
}

export async function toggleStatus(
  type: ContentType,
  id: string,
  status: ContentStatus,
): Promise<void> {
  const base = contentBase();
  const res = await fetch(`${base}/${type}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  await parseJson(res);
  clearCache(type);
}

export function getPublishedArticles(articles: Article[]): Article[] {
  return articles
    .filter((a) => a.status === "published")
    .sort((a, b) => String(b.publishDate ?? "").localeCompare(String(a.publishDate ?? "")));
}

export function getArticlesByTopicSlug(articles: Article[], topicSlug: string): Article[] {
  return getPublishedArticles(articles).filter((a) => {
    if (a.category?.toLowerCase().includes(topicSlug.toLowerCase())) return true;
    return a.topicIds?.some((t) => t === topicSlug || t.includes(topicSlug));
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
