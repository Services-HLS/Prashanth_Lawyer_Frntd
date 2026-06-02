import { createFileRoute } from "@tanstack/react-router";

import { BooksPage } from "@/pages/public/BooksPage";

export const Route = createFileRoute("/books")({
  head: () => ({ meta: [{ title: "Books | Prasanth Raju" }] }),
  component: BooksPage,
});
