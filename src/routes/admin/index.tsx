import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { checkHealth } from "@/admin/api";
import { getPrimaryResources } from "@/admin/resources";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminDashboard,
});

function AdminDashboard() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    retry: 1,
  });

  const primary = getPrimaryResources();

  return (
    <div className="max-w-3xl">
      <h1 className="admin-display mb-2 text-3xl font-bold">Admin</h1>
      <p className="mb-6 text-sm text-[#6B7385]">
        Add articles and books, upload images, set status to <strong>Published</strong>, then refresh
        the website.
      </p>

      <div
        className={`admin-card mb-6 text-sm ${
          health.data?.database === "up"
            ? "border-[#1B4D3E]/30 bg-[#EAF4F0]"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        Database:{" "}
        {health.isLoading
          ? "Checking…"
          : health.data?.database === "up"
            ? "Connected"
            : "Offline — start backend (npm start in backend folder)"}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {primary.map((r) => (
          <Link
            key={r.id}
            to="/admin/$resource"
            params={{ resource: r.id }}
            className="admin-card block no-underline transition hover:shadow-md"
          >
            <h2 className="admin-display text-xl font-bold text-[#0A0F1E]">{r.label}</h2>
            <p className="mt-2 text-xs text-[#6B7385]">{r.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#E8522A]">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-coral inline-block no-underline"
        >
          Preview website
        </a>
        <Link to="/admin/leads" className="admin-btn-ghost inline-block no-underline">
          View messages
        </Link>
        <Link to="/admin/more" className="admin-btn-ghost inline-block no-underline">
          More site sections
        </Link>
      </div>
    </div>
  );
}
