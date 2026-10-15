import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const TEMP_STYLES = {
  Hot:  { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
  Lost: { color: "#7A0A17", bg: "#FCF5F6" },
};
const FALLBACK = { color: "#6B7280", bg: "#F3F4F6" };

/**
 * Custom tooltip on client name hover — shows temperature (Hot / Warm / Cold)
 * with matching color. Uses a portal so table overflow does not clip it.
 */
export default function ClientNameHoverTip({
  name,
  temperature,
  mmlId,
  children,
  className = "",
}) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);
  const tone = TEMP_STYLES[temperature] || FALLBACK;
  const label = temperature ? `${temperature} Lead` : "Lead";

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = 200;
    let left = r.left;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const top = r.bottom + 6;
    setPos({ top, left, width });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 100);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={scheduleClose}
      className={`inline-flex min-w-0 ${className}`}
    >
      {children}
      {pos &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[80] rounded-lg border border-black/10 bg-white px-2.5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.1)] pointer-events-none"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: tone.color }}
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: tone.color }}
              >
                {label}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] font-semibold text-[#111] truncate">{name}</p>
            {mmlId ? (
              <p className="text-[10px] text-[#9CA3AF] truncate">{mmlId}</p>
            ) : null}
          </div>,
          document.body
        )}
    </span>
  );
}
