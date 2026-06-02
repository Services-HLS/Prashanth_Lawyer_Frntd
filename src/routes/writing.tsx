import { createFileRoute } from "@tanstack/react-router";

import { WritingArchivePage } from "@/pages/public/WritingArchivePage";

export const Route = createFileRoute("/writing")({
  ssr: false,
  head: () => ({
    meta: [
      {
        title: "Published Work & Analysis | Prasanth Raju",
      },
      {
        name: "description",
        content: "All published articles and books by Prasanth Raju.",
      },
    ],
  }),
  component: WritingArchivePage,
});
