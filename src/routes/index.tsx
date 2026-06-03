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

async function readJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(text.trim().slice(0, 160) || `API error ${res.status}`);
  }
}

async function fetchWritingFromDb(): Promise<{ articles: Record<string, unknown>[]; books: Record<string, unknown>[] }> {
  const res = await fetch("/api/v1/site/writing", { cache: "no-store" });
  const json = await readJsonResponse(res);
  const data = json.data as { articles?: Record<string, unknown>[]; books?: Record<string, unknown>[] } | undefined;
  if (!res.ok || !json.success || !data) {
    const err = json.error;
    throw new Error(typeof err === "string" ? err : `API error ${res.status}`);
  }
  let books = data.books ?? [];
  if (!books.length) {
    const feedRes = await fetch("/api/v1/books/feed", { cache: "no-store" });
    const feedJson = await readJsonResponse(feedRes);
    const feedData = feedJson.data as Record<string, unknown>[] | undefined;
    if (feedRes.ok && feedJson.success && feedData) books = feedData;
  }
  return {
    articles: stripHeavyFields(data.articles ?? []),
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
