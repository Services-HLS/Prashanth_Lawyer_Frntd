import { createFileRoute } from "@tanstack/react-router";

import { ArticlePage } from "@/pages/public/ArticlePage";

export const Route = createFileRoute("/article/$slug")({
  ssr: false,
  head: () => ({ meta: [{ title: "Article | Prasanth Raju" }] }),
  component: ArticleRoute,
});

function ArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticlePage slug={slug} />;
}
