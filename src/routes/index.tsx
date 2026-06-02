import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Prasanth Raju | Advocate & Counsel | Bombay High Court & Supreme Court of India" },
      {
        name: "description",
        content:
          "Prasanth Raju — Advocate & Counsel practising at the Bombay High Court and Supreme Court of India.",
      },
      { property: "og:title", content: "Prasanth Raju | Advocate & Counsel" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

type WritingPayload = {
  type: "CMS_WRITING";
  articles: Record<string, unknown>[];
  books: Record<string, unknown>[];
};

function stripHeavyFields(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const { cover_image: _c, content: _t, ...rest } = row;
    return rest;
  });
}

async function fetchWritingFromDb(): Promise<{ articles: Record<string, unknown>[]; books: Record<string, unknown>[] }> {
  const res = await fetch("/api/v1/site/writing", { cache: "no-store" });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { articles?: Record<string, unknown>[]; books?: Record<string, unknown>[] };
    error?: string;
  };
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `API error ${res.status}`);
  }
  let books = json.data.books ?? [];
  if (!books.length) {
    const feedRes = await fetch("/api/v1/books/feed", { cache: "no-store" });
    const feedJson = (await feedRes.json()) as { success?: boolean; data?: Record<string, unknown>[] };
    if (feedRes.ok && feedJson.success && feedJson.data) books = feedJson.data;
  }
  return {
    articles: stripHeavyFields(json.data.articles ?? []),
    books: stripHeavyFields(books),
  };
}

function Index() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const injectWriting = useCallback(async () => {
    try {
      const { articles, books } = await fetchWritingFromDb();
      const win = iframeRef.current?.contentWindow;
      if (!win) return;

      const payload: WritingPayload = { type: "CMS_WRITING", articles, books };
      win.postMessage(payload, "*");

      const framed = win as Window & {
        cmsRenderWriting?: (a: Record<string, unknown>[], b: Record<string, unknown>[]) => void;
        loadWritingFromMysql?: () => void;
      };
      if (typeof framed.cmsRenderWriting === "function") {
        framed.cmsRenderWriting(articles, books);
      }
    } catch (err) {
      console.error("Failed to load writing section from database:", err);
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/site.html"
      title="Prasanth Raju — Advocate & Counsel"
      onLoad={() => {
        void injectWriting();
        setTimeout(() => void injectWriting(), 800);
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        margin: 0,
        padding: 0,
      }}
    />
  );
}
