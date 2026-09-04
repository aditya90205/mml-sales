import { Flag, X } from "lucide-react";

/** Lead score breakdown + 7-day history chart. Used on pipeline and dashboard tables. */
export default function LeadScoreModal({ lead, onClose }) {
  if (!lead) return null;

  const score = Number(lead.score ?? lead.leadScore);
  const display = Number.isFinite(score) ? score.toFixed(1) : "8.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/8 w-full max-w-[650px] p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111] hover:bg-black/5 p-1.5 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-[17px] font-bold text-[#111] mb-4">Lead Score Details</h3>

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[13px] text-[#4B5563] font-medium">Total Lead Score</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[28px] font-bold text-[#16A34A] leading-none">{display}</span>
              <span className="text-[15px] font-semibold text-[#9CA3AF]">/ 10</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Flag size={14} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
              <span className="bg-[#E7F8EF] border border-[#BBF7D0] text-[#16A34A] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
                High
              </span>
            </div>
            <p className="text-[12px] text-[#4B5563] text-right font-medium">
              Great! This lead has a high conversion potential.
            </p>
          </div>
        </div>

        <div className="border border-black/8 rounded-2xl p-4 grid grid-cols-[210px_1fr] gap-5 bg-[#FAFAFB]/50">
          <div className="pr-3 border-r border-black/8">
            <h4 className="text-[13px] font-bold text-[#111] mb-3">Score Breakdown</h4>
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Profile Completion</span>
                <span>
                  <strong className="text-[#16A34A] font-bold">2.0</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Source Quality</span>
                <span>
                  <strong className="text-[#16A34A] font-bold">2.0</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Client Engagement</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Time at Stage</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Follow-up Activity</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between min-w-0">
            <h4 className="text-[13px] font-bold text-[#111] mb-2">
              Score History <span className="text-[#9CA3AF] font-normal">(Last 7 Days)</span>
            </h4>

            <div className="w-full">
              <svg viewBox="0 0 340 135" className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="scoreGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <text x="20" y="14" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">10</text>
                <text x="20" y="39" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">7.5</text>
                <text x="20" y="64" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">5.0</text>
                <text x="20" y="89" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">2.5</text>
                <text x="20" y="114" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">0</text>

                {[10, 35, 60, 85, 110].map((y) => (
                  <line key={y} x1="28" y1={y} x2="330" y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                ))}

                {[28, 78.3, 128.6, 179, 229.3, 279.6, 330].map((x) => (
                  <line key={x} x1={x} y1="10" x2={x} y2="110" stroke="rgba(0,0,0,0.06)" />
                ))}

                <path
                  d="M 28 65 L 78.3 60 L 128.6 35 L 179 78 L 229.3 65 L 279.6 35 L 330 20 L 330 110 L 28 110 Z"
                  fill="url(#scoreGreenGrad)"
                />

                <path
                  d="M 28 65 L 78.3 60 L 128.6 35 L 179 78 L 229.3 65 L 279.6 35 L 330 20"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                <text x="28" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">7d ago</text>
                <text x="78.3" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">6d ago</text>
                <text x="128.6" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">5d ago</text>
                <text x="179" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">4d ago</text>
                <text x="229.3" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">3d ago</text>
                <text x="279.6" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">2d ago</text>
                <text x="330" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">Today</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
