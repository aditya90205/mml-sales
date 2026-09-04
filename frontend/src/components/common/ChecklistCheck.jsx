import { AlertTriangle, Check } from "lucide-react";

const BOX = "size-[20px] rounded-[6px] grid place-items-center shrink-0";

function Mark({ done, blocked, className = "" }) {
  if (blocked && !done) {
    return (
      <span className={`${BOX} bg-[#E8395B] border border-[#E8395B] ${className}`}>
        <AlertTriangle size={11} className="text-white" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className={`${BOX} ${
        done ? "bg-[#16A34A] border border-[#16A34A]" : "bg-white border border-[#E3D4D7]"
      } ${className}`}
    >
      {done && <Check size={12} className="text-white" strokeWidth={3} />}
    </span>
  );
}

/**
 * Standard checklist mark: checked → green fill + white tick,
 * unchecked → empty rounded square. Pass onClick to toggle.
 */
export default function ChecklistCheck({ done = false, blocked = false, onClick, className = "", label }) {
  const mark = <Mark done={done} blocked={blocked} className={onClick ? "" : className} />;

  if (!onClick) return mark;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!done}
      aria-label={label || (done ? "Uncheck" : "Check")}
      onClick={onClick}
      className={`shrink-0 cursor-pointer rounded-[6px] ${className}`}
    >
      {mark}
    </button>
  );
}
