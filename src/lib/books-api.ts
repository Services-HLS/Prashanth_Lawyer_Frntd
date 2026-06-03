import { formatBookCardSummary } from "@/lib/book-format";
import { normalizeBookForDisplay } from "@/lib/content-format";
import {
  fetchMysqlBookCover,
  resolveBookCover,
  rowStr,
  type ApiRow,
} from "@/lib/public-api";

async function readJsonList(res: Response): Promise<ApiRow[]> {
  const text = await res.text();
  let json: { success?: boolean; data?: ApiRow[]; error?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new Error(text.trim().slice(0, 160) || `API error ${res.status}`);
  }
  if (!res.ok || !json.success || !Array.isArray(json.data)) {
    throw new Error(json.error || `Failed to load books (${res.status})`);
  }
  return json.data;
}

export async function fetchPublishedBooks(): Promise<ApiRow[]> {
  const res = await fetch("/api/v1/books/feed", { cache: "no-store" });
  const rows = await readJsonList(res);
  const normalized = rows.map((row) => normalizeBookForDisplay(row));

  await Promise.all(
    normalized.map(async (row, index) => {
      if (resolveBookCover(row)) return;
      const slug = rowStr(row, "slug");
      if (!slug) return;
      const cover = await fetchMysqlBookCover(slug);
      if (cover) normalized[index] = { ...row, cover_image: cover };
    }),
  );

  return normalized;
}

export function bookCardExcerpt(row: ApiRow, maxLen = 140): string {
  const excerpt = rowStr(row, "excerpt");
  if (excerpt) {
    const text = excerpt.replace(/\s+/g, " ").trim();
    if (text.length > maxLen) return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
    return text;
  }
  return formatBookCardSummary(rowStr(row, "description"), maxLen);
}
