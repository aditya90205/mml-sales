const TONES = {
  green: { color: "#16A34A", bg: "#E7F8EF" },
  amber: { color: "#F59E0B", bg: "#FFF3E4" },
  red:   { color: "#E8395B", bg: "#FDECEE" },
  blue:  { color: "#3B82F6", bg: "#E8F2FE" },
  gray:  { color: "#9CA3AF", bg: "#F1F2F4" },
};

/** Small colored status/summary badge reused across deal-detail tables. */
export default function StatusPill({ tone = "gray", children }) {
  const t = TONES[tone] || TONES.gray;
  return (
    <span
      className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
      style={{ color: t.color, backgroundColor: t.bg }}
    >
      {children}
    </span>
  );
}
