import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { type Article, type Topic, getAll, getArticlesByTopicSlug } from "@/lib/content-store";

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAll<Topic>("topic"), getAll<Article>("article")])
      .then(([t, a]) => {
        setTopics(t.filter((x) => x.status === "published"));
        setArticles(a.filter((x) => x.status === "published"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <h1 className="font-serif text-3xl font-bold">Topics</h1>
      <p className="mt-2 text-[#6B7385]">Browse by subject area.</p>
      {loading && <p className="mt-8 text-sm">Loading…</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => {
          const count = getArticlesByTopicSlug(articles, t.slug).length || t.articleCount || 0;
          return (
            <Link
              key={t.id}
              to="/topic/$slug"
              params={{ slug: t.slug }}
              className="rounded-lg border border-[rgba(10,15,30,0.08)] bg-white p-5 no-underline hover:shadow-md"
            >
              <span className="text-2xl">{t.icon || "📌"}</span>
              <h2 className="mt-2 font-serif text-lg font-bold text-[#0A0F1E]">{t.title}</h2>
              <p className="mt-1 text-sm text-[#6B7385]">{count} article(s)</p>
            </Link>
          );
        })}
      </div>
    </PublicLayout>
  );
}
