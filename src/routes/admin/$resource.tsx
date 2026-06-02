import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { ResourceManager } from "@/admin/components/ResourceManager";
import { getResource } from "@/admin/resources";

const RESERVED = new Set(["admin", "login", "leads", "more"]);

export const Route = createFileRoute("/admin/$resource")({
  ssr: false,
  beforeLoad: ({ params }) => {
    if (RESERVED.has(params.resource)) {
      throw redirect({ to: "/admin/" });
    }
  },
  component: AdminResourcePage,
});

function AdminResourcePage() {
  const { resource: resourceId } = Route.useParams();
  const resource = getResource(resourceId);

  if (!resource) {
    return (
      <div className="admin-card">
        <h1 className="admin-display text-xl font-bold">Unknown section</h1>
        <Link to="/admin/" className="mt-4 inline-block text-[#E8522A]">
          ← Dashboard
        </Link>
      </div>
    );
  }

  return <ResourceManager resource={resource} />;
}
