import { createFileRoute } from "@tanstack/react-router";

import { PodcastPage } from "@/pages/public/PodcastPage";

export const Route = createFileRoute("/podcast/$slug")({
  head: () => ({ meta: [{ title: "Podcast Episode | Prasanth Raju" }] }),
  component: PodcastRoute,
});

function PodcastRoute() {
  const { slug } = Route.useParams();
  return <PodcastPage slug={slug} />;
}

