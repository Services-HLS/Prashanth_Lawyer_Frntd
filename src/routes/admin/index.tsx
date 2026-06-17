import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { checkHealth, adminFetch } from "@/admin/api";
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

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminFetch<any[]>("/reviews/admin"),
  });

  const primary = getPrimaryResources();
  const hasPending = reviewsQuery.data?.some((r: any) => r.status === "pending") ?? false;

  return (
    <div className="max-w-4xl">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes adminPulse {
          0%, 100% { 
            border-color: #E8522A; 
            box-shadow: 0 4px 20px rgba(232, 82, 42, 0.12);
          }
          50% { 
            border-color: rgba(232, 82, 42, 0.3); 
            box-shadow: 0 4px 6px rgba(232, 82, 42, 0.03);
          }
        }
        .admin-box-pulse {
          animation: adminPulse 1.8s ease-in-out infinite;
        }
      `}} />

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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {primary.map((r) => {
          const isReviews = r.id === "reviews";
          const highlight = isReviews && hasPending;

          return (
            <Link
              key={r.id}
              to="/admin/$resource"
              params={{ resource: r.id }}
              className={`admin-card block no-underline transition hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                highlight
                  ? "bg-[#FEF6F4] border-2 border-[#E8522A] admin-box-pulse"
                  : "border-[rgba(10,15,30,0.08)] bg-white"
              }`}
              style={{ minHeight: "150px" }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="admin-display text-xl font-bold text-[#0A0F1E]">{r.label}</h2>
                  {highlight && (
                    <span className="flex h-2 w-2 relative mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8522A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8522A]"></span>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-[#6B7385]">{r.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#E8522A]">
                  Open →
                </span>
                {highlight && (
                  <span className="text-[10px] font-bold text-[#E8522A] uppercase tracking-wide">
                    New Review
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
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
