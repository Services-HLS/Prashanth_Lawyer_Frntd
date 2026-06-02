import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/public/PublicLayout";
import { type Book, getAll } from "@/lib/content-store";

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAll<Book>("book")
      .then((list) => setBooks(list.filter((b) => b.status === "published")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <h1 className="font-serif text-3xl font-bold">Books</h1>
      <p className="mt-2 text-[#6B7385]">Publications managed in Admin → Books.</p>
      {loading && <p className="mt-8 text-sm">Loading…</p>}
      {!loading && books.length === 0 && (
        <p className="mt-8 text-sm text-[#6B7385]">No published books yet.</p>
      )}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {books.map((b) => (
          <div
            key={b.id}
            className="flex gap-4 rounded-lg border border-[rgba(10,15,30,0.08)] bg-white p-5"
          >
            {b.coverImage && (
              <img
                src={b.coverImage}
                alt=""
                className="h-32 w-24 shrink-0 rounded object-cover"
              />
            )}
            <div>
              <h2 className="font-serif text-xl font-bold">{b.title}</h2>
              {b.author && <p className="text-sm text-[#6B7385]">{b.author}</p>}
              <p className="mt-2 text-sm">{b.description}</p>
              {b.buyLink && (
                <a
                  href={b.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-[#E8522A] no-underline"
                >
                  View / buy →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
