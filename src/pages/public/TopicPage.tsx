import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import {
  type Article,
  type Topic,
  getAll,
  getArticlesByTopicSlug,
  getBySlug,
} from "@/lib/content-store";

export function TopicPage({ slug }: { slug: string }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBySlug<Topic>("topic", slug), getAll<Article>("article")])
      .then(([t, all]) => {
        setTopic(t);
        setArticles(getArticlesByTopicSlug(all, slug));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <p className="text-sm text-[#6B7385]">Loading…</p>
      </PublicLayout>
    );
  }

  if (!topic) {
    return (
      <PublicLayout>
        <h1 className="font-serif text-2xl font-bold">Topic not found</h1>
        <Link to="/topics" className="mt-4 inline-block text-[#E8522A] no-underline">
          ← Topics
        </Link>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Link to="/topics" className="text-sm font-semibold text-[#1B4D3E] no-underline">
        ← Topics
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">
        {topic.icon} {topic.title}
      </h1>
      {topic.description && <p className="mt-2 text-[#6B7385]">{topic.description}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.id}
            to="/article/$slug"
            params={{ slug: a.slug }}
            className="block rounded-lg border bg-white p-4 no-underline hover:shadow-md"
          >
            <h2 className="font-serif text-lg font-bold">{a.title}</h2>
            <p className="mt-1 text-sm text-[#6B7385] line-clamp-2">{a.description}</p>
          </Link>
        ))}
      </div>
      {articles.length === 0 && (
        <p className="mt-8 text-sm text-[#6B7385]">No articles for this topic yet.</p>
      )}
    </PublicLayout>
  );
}
