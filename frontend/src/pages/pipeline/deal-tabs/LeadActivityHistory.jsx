import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  CreditCard,
  FileText,
  Filter,
  Handshake,
  Image,
  Pencil,
  Phone,
  Star,
  StickyNote,
  UserPlus,
  UserRound,
  Video,
} from "lucide-react";
import {
  ensureLeadHistory,
  getLeadActivities,
  subscribeLeadActivity,
} from "../../../utils/leadActivityStore.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "stage", label: "Stages" },
  { id: "contact", label: "Contact" },
  { id: "files", label: "Files" },
  { id: "notes", label: "Notes" },
];

const FILTER_TYPES = {
  stage: ["stage", "handover", "score"],
  contact: ["created", "assignment", "call", "meeting", "details"],
  files: ["document", "quote", "payment"],
  notes: ["note", "flag"],
};

const TYPE_META = {
  created: { icon: UserPlus, bg: "#EEF2FF", color: "#4338CA" },
  assignment: { icon: UserRound, bg: "#F3E8F0", color: "#7A0A17" },
  call: { icon: Phone, bg: "#E8F2FE", color: "#2563EB" },
  details: { icon: Pencil, bg: "#F3E8F0", color: "#7A0A17" },
  stage: { icon: ArrowRightLeft, bg: "#E7F8EF", color: "#16A34A" },
  score: { icon: Star, bg: "#FFF3E4", color: "#D97706" },
  document: { icon: FileText, bg: "#EEF2FF", color: "#4338CA" },
  meeting: { icon: Video, bg: "#E8F2FE", color: "#2563EB" },
  quote: { icon: FileText, bg: "#FFF3E4", color: "#D97706" },
  payment: { icon: CreditCard, bg: "#E7F8EF", color: "#16A34A" },
  handover: { icon: Handshake, bg: "#F3E8F0", color: "#7A0A17" },
  note: { icon: StickyNote, bg: "#FAFAFB", color: "#4B5563" },
  flag: { icon: Star, bg: "#FFF3E4", color: "#D97706" },
  image: { icon: Image, bg: "#EEF2FF", color: "#4338CA" },
};

function formatDateLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDate(events) {
  const groups = [];
  const index = new Map();
  for (const event of events) {
    const key = formatDateLabel(event.at);
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ date: key, items: [] });
    }
    groups[index.get(key)].items.push(event);
  }
  return groups;
}

function ActivityIcon({ type }) {
  const meta = TYPE_META[type] || TYPE_META.note;
  const Icon = meta.icon;
  return (
    <span
      className="size-8 rounded-full grid place-items-center shrink-0 border border-white shadow-sm"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon size={14} strokeWidth={2.2} />
    </span>
  );
}

export default function LeadActivityHistory({ lead, currentStage = "P0" }) {
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    ensureLeadHistory(lead, currentStage);
    setTick((n) => n + 1);
  }, [lead?.id, currentStage, lead?.p0Status]);

  useEffect(() => subscribeLeadActivity(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const onPointerDown = (event) => {
      if (!filterRef.current?.contains(event.target)) setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  const events = useMemo(() => {
    const all = getLeadActivities(lead?.id);
    if (filter === "all") return all;
    const types = FILTER_TYPES[filter] || [];
    return all.filter((event) => types.includes(event.type));
  }, [lead?.id, filter, tick]);

  const groups = groupByDate(events);
  const name = lead?.name || "this lead";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-[#111] truncate">
            Lead History — {name}
          </h2>
          <p className="text-[12.5px] text-[#6B7280] mt-0.5">
            Every activity from P0 to P6 is logged here as the lead moves.
          </p>
        </div>
        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/10 text-[12px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            aria-label="Filter timeline"
          >
            <Filter size={13} />
            Timeline History
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-1.5 z-20 min-w-[140px] bg-white border border-black/10 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilter(item.id);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[12.5px] ${
                    filter === item.id
                      ? "bg-[#F3E8F0] text-[#7A0A17] font-semibold"
                      : "text-[#374151] hover:bg-[#FAFAFB]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-black/8">
        <span className="inline-block text-[13px] font-semibold text-[#7A0A17] pb-2 border-b-2 border-[#7A0A17]">
          History
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="text-[13px] text-[#6B7280] py-6 text-center">
          No activity yet. Create the lead, save details, or move a stage — it will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.date}>
              <span className="inline-flex items-center h-7 px-3 rounded-lg bg-[#F3F4F6] text-[12px] font-semibold text-[#4B5563]">
                {group.date}
              </span>
              <div className="relative mt-3 ml-1">
                {group.items.map((event, index) => {
                  const last = index === group.items.length - 1;
                  return (
                    <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                      <div className="w-[72px] shrink-0 pt-1.5 text-right">
                        <p className="text-[12px] font-semibold text-[#6B7280] whitespace-nowrap">
                          {formatTime(event.at)}
                        </p>
                      </div>
                      <div className="relative flex flex-col items-center shrink-0 w-8">
                        <ActivityIcon type={event.type} />
                        {!last && (
                          <span className="absolute top-8 bottom-[-8px] w-px bg-[#E5E7EB]" />
                        )}
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-[13.5px] font-semibold text-[#111] leading-snug">
                          {event.title}
                        </p>
                        {event.detail ? (
                          <p className="text-[12.5px] text-[#4B5563] mt-0.5 leading-relaxed">
                            {event.detail}
                          </p>
                        ) : null}
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          by {event.actor} {formatDateLabel(event.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
