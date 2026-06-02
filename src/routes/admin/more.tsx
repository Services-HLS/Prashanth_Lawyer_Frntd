import { createFileRoute, Link } from "@tanstack/react-router";

import { getAdvancedResources } from "@/admin/resources";

export const Route = createFileRoute("/admin/more")({
  ssr: false,
  component: AdminMorePage,
});

function AdminMorePage() {
  const advanced = getAdvancedResources();

  return (
    <div className="max-w-3xl">
      <Link to="/admin/" className="text-sm font-semibold text-[#6B7385] no-underline hover:text-[#E8522A]">
        ← Back
      </Link>
      <h1 className="admin-display mt-4 text-2xl font-bold">More site sections</h1>
      <p className="mt-2 text-sm text-[#6B7385]">
        Optional homepage blocks — practice areas, testimonials, contact info, etc.
      </p>

      <ul className="mt-6 space-y-2">
        {advanced.map((r) => (
          <li key={r.id}>
            <Link
              to="/admin/$resource"
              params={{ resource: r.id }}
              className="admin-card flex items-center justify-between no-underline"
            >
              <span className="font-semibold text-[#0A0F1E]">{r.label}</span>
              <span className="text-sm text-[#E8522A]">Edit →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
