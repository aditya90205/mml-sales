import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const POPOVER_WIDTH = 340;
const POPOVER_MAX_HEIGHT = 170;

/**
 * Wraps the "Follow Up Time Left" cell (Dashboard's My Leads table, Pipeline
 * Board's table view) and shows the same Last Discussion / Next Action
 * content as the deal's Overview tab on hover, via a portal so it isn't
 * clipped by the tables' scroll containers.
 */
export default function FollowUpHoverCard({
  children,
  lastDiscussionAt,
  lastDiscussionNote = "Meeting Notes/Discussions",
  nextActionAt,
  nextActionNote,
  urgency,
  onFollowUp,
  className = "",
}) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    let left = r.left + r.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - POPOVER_WIDTH - 12));
    const below = r.bottom + 8;
    const placeAbove = below + POPOVER_MAX_HEIGHT > window.innerHeight;
    setPos({ anchorTop: r.top, top: below, left, placeAbove });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 120);
  };

  return (
    <span ref={ref} onMouseEnter={open} onMouseLeave={scheduleClose} className={`inline-block ${className}`}>
      {children}

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] w-[340px] bg-white border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-4"
            style={{
              top: pos.placeAbove ? undefined : pos.top,
              bottom: pos.placeAbove ? window.innerHeight - pos.anchorTop + 8 : undefined,
              left: pos.left,
            }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Last Discussion</p>
                <p className="text-[13px] font-semibold text-[#111] mt-1">{lastDiscussionAt || "-"}</p>
                {lastDiscussionNote && <p className="text-[12px] text-[#4B5563] mt-0.5">{lastDiscussionNote}</p>}
                {onFollowUp && (
                  <button
                    type="button"
                    onClick={onFollowUp}
                    className="text-[11.5px] font-semibold text-[#2563EB] hover:underline mt-1"
                  >
                    Follow up History
                  </button>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Next Action</p>
                  {urgency && <span className="text-[11px] font-bold text-[#E8395B] shrink-0">{urgency}</span>}
                </div>
                <p className="text-[13px] font-semibold text-[#111] mt-1">{nextActionAt || "-"}</p>
                {nextActionNote && <p className="text-[12px] text-[#4B5563] mt-0.5">{nextActionNote}</p>}
              </div>
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}
