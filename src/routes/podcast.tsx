import { createFileRoute } from "@tanstack/react-router";

import { PodcastsPage } from "@/pages/public/PodcastsPage";

export const Route = createFileRoute("/podcast")({
  head: () => ({ meta: [{ title: "Podcast | Prasanth Raju" }] }),
  component: PodcastsPage,
});
