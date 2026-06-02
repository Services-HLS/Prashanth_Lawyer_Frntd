import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { stripHtml } from "@/lib/content-format";
import {
  fetchPublishedBySlug,
  formatPublishDate,
  resolveArticleGallery,
  resolveArticleHero,
  rowStr,
  type ApiRow,
} from "@/lib/public-api";

import "@/styles/public-detail.css";

export function ArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ApiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedBySlug("articles", slug)
      .then(setArticle)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <p className="text-sm text-[#6B7385]">Loading article…</p>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/classic" className="public-detail-back mt-4">
          ← Back to site
        </Link>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <h1 className="font-serif text-2xl font-bold">Article not found</h1>
        <Link to="/classic" className="public-detail-back mt-4">
          ← Back to site
        </Link>
      </PublicLayout>
    );
  }

  const hero = resolveArticleHero(article);
  const gallery = resolveArticleGallery(article, hero);
  const pdfUrl = rowStr(article, "pdf_url");
  const title = rowStr(article, "title");
  const category = rowStr(article, "category") || rowStr(article, "type") || "Article";
  const content = rowStr(article, "content");
  let lead = rowStr(article, "description");
  if (lead && content) {
    const firstInBody = stripHtml(
      content.match(/<p[^>]*>[\s\S]*?<\/p>/i)?.[0] ?? content.slice(0, 500),
    )
      .replace(/\s+/g, " ")
      .trim();
    const leadNorm = lead.replace(/\s+/g, " ").trim();
    if (
      firstInBody &&
      (firstInBody.startsWith(leadNorm) ||
        leadNorm.startsWith(firstInBody.slice(0, Math.min(leadNorm.length, 120))))
    ) {
      lead = "";
    }
  }

  return (
    <PublicLayout>
      <article className="public-detail">
        <Link to="/classic" className="public-detail-back">
          ← Back to site
        </Link>

        <p className="public-detail-label">{category}</p>
        <h1 className="public-detail-title">{title}</h1>

        <div className="public-detail-meta">
          {rowStr(article, "author") && <span>By {rowStr(article, "author")}</span>}
          {rowStr(article, "publish_date") && (
            <span>
              {rowStr(article, "author") ? " · " : ""}
              {formatPublishDate(rowStr(article, "publish_date"))}
            </span>
          )}
        </div>

        {lead && <p className="public-detail-lead">{lead}</p>}

        {hero && (
          <figure className="public-detail-hero">
            <img src={hero} alt={title} loading="lazy" decoding="async" />
          </figure>
        )}

        {(pdfUrl || gallery.length > 0) && (
          <div className="public-detail-actions">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="public-detail-btn public-detail-btn-primary"
              >
                Open PDF
              </a>
            )}
          </div>
        )}

        {gallery.length > 0 && (
          <div className="public-detail-gallery" aria-label="Gallery">
            {gallery.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
        )}

        {content && (
          <div
            className="public-detail-prose"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </article>
    </PublicLayout>
  );
}
