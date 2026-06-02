import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/pages/public/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About | Prasanth Raju" }] }),
  component: AboutPage,
});
