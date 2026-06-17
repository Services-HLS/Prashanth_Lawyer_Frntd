import { createFileRoute } from "@tanstack/react-router";

import { ReviewsPage } from "../pages/public/ReviewsPage";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Client Reviews | Prasanth Raju" }] }),
  component: ReviewsPage,
});
