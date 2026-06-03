import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { stripHtml } from "@/lib/content-format";
import {
  fetchPublishedBySlug,
  formatPublishDate,
  resolveBookCover,
  rowStr,
  type ApiRow,
} from "@/lib/public-api";

import "@/styles/public-detail.css";

export function BookPage({ slug }: { slug: string }) {
  const [book, setBook] = useState<ApiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedBySlug("books", slug)
      .then(setBook)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <p className="text-sm text-[#6B7385]">Loading book…</p>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/books" className="public-detail-back mt-4">
          ← Back to books
        </Link>
      </PublicLayout>
    );
  }

  if (!book) {
    return (
      <PublicLayout>
        <h1 className="font-serif text-2xl font-bold">Book not found</h1>
        <Link to="/books" className="public-detail-back mt-4">
          ← Back to books
        </Link>
      </PublicLayout>
    );
  }

  const cover = resolveBookCover(book);
  const buyLink = rowStr(book, "buy_link");
  const title = rowStr(book, "title");
  const excerpt = rowStr(book, "excerpt");
  const bodyHtml = rowStr(book, "description");
  const hasStructuredBody = bodyHtml.includes("book-publication");

  return (
    <PublicLayout>
      <div className="public-detail-book">
        <div>
          <Link to="/books" className="public-detail-back">
            ← Back to books
          </Link>
          {cover && (
            <figure className="public-detail-book-cover mt-6">
              <img src={cover} alt={title} loading="lazy" />
            </figure>
          )}
        </div>

        <div className="public-detail-book-body">
          <p className="public-detail-label">Publication</p>
          <h1 className="public-detail-title">{title}</h1>

          <ul className="public-detail-book-facts">
            {rowStr(book, "author") && <li>Author: {rowStr(book, "author")}</li>}
            {rowStr(book, "publisher") && <li>Publisher: {rowStr(book, "publisher")}</li>}
            {rowStr(book, "isbn") && <li>ISBN: {rowStr(book, "isbn")}</li>}
            {rowStr(book, "publication_date") && (
              <li>Published: {formatPublishDate(rowStr(book, "publication_date"))}</li>
            )}
          </ul>

          {excerpt && <p className="public-detail-lead">{excerpt}</p>}

          {buyLink && (
            <div className="public-detail-actions">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="public-detail-btn public-detail-btn-accent"
              >
                View / buy book
              </a>
            </div>
          )}

          {hasStructuredBody ? (
            <div
              className="public-detail-prose book-publication-wrap"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            bodyHtml && <p className="public-detail-lead">{stripHtml(bodyHtml)}</p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
