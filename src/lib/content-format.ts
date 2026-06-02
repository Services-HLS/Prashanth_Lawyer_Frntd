import { formatBookBodyHtml, formatBookCardSummary } from "./book-format";
import { rowStr, type ApiRow } from "./public-api";

const METADATA_RE = /<!--\s*METADATA_START([\s\S]*?)-->\s*$/i;

function stripMetadata(html: string): string {
  return html.replace(METADATA_RE, "").trim();
}

/** Strip HTML tags to plain text */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Detect table-of-contents / section-outline junk (not real article prose) */
export function isOutlineOrToc(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return false;
  if (/^table of contents$/i.test(t)) return true;
  if (/table of contents/i.test(t.slice(0, 80)) && t.length < 500) return true;

  const lines = t
    .split(/(?:\n|(?<=[.!?])\s+)|(?=\d+\.\s)/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length >= 4) {
    const outlineLike = lines.filter(
      (l) =>
        l.length < 90 &&
        (/^\d+\.\s/.test(l) ||
          /^meaning of\b/i.test(l) ||
          /^section\b/i.test(l) ||
          /^chapter\b/i.test(l) ||
          /^part\b/i.test(l) ||
          /^appendix\b/i.test(l)),
    );
    if (outlineLike.length >= 3) return true;
  }

  if ((t.match(/\bmeaning of\b/gi) || []).length >= 2) return true;
  if ((t.match(/\bsection\s+\d+/gi) || []).length >= 2) return true;

  return false;
}

function isOutlineLine(line: string): boolean {
  const l = line.trim();
  if (!l || l.length < 3) return true;
  if (/^table of contents$/i.test(l)) return true;
  if (/^contents$/i.test(l)) return true;
  if (/^\d+\.\s/.test(l) && l.length < 100 && !/[.!?]$/.test(l)) return true;
  if (/^meaning of\b/i.test(l) && l.length < 120) return true;
  return isOutlineOrToc(l);
}

function normalizedHeadingText(line: string): string {
  return line
    .trim()
    .replace(/^#{1,6}\s+/, "")
    .replace(/^\d+[\.)]\s+/, "")
    .replace(/^section\s+\d+\s*[:.-]?\s*/i, "Section ")
    .replace(/\s+/g, " ");
}

function detectSectionHeading(line: string): string | null {
  const raw = line.trim();
  if (!raw) return null;
  const text = normalizedHeadingText(raw);
  if (!text || text.length > 100) return null;

  if (/^[A-Z][\w\s,&/()-]{2,80}$/.test(text) && !/[.!?]$/.test(text)) {
    if (
      /^(introduction|background|analysis|conclusion|references|bibliography|facts|issues|arguments?|discussion|key takeaways?)$/i.test(
        text,
      )
    ) {
      return text;
    }
  }

  if (/^#{1,6}\s+/.test(raw)) return text;
  if (/^section\s+\d+[:.\s-]/i.test(raw)) return text;
  if (
    /^(introduction|background|analysis|conclusion|references|bibliography|facts|issues|arguments?|discussion|key takeaways?)\s*[:.-]?$/i.test(
      raw,
    )
  ) {
    return text;
  }

  return null;
}

/** First readable paragraph from HTML or plain text */
export function firstReadableParagraph(htmlOrText: string, minLen = 60): string {
  const raw = htmlOrText.replace(METADATA_RE, "").trim();
  if (!raw) return "";

  if (raw.includes("<p")) {
    const parts = raw.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    for (const part of parts) {
      const text = stripHtml(part).trim();
      if (text.length >= minLen && !isOutlineLine(text)) return text;
    }
  }

  const plain = stripHtml(raw);
  const chunks = plain.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.length >= minLen && !isOutlineLine(chunk)) return chunk;
  }

  if (plain.length >= minLen && !isOutlineOrToc(plain)) {
    const sentence = plain.match(/[^.!?]+[.!?]+/)?.[0]?.trim();
    if (sentence && sentence.length >= 40) return sentence;
  }

  return "";
}

