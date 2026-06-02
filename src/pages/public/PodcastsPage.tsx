import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { type Podcast, getAll } from "@/lib/content-store";

export function PodcastsPage() {
  const [episodes, setEpisodes] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAll<Podcast>("podcast")
      .then((list) =>
        setEpisodes(
          list
            .filter((p) => p.status === "published")
            .sort((a, b) => (b.episodeNumber ?? 0) - (a.episodeNumber ?? 0)),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <h1 className="font-serif text-3xl font-bold">Podcast</h1>
      {loading && <p className="mt-8 text-sm">Loading…</p>}
      <div className="mt-8 space-y-4">
        {episodes.map((p) => (
          <div key={p.id} className="rounded-lg border bg-white p-5">
            <p className="text-xs font-semibold text-[#E8522A]">
              Episode {p.episodeNumber ?? "—"}
            </p>
            <h2 className="font-serif text-xl font-bold">{p.title}</h2>
            <p className="mt-1 text-sm text-[#6B7385]">{p.summary || p.description}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <Link
                to="/podcast/$slug"
                params={{ slug: p.slug }}
                className="font-semibold text-[#E8522A] no-underline"
              >
                Read details →
              </Link>
              {p.audioUrl && (
                <a
                  href={p.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1B4D3E] no-underline"
                >
                  Listen →
                </a>
              )}
              {p.videoUrl && (
                <a
                  href={p.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1B4D3E] no-underline"
                >
                  Watch →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
