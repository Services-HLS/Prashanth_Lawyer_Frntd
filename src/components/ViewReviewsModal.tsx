import React, { useState, useEffect } from "react";
import { Star, X } from "lucide-react";

interface ViewReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
}

export function ViewReviewsModal({ isOpen, onClose }: ViewReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

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

    void fetchReviews();
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate statistics
  const count = reviews.length;
  const average = count > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1) : "0.0";
  
  // Star breakdown calculation
  const starCounts = [0, 0, 0, 0, 0]; // Index 0 is 1 star, Index 4 is 5 stars
  reviews.forEach((r) => {
    const starIdx = Math.max(1, Math.min(5, r.rating)) - 1;
    starCounts[starIdx]++;
  });

  const getPercentage = (starCount: number) => {
    if (count === 0) return 0;
    return Math.round((starCount / count) * 100);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white shadow-2xl p-6 md:p-8 text-[#0A0F1E] flex flex-col gap-6 rounded-[24px] relative animate-scaleUp max-h-[85vh]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#1B4D3E]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Client Reviews &amp; Ratings
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-[#E8522A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Loading reviews...</p>
          </div>
        ) : count === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <p className="font-serif text-lg text-slate-600 mb-1">No reviews published yet</p>
            <p className="text-xs">Be the first to submit a review for Prasanth Raju's legal services.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 overflow-y-auto pr-1">
            
            {/* Stats Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl items-center">
              {/* Left Score Column */}
              <div className="md:col-span-2 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                <span className="text-5xl font-extrabold text-[#1B4D3E]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {average}
                </span>
                <div className="flex items-center gap-0.5 text-[#C9951A] my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(average))
                          ? "fill-[#C9951A] text-[#C9951A]"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {count} {count === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              {/* Right Bars Column */}
              <div className="md:col-span-3 flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const starCount = starCounts[stars - 1] || 0;
                  const pct = getPercentage(starCount);
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="w-3 font-semibold text-right">{stars}</span>
                      <Star className="w-3.5 h-3.5 fill-[#C9951A] text-[#C9951A]" />
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
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

            {/* Scrollable Reviews List */}
            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-1">
              {reviews.map((review) => {
                const initials = review.name ? review.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "C";
                return (
                  <div 
                    key={review.id}
                    className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Submitter Author Info */}
                      <div className="flex items-center gap-3">
                        {review.avatar_url ? (
                          <img 
                            src={review.avatar_url} 
                            alt={review.name} 
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-800">{review.name}</div>
                          <div className="text-xs text-slate-400">{review.email}</div>
                        </div>
                      </div>

                      {/* Stars & Date Column */}
                      <div className="flex flex-col items-end gap-1">
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
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                      "{review.comment}"
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
