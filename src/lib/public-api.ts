export type ApiRow = Record<string, unknown>;

const METADATA_RE = /<!--\s*METADATA_START([\s\S]*?)-->\s*$/i;

export async function fetchPublishedBySlug(
  resource: "articles" | "books",
  slug: string,
): Promise<ApiRow | null> {
  const res = await fetch(`/api/v1/${resource}/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as { success?: boolean; data?: ApiRow; error?: string };
  if (res.status === 404) return null;
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `Failed to load (${res.status})`);
  }
  let row = resource === "articles" ? normalizeArticleRow(json.data) : json.data;

  const { normalizeArticleForDisplay, normalizeBookForDisplay } = await import(
    "./content-format.js"
  );
  if (resource === "articles") {
    row = normalizeArticleForDisplay(row);
  } else {
    row = normalizeBookForDisplay(row);
  }

  if (resource === "articles" && !resolveArticleHero(row)) {
    const images = await fetchMysqlArticleImages(slug);
    if (images) row = { ...row, ...images };
  }
  if (resource === "books" && !resolveBookCover(row)) {
    const cover = await fetchMysqlBookCover(slug);
    if (cover) row = { ...row, cover_image: cover };
  }

  return row;
}

/** Image fields from MySQL articles table (featured_image, gallery_images) */
export async function fetchMysqlArticleImages(
  slug: string,
): Promise<{ featured_image?: string; gallery_images?: unknown } | null> {
  const res = await fetch(`/api/v1/images/articles/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { featured_image?: string | null; gallery_images?: unknown };
  };
  if (!res.ok || !json.success || !json.data) return null;
  const out: { featured_image?: string; gallery_images?: unknown } = {};
  if (json.data.featured_image) out.featured_image = String(json.data.featured_image);
  if (json.data.gallery_images != null) out.gallery_images = json.data.gallery_images;
  return out;
}

/** cover_image from MySQL books table */
export async function fetchMysqlBookCover(slug: string): Promise<string | null> {
  const res = await fetch(`/api/v1/images/books/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { cover_image?: string | null };
  };
  if (!res.ok || !json.success || !json.data?.cover_image) return null;
  const cover = String(json.data.cover_image);
  return isImageSrc(cover) ? cover : null;
}

export function rowStr(row: ApiRow, key: string): string {
  const v = row[key];
  if (v != null && v !== "") return String(v);
  const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const v2 = row[camel];
  return v2 == null ? "" : String(v2);
}

function isImageSrc(src: string): boolean {
  const s = src.trim();
  if (!s) return false;
  return (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("data:image/") ||
    s.startsWith("/uploads/")
  );
}

function isHttpImage(src: string): boolean {
  const s = src.trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/uploads/");
}

/** Parse gallery_images column or JSON string into image URLs */
export function parseGalleryImages(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value.map(String).filter(isImageSrc);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) return parsed.map(String).filter(isImageSrc);
      } catch {
        /* fall through */
      }
    }
    if (isImageSrc(trimmed)) return [trimmed];
  }
  return [];
}

export function parseContentMetadata(html: string): {
  cleanHtml: string;
  galleryImages: string[];
  pdfUrl: string;
} {
  const raw = html ?? "";
  const match = raw.match(METADATA_RE);
  if (!match) {
    return { cleanHtml: raw, galleryImages: [], pdfUrl: "" };
  }

  let galleryImages: string[] = [];
  let pdfUrl = "";
  try {
    const meta = JSON.parse(match[1]) as {
      galleryImages?: unknown;
      pdfUrl?: string;
    };
    galleryImages = parseGalleryImages(meta.galleryImages);
    if (typeof meta.pdfUrl === "string") pdfUrl = meta.pdfUrl;
  } catch {
    /* ignore */
  }

  return {
    cleanHtml: raw.replace(METADATA_RE, "").trim(),
    galleryImages,
    pdfUrl,
  };
}

export function normalizeArticleRow(row: ApiRow): ApiRow {
  const content = rowStr(row, "content");
  if (!content.includes("METADATA_START")) return row;

  const { cleanHtml, galleryImages, pdfUrl } = parseContentMetadata(content);
  const next: ApiRow = { ...row, content: cleanHtml };

  if (galleryImages.length && !rowStr(next, "gallery_images")) {
    next.gallery_images = galleryImages;
  }
  if (pdfUrl && !rowStr(next, "pdf_url")) {
    next.pdf_url = pdfUrl;
  }
  return next;
}

export function firstImageFromHtml(html: string): string | null {
  if (!html) return null;
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (isImageSrc(match[1])) return match[1];
  }
  return null;
}

export function allImagesFromHtml(html: string): string[] {
  if (!html) return [];
  const found: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (isImageSrc(match[1]) && !found.includes(match[1])) found.push(match[1]);
  }
  return found;
}

export function resolveArticleHero(row: ApiRow): string {
  const featured = rowStr(row, "featured_image");
  if (isImageSrc(featured)) return featured;
  const gallery = parseGalleryImages(row.gallery_images);
  if (gallery.length) return gallery[0];
  const fromContent = firstImageFromHtml(rowStr(row, "content"));
  if (fromContent) return fromContent;
  return "";
}

export function resolveArticleGallery(row: ApiRow, hero: string): string[] {
  const fromCol = parseGalleryImages(row.gallery_images);
  const fromHtml = allImagesFromHtml(rowStr(row, "content"));
  const merged = [...fromCol, ...fromHtml].filter((src, i, arr) => arr.indexOf(src) === i);
  return hero ? merged.filter((src) => src !== hero) : merged;
}

export function resolveBookCover(row: ApiRow): string {
  const cover = rowStr(row, "cover_image");
  if (isImageSrc(cover)) return cover;
  return "";
}

/** Thumbnail for list cards — supports http(s) and reasonable data: URLs */
export function resolveListThumbnail(row: ApiRow, kind: "article" | "book"): string {
  if (kind === "book") {
    const cover = rowStr(row, "cover_image");
    if (isImageSrc(cover) && cover.length < 600_000) return cover;
    return "";
  }
  const featured = rowStr(row, "featured_image");
  if (isImageSrc(featured) && featured.length < 600_000) return featured;
  const gallery = parseGalleryImages(row.gallery_images);
  const usable = gallery.find((g) => isImageSrc(g) && g.length < 600_000);
  if (usable) return usable;
  return "";
}

export function formatPublishDate(value: string): string {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
