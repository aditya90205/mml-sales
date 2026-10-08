import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Copy,
  Download,
  History,
  Mic,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";

const AI_ACTIONS = [
  { label: "Create", icon: Plus, color: "#16A34A" },
  { label: "Refresh", icon: RefreshCw, color: "#3B82F6" },
  { label: "History", icon: History, color: "#E8395B" },
  { label: "Activity", icon: Activity, color: "#8B5CF6" },
];

const AI_TAGS = ["Summary of the month", "Tomorrow Meetings"];

const PRIORITY_ITEMS = [
  {
    parts: [
      { text: "5 high-value leads waiting for " },
      { text: "follow-up", to: "/tasks?today=1&sort=priority" },
    ],
  },
  {
    parts: [
      { text: "₹18,400 in discount approvals pending for " },
      { text: "Harshit Sharma", to: "/pipeline?openLead=p1-1&tab=overview&openDiscount=1" },
    ],
  },
  {
    parts: [
      { text: "Kuhu Sharma", to: "/pipeline?openLead=p0-1&tab=overview" },
      { text: " and " },
      { text: "Ankit Sharma", to: "/pipeline?openLead=p0-2&tab=overview" },
      { text: " profiles awaiting completion before their meetings" },
    ],
  },
  {
    parts: [
      { text: "You're at 74% of this month's ₹25L " },
      { text: "target", to: "/hrms?tab=Summary&open=achievement" },
    ],
  },
  {
    parts: [
      { text: "1 urgent " },
      { text: "complaint", to: "/hrms?tab=Summary&open=warnings" },
      { text: " flagged — needs a same-day response" },
    ],
  },
  {
    parts: [
      { text: "AI recommends contacting clients " },
      { text: "Vivek Sharma", to: "/pipeline?openLead=p4-1&tab=overview" },
      { text: " and " },
      { text: "Rohit Sharma", to: "/pipeline?openLead=p5-1&tab=overview" },
      { text: " today — both are close to closing" },
    ],
  },
];

export default function AIAssistant({ onClose, variant = "card" }) {
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState(AI_TAGS);
  const [activeTag, setActiveTag] = useState(null);

  const contentHeading = activeTag || "Today's Priority";
  const inModal = variant === "modal";

  return (
    <div
      className={`bg-white flex flex-col gap-3.5 ${
        inModal ? "p-1" : "border border-black/8 rounded-2xl p-4 h-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[17px] font-bold text-[#111] flex items-center gap-2">
          <Sparkles size={16} className="text-[#8B5CF6]" fill="#8B5CF6" strokeWidth={0} />
          Your Personal Assistant
        </h2>
        <div className="flex items-center gap-1.5">
          {AI_ACTIONS.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              type="button"
              title={label}
              className="size-7 rounded-lg grid place-items-center hover:bg-black/4 transition-colors"
            >
              <Icon size={14} style={{ color }} strokeWidth={2} />
            </button>
          ))}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-lg grid place-items-center text-[#6B7280] hover:bg-black/4 hover:text-[#111] transition-colors"
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <span
              key={tag}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTag(isActive ? null : tag)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTag(isActive ? null : tag);
                }
              }}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 text-[11px] rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors border ${
                isActive
                  ? "bg-[#FDF2F3] border-[#7A0A17]/40 text-[#7A0A17] font-semibold"
                  : "text-[#4B5563] bg-[#F1F2F4] border-transparent hover:bg-[#E9EAEC]"
              }`}
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTags((prev) => {
                    const next = prev.filter((x) => x !== tag);
                    if (tag === activeTag) setActiveTag(null);
                    return next;
                  });
                }}
                className={`hover:opacity-80 ${isActive ? "text-[#7A0A17]" : "text-[#6B7280] hover:text-[#111]"}`}
                aria-label={`Remove ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          );
        })}
        <button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] hover:text-[#111] transition-colors">
          See All <ArrowRight size={11} />
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <h3 className="text-[15px] font-bold text-[#111]">{contentHeading}</h3>

        <ul className="flex flex-col gap-2 flex-1">
          {PRIORITY_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151]">
              <span className="size-[5px] rounded-full bg-[#C9CDD4] shrink-0 mt-[7px]" />
              <span className="leading-relaxed">
                {item.parts.map((part, j) =>
                  part.to ? (
                    <Link
                      key={j}
                      to={part.to}
                      onClick={onClose}
                      className="text-[#2563EB] underline underline-offset-2 decoration-current hover:text-[#1D4ED8]"
                    >
                      {part.text}
                    </Link>
                  ) : (
                    <span key={j}>{part.text}</span>
                  )
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="border border-black/10 rounded-xl p-3 mt-auto">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask MML anything..."
            className="w-full resize-none bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
          />
          <div className="flex items-center justify-end gap-1">
            {[Paperclip, Copy, Download, Mic].map((Icon, i) => (
              <button key={i} type="button" className="p-2 text-[#6B7280] hover:text-[#111] rounded-lg hover:bg-black/4 transition-colors">
                <Icon size={15} strokeWidth={1.6} />
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 ml-1.5 px-4 h-9 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Ask anything <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIAssistantModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} hideHeader width="max-w-[560px]">
      <AIAssistant onClose={onClose} variant="modal" />
    </Modal>
  );
}
