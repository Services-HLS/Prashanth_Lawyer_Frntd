import { useEffect, useState } from "react";

import { BookCard } from "@/components/public/BookCard";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchPublishedBooks } from "@/lib/books-api";
import { rowStr, type ApiRow } from "@/lib/public-api";

import "@/styles/writing-archive.css";

export function BooksPage() {
  const [books, setBooks] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedBooks()
      .then(setBooks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="writing-archive">
        <h1 className="writing-archive-title">Books</h1>
        <p className="writing-archive-intro">Publications managed in Admin → Books.</p>

        {loading && <p className="writing-archive-status">Loading…</p>}
        {error && <p className="writing-archive-error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="writing-archive-empty">No published books yet.</p>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="writing-archive-grid writing-archive-grid--books mt-8">
            {books.map((book) => (
              <BookCard key={rowStr(book, "id") || rowStr(book, "slug")} row={book} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
