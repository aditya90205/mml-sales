const VARIANTS = {
  pending:  "bg-[#FFF0E5] text-[#F97C3B]",
  approved: "bg-[#E5FAEC] text-[#00C142]",
  rejected: "bg-[#fde5eb] text-[#F4124D]",
  review:   "bg-[#E5F2FF] text-[#0085FF]",
  info:     "bg-[#EEF4FF] text-[#5B8DEF]",
  purple:   "bg-[#F5F3FF] text-[#7B6CF6]",
  default:  "bg-[#f1f1f4] text-[#515052]",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${VARIANTS[variant] ?? VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}
