import { useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Flag,
  Hourglass,
  Info,
  Link2,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import TopBar from "../components/layout/TopBar";

/* ───────────────────────── Data ───────────────────────── */

const PIPELINE_STAGES = [
  { id: "P0", label: "New",                    color: "#E8395B" },
  { id: "P1", label: "Qualified",               color: "#F59E0B" },
  { id: "P2", label: "Profile Creation",        color: "#8B5CF6" },
  { id: "P3", label: "Video Call/Visit",        color: "#7C3AED" },
  { id: "P4", label: "Negotiation",             color: "#6366F1" },
  { id: "P5", label: "Closed",                  color: "#16A34A" },
  { id: "P6", label: "Closed Sale Onboarding",  color: "#EAB308" },
];

const QUICK_GROUPS = [
  {
    title: "Capture & Visits",
    icon: Eye,
    color: "#3B82F6",
    bg: "#E8F2FE",
    chips: ["Client Intake", "Smart Home & Office Visits", "Video Call Desk"],
  },
  {
    title: "Oversight",
    icon: ShieldCheck,
    color: "#16A34A",
    bg: "#E7F8EF",
    chips: ["Cross Branch Flags"],
  },
  {
    title: "Deal Docs",
    icon: FileText,
    color: "#6366F1",
    bg: "#EEF0FE",
    chips: ["Package Pricing", "Quotations", "Discount Request", "Contract & Payment", "P6 Handover"],
  },
];

const TEMPERATURE_STYLES = {
  Hot:  { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
};

const PRIORITY_STYLES = {
  High:   { color: "#E8395B", bg: "#FDECEE" },
  Medium: { color: "#F59E0B", bg: "#FFF3E4" },
  Low:    { color: "#16A34A", bg: "#E7F8EF" },
};

const OWNER = { name: "Aditya Sharma", label: "Owner", role: "Sales Manager", branch: "Rajouri Garden" };

/** Two sample cards per stage, mirroring the lead roster used on the dashboard. */
const LEADS_BY_STAGE = {
  P0: [
    { name: "Kuhu Sharma",  starred: true,  mmlId: "MML - D - 10437", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2, hrs: 6,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Ankit Sharma", starred: true,  mmlId: "MML - D - 10437", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2, hrs: 6,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P1: [
    { name: "Harshit Sharma", starred: false, mmlId: "MML - D - 10437", temperature: "Hot",  score: 8.5, priority: "High", completion: 40,  days: 4, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Arjun Rampal",  starred: false, mmlId: "MML - D - 10437", temperature: "Hot",  score: 8.5, priority: "High", completion: 100, days: 2, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P2: [
    { name: "Ankur Sharma", starred: false, mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 6, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Priya Raheja", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 2, hrs: 6,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P3: [
    { name: "Aditya Sharma", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 8, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Priya Raheja",  starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 2, hrs: 8,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P4: [
    { name: "Vivek Sharma", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 12, hrs: 6, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Priya Raheja", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 2,  hrs: 8, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P5: [
    { name: "Rohit Sharma", starred: true,  mmlId: "MML - D - 10437", temperature: "Warm", score: 8.5, priority: "High", completion: 100, days: 14, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Priya Raheja", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 2,  hrs: 8,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P6: [
    { name: "Virat Sharma", starred: true,  mmlId: "MML - D - 10437", temperature: "Warm", score: 8.5, priority: "High", completion: 100, days: 16, hrs: 24, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { name: "Priya Raheja", starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High", completion: 100, days: 2,  hrs: 8,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
};

const PER_PAGE_OPTIONS = [10, 25, 50];

/* ───────────────────────── Small pieces ───────────────────────── */

function InitialsAvatar({ name, size = 28 }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="rounded-full bg-[#EEF0FE] text-[#6366F1] font-bold grid place-items-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

function Pill({ tone, children }) {
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
      style={{ color: tone.color, backgroundColor: tone.bg }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────── Alert banner ───────────────────────── */

function ActionAlertBanner() {
  return (
    <div className="bg-[#FDECEE] border border-[#F7D3D9] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 flex-wrap">
      <span className="size-9 rounded-xl bg-[#FFE1CC] grid place-items-center shrink-0">
        <AlarmClock size={18} className="text-[#F97316]" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-[#111]">2 items need action today</p>
        <p className="text-[12px] text-[#6B7280] mt-0.5">
          Sanjay Mehta has been in P4 for 9 days, 1 discount request is awaiting sales head approval.
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
      >
        View
      </button>
    </div>
  );
}

/* ───────────────────────── Quick links row ───────────────────────── */

function QuickLinksRow() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl divide-y divide-black/8 lg:divide-y-0 lg:flex lg:items-stretch">
      {QUICK_GROUPS.map((group, i) => (
        <div
          key={group.title}
          className={`px-4 py-3.5 ${i === QUICK_GROUPS.length - 1 ? "lg:flex-1 lg:min-w-0" : "lg:shrink-0"} ${
            i > 0 ? "lg:border-l lg:border-black/8" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2.5 whitespace-nowrap">
            <group.icon size={15} style={{ color: group.color }} strokeWidth={1.8} />
            <p className="text-[13px] font-bold text-[#111]">{group.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#4B5563] bg-[#F7F8FA] border border-black/6 rounded-lg px-2.5 py-1.5 hover:bg-[#F1F2F4] transition-colors whitespace-nowrap"
              >
                {chip}
                <span className="text-[10px] font-semibold text-[#9CA3AF] bg-white rounded px-1.5 py-0.5">3</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function BoardToolbar({ search, onSearchChange, perPage, onPerPageChange }) {
  const [perPageOpen, setPerPageOpen] = useState(false);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[520px] focus-within:border-[#7A0A17]/40 transition-colors">
        <Search size={15} className="text-[#9CA3AF] shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
        />
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
      >
        <Search size={14} /> Search
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
      >
        <SlidersHorizontal size={14} /> Filter
      </button>

      <div className="relative shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => setPerPageOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
        >
          Per Page: {perPage}
          <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${perPageOpen ? "rotate-180" : ""}`} />
        </button>
        {perPageOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] min-w-[100px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 overflow-hidden">
            {PER_PAGE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { onPerPageChange(n); setPerPageOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                  n === perPage ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Lead card ───────────────────────── */

function LeadCard({ lead, stageColor, nextStageLabel }) {
  const temperature = TEMPERATURE_STYLES[lead.temperature];
  const priority = PRIORITY_STYLES[lead.priority];

  const urgentHrs = lead.hrs <= 8;

  return (
    <div
      className="bg-white border border-black/8 rounded-xl p-3.5 flex flex-col gap-3 border-l-4"
      style={{ borderLeftColor: stageColor }}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-[#111] truncate">{lead.name}</p>
            {lead.starred && <Star size={12} className="text-[#F59E0B] shrink-0" fill="#F59E0B" strokeWidth={0} />}
          </span>
          <p className="text-[10px] text-[#9CA3AF]">{lead.mmlId}</p>
        </div>
        <button type="button" className="p-1 text-[#9CA3AF] hover:text-[#111] rounded-md hover:bg-black/4 transition-colors shrink-0" aria-label="More options">
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between gap-1.5">
        <Pill tone={temperature}>{lead.temperature}</Pill>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111] shrink-0">
          {lead.score.toFixed(1)}
          <Flag size={10} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
        </span>
        <Pill tone={priority}>{lead.priority}</Pill>
      </div>

      {/* Profile completion */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#9CA3AF]">Profile Completion</span>
          <span className="text-[12px] font-bold text-[#111]">{lead.completion}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#EDEEF1] overflow-hidden">
          <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${lead.completion}%` }} />
        </div>
      </div>

      <div className="h-px bg-black/6" />

      {/* Details */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Details</p>
          <Info size={12} className="text-[#9CA3AF]" />
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#4B5563]">
          <span className="inline-flex items-center gap-1 shrink-0">
            <Clock size={12} className="text-[#9CA3AF]" /> {lead.days} Days
          </span>
          <span className={`inline-flex items-center gap-1 shrink-0 ${urgentHrs ? "text-[#E8395B] font-semibold" : ""}`}>
            <Hourglass size={12} className={urgentHrs ? "text-[#E8395B]" : "text-[#9CA3AF]"} /> {lead.hrs} Hrs
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[#3B82F6] font-semibold bg-[#E8F2FE] border border-[#BFDBFE] rounded-md px-2 py-0.5 hover:bg-[#DBE9FD] transition-colors shrink-0"
          >
            <Link2 size={11} /> Join
          </button>
        </div>
      </div>

      {/* Last discussion / next action */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-[#9CA3AF]">Last Discussion</p>
          <p className="text-[11px] font-medium text-[#374151] mt-0.5">{lead.lastDiscussion}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#9CA3AF]">Next Action</p>
          <p className="text-[11px] font-medium text-[#374151] mt-0.5">{lead.nextAction}</p>
        </div>
      </div>

      <div className="h-px bg-black/6" />

      {/* Owner */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <InitialsAvatar name={OWNER.name} />
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-[#374151] leading-tight">
              {OWNER.name} <span className="text-[#9CA3AF] font-normal">({OWNER.label})</span>
            </p>
            <p className="text-[10px] text-[#9CA3AF] leading-tight">{OWNER.role}</p>
            <p className="text-[10px] text-[#9CA3AF] inline-flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {OWNER.branch}
            </p>
          </div>
        </div>
        {/* <button type="button" className="self-end text-[10.5px] font-semibold text-[#E8395B] hover:underline">
          Report Concern
        </button> */}
      </div>

      {/* Move to next stage */}
      {nextStageLabel ? (
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[#7A0A17]/25 text-[#7A0A17] text-[12.5px] font-semibold hover:bg-[#FCF5F6] transition-colors"
        >
          Move to {nextStageLabel} <ArrowRight size={13} />
        </button>
      ) : (
        <span className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#E7F8EF] text-[#16A34A] text-[12.5px] font-semibold">
          Onboarding Complete
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Column ───────────────────────── */

function PipelineColumn({ stage, leads, nextStageId }) {
  return (
    <div className="flex flex-col w-[280px] shrink-0 bg-[#F7F8FA] border border-black/6 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-3 bg-white border-b border-black/8">
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
          <span className="text-[13px] font-bold text-[#111] truncate">
            {stage.id} {stage.label}
          </span>
        </span>
        <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2 py-0.5 shrink-0">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: 640 }}>
        {leads.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] text-center py-6">No leads in this stage</p>
        ) : (
          leads.map((lead, i) => (
            <LeadCard key={`${stage.id}-${i}`} lead={lead} stageColor={stage.color} nextStageLabel={nextStageId} />
          ))
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function PipelineBoard() {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);

  const columns = useMemo(
    () =>
      PIPELINE_STAGES.map((stage, i) => {
        const allLeads = LEADS_BY_STAGE[stage.id] || [];
        const filtered = search
          ? allLeads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
          : allLeads;
        const next = PIPELINE_STAGES[i + 1];
        return { stage, leads: filtered.slice(0, perPage), nextStageId: next?.id };
      }),
    [search, perPage]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar page="Pipeline Board" />

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Pipeline Board</h1>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
          >
            <Plus size={15} /> Add Deal
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 flex flex-col gap-4 min-w-0">
        <ActionAlertBanner />
        <QuickLinksRow />
        <BoardToolbar search={search} onSearchChange={setSearch} perPage={perPage} onPerPageChange={setPerPage} />

        {/* Board */}
        <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {columns.map(({ stage, leads, nextStageId }) => (
            <PipelineColumn key={stage.id} stage={stage} leads={leads} nextStageId={nextStageId} />
          ))}
        </div>
      </div>
    </div>
  );
}