/** Short summary for cards and lead line */
export function formatSummary(row: ApiRow, maxLen = 220): string {
  const desc = rowStr(row, "description");
  const content = rowStr(row, "content");

  let text = "";
  if (desc && !isOutlineOrToc(stripHtml(desc))) {
    text = stripHtml(desc);
  } else {
    text = firstReadableParagraph(content, 50);
  }
  if (!text && desc) text = stripHtml(desc);
  if (!text) text = firstReadableParagraph(content, 40);

  text = text.replace(/\s+/g, " ").trim();
  if (text.length > maxLen) {
    text = text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
  }
  return text;
}

function splitPlainIntoParagraphs(text: string): string[] {
  const cleaned = text.replace(METADATA_RE, "").trim();
  if (!cleaned) return [];

  let parts = cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1 && cleaned.length > 200) {
    parts = cleaned
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .reduce<string[]>((acc, sentence) => {
        const s = sentence.trim();
        if (!s) return acc;
        if (acc.length === 0) {
          acc.push(s);
          return acc;
        }
        const last = acc[acc.length - 1];
        if (last.length < 320) {
          acc[acc.length - 1] = `${last} ${s}`;
        } else {
          acc.push(s);
        }
        return acc;
      }, []);
  }

  return parts.filter((p) => p.length >= 40 && !isOutlineLine(p));
}

function plainTextToHtml(text: string): string {
  const cleaned = text.replace(METADATA_RE, "").trim();
  if (!cleaned) return "";

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return "";

  const out: string[] = [];
  let paragraph = "";

  const flushParagraph = () => {
    const p = paragraph.replace(/\s+/g, " ").trim();
    paragraph = "";
    if (!p || p.length < 20 || isOutlineLine(p)) return;
    out.push(`<p>${escapeHtml(p)}</p>`);
  };

  for (const line of lines) {
    const heading = detectSectionHeading(line);
    if (heading) {
      flushParagraph();
      out.push(`<h2>${escapeHtml(heading)}</h2>`);
      continue;
    }
    paragraph = paragraph ? `${paragraph} ${line}` : line;
  }
  flushParagraph();

  if (out.length) return out.join("\n");

  const paragraphs = splitPlainIntoParagraphs(text);
  if (!paragraphs.length) return "";
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
}

function filterHtmlParagraphs(html: string): string {
  const parts = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  if (!parts.length) return html;

  const kept = parts
    .map((part) => {
      const text = stripHtml(part).trim();
      const heading = detectSectionHeading(text);
      if (heading) return `<h2>${escapeHtml(heading)}</h2>`;
      return part;
    })
    .filter((part) => {
    const text = stripHtml(part).trim();
    if (!text) return false;
    return !isOutlineLine(text);
  });

  if (!kept.length) return "";
  return kept.join("\n");
}

function normalizeHeadings(html: string): string {
  return html
    .replace(/<h1[^>]*>/gi, "<h2>")
    .replace(/<\/h1>/gi, "</h2>");
}

/** Full article body HTML for detail page */
export function formatArticleBodyHtml(content: string): string {
  let raw = stripMetadata(content);
  if (!raw) return "";

  if (raw.includes("<p") || raw.includes("<h")) {
    const filtered = filterHtmlParagraphs(raw);
    if (filtered) return normalizeHeadings(filtered);
  }

  const asHtml = plainTextToHtml(raw);
  if (asHtml) return asHtml;

  const filtered = filterHtmlParagraphs(raw);
  return filtered ? normalizeHeadings(filtered) : "";
}

export function normalizeArticleForDisplay(row: ApiRow): ApiRow {
  const content = rowStr(row, "content");
  const summary = formatSummary(row);
  const body = formatArticleBodyHtml(content);

  const next: ApiRow = { ...row };
  if (summary) next.description = summary;
  else if (isOutlineOrToc(stripHtml(rowStr(row, "description")))) {
    next.description = "";
  }
  if (body) next.content = body;
  return next;
}

export function normalizeBookForDisplay(row: ApiRow): ApiRow {
  const raw = rowStr(row, "description");
  const next: ApiRow = { ...row };

  if (raw.includes("book-publication")) {
    if (rowStr(row, "excerpt")) next.excerpt = rowStr(row, "excerpt");
    else {
      const excerpt = formatBookCardSummary(raw);
      if (excerpt) next.excerpt = excerpt;
    }
    return next;
  }

  const excerpt = rowStr(row, "excerpt") || formatBookCardSummary(raw);
  const body = formatBookBodyHtml(raw);
  if (excerpt) next.excerpt = excerpt;
  if (body) next.description = body;
  return next;
}
