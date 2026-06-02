import { createFileRoute } from "@tanstack/react-router";

import { TopicsPage } from "@/pages/public/TopicsPage";

export const Route = createFileRoute("/topics")({
  head: () => ({ meta: [{ title: "Topics | Prasanth Raju" }] }),
  component: TopicsPage,
});
