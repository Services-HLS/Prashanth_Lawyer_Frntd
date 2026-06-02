import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import {
  type Article,
  type Book,
  type Podcast,
  type Topic,
  getAll,
  getPublishedArticles,
} from "@/lib/content-store";

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAll<Article>("article"),
      getAll<Topic>("topic"),
      getAll<Book>("book"),
      getAll<Podcast>("podcast"),
    ])
      .then(([a, t, b, p]) => {
        setArticles(getPublishedArticles(a));
        setTopics(t.filter((x) => x.status === "published").slice(0, 6));
        setBooks(
          b
            .filter((x) => x.status === "published")
            .sort((x, y) =>
              String(y.publicationDate ?? "").localeCompare(String(x.publicationDate ?? "")),
            )
            .slice(0, 3),
        );
        setPodcasts(
          p
            .filter((x) => x.status === "published")
            .sort((x, y) => (y.episodeNumber ?? 0) - (x.episodeNumber ?? 0))
            .slice(0, 3),
        );
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E8522A]">
          Advocate &amp; Counsel
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-[#0A0F1E] md:text-5xl">
          Where Law Meets Strategy
        </h1>
        <p className="mt-4 max-w-2xl text-[#6B7385]">
          Published analysis, books, and insights from practice at the Bombay High Court and
          Supreme Court of India — updated live from the CMS.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/books"
            className="rounded-md bg-[#E8522A] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#d44724]"
          >
            View books
          </Link>
          <Link
            to="/classic"
            className="rounded-md border border-[rgba(10,15,30,0.15)] px-4 py-2 text-sm font-semibold text-[#0A0F1E] no-underline hover:bg-white"
          >
            Full marketing site
          </Link>
        </div>
      </section>

      {loading && <p className="text-sm text-[#6B7385]">Loading…</p>}
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}. Start the backend (<code>npm run dev</code> in backend/).
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-serif text-2xl font-bold">Recent articles</h2>
              <Link to="/topics" className="text-sm font-semibold text-[#1B4D3E] no-underline">
                All topics →
              </Link>
            </div>
            {articles.length === 0 ? (
              <p className="text-sm text-[#6B7385]">
                No published articles yet. Add them in Admin → Articles (status: published).
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 6).map((a) => (
                  <Link
                    key={a.id}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="block rounded-lg border border-[rgba(10,15,30,0.08)] bg-white p-5 no-underline transition hover:shadow-md"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#E8522A]">
                      {a.category || "Article"}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold text-[#0A0F1E]">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[#6B7385]">{a.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-serif text-2xl font-bold">Latest books</h2>
              <Link to="/books" className="text-sm font-semibold text-[#1B4D3E] no-underline">
                View all →
              </Link>
            </div>
            {books.length === 0 ? (
              <p className="text-sm text-[#6B7385]">
                No published books yet. Add them in Admin → Books (status: published).
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {books.map((b) => (
                  <Link
                    key={b.id}
                    to="/book/$slug"
                    params={{ slug: b.slug }}
                    className="block rounded-lg border border-[rgba(10,15,30,0.08)] bg-white p-5 no-underline transition hover:shadow-md"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#E8522A]">
                      Book
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold text-[#0A0F1E]">{b.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[#6B7385]">{b.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-serif text-2xl font-bold">Latest podcasts</h2>
              <Link to="/podcast" className="text-sm font-semibold text-[#1B4D3E] no-underline">
                View all →
              </Link>
            </div>
            {podcasts.length === 0 ? (
              <p className="text-sm text-[#6B7385]">
                No published podcasts yet. Add them in Admin → Podcasts (status: published).
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {podcasts.map((p) => (
                  <Link
                    key={p.id}
                    to="/podcast/$slug"
                    params={{ slug: p.slug }}
                    className="block rounded-lg border border-[rgba(10,15,30,0.08)] bg-white p-5 no-underline transition hover:shadow-md"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#E8522A]">
                      Podcast Episode {p.episodeNumber ?? "—"}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold text-[#0A0F1E]">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[#6B7385]">
                      {p.summary || p.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {topics.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-2xl font-bold">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <Link
                    key={t.id}
                    to="/topic/$slug"
                    params={{ slug: t.slug }}
                    className="rounded-full border border-[#1B4D3E]/20 bg-[#EAF4F0] px-4 py-1.5 text-sm font-medium text-[#1B4D3E] no-underline hover:bg-[#d4ebe3]"
                  >
                    {t.icon} {t.title}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PublicLayout>
  );
}
