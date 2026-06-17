import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { adminFetch } from "../api";

export function ReviewsManager() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminFetch<any[]>("/reviews/admin"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return adminFetch(`/reviews/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Review status updated to: ${variables.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update review status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/reviews/admin/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted review successfully");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reviews = reviewsQuery.data ?? [];

  // Filter reviews based on user selection
  const filteredReviews = reviews.filter((r) => {
    // 1. Status Filter
    if (statusFilter !== "all" && r.status !== statusFilter) {
      return false;
    }

    // 2. Date Filter
    if (datePreset === "all") {
      return true;
    }

    if (!r.created_at) {
      return false; // If no date and filtering by date, exclude
    }

    const reviewDate = new Date(r.created_at);
    const now = new Date();

    if (datePreset === "today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return reviewDate >= startOfToday;
    } 
    
    if (datePreset === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return reviewDate >= sevenDaysAgo;
    } 
    
    if (datePreset === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return reviewDate >= thirtyDaysAgo;
    } 
    
    if (datePreset === "custom") {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (reviewDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (reviewDate > end) return false;
      }
      return true;
    }

    return true;
  });

  return (
    <div className="max-w-4xl">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes adminPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .admin-pulse {
          animation: adminPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />

      <Link to="/admin" className="text-sm font-semibold text-[#6B7385] no-underline hover:text-[#E8522A]">
        ← Back
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="admin-display text-2xl font-bold">Reviews Moderation</h1>
        <p className="mt-1 text-sm text-[#6B7385]">
          Manage and audit reviews submitted by visitors. Approved reviews are displayed on the main website.
        </p>
      </div>

      {/* Filters UI panel */}
      <div className="bg-[#fafaf8] border border-[rgba(10,15,30,0.08)] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7385] mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-[rgba(10,15,30,0.15)] rounded-lg px-3 py-2 text-sm text-[#0A0F1E] outline-none focus:border-[#E8522A] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7385] mb-2">
            Date Filter
          </label>
          <select
            value={datePreset}
            onChange={(e) => {
              setDatePreset(e.target.value);
              if (e.target.value !== "custom") {
                setStartDate("");
                setEndDate("");
              }
            }}
            className="w-full bg-white border border-[rgba(10,15,30,0.15)] rounded-lg px-3 py-2 text-sm text-[#0A0F1E] outline-none focus:border-[#E8522A] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>

        {datePreset === "custom" && (
          <>
            <div className="w-full sm:w-auto sm:flex-1 min-w-[140px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7385] mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[rgba(10,15,30,0.15)] rounded-lg px-3 py-2 text-sm text-[#0A0F1E] outline-none focus:border-[#E8522A] cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-auto sm:flex-1 min-w-[140px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7385] mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[rgba(10,15,30,0.15)] rounded-lg px-3 py-2 text-sm text-[#0A0F1E] outline-none focus:border-[#E8522A] cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      <div className="admin-card overflow-hidden p-0">
        {reviewsQuery.isLoading && <p className="p-6 text-sm text-[#6B7385]">Loading reviews…</p>}
        {reviewsQuery.isError && (
          <p className="p-6 text-sm text-red-600">{(reviewsQuery.error as Error).message}</p>
        )}

        {!reviewsQuery.isLoading && !reviewsQuery.isError && (
          <div className="flex flex-col gap-0.5 bg-[rgba(10,15,30,0.08)]">
            {filteredReviews.length === 0 ? (
              <div className="bg-[#fafaf8] py-8 text-center text-[#6B7385] italic">
                {reviews.length === 0 
                  ? "No reviews submitted yet." 
                  : "No reviews match your selected filters."}
              </div>
            ) : (
              filteredReviews.map((r) => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";

                return (
                  <div
                    key={r.id}
                    className={`transition-all duration-300 p-6 flex flex-col md:flex-row justify-between gap-6 ${
                      isPending
                        ? "bg-[#FEF6F4] border-l-4 border-[#E8522A]"
                        : "bg-[#fafaf8] border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base text-[#0A0F1E]">{r.name}</span>
                        <span className="text-xs text-[#6B7385]">({r.email})</span>
                        
                        {/* Status badges */}
                        {isPending && (
                          <span className="admin-pulse inline-flex items-center bg-[#E8522A] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            New / Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center bg-[#EAF4F0] text-[#1B4D3E] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center bg-red-100 text-red-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center text-amber-500 font-bold text-sm">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                        <span className="ml-2 text-xs text-[#6B7385] font-normal">
                          {r.created_at ? new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-[#0A0F1E] leading-relaxed italic font-serif bg-white/40 p-3 rounded-lg border border-[rgba(10,15,30,0.03)]">
                        "{r.comment}"
                      </p>
                    </div>

                    {/* Approve / Reject / Delete actions beside of the review */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[rgba(10,15,30,0.08)]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: r.id, status: "approved" })}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 border-none ${
                            isApproved
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-[#1B4D3E] text-white hover:bg-[#256350] hover:shadow-[0_4px_12px_rgba(27,77,62,0.2)] active:scale-95 cursor-pointer"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: r.id, status: "rejected" })}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 border-none ${
                            isRejected
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_4px_12px_rgba(220,38,38,0.2)] active:scale-95 cursor-pointer"
                          }`}
                        >
                          Reject
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete the review from "${r.name}"?`)) {
                            deleteMutation.mutate(r.id);
                          }
                        }}
                        className="text-xs font-semibold text-[#6B7385] hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
