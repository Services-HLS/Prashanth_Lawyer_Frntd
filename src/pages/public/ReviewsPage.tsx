import React, { useState, useEffect } from "react";
import { Star, ArrowLeft, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { PublicLayout } from "@/components/public/PublicLayout";
import { WriteReviewModal } from "@/components/WriteReviewModal";

interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [writeOpen, setWriteOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/reviews");
      const json = await res.json();
      let list: Review[] = [];
      if (json && json.success && json.data) list = json.data;
      else if (Array.isArray(json)) list = json;
      else if (json && Array.isArray(json.data)) list = json.data;

      setReviews(list);
    } catch (err) {
      console.error("Failed to load reviews list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, []);

  const count = reviews.length;
  const average = count > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1) : "0.0";
  
  const starCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const starIdx = Math.max(1, Math.min(5, r.rating)) - 1;
    starCounts[starIdx]++;
  });

  const getPercentage = (starCount: number) => {
    if (count === 0) return 0;
    return Math.round((starCount / count) * 100);
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(/-/g, "/"));
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 0) return "just now";

      const intervals = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
      };

      if (seconds >= intervals.year) {
        const count = Math.floor(seconds / intervals.year);
        return count === 1 ? "1 year ago" : `${count} years ago`;
      }
      if (seconds >= intervals.month) {
        const count = Math.floor(seconds / intervals.month);
        return count === 1 ? "1 month ago" : `${count} months ago`;
      }
      if (seconds >= intervals.day) {
        const count = Math.floor(seconds / intervals.day);
        return count === 1 ? "yesterday" : `${count} days ago`;
      }
      if (seconds >= intervals.hour) {
        const count = Math.floor(seconds / intervals.hour);
        return count === 1 ? "1 hour ago" : `${count} hours ago`;
      }
      if (seconds >= intervals.minute) {
        const count = Math.floor(seconds / intervals.minute);
        return count === 1 ? "1 minute ago" : `${count} minutes ago`;
      }
      return "just now";
    } catch {
      return dateStr;
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-4 text-[#0A0F1E]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 mb-8">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#E8522A] no-underline uppercase tracking-wider mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold text-[#1B4D3E] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
              Client Reviews &amp; Ratings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Read transparent feedback submitted by clients. Only admin-approved reviews are displayed.
            </p>
          </div>
          <button
            onClick={() => setWriteOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#E8522A] hover:bg-[#FF7B54] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" /> Submit a Review
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-[#E8522A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Loading reviews...</p>
          </div>
        ) : count === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="font-serif text-lg text-slate-600 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>No reviews published yet</p>
            <p className="text-xs text-slate-400">Be the first to submit a review for Prasanth Raju's legal services.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Stats Block */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl items-center">
              <div className="md:col-span-2 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <span className="text-6xl font-extrabold text-[#1B4D3E] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {average}
                </span>
                <div className="flex items-center gap-0.5 text-[#C9951A] my-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-5.5 h-5.5 ${
                        star <= Math.round(Number(average))
                          ? "fill-[#C9951A] text-[#C9951A]"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Based on {count} {count === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              <div className="md:col-span-3 flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const starCount = starCounts[stars - 1] || 0;
                  const pct = getPercentage(starCount);
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="w-3 font-bold text-right">{stars}</span>
                      <Star className="w-3.5 h-3.5 fill-[#C9951A] text-[#C9951A]" />
                      <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C9951A] rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 font-semibold text-slate-600 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Reviews */}
            <div className="flex flex-col gap-5">
              {reviews.map((review) => {
                const initials = review.name ? review.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "C";
                return (
                  <div 
                    key={review.id}
                    className="p-5 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col gap-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {review.avatar_url ? (
                          <img 
                            src={review.avatar_url} 
                            alt={review.name} 
                            className="w-11 h-11 rounded-full border border-slate-200 object-cover" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-800">{review.name}</div>
                          <div className="text-xs text-slate-400">{review.email}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-0.5 text-[#C9951A]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? "fill-[#C9951A] text-[#C9951A]"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {getRelativeTime(review.created_at)}
                        </span>
                      </div>
                    </div>

                    <p 
                      className="text-[0.95rem] text-[#0A0F1E] leading-relaxed whitespace-pre-line font-sans font-normal"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      "{review.comment}"
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        <WriteReviewModal
          isOpen={writeOpen}
          onClose={() => setWriteOpen(false)}
          onSuccess={fetchReviews}
        />

      </div>
    </PublicLayout>
  );
}
