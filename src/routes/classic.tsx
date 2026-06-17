import { createFileRoute } from "@tanstack/react-router";

/** Full marketing site (site.html) — CMS sections load articles/books from API */
export const Route = createFileRoute("/classic")({
  head: () => ({
    meta: [{ title: "Prasanth Raju | Full site" }],
  }),
  component: ClassicSite,
});

function ClassicSite() {
  return (
    <iframe
      src="/site.html?v=7"
      title="Prasanth Raju — Full site"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
