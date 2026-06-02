import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { type About, getAll } from "@/lib/content-store";

export function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    getAll<About>("about").then((list) => {
      const published = list.find((a) => a.status === "published");
      setAbout(published ?? list[0] ?? null);
    });
  }, []);

  return (
    <PublicLayout>
      <h1 className="font-serif text-3xl font-bold">About Prasanth Raju</h1>
      <p className="mt-2 text-[#6B7385]">
        Advocate &amp; Counsel · Bombay High Court &amp; Supreme Court of India
      </p>
      {about?.content ? (
        <article
          className="prose prose-neutral mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: about.content }}
        />
      ) : (
        <div className="mt-8 space-y-4 text-[#6B7385]">
          <p>
            Engineer, IIM MBA, and advocate with twelve years of pre-law business experience
            across technology, venture capital, and strategy.
          </p>
          <p>
            Edit this page in <strong>Admin → About</strong> (status: published) to replace this
            placeholder with CMS content.
          </p>
        </div>
      )}
    </PublicLayout>
  );
}
