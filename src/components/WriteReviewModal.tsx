import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "sonner";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WriteReviewModal({ isOpen, onClose, onSuccess }: WriteReviewModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write your review feedback.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        rating,
        comment: comment.trim(),
        mockName: name.trim(),
        mockEmail: email.trim().toLowerCase(),
        mockAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      };

      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted! It will appear on the site once approved.");
      setName("");
      setEmail("");
      setComment("");
      setRating(5);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white shadow-2xl p-6 md:p-8 text-[#0A0F1E] flex flex-col gap-6 rounded-[20px] relative animate-scaleUp"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3 text-left">
          <h2 className="text-xl font-bold text-[#1B4D3E]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Submit a Client Review
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Share your feedback. Reviews are audited and approved before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          {/* Full Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8522A]"
            />
          </div>

          {/* Email Address Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="e.g. john.doe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8522A]"
            />
          </div>

          {/* Rating Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-slate-200 hover:scale-110 transition"
                >
                  <Star 
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? "fill-[#C9951A] text-[#C9951A]"
                        : "text-slate-200 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Review / Feedback
            </label>
            <textarea
              placeholder="Write your review here... How was your consultation or case management?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8522A] resize-none"
            />
            <span className="text-[10px] text-right text-slate-400">
              {comment.length} / 2000 characters
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-500 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#E8522A] hover:bg-[#FF7B54] text-white py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
