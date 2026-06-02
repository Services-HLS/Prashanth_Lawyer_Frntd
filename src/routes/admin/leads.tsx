import { createFileRoute } from "@tanstack/react-router";

import { LeadsManager } from "@/admin/components/LeadsManager";

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  return <LeadsManager />;
}
