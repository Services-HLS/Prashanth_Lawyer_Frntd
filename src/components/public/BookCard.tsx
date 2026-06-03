import { Link } from "@tanstack/react-router";

import { bookCardExcerpt } from "@/lib/books-api";
import { formatPublishDate, resolveBookCover, rowStr, type ApiRow } from "@/lib/public-api";

import "@/styles/writing-archive.css";

type BookCardProps = {
  row: ApiRow;
  ctaLabel?: string;
};

export function BookCard({ row, ctaLabel = "View book →" }: BookCardProps) {
  const slug = rowStr(row, "slug");
  const cover = resolveBookCover(row);
  const excerpt = bookCardExcerpt(row);
  const date = rowStr(row, "publication_date");
  const author = rowStr(row, "author") || rowStr(row, "publisher") || "Prasanth Raju";
  const buyLink = rowStr(row, "buy_link");
  const label = buyLink ? "View / buy →" : ctaLabel;

  return (
    <Link
      to="/book/$slug"
      params={{ slug }}
      className={`writing-archive-card${cover ? " with-image" : ""}`}
      data-cat="book"
    >
      {cover && (
        <div className="writing-archive-card-thumb">
          <img src={cover} alt={rowStr(row, "title")} loading="lazy" decoding="async" />
        </div>
      )}
      <div className="writing-archive-card-body">
        <span className="writing-archive-tag guide">
          Book{date ? ` · ${formatPublishDate(date)}` : ""}
        </span>
        <h3 className="writing-archive-card-title">{rowStr(row, "title")}</h3>
        <p className="text-sm text-[#6B7385]">{author}</p>
        {excerpt && <p className="writing-archive-card-excerpt">{excerpt}</p>}
        <span className="writing-archive-card-cta">{label}</span>
      </div>
    </Link>
  );
}
