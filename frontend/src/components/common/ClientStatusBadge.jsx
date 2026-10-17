const STATUS = {
  Active: { bg: "#E7F8EF", color: "#15803D" },
  Pipeline: { bg: "#E8F2FE", color: "#2A78D6" },
  Inactive: { bg: "#FDECEE", color: "#E8395B" },
};

const SUB_LABEL = {
  Hold: { bg: "#FCF5F6", color: "#7A0A17" },
  Lost: { bg: "#FCF5F6", color: "#7A0A17" },
  "Subscription Expired": { bg: "#FDECEE", color: "#E8395B" },
};

/**
 * Client-database status cell.
 * Single status is a rounded rectangle. When `subLabel` is set (Hold / Lost /
 * Subscription Expired), renders as one stacked block: status on top, label
 * below — same layout that previously showed Married.
 */
export default function ClientStatusBadge({ status, subLabel = "" }) {
  const tone = STATUS[status] || { bg: "#F1F2F4", color: "#6B7280" };
  const label = String(subLabel || "").trim();

  if (!label) {
    return (
      <span
        className="inline-flex items-center justify-center min-w-[78px] px-3.5 py-[6px] rounded-[6px] text-[11px] font-semibold leading-none whitespace-nowrap"
        style={{ backgroundColor: tone.bg, color: tone.color }}
      >
        {status}
      </span>
    );
  }

  const subTone = SUB_LABEL[label] || { bg: "#F1F2F4", color: "#6B7280" };

  return (
    <span className="inline-flex flex-col overflow-hidden rounded-[6px] min-w-[78px] text-center align-middle">
      <span
        className="px-3.5 py-[6px] text-[11px] font-semibold leading-none whitespace-nowrap"
        style={{ backgroundColor: tone.bg, color: tone.color }}
      >
        {status}
      </span>
      <span
        className="px-3.5 py-[6px] text-[11px] font-medium leading-none whitespace-nowrap border-t border-black/[0.06]"
        style={{ backgroundColor: subTone.bg, color: subTone.color }}
      >
        {label}
      </span>
    </span>
  );
}
