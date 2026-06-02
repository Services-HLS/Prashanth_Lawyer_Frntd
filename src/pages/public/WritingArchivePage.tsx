import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import {
  fetchMysqlArticleImages,
  fetchMysqlBookCover,
  formatPublishDate,
  rowStr,
  type ApiRow,
} from "@/lib/public-api";

import "@/styles/writing-archive.css";

type FilterCat = "all" | "oxford" | "opinion" | "guide" | "lexis" | "book";

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: "all", label: "All" },
  { id: "oxford", label: "Oxford OBLB" },
  { id: "opinion", label: "Legal Opinion" },
  { id: "guide", label: "Practical Guide" },
  { id: "lexis", label: "LexisNexis" },
  { id: "book", label: "Books" },
];

function articleCategory(row: ApiRow): FilterCat {
  const c = rowStr(row, "category").toLowerCase();
  if (c.includes("oxford")) return "oxford";
  if (c.includes("lexis")) return "lexis";
  const t = rowStr(row, "type").toLowerCase();
  if (t === "legal_opinion" || c.includes("opinion")) return "opinion";
  if (t === "guide" || c.includes("guide")) return "guide";
  return "all";
}

function tagClass(cat: FilterCat): string {
  if (cat === "oxford") return "oxford";
  if (cat === "lexis") return "lexis";
  if (cat === "opinion") return "opinion";
  if (cat === "guide") return "guide";
  return "guide";
}

function isUsableImage(src: string): boolean {
  if (!src) return false;
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/uploads/") ||
    (src.startsWith("data:image/") && src.length < 600_000)
  );
}

function resolveArticleThumb(row: ApiRow): string {
  const featured = rowStr(row, "featured_image");
  if (isUsableImage(featured)) return featured;
  const gallery = rowStr(row, "gallery_images");
  if (gallery.startsWith("[")) {
    try {
      const arr = JSON.parse(gallery) as unknown[];
      const first = arr.map(String).find(isUsableImage);
      if (first) return first;
    } catch {
      /* ignore */
    }
  }
  if (row.has_featured_image) {
    return `/api/v1/images/articles/${encodeURIComponent(rowStr(row, "slug"))}`;
  }
  return "";
}

function resolveBookThumb(row: ApiRow): string {
  const cover = rowStr(row, "cover_image");
  if (isUsableImage(cover)) return cover;
  if (row.has_cover_image) {
    return `/api/v1/images/books/${encodeURIComponent(rowStr(row, "slug"))}`;
  }
  return "";
}

async function fetchWriting(): Promise<{ articles: ApiRow[]; books: ApiRow[] }> {
  const res = await fetch("/api/v1/site/writing", { cache: "no-store" });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { articles?: ApiRow[]; books?: ApiRow[] };
    error?: string;
  };
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `Failed to load (${res.status})`);
  }
  let books = json.data.books ?? [];
  if (!books.length) {
    const feedRes = await fetch("/api/v1/books", { cache: "no-store" });
    const feedJson = (await feedRes.json()) as { success?: boolean; data?: ApiRow[] };
    if (feedRes.ok && feedJson.success && feedJson.data) books = feedJson.data;
  }
  const articles = (json.data.articles ?? []).filter(
    (a) => rowStr(a, "type").toLowerCase() !== "legal_opinion",
  );
  return { articles, books };
}

