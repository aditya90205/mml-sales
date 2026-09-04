import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlarmClock,
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  Flag,
  Hourglass,
  Info,
  LayoutGrid,
  LayoutList,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
  PhoneOff,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Video,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
// TopBar is now provided by Layout
import eyeIcon from "../assets/eye.png";
import peopleIcon from "../assets/people.png";
import fileIcon from "../assets/file.png";
import AddP0ProspectPage from "./pipeline/AddP0ProspectPage";
import MoveToP1Page from "./pipeline/MoveToP1Page";
import MoveToP2Page from "./pipeline/MoveToP2Page";
import DealDetailPage from "./pipeline/DealDetailPage";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";

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

const CHIP_ROUTES = {
  "Smart Home & Office Visits": "/pipeline/visits",
  "Cross Branch Flags": "/pipeline/cross-branch",
  "Quotations": "/pipeline/quotations",
  "Discount Request": "/pipeline/discount-requests",
  "Contract & Payment": "/pipeline/contract-payment",
  "P6 Handover": "/pipeline/p6-handover",
};

const QUICK_GROUPS = [
  {
    title: "Capture & Visits",
    icon: peopleIcon,
    color: "#6366F1",
    bg: "#EEF0FE",
    chips: ["Client Intake", "Smart Home & Office Visits", "Video Call Desk"],
  },
  {
    title: "Oversight",
    icon: eyeIcon,
    color: "#16A34A",
    bg: "#E7F8EF",
    chips: ["Cross Branch Flags"],
  },
  {
    title: "Deal Docs",
    icon: fileIcon,
    color: "rgb(245, 158, 11)",
    bg: "rgb(255, 243, 228)",
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
    { id: "p0-1", name: "Kuhu Sharma",    starred: true,  mmlId: "MML - D - 10428", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p0-2", name: "Ankit Sharma",   starred: true,  mmlId: "MML - D - 10429", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P1: [
    { id: "p1-1", name: "Harshit Sharma", starred: false, mmlId: "MML - D - 10430", temperature: "Hot",  score: 8.5, priority: "High",   completion: 40,  days: 4,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p1-2", name: "Arjun Rampal",   starred: false, mmlId: "MML - D - 10431", temperature: "Hot",  score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P2: [
    { id: "p2-1", name: "Ankur Sharma",   starred: false, mmlId: "MML - D - 10432", temperature: "Cold", score: 7.5, priority: "Medium", completion: 75,  days: 6,  hrs: 24, source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p2-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10433", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 6,  source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P3: [
    { id: "p3-1", name: "Aditya Sharma",  starred: true,  mmlId: "MML - D - 10434", temperature: "Cold", score: 8.5, priority: "Medium", completion: 85,  days: 8,  hrs: 24, source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p3-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10435", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P4: [
    { id: "p4-1", name: "Vivek Sharma",   starred: true,  mmlId: "MML - D - 10436", temperature: "Cold", score: 9.0, priority: "Low",    completion: 90,  days: 10, hrs: 6,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p4-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P5: [
    { id: "p5-1", name: "Rohit Sharma",   starred: true,  mmlId: "MML - D - 10438", temperature: "Warm", score: 7.5, priority: "Medium", completion: 60,  days: 12, hrs: 24, source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p5-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10439", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P6: [
    { id: "p6-1", name: "Virat Sharma",   starred: true,  mmlId: "MML - D - 10440", temperature: "Warm", score: 8.5, priority: "Low",    completion: 55,  days: 14, hrs: 24, source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p6-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10441", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
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
          className={`px-4 py-3.5 ${
            i === QUICK_GROUPS.length - 1 ? "lg:flex-1 lg:min-w-0" : "lg:shrink-0"
          } ${i > 0 ? "lg:border-l lg:border-black/8" : ""}`}
        >
          {/* Group header with PNG icon */}
          <div className="flex items-center gap-2 mb-2.5 whitespace-nowrap">
            <img src={group.icon} alt={group.title} style={{ width: 15, height: 15, objectFit: "contain" }} />
            <p className="text-[13px] font-bold text-[#111]">{group.title}</p>
          </div>

          {/* Chips – Deal Docs keeps all five cards on one row */}
          <div className={`flex gap-2 ${group.title === "Deal Docs" ? "flex-wrap lg:flex-nowrap" : "flex-wrap"}`}>
            {group.chips.map((chip) => {
              const chipClass = `
                inline-flex items-center justify-between gap-2
                text-[11.5px] font-medium rounded-lg
                px-2.5 py-[9px]
                min-h-[52px] flex-1
                ${group.title === "Deal Docs" ? "basis-0 min-w-0" : "basis-[140px]"}
                transition-colors text-left text-[#111] no-underline
              `;
              const inner = (
                <>
                  <span
                    className="leading-snug flex-1 min-w-0"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {chip}
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold bg-white/70 rounded px-1.5 py-0.5 self-center text-[#111]">
                    3
                  </span>
                </>
              );
              const to = CHIP_ROUTES[chip];
              return to ? (
                <Link
                  key={chip}
                  to={to}
                  style={{ backgroundColor: group.bg }}
                  className={`${chipClass} hover:brightness-[0.97] hover:ring-1 hover:ring-black/8`}
                >
                  {inner}
                </Link>
              ) : (
                <span key={chip} style={{ backgroundColor: group.bg }} className={chipClass}>
                  {inner}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function BoardToolbar({ search, onSearchChange, perPage, onPerPageChange, view, onViewChange }) {
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

      {/* Right side controls: View toggle & Per Page */}
      <div className="flex items-center gap-2.5 ml-auto shrink-0">
        {/* View toggle */}
        <div className="flex items-center h-10 rounded-xl border border-black/10 bg-white overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => onViewChange("table")}
            title="Table view"
            className={`h-full px-3 flex items-center transition-colors ${
              view === "table" ? "bg-[#7A0A17] text-white" : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
            }`}
          >
            <LayoutList size={15} />
          </button>
          <span className="w-px h-5 bg-black/10" />
          <button
            type="button"
            onClick={() => onViewChange("board")}
            title="Board view"
            className={`h-full px-3 flex items-center transition-colors ${
              view === "board" ? "bg-[#7A0A17] text-white" : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        <div className="relative shrink-0">
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
    </div>
  );
}

/* ───────────────────────── Lead card ───────────────────────── */

function LeadCard({ lead, stageColor, nextStageLabel, stageKey, onOpenScoreModal, onMoveStage, onOpenDeal }) {
  const temperature = TEMPERATURE_STYLES[lead.temperature];
  const priority = PRIORITY_STYLES[lead.priority];

  const urgentHrs = lead.hrs <= 8;
  const canOpenDeal = true;

  return (
    <div
      role={canOpenDeal ? "button" : undefined}
      tabIndex={canOpenDeal ? 0 : undefined}
      onClick={() => canOpenDeal && onOpenDeal?.(lead, stageKey)}
      onKeyDown={(e) => {
        if (canOpenDeal && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpenDeal?.(lead, stageKey);
        }
      }}
      className={`bg-white border border-black/8 rounded-xl p-3.5 flex flex-col gap-3 border-l-4 ${canOpenDeal ? "cursor-pointer hover:shadow-sm" : ""}`}
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
        <button type="button" onClick={(e) => e.stopPropagation()} className="p-1 text-[#9CA3AF] hover:text-[#111] rounded-md hover:bg-black/4 transition-colors shrink-0" aria-label="More options">
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between gap-1.5">
        <Pill tone={temperature}>{lead.temperature}</Pill>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenScoreModal?.(lead);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111] shrink-0 hover:bg-[#F3F4F6] px-1.5 py-0.5 rounded transition-colors"
          title="Click to view Lead Score Details"
        >
          {lead.score.toFixed(1)}
          <Flag size={10} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
        </button>
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
            onClick={(e) => e.stopPropagation()}
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
      </div>

      {/* Move to next stage */}
      {nextStageLabel ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveStage?.(lead, stageKey);
          }}
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

function PipelineColumn({ stage, leads, nextStageId, onOpenScoreModal, onMoveStage, onOpenDeal }) {
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
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stageKey={stage.id}
              stageColor={stage.color}
              nextStageLabel={nextStageId}
              onOpenScoreModal={onOpenScoreModal}
              onMoveStage={onMoveStage}
              onOpenDeal={onOpenDeal}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Table view ─────────────────────── */

const TABLE_COLS = [
  { key: "name",       label: "Client Name" },
  { key: "owner",      label: "Owner" },
  { key: "stage",      label: "Stage" },
  { key: "priority",   label: "Priority" },
  { key: "score",      label: "Lead\nScore" },
  { key: "completion", label: "Profile\nCompletion" },
  { key: "days",       label: "Time at This\nStage" },
  { key: "source",     label: "Source" },
  { key: "followup",   label: "Follow Up\nTime Left" },
  { key: "actions",    label: "Actions" },
];

function PipelineTableView({ flatLeads, onOpenScoreModal, onMoveStage, onOpenDeal }) {
  const getValue = useCallback((row, key) => {
    if (key === "stage") return `${row.stage.id} ${row.stage.label}`;
    if (key === "owner") return OWNER.name;
    if (key === "followup") return row.lead.hrs;
    return row.lead[key];
  }, []);
  const { sorted, sort, toggle } = useTableSort(flatLeads, { defaultKey: "name", getValue });

  const PRIORITY_FLAG = { High: "#E8395B", Medium: "#F59E0B", Low: "#16A34A" };

  return (
    <div>
      {/* Priority legend */}
      <div className="flex items-center gap-4 mb-3">
        {Object.entries(PRIORITY_FLAG).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[12px] text-[#4B5563]">
            <Flag size={11} fill={color} style={{ color }} strokeWidth={0} />
            {label === "High" ? "Low Probability" : label === "Medium" ? "Medium" : "High"}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/8">
                {TABLE_COLS.map((col) => (
                  <SortableTh
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    sort={sort}
                    onSort={toggle}
                    unsortable={col.key === "actions"}
                    className="px-3 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide align-bottom"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ lead, stage }, idx) => {
                const temp   = TEMPERATURE_STYLES[lead.temperature];
                const pri    = PRIORITY_STYLES[lead.priority];
                const urgent = lead.hrs <= 8;
                return (
                  <tr
                    key={idx}
                    onClick={() => onOpenDeal?.(lead, stage.id)}
                    className="border-b border-black/5 last:border-0 hover:bg-[#FAFAFB] transition-colors cursor-pointer"
                  >
                    {/* Client Name */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                        <div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="text-[12.5px] font-semibold text-[#111] hover:text-[#7A0A17] hover:underline"
                            >
                              {lead.name}
                            </button>
                            {lead.starred && <Star size={11} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />}
                          </div>
                          <p className="text-[10px] text-[#9CA3AF]">{lead.mmlId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="text-[12px] font-medium text-[#374151]">{OWNER.name}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{OWNER.role} | {OWNER.branch}</p>
                    </td>

                    {/* Stage */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="text-[12px] text-[#374151]">
                        {stage.id} - {stage.label}{" "}
                        <span style={{ color: temp.color }} className="font-semibold">({lead.temperature})</span>
                      </p>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ color: pri.color, backgroundColor: pri.bg }}
                      >
                        {lead.priority}
                      </span>
                    </td>

                    {/* Lead Score */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenScoreModal?.(lead);
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111] hover:bg-[#F3F4F6] px-1.5 py-0.5 rounded transition-colors"
                        title="Click to view Lead Score Details"
                      >
                        {lead.score.toFixed(1)}
                        <Flag size={10} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
                      </button>
                    </td>

                    {/* Profile Completion */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[12px] font-semibold text-[#374151]">{lead.completion}%</span>
                    </td>

                    {/* Time at Stage */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[12px] text-[#374151]">{lead.days} Days</span>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[12px] text-[#374151]">{lead.source}</span>
                    </td>

                    {/* Follow Up */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {(urgent || idx % 3 === 0) && (
                          <Video size={15} className="text-[#3B82F6] shrink-0" />
                        )}
                        <div>
                          <p className={`text-[12px] font-semibold ${urgent ? "text-[#E8395B]" : "text-[#374151]"}`}>
                            {lead.hrs} HRS Left
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]">Start Time: 12:00</p>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {idx % 3 === 0 ? (
                          <button type="button" className="p-1 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] transition-colors" title="Dropped Call">
                            <PhoneOff size={14} />
                          </button>
                        ) : (
                          <button type="button" className="p-1 rounded-lg text-[#16A34A] hover:bg-[#E7F8EF] transition-colors" title="Call">
                            <Phone size={14} />
                          </button>
                        )}
                        <button type="button" className="p-1 rounded-lg text-[#F59E0B] hover:bg-[#FFF3E4] transition-colors" title="Message">
                          <MessageSquare size={14} />
                        </button>
                        <button type="button" className="relative p-1 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] transition-colors" title="Email">
                          <Mail size={14} />
                          {idx % 2 === 0 && (
                            <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-[#DC2626]" />
                          )}
                        </button>
                        <button type="button" className="p-1 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] transition-colors" title="Schedule">
                          <Calendar size={14} />
                        </button>
                        <button type="button" className="p-1 rounded-lg text-[#9CA3AF] hover:bg-black/5 transition-colors" title="More Options">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Lead Score Modal ─────────────────────── */

function LeadScoreModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/8 w-full max-w-[650px] p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111] hover:bg-black/5 p-1.5 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h3 className="text-[17px] font-bold text-[#111] mb-4">Lead Score Details</h3>

        {/* Top summary section */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[13px] text-[#4B5563] font-medium">Total Lead Score</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[28px] font-bold text-[#16A34A] leading-none">
                {lead.score ? lead.score.toFixed(1) : "8.5"}
              </span>
              <span className="text-[15px] font-semibold text-[#9CA3AF]">/ 10</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Flag size={14} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
              <span className="bg-[#E7F8EF] border border-[#BBF7D0] text-[#16A34A] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
                High
              </span>
            </div>
            <p className="text-[12px] text-[#4B5563] text-right font-medium">
              Great! This lead has a high conversion potential.
            </p>
          </div>
        </div>

        {/* Breakdown & History Card Box */}
        <div className="border border-black/8 rounded-2xl p-4 grid grid-cols-[210px_1fr] gap-5 bg-[#FAFAFB]/50">
          {/* Left Column: Score Breakdown */}
          <div className="pr-3 border-r border-black/8">
            <h4 className="text-[13px] font-bold text-[#111] mb-3">Score Breakdown</h4>
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Profile Completion</span>
                <span>
                  <strong className="text-[#16A34A] font-bold">2.0</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Source Quality</span>
                <span>
                  <strong className="text-[#16A34A] font-bold">2.0</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Client Engagement</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Time at Stage</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#4B5563] font-medium">Follow-up Activity</span>
                <span>
                  <strong className="text-[#F59E0B] font-bold">1.5</strong>{" "}
                  <span className="text-[#9CA3AF]">/ 2.0</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Score History (Last 7 Days) */}
          <div className="flex flex-col justify-between min-w-0">
            <h4 className="text-[13px] font-bold text-[#111] mb-2">
              Score History <span className="text-[#9CA3AF] font-normal">(Last 7 Days)</span>
            </h4>

            {/* SVG Chart with Y-axis scale and X-axis grid lines */}
            <div className="w-full">
              <svg viewBox="0 0 340 135" className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="scoreGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Labels */}
                <text x="20" y="14" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">10</text>
                <text x="20" y="39" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">7.5</text>
                <text x="20" y="64" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">5.0</text>
                <text x="20" y="89" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">2.5</text>
                <text x="20" y="114" textAnchor="end" fill="#9CA3AF" fontSize="9.5" fontWeight="500">0</text>

                {/* Horizontal background grid lines */}
                {[10, 35, 60, 85, 110].map((y) => (
                  <line key={y} x1="28" y1={y} x2="330" y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                ))}

                {/* Vertical background grid lines (aligned with 7 day labels) */}
                {[28, 78.3, 128.6, 179, 229.3, 279.6, 330].map((x) => (
                  <line key={x} x1={x} y1="10" x2={x} y2="110" stroke="rgba(0,0,0,0.06)" />
                ))}

                {/* Filled Gradient Area */}
                <path
                  d="M 28 65 L 78.3 60 L 128.6 35 L 179 78 L 229.3 65 L 279.6 35 L 330 20 L 330 110 L 28 110 Z"
                  fill="url(#scoreGreenGrad)"
                />

                {/* Dashed Line */}
                <path
                  d="M 28 65 L 78.3 60 L 128.6 35 L 179 78 L 229.3 65 L 279.6 35 L 330 20"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* X Axis Day Labels */}
                <text x="28" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">7d ago</text>
                <text x="78.3" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">6d ago</text>
                <text x="128.6" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">5d ago</text>
                <text x="179" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">4d ago</text>
                <text x="229.3" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">3d ago</text>
                <text x="279.6" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">2d ago</text>
                <text x="330" y="127" textAnchor="middle" fill="#9CA3AF" fontSize="9.5" fontWeight="500">Today</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export default function PipelineBoard() {
  const [search, setSearch]             = useState("");
  const [perPage, setPerPage]           = useState(10);
  const [view,   setView]               = useState("table"); // "board" | "table"
  const [selectedScoreLead, setSelectedScoreLead] = useState(null);

  // Dynamic state for pipeline lead items
  const [leadsData, setLeadsData]       = useState(LEADS_BY_STAGE);
  const [subView, setSubView]           = useState(null); // null | "add-p0" | "move-p1" | "move-p2" | "deal-detail"
  const [activeLead, setActiveLead]     = useState(null);
  const [dealTargetStage, setDealTargetStage] = useState("P5");

  const handleAddProspect = (newLead) => {
    const leadWithId = { id: `p0-${Date.now()}`, ...newLead };
    setLeadsData((prev) => ({
      ...prev,
      P0: [leadWithId, ...(prev.P0 || [])],
    }));
    toast.success(`Prospect "${newLead.name}" created successfully in P0 Prospect!`);
  };

  const handleMoveToP1 = (lead, updatedData) => {
    setLeadsData((prev) => {
      const p0Filtered = (prev.P0 || []).filter((l) => l.id !== lead.id);
      const updatedLead = { ...lead, ...updatedData, temperature: "Hot", score: 8.5, completion: 45 };
      return {
        ...prev,
        P0: p0Filtered,
        P1: [updatedLead, ...(prev.P1 || [])],
      };
    });
    toast.success(`Lead "${lead.name}" successfully moved to P1 Qualified!`);
  };

  const handleMoveToP2 = (lead, updatedData) => {
    setLeadsData((prev) => {
      const p1Filtered = (prev.P1 || []).filter((l) => l.id !== lead.id);
      const updatedLead = { ...lead, ...updatedData, temperature: "Hot", score: 9.0, completion: 70 };
      return {
        ...prev,
        P1: p1Filtered,
        P2: [updatedLead, ...(prev.P2 || [])],
      };
    });
    toast.success(`Lead "${lead.name}" successfully moved to P2 Data Collection!`);
  };

  const handleMoveToP3 = (lead) => {
    setLeadsData((prev) => {
      const from = (prev.P2 || []).filter((l) => l.id !== lead.id);
      return { ...prev, P2: from, P3: [{ ...lead, completion: 80 }, ...(prev.P3 || [])] };
    });
    toast.success(`Lead "${lead.name}" moved to P3 Visit / Video!`);
  };

  const handleMoveToP4 = (lead) => {
    setLeadsData((prev) => {
      const from = (prev.P3 || []).filter((l) => l.id !== lead.id);
      return { ...prev, P3: from, P4: [{ ...lead, completion: 90 }, ...(prev.P4 || [])] };
    });
    toast.success(`Lead "${lead.name}" moved to P4 Negotiation!`);
  };

  const handleMoveToP5 = (lead) => {
    setLeadsData((prev) => {
      const p4Filtered = (prev.P4 || []).filter((l) => l.id !== lead.id);
      const updatedLead = { ...lead, temperature: "Warm", completion: 100 };
      return {
        ...prev,
        P4: p4Filtered,
        P5: [updatedLead, ...(prev.P5 || [])],
      };
    });
    toast.success(`Lead "${lead.name}" moved to P5 Payment!`);
  };

  const handleMoveToP6 = (lead) => {
    setLeadsData((prev) => {
      const p5Filtered = (prev.P5 || []).filter((l) => l.id !== lead.id);
      const updatedLead = { ...lead, temperature: "Warm", completion: 100 };
      return {
        ...prev,
        P5: p5Filtered,
        P6: [updatedLead, ...(prev.P6 || [])],
      };
    });
    toast.success(`Lead "${lead.name}" moved to P6 Handover!`);
  };

  const handleOpenDeal = (lead, stageKey) => {
    setActiveLead(lead);
    setDealTargetStage(stageKey);
    setSubView("deal-detail");
  };

  const handleMoveStage = (lead, stageKey) => {
    if (stageKey === "P0") {
      setActiveLead(lead);
      setSubView("move-p1");
    } else if (stageKey === "P1") {
      setActiveLead(lead);
      setSubView("move-p2");
    } else if (stageKey === "P2") {
      handleMoveToP3(lead);
      setSubView(null);
      setActiveLead(null);
    } else if (stageKey === "P3") {
      handleMoveToP4(lead);
      setSubView(null);
      setActiveLead(null);
    } else if (stageKey === "P4") {
      handleMoveToP5(lead);
      setSubView(null);
      setActiveLead(null);
    } else if (stageKey === "P5") {
      handleMoveToP6(lead);
      setSubView(null);
      setActiveLead(null);
    }
  };

  const columns = useMemo(
    () =>
      PIPELINE_STAGES.map((stage, i) => {
        const allLeads = leadsData[stage.id] || [];
        const filtered = search
          ? allLeads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
          : allLeads;
        const next = PIPELINE_STAGES[i + 1];
        return { stage, leads: filtered.slice(0, perPage), nextStageId: next?.id };
      }),
    [search, perPage, leadsData]
  );

  // Flat list for table view
  const flatLeads = useMemo(
    () =>
      PIPELINE_STAGES.flatMap((stage) => {
        const all = leadsData[stage.id] || [];
        const filtered = search
          ? all.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
          : all;
        return filtered.slice(0, perPage).map((lead) => ({ lead, stage }));
      }),
    [search, perPage, leadsData]
  );

  // Sub-page view rendering
  if (subView === "add-p0") {
    return (
      <AddP0ProspectPage
        onBack={() => setSubView(null)}
        onAddProspect={handleAddProspect}
      />
    );
  }

  if (subView === "move-p1") {
    return (
      <MoveToP1Page
        lead={activeLead}
        onBack={() => { setSubView(null); setActiveLead(null); }}
        onMoveToP1={handleMoveToP1}
      />
    );
  }

  if (subView === "move-p2") {
    return (
      <MoveToP2Page
        lead={activeLead}
        onBack={() => { setSubView(null); setActiveLead(null); }}
        onMoveToP2={handleMoveToP2}
      />
    );
  }

  if (subView === "deal-detail") {
    return (
      <DealDetailPage
        lead={activeLead}
        currentStage={dealTargetStage}
        onBack={() => { setSubView(null); setActiveLead(null); }}
        onAdvance={handleMoveStage}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Lead Score Details Modal */}
      <LeadScoreModal
        lead={selectedScoreLead}
        onClose={() => setSelectedScoreLead(null)}
      />

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Pipeline Board</h1>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => toast.success("Pipeline deals exported successfully!")}
            className="inline-flex items-center gap-2 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            onClick={() => setSubView("add-p0")}
            className="inline-flex items-center gap-2 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
          >
            <Plus size={15} /> Add Prospect
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 flex flex-col gap-4 min-w-0">
        <ActionAlertBanner />
        <QuickLinksRow />
        <BoardToolbar
          search={search} onSearchChange={setSearch}
          perPage={perPage} onPerPageChange={setPerPage}
          view={view} onViewChange={setView}
        />

        {view === "board" ? (
          /* Board – break out of px-5 so scroll area is edge-to-edge */
          <div className="-mx-5 flex items-start gap-4 overflow-x-auto pb-2 scrollbar-thin px-5">
            {columns.map(({ stage, leads, nextStageId }) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={leads}
                nextStageId={nextStageId}
                onOpenScoreModal={(lead) => setSelectedScoreLead(lead)}
                onMoveStage={handleMoveStage}
                onOpenDeal={handleOpenDeal}
              />
            ))}
          </div>
        ) : (
          <PipelineTableView
            flatLeads={flatLeads}
            onOpenScoreModal={(lead) => setSelectedScoreLead(lead)}
            onMoveStage={handleMoveStage}
            onOpenDeal={handleOpenDeal}
          />
        )}
      </div>
    </div>
  );
}
