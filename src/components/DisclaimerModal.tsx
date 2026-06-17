import React, { useState } from "react";

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleProceed = () => {
    if (isChecked) {
      setIsClosing(true);
      setTimeout(() => {
        onAccept();
      }, 350); // Matches the fadeOut/scaleDown transition duration
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAFAF8]/95 backdrop-blur-md p-4 md:p-6 overflow-y-auto ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* Inline styles for keyframe animations and noise background */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes PR_fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes PR_fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes PR_scaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes PR_scaleDown {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.96) translateY(-12px); }
        }
        .animate-fadeIn {
          animation: PR_fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeOut {
          animation: PR_fadeOut 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleUp {
          animation: PR_scaleUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-scaleDown {
          animation: PR_scaleDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .noise-bg::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
          z-index: 0;
        }
      `}} />

      {/* Noise background for the overall screen overlay */}
      <div className="absolute inset-0 noise-bg pointer-events-none z-0" />

      {/* Modal Card */}
      <div 
        className={`relative z-10 w-full max-w-3xl bg-white border border-[rgba(10,15,30,0.06)] shadow-[0_16px_40px_rgba(10,15,30,0.08)] p-6 md:p-10 text-[#0A0F1E] flex flex-col gap-6 rounded-[24px] ${
          isClosing ? "animate-scaleDown" : "animate-scaleUp"
        }`}
      >
        
        {/* Header Decorator & Title */}
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#E8522A] uppercase font-mono mb-1">
            <span>Advocate & Counsel</span>
            <span className="w-1.5 h-1.5 bg-[#E8522A] rounded-full"></span>
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold text-[#1B4D3E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Disclaimer
          </h1>
        </div>
        
        {/* Paragraph Text */}
        <div className="text-sm md:text-base leading-relaxed text-[#6B7385] text-justify space-y-4 font-sans font-light">
          <p>
            The Bar Council of India does not permit advertisement or solicitation by advocates in any form or manner.
            By accessing this website, you acknowledge and confirm that you are seeking information relating to
            Prasanth Raju of your own accord and that there has been no form of solicitation, advertisement or
            inducement by Prasanth Raju or his members.
          </p>
          <p>
            The content of this website is for informational purposes only and should not be interpreted as soliciting or
            advertisement. No material/information provided on this website should be construed as legal advice.
            Prasanth Raju shall not be liable for consequences of any action taken by relying on the material/information
            provided on this website. The contents of this website are the intellectual property of Prasanth Raju.
          </p>
        </div>
        
        {/* Checkbox and Accept Button Group */}
        <div className="flex flex-col gap-5 border-t border-slate-100 pt-6">
          <label className="flex items-center gap-3 cursor-pointer select-none group text-sm md:text-base text-[#0A0F1E] font-medium transition-colors duration-200 hover:text-[#E8522A]">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 border border-slate-300 rounded-md checked:bg-[#E8522A] checked:border-[#E8522A] focus:ring-0 focus:ring-offset-0 transition duration-200 cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-white after:text-xs after:hidden checked:after:block"
            />
            <span>I accept the above.</span>
          </label>
          
          <div className="pt-1">
            <button
              onClick={handleProceed}
              disabled={!isChecked}
              className={`px-8 py-3.5 text-xs tracking-wider uppercase font-semibold rounded-full transition-all duration-300 ${
                isChecked
                  ? "bg-[#E8522A] text-white hover:bg-[#FF7B54] active:scale-[0.98] shadow-[0_4px_12px_rgba(232,82,42,0.2)] hover:shadow-[0_6px_20px_rgba(232,82,42,0.3)] cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              PROCEED TO WEBSITE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
