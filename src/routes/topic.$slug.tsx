import { createFileRoute } from "@tanstack/react-router";

import { TopicPage } from "@/pages/public/TopicPage";

export const Route = createFileRoute("/topic/$slug")({
  component: TopicRoute,
});

function TopicRoute() {
  const { slug } = Route.useParams();
  return <TopicPage slug={slug} />;
}
