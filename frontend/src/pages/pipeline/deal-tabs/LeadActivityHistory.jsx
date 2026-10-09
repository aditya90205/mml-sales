import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  CreditCard,
  FileText,
  Filter,
  Handshake,
  Image,
  Paperclip,
  Pencil,
  Phone,
  Star,
  StickyNote,
  UserPlus,
  UserRound,
  Video,
} from "lucide-react";
import { formatLookingForLabel } from "../../../utils/leadFields.js";
import {
  clientSummaryFromLead,
  ensureLeadHistory,
  isVideoActivity,
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
  notes: ["note", "flag", "summary"],
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
  summary: { icon: FileText, bg: "#F3E8FF", color: "#7C3AED" },
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

function filled(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  return text;
}

function looksLikeSchedule(value) {
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(String(value || "").trim());
}

function nextActionText(lead, details) {
  const candidates = [lead?.nextActionNote, details.nextAction, lead?.nextAction];
  const note = candidates.map(filled).find((value) => value && !looksLikeSchedule(value));
  return note || "";
}

function asLines(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function shortClientLines(lead, events = []) {
  const fromMeeting = events.find((event) => filled(event.clientSummary));
  if (fromMeeting) return asLines(fromMeeting.clientSummary);

  const details = lead?.overviewDetails || {};
  const name = lead?.name || "The client";
  const place = [
    filled(lead?.areaOfHouse) || filled(lead?.area) || filled(details.areaOfHouse),
    filled(lead?.city) || filled(details.city),
  ]
    .filter(Boolean)
    .join(", ");
  const looking = formatLookingForLabel(filled(lead?.lookingFor) || filled(details.lookingFor));
  const pack = filled(lead?.packageInterest) || filled(details.packageInterest);
  const next = nextActionText(lead, details);

  const seek = looking ? ` and is looking for a ${looking.toLowerCase()}` : "";
  const who = place
    ? `${name} is based in ${place}${seek}.`
    : `${name}${seek || " is in early discussion with the family"}.`;

  const lines = [who];
  if (pack) lines.push(`The family is warm on ${pack} and wants a short follow-up before they decide.`);
  if (next) lines.push(`Next step: ${next.replace(/\.$/, "")}.`);
  else if (!pack) lines.push("Preferences are still being captured on the next call.");
  return lines.slice(0, 3);
}

function ClientSummaryPanel({ lead, events }) {
  const lines = shortClientLines(lead, events);
  if (!lines.length) return null;

  return (
    <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">Client summary</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {lines.map((line) => (
          <p key={line} className="text-[13px] text-[#1F2937] leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
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

function InsightBlock({ label, children, className = "" }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
      <div className="mt-1 text-[12.5px] text-[#1F2937] leading-relaxed">{children}</div>
    </div>
  );
}

function VideoCallRecord({ event, lead }) {
  const clientSummary = event.clientSummary || clientSummaryFromLead(lead);
  const transcript = event.transcript || "";
  const notes = event.notes || "";
  const summary = event.meetingSummary || "";

  return (
    <div className="mt-2 flex flex-col gap-2">
      {clientSummary ? (
        <InsightBlock label="Client summary" className="border-[#DBEAFE] bg-[#F8FBFF] text-[#2563EB]">
          {clientSummary}
        </InsightBlock>
      ) : null}
      {transcript || notes ? (
        <InsightBlock label="Transcript / notes" className="border-[#EDE9FE] bg-[#FBF9FF] text-[#7C3AED]">
          {transcript ? <p className="whitespace-pre-line">{transcript}</p> : null}
          {notes ? <p className={`${transcript ? "mt-1.5" : ""} whitespace-pre-line`}>{notes}</p> : null}
        </InsightBlock>
      ) : null}
      {summary || event.attachment ? (
        <div className="rounded-xl border border-black/8 bg-[#FAFAFB] p-3 flex gap-3">
          <div className="w-[118px] shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Attachment</p>
            <p className="mt-1.5 inline-flex items-start gap-1.5 text-[12px] font-semibold text-[#374151] break-all">
              <Paperclip size={13} className="shrink-0 mt-0.5 text-[#6B7280]" />
              <span>{event.attachment || "Video recording"}</span>
            </p>
          </div>
          <div className="min-w-0 flex-1 border-l border-black/8 pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Meeting summary</p>
            <p className="mt-1.5 text-[12.5px] text-[#111] leading-relaxed">
              {summary || "Summary of this video will show here once the recording is reviewed."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
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
  const [openVideoId, setOpenVideoId] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => subscribeLeadActivity(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const onPointerDown = (event) => {
      if (!filterRef.current?.contains(event.target)) setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  const allEvents = useMemo(
    () => ensureLeadHistory(lead, currentStage),
    [lead, currentStage, tick]
  );
  const events = useMemo(() => {
    if (filter === "all") return allEvents;
    const types = FILTER_TYPES[filter] || [];
    return allEvents.filter((event) => types.includes(event.type));
  }, [allEvents, filter]);

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

      <ClientSummaryPanel lead={lead} events={allEvents} />

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
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-[#111] leading-snug inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span>{event.title}</span>
                            {isVideoActivity(event) ? (
                              <button
                                type="button"
                                aria-expanded={openVideoId === event.id}
                                aria-label={openVideoId === event.id ? "Hide video call details" : "Open video call details"}
                                onClick={() => setOpenVideoId((current) => (current === event.id ? null : event.id))}
                                className="text-[12.5px] font-bold text-[#7A0A17] hover:text-[#640712] transition-colors whitespace-nowrap"
                              >
                                {openVideoId === event.id ? "Hide" : "View >"}
                              </button>
                            ) : null}
                          </p>
                          {event.detail ? (
                            <p className="text-[12.5px] text-[#4B5563] mt-0.5 leading-relaxed">
                              {event.detail}
                            </p>
                          ) : null}
                          {event.type === "summary" && (event.transcript || event.attachment) ? (
                            <div className="mt-2 flex flex-col gap-2">
                              {event.transcript ? (
                                <InsightBlock
                                  label="Transcript"
                                  className="border-[#EDE9FE] bg-[#FBF9FF] text-[#7C3AED]"
                                >
                                  <p className="whitespace-pre-line">{event.transcript}</p>
                                </InsightBlock>
                              ) : null}
                              {event.attachment ? (
                                <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#374151]">
                                  <Paperclip size={13} className="text-[#6B7280]" />
                                  {event.attachment}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        {isVideoActivity(event) && openVideoId === event.id ? (
                          <VideoCallRecord event={event} lead={lead} />
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
