const STATUS = {
  Active: { bg: "#E7F8EF", color: "#15803D" },
  Inactive: { bg: "#FDECEE", color: "#E8395B" },
};

/**
 * Client-database status cell.
 * Single status is a rounded rectangle. Married clients render as one stacked
 * block: status on top, "Married" below, with a thin divider — matching the
 * Client Database mock.
 */
export default function ClientStatusBadge({ status, married = false }) {
  const tone = STATUS[status] || { bg: "#F1F2F4", color: "#6B7280" };

  if (!married) {
    return (
      <span
        className="inline-flex items-center justify-center min-w-[78px] px-3.5 py-[6px] rounded-[6px] text-[11px] font-semibold leading-none whitespace-nowrap"
        style={{ backgroundColor: tone.bg, color: tone.color }}
      >
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col overflow-hidden rounded-[6px] min-w-[78px] text-center align-middle">
      <span
        className="px-3.5 py-[6px] text-[11px] font-semibold leading-none whitespace-nowrap"
        style={{ backgroundColor: tone.bg, color: tone.color }}
      >
        {status}
      </span>
      <span className="px-3.5 py-[6px] text-[11px] font-medium leading-none whitespace-nowrap bg-[#F1F2F4] text-[#6B7280] border-t border-black/[0.06]">
        Married
      </span>
    </span>
  );
}
