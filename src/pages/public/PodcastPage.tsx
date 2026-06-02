import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { type Podcast, getBySlug } from "@/lib/content-store";

import "@/styles/public-detail.css";

function splitDescription(text: string): string[] {
  const clean = String(text || "").trim();
  if (!clean) return [];
  const blocks = clean
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  return clean
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);
}

export function PodcastPage({ slug }: { slug: string }) {
  const [episode, setEpisode] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBySlug<Podcast>("podcast", slug)
      .then((row) => {
        if (!row || row.status !== "published") {
          setEpisode(null);
          return;
        }
        setEpisode(row);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const paragraphs = useMemo(
    () => splitDescription(episode?.description ?? ""),
    [episode?.description],
  );

  if (loading) {
    return (
      <PublicLayout>
        <p className="text-sm text-[#6B7385]">Loading podcast…</p>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <p className="text-sm text-red-600">{error}</p>
      </PublicLayout>
    );
  }

  if (!episode) {
    return (
      <PublicLayout>
        <h1 className="font-serif text-2xl font-bold">Podcast not found</h1>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="public-detail">
        <Link to="/podcast" className="public-detail-back">
          ← Back to podcasts
        </Link>

        <p className="public-detail-label">
          Episode {episode.episodeNumber ?? "—"}
          {episode.duration ? ` · ${episode.duration}` : ""}
        </p>
        <h1 className="public-detail-title">{episode.title}</h1>

        <div className="public-detail-meta">
          {episode.guestName && <span>Guest: {episode.guestName}</span>}
        </div>

        {episode.summary && <p className="text-sm text-[#6B7385]">{episode.summary}</p>}

        {(episode.audioUrl || episode.videoUrl) && (
          <div className="public-detail-actions">
            {episode.audioUrl && (
              <a
                href={episode.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="public-detail-btn public-detail-btn-primary"
              >
                Listen now
              </a>
            )}
            {episode.videoUrl && (
              <a
                href={episode.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="public-detail-btn"
              >
                Watch video
              </a>
            )}
          </div>
        )}

        {episode.coverImage && (
          <figure className="public-detail-hero">
            <img src={episode.coverImage} alt={episode.title} loading="lazy" />
          </figure>
        )}

        {paragraphs.length > 0 && (
          <div className="public-detail-prose">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
      </article>
    </PublicLayout>
  );
}

