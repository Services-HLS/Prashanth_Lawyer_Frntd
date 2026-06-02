import { createFileRoute } from "@tanstack/react-router";

import { BookPage } from "@/pages/public/BookPage";

export const Route = createFileRoute("/book/$slug")({
  ssr: false,
  head: () => ({ meta: [{ title: "Book | Prasanth Raju" }] }),
  component: BookRoute,
});

function BookRoute() {
  const { slug } = Route.useParams();
  return <BookPage slug={slug} />;
}
