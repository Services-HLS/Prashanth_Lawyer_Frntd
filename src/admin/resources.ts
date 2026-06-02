export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "datetime"
  | "json"
  | "checkbox"
  | "image"
  | "gallery";

export type FieldSection = "main" | "media" | "more";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  section?: FieldSection;
  hidden?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

export type AdminTier = "primary" | "advanced";

export type AdminResource = {
  id: string;
  label: string;
  endpoint: string;
  description: string;
  tier?: AdminTier;
  siteSection?: string;
  listColumn: string;
  fields: FieldDef[];
};

const statusField: FieldDef = {
  name: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ],
};

const titleField: FieldDef = {
  name: "title",
  label: "Title",
  type: "text",
  section: "main",
  required: true,
  placeholder: "Clear legal title (issue + context + jurisdiction)",
};

const slugHidden: FieldDef = {
  name: "slug",
  label: "Slug",
  type: "text",
  hidden: true,
};

export const ADMIN_RESOURCES: AdminResource[] = [
  {
    id: "articles",
    label: "Articles",
    endpoint: "articles",
    tier: "primary",
    description: "Homepage → Published Work & Analysis",
    siteSection: "#writing",
    listColumn: "title",
    fields: [
      { ...statusField, section: "main" },
      titleField,
      slugHidden,
      {
        name: "type",
        label: "Type",
        type: "select",
        hidden: true,
        options: [
          { value: "article", label: "Article" },
          { value: "legal_opinion", label: "Legal opinion" },
          { value: "guide", label: "Guide" },
        ],
      },
      {
        name: "description",
        label: "Abstract / short summary",
        type: "textarea",
        section: "main",
        rows: 4,
        placeholder:
          "120-180 words.\nContext + legal issue + core argument + practical takeaway.\nDo not paste table of contents here.",
      },
      {
        name: "content",
        label: "Article text",
        type: "textarea",
        section: "main",
        rows: 16,
        placeholder:
          "Introduction\n- Legal issue and scope\n- Why it matters now\n\nBackground\n- Statutory framework\n- Key precedents\n\nAnalysis\n- Arguments and counterarguments\n- Practical implications\n\nConclusion\n- Final position\n- Action points for readers\n\nReferences / authorities",
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        section: "main",
        placeholder: "e.g. Business of Law",
      },
      {
        name: "author",
        label: "Author",
        type: "text",
        section: "main",
        placeholder: "Author name as it should appear publicly",
      },
      { name: "featured_image", label: "Main image", type: "image", section: "media" },
      { name: "gallery_images", label: "More images", type: "gallery", section: "media" },
      { name: "publish_date", label: "Publish date", type: "datetime", section: "more" },
      { name: "pdf_url", label: "PDF link", type: "text", section: "more" },
      {
        name: "tags",
        label: "Keywords / tags",
        type: "text",
        section: "more",
        placeholder: "arbitration, section 34, limitation, consumer law",
      },
    ],
  },
  {
    id: "books",
    label: "Books",
    endpoint: "books",
    tier: "primary",
    description: "Homepage → Books section",
    siteSection: "#writing",
    listColumn: "title",
    fields: [
      { ...statusField, section: "main" },
      titleField,
      slugHidden,
      { name: "type", label: "Type", type: "text", hidden: true },
      {
        name: "description",
        label: "Book publication content",
        type: "textarea",
        section: "main",
        rows: 18,
        placeholder:
          "Table of Contents\n1. Chapter 1\n2. Chapter 2\n3. Chapter 3\n\nPart 1: Foundations\nChapter 1: Overview\nWrite 2–3 lines of prose here. Explain the chapter’s goal and scope.\n- Key point one\n- Key point two\n\nChapter 2: Core legal concepts\nWrite your analysis in paragraphs (plain text or lines). Use bullets for points.\n- Practical takeaway 1\n- Practical takeaway 2\n\nPart 2: Practice\nChapter 3: Application\nExplain how the concepts are applied in real situations.\n- Litigation strategy\n- Drafting guidance\n\nReferences / Bibliography\n- Cases: (optional list)\n- Statutes: (optional list)\n- Secondary sources: (optional list)",
      },
      {
        name: "author",
        label: "Author",
        type: "text",
        section: "main",
        placeholder: "Primary author / editor",
      },
      { name: "cover_image", label: "Cover image", type: "image", section: "media" },
      { name: "buy_link", label: "Buy / view link", type: "text", section: "more" },
      { name: "publication_date", label: "Publication date", type: "date", section: "more" },
      {
        name: "publisher",
        label: "Publisher",
        type: "text",
        section: "more",
        placeholder: "Publishing house / imprint",
      },
      { name: "isbn", label: "ISBN", type: "text", section: "more" },
    ],
  },
  {
    id: "podcasts",
    label: "Podcasts",
    endpoint: "podcasts",
    tier: "primary",
    description: "Podcast episodes on the site",
    siteSection: "#podcasts",
    listColumn: "title",
    fields: [
      { ...statusField, section: "main" },
      titleField,
      slugHidden,
      { name: "type", label: "Type", type: "text", hidden: true },
      {
        name: "summary",
        label: "Summary",
        type: "textarea",
        section: "main",
        rows: 3,
        placeholder: "Short 2-4 line summary visible on cards and previews.",
      },
      {
        name: "description",
        label: "Episode notes / full description",
        type: "textarea",
        section: "main",
        rows: 6,
        placeholder: "Detailed explanation, key points, and discussion highlights.",
      },
      { name: "audio_url", label: "Audio URL", type: "text", section: "media" },
      { name: "video_url", label: "Video URL", type: "text", section: "media" },
      { name: "duration", label: "Duration", type: "text", section: "main", placeholder: "42:00" },
      { name: "guest_name", label: "Guest", type: "text", section: "main" },
      { name: "cover_image", label: "Cover image", type: "image", section: "media" },
      { name: "episode_number", label: "Episode number", type: "number", section: "more" },
      { name: "platform_links", label: "Platform links (advanced)", type: "json", section: "more", rows: 3 },
    ],
  },
  {
    id: "topics",
    label: "Topics",
    endpoint: "topics",
    tier: "advanced",
    description: "Writing categories / taxonomy",
    listColumn: "title",
    fields: [
      titleField,
      slugHidden,
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "icon", label: "Icon", type: "text", placeholder: "📌" },
      {
        name: "topic_kind",
        label: "Kind",
        type: "select",
        options: [
          { value: "writing_category", label: "Writing category" },
          { value: "practice_area", label: "Practice area" },
        ],
      },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "about",
    label: "About",
    endpoint: "about",
    tier: "advanced",
    description: "About page content",
    siteSection: "#about",
    listColumn: "title",
    fields: [
      titleField,
      slugHidden,
      { name: "description", label: "Short description", type: "textarea", rows: 2 },
      { name: "content", label: "HTML content", type: "textarea", rows: 10 },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea", rows: 2 },
      { name: "hero_json", label: "Hero JSON", type: "json", rows: 4 },
      { name: "recognitions", label: "Recognitions (JSON array)", type: "json", rows: 4 },
      statusField,
    ],
  },
  {
    id: "practice-areas",
    label: "Practice areas",
    endpoint: "practice-areas",
    tier: "advanced",
    description: "Practice cards on homepage",
    siteSection: "#practice",
    listColumn: "title",
    fields: [
      titleField,
      slugHidden,
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "icon", label: "Icon", type: "text" },
      { name: "card_number", label: "Card number", type: "text", placeholder: "01" },
      { name: "sub_tags", label: "Sub-tags (JSON array)", type: "json", rows: 3 },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    endpoint: "timeline",
    tier: "advanced",
    description: "Career timeline (about & credentials)",
    siteSection: "#about, #credentials",
    listColumn: "title",
    fields: [
      {
        name: "section",
        label: "Section",
        type: "select",
        options: [
          { value: "about", label: "About" },
          { value: "credentials", label: "Credentials" },
        ],
      },
      { name: "year_label", label: "Year", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "textarea", rows: 2 },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "memberships",
    label: "Memberships",
    endpoint: "memberships",
    tier: "advanced",
    description: "Credentials memberships grid",
    siteSection: "#credentials",
    listColumn: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "speaking-events",
    label: "Speaking events",
    endpoint: "speaking-events",
    tier: "advanced",
    description: "Events on speaking section",
    siteSection: "#speaking",
    listColumn: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "event_date", label: "Event date", type: "date" },
      { name: "month_label", label: "Month label", type: "text", placeholder: "May" },
      { name: "day_label", label: "Day label", type: "text", placeholder: "12" },
      {
        name: "event_type",
        label: "Type",
        type: "select",
        options: [
          { value: "seminar", label: "Seminar" },
          { value: "panel", label: "Panel" },
          { value: "moot", label: "Moot" },
          { value: "talk", label: "Talk" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "venue", label: "Venue", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "collaboration-services",
    label: "Collaboration",
    endpoint: "collaboration-services",
    tier: "advanced",
    description: "Work with Prasanth cards",
    siteSection: "#speaking",
    listColumn: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "icon", label: "Icon", type: "text" },
      { name: "cta_label", label: "CTA label", type: "text" },
      { name: "cta_target", label: "CTA target", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "resources",
    label: "Free resources",
    endpoint: "resources",
    tier: "advanced",
    description: "Downloadable guides",
    siteSection: "#resources",
    listColumn: "title",
    fields: [
      titleField,
      slugHidden,
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      {
        name: "resource_type",
        label: "Type",
        type: "select",
        options: [
          { value: "checklist", label: "Checklist" },
          { value: "guide", label: "Guide" },
          { value: "explainer", label: "Explainer" },
          { value: "template", label: "Template" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "icon", label: "Icon", type: "text" },
      { name: "file_url", label: "File URL", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    endpoint: "testimonials",
    tier: "advanced",
    description: "Client testimonials",
    siteSection: "#testimonials",
    listColumn: "author_name",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
      { name: "author_initials", label: "Initials", type: "text" },
      { name: "author_name", label: "Name", type: "text" },
      { name: "author_role", label: "Role", type: "text" },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "ticker",
    label: "Ticker",
    endpoint: "ticker",
    tier: "advanced",
    description: "Scrolling credentials bar",
    listColumn: "label",
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "highlight_text", label: "Highlight text", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ],
  },
  {
    id: "publications",
    label: "Publications bar",
    endpoint: "publications",
    tier: "advanced",
    description: "Featured & published in logos",
    listColumn: "name",
    fields: [
      {
        name: "name",
        label: "Publication name",
        type: "text",
        required: true,
        placeholder: "Oxford Business Law Blog / SCC Online / Bar & Bench",
      },
      {
        name: "url",
        label: "Publication URL",
        type: "text",
        placeholder: "https://...",
      },
      { name: "logo_url", label: "Logo", type: "image" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ],
  },
  {
    id: "contact-details",
    label: "Contact details",
    endpoint: "contact-details",
    tier: "advanced",
    description: "Contact section info rows",
    siteSection: "#contact",
    listColumn: "label",
    fields: [
      { name: "icon", label: "Icon", type: "text" },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "value", label: "Value", type: "textarea", rows: 2 },
      { name: "link_url", label: "Link URL", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
  {
    id: "social-links",
    label: "Social links",
    endpoint: "social-links",
    tier: "advanced",
    description: "Footer & contact social icons",
    listColumn: "platform",
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true },
      { name: "label", label: "Label", type: "text" },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "sort_order", label: "Sort order", type: "number" },
      statusField,
    ],
  },
];

export function getResource(id: string): AdminResource | undefined {
  return ADMIN_RESOURCES.find((r) => r.id === id);
}

export function getPrimaryResources(): AdminResource[] {
  return ADMIN_RESOURCES.filter((r) => r.tier !== "advanced");
}

export function getAdvancedResources(): AdminResource[] {
  return ADMIN_RESOURCES.filter((r) => r.tier === "advanced");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
