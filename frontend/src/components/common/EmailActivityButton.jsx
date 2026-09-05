import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mail } from "lucide-react";

const SAMPLE_EMAILS = [
  { subject: "Profile shortlist sent", snippet: "3 new matches shared for review — awaiting client feedback.", time: "2 hr ago", unread: true },
  { subject: "Follow-up: video call slot", snippet: "Confirming Thursday 4 PM for the video call with the family.", time: "Yesterday", unread: true },
  { subject: "Welcome to Make My Lagan", snippet: "Onboarding checklist and RM contact details.", time: "3 days ago", unread: false },
];

const POPOVER_WIDTH = 300;
const POPOVER_MAX_HEIGHT = 300;

/**
 * Mail icon used in lead-row action columns (Pipeline Board, Dashboard).
 * Hovering shows a portal-positioned popover previewing recent email
 * activity for that lead, so it works inside horizontally-scrolling tables
 * without being clipped.
 */
export default function EmailActivityButton({ className = "", size = 14, hasUnread = false }) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);
  const unreadCount = hasUnread ? SAMPLE_EMAILS.filter((m) => m.unread).length : 0;

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
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        className={className}
        title="Email"
        aria-label="Email"
      >
        <Mail size={size} />
        {hasUnread && <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-[#DC2626]" />}
      </button>

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] w-[300px] bg-white border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden"
            style={{
              top: pos.placeAbove ? undefined : pos.top,
              bottom: pos.placeAbove ? window.innerHeight - pos.anchorTop + 8 : undefined,
              left: pos.left,
            }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/8">
              <p className="text-[12.5px] font-bold text-[#111]">Email activity</p>
              {unreadCount > 0 && (
                <span className="text-[10.5px] font-semibold text-[#DC2626] bg-[#FEE2E2] rounded-full px-2 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="max-h-[260px] overflow-y-auto divide-y divide-black/5">
              {SAMPLE_EMAILS.map((m) => (
                <div key={m.subject} className={`flex items-start gap-2.5 px-3.5 py-2.5 ${m.unread ? "bg-[#FCF5F6]" : ""}`}>
                  <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${m.unread ? "bg-[#DC2626]" : "bg-transparent"}`} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#111] truncate">{m.subject}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">{m.snippet}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