export function WritingArchivePage() {
  const [articles, setArticles] = useState<ApiRow[]>([]);
  const [books, setBooks] = useState<ApiRow[]>([]);
  const [filter, setFilter] = useState<FilterCat>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enrichImages = useCallback(async (articleRows: ApiRow[], bookRows: ApiRow[]) => {
    const nextArticles = [...articleRows];
    const nextBooks = [...bookRows];

    await Promise.all(
      nextArticles.map(async (row, i) => {
        if (resolveArticleThumb(row)) return;
        const slug = rowStr(row, "slug");
        if (!slug) return;
        const images = await fetchMysqlArticleImages(slug);
        if (images?.featured_image) {
          nextArticles[i] = { ...row, featured_image: images.featured_image };
        }
      }),
    );

    await Promise.all(
      nextBooks.map(async (row, i) => {
        if (resolveBookThumb(row)) return;
        const slug = rowStr(row, "slug");
        if (!slug) return;
        const cover = await fetchMysqlBookCover(slug);
        if (cover) nextBooks[i] = { ...row, cover_image: cover };
      }),
    );

    setArticles(nextArticles);
    setBooks(nextBooks);
  }, []);

  useEffect(() => {
    fetchWriting()
      .then(({ articles: a, books: b }) => enrichImages(a, b))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enrichImages]);

  const filteredArticles = useMemo(() => {
    if (filter === "book") return [];
    if (filter === "all") return articles;
    return articles.filter((a) => articleCategory(a) === filter);
  }, [articles, filter]);

  const filteredBooks = useMemo(() => {
    if (filter !== "all" && filter !== "book") return [];
    return books;
  }, [books, filter]);

  const showArticles = filter !== "book";
  const showBooks = filter === "all" || filter === "book";

  return (
    <PublicLayout>
      <div className="writing-archive">
        <Link to="/classic" className="writing-archive-back">
          ← Back to site
        </Link>

        <p className="writing-archive-label">Featured Writing</p>
        <h1 className="writing-archive-title">Published Work &amp; Analysis</h1>
        <p className="writing-archive-intro">
          All published articles and books from the database.
        </p>

        <div className="writing-archive-filters" role="tablist" aria-label="Filter content">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`writing-archive-filter${filter === f.id ? " is-active" : ""}`}
              data-cat={f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="writing-archive-status">Loading…</p>}
        {error && (
          <p className="writing-archive-error">
            {error}. Start the backend (<code>npm start</code> in backend/).
          </p>
        )}

        {!loading && !error && (
          <>
            {showArticles && (
              <section className="writing-archive-section" aria-labelledby="articles-heading">
                <h2 id="articles-heading" className="writing-archive-section-title">
                  Articles
                  <span className="writing-archive-count">{filteredArticles.length}</span>
                </h2>
                {filteredArticles.length === 0 ? (
                  <p className="writing-archive-empty">No articles in this category.</p>
                ) : (
                  <div className="writing-archive-grid">
                    {filteredArticles.map((a) => (
                      <ArticleArchiveCard key={rowStr(a, "id") || rowStr(a, "slug")} row={a} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showBooks && (
              <section className="writing-archive-section" aria-labelledby="books-heading">
                <h2 id="books-heading" className="writing-archive-section-title">
                  Books
                  <span className="writing-archive-count">{filteredBooks.length}</span>
                </h2>
                {filteredBooks.length === 0 ? (
                  <p className="writing-archive-empty">No published books yet.</p>
                ) : (
                  <div className="writing-archive-grid writing-archive-grid--books">
                    {filteredBooks.map((b) => (
                      <BookArchiveCard key={rowStr(b, "id") || rowStr(b, "slug")} row={b} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showArticles &&
              showBooks &&
              filteredArticles.length === 0 &&
              filteredBooks.length === 0 && (
                <p className="writing-archive-empty">Nothing published in this category yet.</p>
              )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

function ArticleArchiveCard({ row }: { row: ApiRow }) {
  const slug = rowStr(row, "slug");
  const cat = articleCategory(row);
  const thumb = resolveArticleThumb(row);
  const excerpt = rowStr(row, "description") || rowStr(row, "excerpt");
  const date = rowStr(row, "publish_date");

  return (
    <Link
      to="/article/$slug"
      params={{ slug }}
      className={`writing-archive-card${thumb ? " with-image" : ""}`}
      data-cat={cat}
    >
      {thumb && (
        <div className="writing-archive-card-thumb">
          <img src={thumb} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="writing-archive-card-body">
        <span className={`writing-archive-tag ${tagClass(cat)}`}>
          {rowStr(row, "category") || rowStr(row, "type") || "Article"}
          {date ? ` · ${formatPublishDate(date)}` : ""}
        </span>
        <h3 className="writing-archive-card-title">{rowStr(row, "title")}</h3>
        {excerpt && <p className="writing-archive-card-excerpt">{excerpt}</p>}
        <span className="writing-archive-card-cta">Read full article →</span>
      </div>
    </Link>
  );
}

function BookArchiveCard({ row }: { row: ApiRow }) {
  const slug = rowStr(row, "slug");
  const thumb = resolveBookThumb(row);
  const excerpt = rowStr(row, "excerpt") || rowStr(row, "description");
  const date = rowStr(row, "publication_date");

  return (
    <Link
      to="/book/$slug"
      params={{ slug }}
      className={`writing-archive-card${thumb ? " with-image" : ""}`}
      data-cat="book"
    >
      {thumb && (
        <div className="writing-archive-card-thumb">
          <img src={thumb} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="writing-archive-card-body">
        <span className="writing-archive-tag guide">
          Book{date ? ` · ${formatPublishDate(date)}` : ""}
        </span>
        <h3 className="writing-archive-card-title">{rowStr(row, "title")}</h3>
        {excerpt && <p className="writing-archive-card-excerpt">{excerpt}</p>}
        <span className="writing-archive-card-cta">View book →</span>
      </div>
    </Link>
  );
}
