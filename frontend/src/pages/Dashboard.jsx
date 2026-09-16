import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  History,
  Activity,
  Users,
  UserRoundCheck,
  ArrowRight,
  X,
  Paperclip,
  Copy,
  Download,
  Mic,
  Send,
  Star,
  Flag,
  MessageSquare,
  Calendar,
  Clock,
  MoreVertical,
  Zap,
  Flame,
  Snowflake,
  UserPlus,
  ClipboardList,
  UploadCloud,
  IndianRupee,
  BadgePercent,
  FileCheck2,
  Heart,
  Bell,
  Crown,
  Sparkles,
  Filter,
} from "lucide-react";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
import EmailActivityButton from "../components/common/EmailActivityButton.jsx";
import FollowUpHoverCard from "../components/common/FollowUpHoverCard.jsx";
import LeadScoreModal from "../components/pipeline/LeadScoreModal";
import DealDetailPage from "./pipeline/DealDetailPage";
import AddP0ProspectPage from "./pipeline/AddP0ProspectPage";
import SearchField from "../components/common/SearchField.jsx";
import { toast } from "react-toastify";
import { USER } from "../components/layout/TopBar";
import salesFunnelImg from "../assets/seles-funnel.png";
import salesPersonProfile from "../assets/sale-person-profile.jpg";
import visitsArrow from "../assets/Monthly-visits-  Meetings-arrow.png";
import revenueArrow from "../assets/Revenue-arrow.png";
import callsArrow from "../assets/Calls per Day-arrow.png";
import conversionArrow from "../assets/Conversion Rate-arrow.png";
import registrationsArrow from "../assets/No. of registrations-arrow.png";
import followupArrow from "../assets/Follow-up Discipline-arrow.png";
import visitsIcon from "../assets/Monthly- visits- Meetings-icon.png";
import revenueIcon from "../assets/revenue-icon.png";
import callsIcon from "../assets/Calls per Day-icon.png";
import conversionIcon from "../assets/Conversion Rate-icon.png";
import registrationsIcon from "../assets/No. of registrations-icon.png";
import followupIcon from "../assets/Follow-up Discipline-icons.png";

/* ───────────────────────── Data ───────────────────────── */

const PERIOD_OPTIONS = [
  { id: "today",        label: "Today" },
  { id: "this_week",    label: "This Week" },
  { id: "this_month",   label: "This Month" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "this_year",    label: "This Year" },
];

const STATS = [
  { label: "Total Clients", value: "34", note: "+10% vs Month",   noteTone: "green", icon: Users,          bg: "#FDECEE", fg: "#E8395B" },
  { label: "New Leads",     value: "12", note: "+10% Last Month", noteTone: "green", icon: UserPlus,       bg: "#EEF0FE", fg: "#6366F1" },
  { label: "Today's tasks", value: "12", note: "3 high priority", noteTone: "red",   icon: ClipboardList,  bg: "#FFF3E4", fg: "#F59E0B" },
];

const QUICK_ACTIONS = [
  { label: "Create Lead",     icon: UserPlus,      bg: "#FDECEE", fg: "#E8395B", action: "lead" },
  { label: "Create Task",     icon: ClipboardList, bg: "#E8F2FE", fg: "#3B82F6", to: "/tasks" },
  { label: "Create Meeting",  icon: Calendar,      bg: "#F0EBFE", fg: "#8B5CF6", to: "/calendar" },
  { label: "Upload Biodata",  icon: UploadCloud,   bg: "#E7F8EF", fg: "#16A34A", to: "/documents" },
];

const PERFORMANCE_SEGMENTS = [
  {
    key: "visits",
    label: "Monthly visits /\nMeetings",
    value: "12",
    target: "15",
    color: "#7FC9A9",
    capsuleBg: "#E9F6EC",
    iconSrc: visitsIcon,
    layout: "row",
    tall: true,
    arrow: visitsArrow,
    pos: { top: "0%", left: "0%" },
    arrowStyle: { left: "86%", top: "30%", width: "15.5cqw" },
  },
  {
    key: "revenue",
    label: "Revenue",
    value: "₹4.8L",
    target: "8L",
    color: "#B86FBE",
    capsuleBg: "#F6E6F8",
    iconSrc: revenueIcon,
    layout: "row",
    tall: true,
    arrow: revenueArrow,
    pos: { top: "4%", right: "0%" },
    arrowStyle: { left: "0%", top: "78%", width: "9.5cqw" },
  },
  {
    key: "calls",
    label: "Calls per\nDay",
    value: "68",
    target: "80",
    color: "#BF4C70",
    capsuleBg: "#FEEBEC",
    iconSrc: callsIcon,
    layout: "stack",
    arrow: callsArrow,
    pos: { top: "38%", right: "0%" },
    arrowStyle: { right: "68%", top: "90%", width: "13cqw" },
  },
  {
    key: "conversion",
    label: "Conversion Rate",
    value: "24%",
    target: null,
    color: "#5596CD",
    capsuleBg: "#E7EEF8",
    iconSrc: conversionIcon,
    layout: "row",
    arrow: conversionArrow,
    pos: { top: "79%", right: "0%" },
    arrowStyle: { right: "calc(100% + 6px)", top: "-42%", width: "8.5cqw" },
  },
  {
    key: "registrations",
    label: "No. of\nregistrations",
    value: "14",
    target: "50",
    note: "28% of target",
    color: "#E76B3D",
    capsuleBg: "#FEE9D8",
    iconSrc: registrationsIcon,
    layout: "row",
    arrow: registrationsArrow,
    pos: { top: "74%", left: "0%" },
    arrowStyle: { left: "82%", top: "-40%", width: "12cqw" },
  },
  {
    key: "followup",
    label: "Follow-up\nDiscipline",
    value: "92",
    target: "100",
    color: "#DA9644",
    capsuleBg: "#FEF2DD",
    iconSrc: followupIcon,
    layout: "stack",
    arrow: followupArrow,
    pos: { top: "31%", left: "0%" },
    arrowStyle: { left: "66%", top: "-16%", width: "12cqw" },
  },
];

const PERFORMANCE_OVERALL_SCORE = 87;

const UP_NEXT = {
  dateLabel: "UP NEXT - NOV 10:35 AM",
  badge: "Today",
  title: "Follow up on Payment",
  time: "11:00 AM – 12:00 PM",
};

const UNSCHEDULED_ITEM = {
  title: "Call back Sethi",
  note: "Lead · 30 min",
};

const RECENT_UPDATES = [
  { id: 1, icon: UserPlus,       bg: "#FDECEE", fg: "#E8395B", title: "Rahul Sharma",      desc: "A new client is registered",       time: "2 min ago" },
  { id: 2, icon: IndianRupee,    bg: "#E7F8EF", fg: "#16A34A", title: "Payment Received",  desc: "Payment of ₹40,000 recieved.",      time: "30 min ago" },
  { id: 3, icon: BadgePercent,   bg: "#E8F2FE", fg: "#3B82F6", title: "Discount Approval", desc: "10% discount approved for Neha Kapoor", time: "1 day ago" },
  { id: 4, icon: UserRoundCheck, bg: "#FDECEE", fg: "#E8395B", title: "Lead Converted",    desc: "Rohit Sharma has been successfully converted into a client", time: "2 days ago" },
  { id: 5, icon: FileCheck2,     bg: "#E7F8EF", fg: "#16A34A", title: "Bio Data Recieved", desc: "Bio data received from Amit Verma", time: "2 days ago" },
];

const LEAD_HEALTH = [
  { key: "hot",  label: "Hot Leads",  count: 18, icon: Flame,     bg: "#FDECEE", fg: "#E8395B" },
  { key: "warm", label: "Warm Leads", count: 18, icon: Flame,     bg: "#FFF3E4", fg: "#F59E0B" },
  { key: "cold", label: "Cold Leads", count: 18, icon: Snowflake, bg: "#E8F2FE", fg: "#3B82F6" },
];

const FUNNEL_ROWS = [
  { key: "new",         stat: "P0 - 482", pct: "100%", to: "to P1" },
  { key: "contacted",   stat: "P0 - 482", pct: "100%", to: "to P1" },
  { key: "qualified",   stat: "P1 - 395", pct: "82%",  to: "to P2", dropPct: "18%", dropCount: "87" },
  { key: "profile",     stat: "P2 - 351", pct: "75%",  to: "to P3", dropPct: "11%", dropCount: "87" },
  { key: "video",       stat: "P3 - 295", pct: "60%",  to: "to P4", dropPct: "16%", dropCount: "87" },
  { key: "negotiation", stat: "P4 - 260", pct: "52%",  to: "to P5", dropPct: "14%", dropCount: "87" },
  { key: "payment",     stat: "P5 - 224", pct: "44%",  to: "to P6", dropPct: "8%",  dropCount: "118" },
  { key: "handover",    stat: "P6 - 224", pct: "43%",  to: "Final Conversion", dropCount: "87", isFinal: true },
];

const AI_ACTIONS = [
  { label: "Create",   icon: Plus,      color: "#16A34A" },
  { label: "Refresh",  icon: RefreshCw, color: "#3B82F6" },
  { label: "History",  icon: History,   color: "#E8395B" },
  { label: "Activity", icon: Activity,  color: "#8B5CF6" },
];

const AI_TAGS = ["Summary of the month", "Tomorrow Meetings"];

const PRIORITY_ITEMS = [
  {
    parts: [
      { text: "5 high-value leads waiting for " },
      { text: "follow-up", to: "/pipeline" },
    ],
  },
  {
    parts: [
      { text: "₹18,400 in " },
      { text: "discount", to: "/pipeline?openLead=p4-1&tab=discounts" },
      { text: " approvals pending across 3 requests" },
    ],
  },
  {
    parts: [
      { text: "2 " },
      { text: "client", to: "/clients" },
      { text: " profiles awaiting completion before their " },
      { text: "meetings", to: "/calendar" },
    ],
  },
  {
    parts: [
      { text: "You're at 74% of this month's ₹25L " },
      { text: "target", to: "/hrms?tab=Incentives" },
    ],
  },
  {
    parts: [
      { text: "1 urgent " },
      { text: "complaint", to: `/hrms?tab=${encodeURIComponent("Complaint & Warning")}` },
      { text: " flagged — needs a same-day response" },
    ],
  },
  {
    parts: [
      { text: "AI recommends contacting clients " },
      { text: "Ananya Verma", to: "/pipeline?openLead=p4-1" },
      { text: " and " },
      { text: "Vikram Chawla", to: "/pipeline?openLead=p4-2" },
      { text: " today — both are close to closing" },
    ],
  },
];

const PRIORITY_STYLES = {
  High:   { color: "#E8395B", bg: "bg-[#FDECEE]" },
  Medium: { color: "#F59E0B", bg: "bg-[#FFF3E4]" },
  Low:    { color: "#16A34A", bg: "bg-[#E7F8EF]" },
};

const LEAD_DOT_COLORS = ["#E8395B", "#F59E0B", "#3B82F6", "#E8395B", "#E8395B", "#E8395B"];

const MY_LEADS = [
  { id: "MML-ID-D-10428", name: "Kuhu Sharma",    starred: true,  stage: "P0 - New",              stageTone: null,   priority: "High",   leadScore: 8.5, profileCompletion: 100, source: "Outbound Calls",   followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Outbound follow-up call" },
  { id: "MML-ID-D-10428", name: "Harshit Sharma", starred: false, stage: "P1 - Qualified",        stageTone: "Lost", priority: "High",   leadScore: 8.5, profileCompletion: 50,  source: "Brand Walking",    followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: true,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Re-engagement call" },
  { id: "MML-ID-D-10428", name: "Aditya Sharma",  starred: false, stage: "P3 - Video Call/Visit", stageTone: "Cold", priority: "Medium", leadScore: 8.5, profileCompletion: 85,  source: "Channel Partner",  followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Confirm video call slot" },
  { id: "MML-ID-D-10428", name: "Vivek Sharma",   starred: false, stage: "P4 - Negotiation",      stageTone: null,   priority: "Low",    leadScore: 9.0, profileCompletion: 90,  source: "Reference - Satish", followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Call Client for pricing confirmation at 8 PM" },
  { id: "MML-ID-D-10429", name: "Vivek Sharma",   starred: false, stage: "P4 - Negotiation",      stageTone: null,   priority: "Low",    leadScore: 9.0, profileCompletion: 90,  source: "Reference - Satish", followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Call Client for pricing confirmation at 8 PM" },
  { id: "MML-ID-D-10428", name: "Virat Sharma",   starred: false, stage: "P6 - Service Handover", stageTone: null,   priority: "Low",    leadScore: 8.5, profileCompletion: 90,  source: "Online - Insta",   followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Confirm handover checklist" },
];

/* ───────────────────────── Header controls ───────────────────────── */

function PeriodSelect({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PERIOD_OPTIONS.find((o) => o.id === value) ?? PERIOD_OPTIONS.find((o) => o.id === "this_month") ?? PERIOD_OPTIONS[0];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors ${
          compact ? "h-9" : "h-[38px]"
        }`}
      >
        {selected.label}
        <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-40 py-1 overflow-hidden">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                opt.id === value ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Cards ───────────────────────── */

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="bg-white border border-black/8 rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
      <span className="size-11 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: stat.bg }}>
        <Icon size={21} style={{ color: stat.fg }} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#6B7280] leading-snug">{stat.label}</p>
        <p className="text-[22px] font-bold text-[#111] leading-tight mt-0.5">{stat.value}</p>
        {stat.note && (
          <p className={`text-[10px] mt-0.5 leading-tight ${
            stat.noteTone === "green"
              ? "text-[#16A34A] font-medium"
              : stat.noteTone === "red"
                ? "text-[#E8395B] font-semibold"
                : "text-[#6B7280]"
          }`}>
            {stat.note}
          </p>
        )}
      </div>
    </div>
  );
}

function QuickActionsCard({ onCreateLead }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-black/8 rounded-2xl px-4 py-3.5 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 shrink-0">
        <span className="size-8 rounded-lg bg-[#FFF3E4] grid place-items-center">
          <Zap size={15} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
        </span>
        <p className="text-[14px] font-bold text-[#111] whitespace-nowrap">Quick Actions</p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {QUICK_ACTIONS.map(({ label, icon: Icon, bg, fg, to, action }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (action === "lead") onCreateLead?.();
              else if (to) navigate(to);
            }}
            className="inline-flex items-center gap-2 h-10 pl-2 pr-3.5 rounded-xl bg-white border border-black/8 hover:bg-[#FAFAFB] transition-colors"
          >
            <span className="size-6 rounded-lg grid place-items-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={13} style={{ color: fg }} strokeWidth={1.8} />
            </span>
            <span className="text-[12.5px] font-semibold text-[#374151] whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PerformanceScoreCard() {
  const n = PERFORMANCE_SEGMENTS.length;
  const gradient = PERFORMANCE_SEGMENTS.map((s, i) => `${s.color} ${(i * 360) / n}deg ${((i + 1) * 360) / n}deg`).join(", ");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col h-full overflow-visible">
      <h2 className="text-[17px] font-bold text-[#111] px-1 flex items-center gap-2">
        <Crown size={16} className="text-[#7A0A17]" fill="#7A0A17" strokeWidth={0} />
        My Performance Score
      </h2>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative w-full max-w-[420px] aspect-square [container-type:inline-size]">
        <div
          className="absolute inset-[24.5%] rounded-full"
          style={{ background: `conic-gradient(${gradient})`, transform: "rotate(-30deg)" }}
        />
        <div className="absolute inset-[29.5%] rounded-full bg-white" />
        <div className="absolute inset-[32%] rounded-full overflow-hidden">
          <img
            src={salesPersonProfile}
            alt="Sales person"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 8%" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[46%] flex flex-col items-center justify-center"
            style={{ backgroundColor: "#7A0A17" }}
          >
            <p className="text-[11px] font-semibold text-white leading-tight">Overall Score</p>
            <p className="text-[20px] font-extrabold text-white leading-none mt-0.5">
              {PERFORMANCE_OVERALL_SCORE}
              <span className="text-[13px] font-semibold text-white/85"> / 100</span>
            </p>
          </div>
          <div className="absolute inset-x-0 top-[54%] h-[2px] bg-white" />
        </div>

        {PERFORMANCE_SEGMENTS.map((s) => {
          const stacked = s.layout === "stack";
          return (
            <div
              key={s.key}
              className="absolute z-[2]"
              style={{
                top: s.pos.top,
                left: s.pos.left,
                right: s.pos.right,
              }}
            >
              <div className="relative w-max">
                <img
                  src={s.arrow}
                  alt=""
                  className="absolute pointer-events-none select-none z-[1] max-w-none [@container(max-width:340px)]:hidden"
                  style={s.arrowStyle}
                />
                <div
                  className="relative z-[2] rounded-[22px]"
                  style={{
                    backgroundColor: s.capsuleBg,
                    display: "flex",
                    flexDirection: stacked ? "column" : "row",
                    alignItems: "center",
                    textAlign: stacked ? "center" : "left",
                    width: stacked ? 98 : undefined,
                    minHeight: stacked ? 112 : !stacked && s.tall ? 68 : undefined,
                    padding: stacked ? "12px 10px 11px" : s.tall ? "11px 14px" : "9px 12px",
                    gap: stacked ? 7 : 8,
                  }}
                >
                  <span
                    className="rounded-full bg-white grid place-items-center shrink-0"
                    style={{ width: stacked ? 28 : 22, height: stacked ? 28 : 22 }}
                  >
                    <img
                      src={s.iconSrc}
                      alt=""
                      className="object-contain"
                      style={{ width: stacked ? 15 : 13, height: stacked ? 15 : 13 }}
                    />
                  </span>
                  <div className={stacked ? "w-full" : "min-w-0"}>
                    <p
                      className="font-semibold leading-tight whitespace-pre-line"
                      style={{ color: s.color, fontSize: stacked ? 11 : 11.5 }}
                    >
                      {s.label}
                    </p>
                    <p className="text-[15px] font-bold leading-tight mt-0.5" style={{ color: s.color }}>
                      {s.value}
                      {s.target && (
                        <span className="text-[12.5px] font-semibold" style={{ color: s.color, opacity: 0.55 }}>
                          {" "}/ {s.target}
                        </span>
                      )}
                    </p>
                    {s.note && (
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: s.color, opacity: 0.7 }}>
                        {s.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function UpNextCard() {
  return (
    <div className="bg-[#FDECEE] border border-[#F6C7CF] rounded-2xl p-3.5 flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] font-bold text-[#E8395B] uppercase tracking-wide whitespace-nowrap">{UP_NEXT.dateLabel}</p>
        <span className="text-[9px] font-bold text-white bg-[#E8395B] rounded-md px-2 py-0.5">{UP_NEXT.badge}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
        <p className="text-[13.5px] font-bold text-[#111]">{UP_NEXT.title}</p>
        <Link to="/calendar" className="text-[11px] font-semibold text-[#3B82F6] hover:underline shrink-0">
          Details
        </Link>
      </div>
      <p className="text-[11.5px] font-semibold text-[#374151] mt-1">{UP_NEXT.time}</p>
    </div>
  );
}

function UnscheduledCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-3.5 flex-1 min-w-0">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Unscheduled</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="size-2 rounded-full bg-[#E8395B] shrink-0" />
        <p className="text-[13.5px] font-bold text-[#111] truncate">{UNSCHEDULED_ITEM.title}</p>
      </div>
      <p className="text-[11px] text-[#9CA3AF] mt-1">{UNSCHEDULED_ITEM.note}</p>
    </div>
  );
}

function RecentUpdatesCard() {
  const [items, setItems] = useState(RECENT_UPDATES);
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-lg bg-[#FFF3E4] grid place-items-center">
            <Bell size={14} className="text-[#F59E0B]" strokeWidth={1.8} />
          </span>
          <h2 className="text-[15px] font-bold text-[#111]">Recent Updates</h2>
        </div>
        <button
          type="button"
          onClick={() => setItems([])}
          className="text-[11px] font-semibold text-[#7A0A17] hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="flex flex-col divide-y divide-black/6 overflow-y-auto">
        {items.map((u) => (
          <div key={u.id} className="flex items-start gap-3 py-2.5">
            <span className="size-8 rounded-lg grid place-items-center shrink-0" style={{ backgroundColor: u.bg }}>
              <u.icon size={14} style={{ color: u.fg }} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-[#111] leading-tight">{u.title}</p>
              <p className="text-[11px] text-[#9CA3AF] leading-snug mt-0.5">{u.desc}</p>
            </div>
            <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap shrink-0">{u.time}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-[12px] text-[#9CA3AF] py-4 text-center">All caught up.</p>}
      </div>

      <Link
        to="/notifications"
        className="text-center text-[11.5px] font-semibold text-[#7A0A17] hover:underline mt-2 pt-2 border-t border-black/6"
      >
        See all notifications
      </Link>
    </div>
  );
}

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState(AI_TAGS);
  const [activeTag, setActiveTag] = useState(null);

  const contentHeading = activeTag || "Today's Priority";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col gap-3.5 h-full">
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

function SalesFunnelCard() {
  const [period, setPeriod] = useState("Daily");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[17px] font-bold text-[#111] flex items-center gap-2">
          <Filter size={18} className="text-[#7A0A17]" fill="#7A0A17" strokeWidth={2} />
          Sales Funnel (P0 - P6)
        </h2>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white border border-black/12 text-[12px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            {period}
            <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-[calc(100%+6px)] min-w-[120px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-40 py-1 overflow-hidden">
              {["Daily", "Weekly", "Monthly"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setPeriod(opt); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-[12.5px] transition-colors ${
                    opt === period ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-stretch gap-1 mt-1 flex-1 min-h-[420px]">
        <div className="flex-1 flex items-center justify-center min-w-0">
          <img
            src={salesFunnelImg}
            alt="Sales funnel from New to Handover"
            className="h-full w-full object-contain object-center select-none pointer-events-none"
          />
        </div>
        <div className="shrink-0 flex flex-col pt-[9%] pb-[2%] pr-2">
          {FUNNEL_ROWS.map((row) => (
            <div key={row.key} className="flex-1 flex items-center min-h-0">
              <div className="flex items-start gap-1.5">
                <span className="text-[13px] font-bold text-[#111] leading-[1.25] whitespace-nowrap tabular-nums">
                  {row.stat} →
                </span>
                <div className="flex items-start">
                  <div className={row.isFinal ? "" : "min-w-[2.6rem]"}>
                    {row.isFinal ? (
                      <>
                        <p className="text-[13px] font-medium text-[#9CA3AF] leading-[1.25] whitespace-nowrap">
                          Final Conversion
                        </p>
                        <p className="text-[13px] font-bold text-[#111] leading-[1.25] mt-px whitespace-nowrap tabular-nums">
                          {row.pct}{" "}
                          <span className="text-[12px] font-medium text-[#9CA3AF]">({row.dropCount})</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[13px] font-bold text-[#111] leading-[1.25] tabular-nums">{row.pct}</p>
                        <p className="text-[11.5px] font-medium text-[#9CA3AF] leading-[1.25] mt-px">{row.to}</p>
                      </>
                    )}
                  </div>
                  {row.dropPct && (
                    <div className="flex items-start ml-2 pl-2.5 border-l border-[#D1D5DB]">
                      <div>
                        <p className="text-[11.5px] font-medium text-[#6B7280] leading-[1.25] whitespace-nowrap">
                          Drop off
                        </p>
                        <p className="leading-[1.25] mt-px whitespace-nowrap tabular-nums">
                          <span className="text-[13px] font-bold text-[#E11D48]">{row.dropPct}</span>
                          {" "}
                          <span className="text-[12px] font-medium text-[#9CA3AF]">({row.dropCount})</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MY_LEADS_VIEWS = [
  { id: "team", label: "My Team" },
  { id: "branch", label: "My Branch" },
];

function stageKeyFromLead(lead) {
  const match = String(lead.stage || "").match(/P[0-6]/);
  return match ? match[0] : "P0";
}

const STAGE_LABELS_DASH = {
  P0: "P0 - New",
  P1: "P1 - Qualified",
  P2: "P2 - Profile Creation",
  P3: "P3 - Video Call/Visit",
  P4: "P4 - Negotiation",
  P5: "P5 - Profile Creation",
  P6: "P6 - Service Handover",
};

const NEXT_STAGE_DASH = {
  P0: "P1",
  P1: "P2",
  P2: "P3",
  P3: "P4",
  P4: "P5",
  P5: "P6",
};

function MyLeadsCard({ leads, onOpenDeal, onMoveStage }) {
  const [period, setPeriod] = useState("today");
  const [leadsView, setLeadsView] = useState("team");
  const [leadsViewOpen, setLeadsViewOpen] = useState(false);
  const [scoreLead, setScoreLead] = useState(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const leadsViewRef = useRef(null);
  const { sorted, sort, toggle } = useTableSort(leads, { defaultKey: "name" });

  useEffect(() => {
    const h = (e) => {
      if (leadsViewRef.current && !leadsViewRef.current.contains(e.target)) setLeadsViewOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <LeadScoreModal lead={scoreLead} onClose={() => setScoreLead(null)} />
      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} />

      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <h2 className="text-[17px] font-bold text-[#111] flex items-center gap-2">
          <Heart size={16} className="text-[#E8395B]" fill="#E8395B" strokeWidth={0} />
          Lead Health
        </h2>
        <div className="flex items-center gap-2.5 flex-wrap">
          {LEAD_HEALTH.map((h) => (
            <span
              key={h.key}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold rounded-xl px-3 py-1.5"
              style={{ backgroundColor: h.bg, color: h.fg }}
            >
              <h.icon size={13} fill={h.fg} strokeWidth={0} />
              {h.label}
              <span className="font-bold">{h.count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="relative" ref={leadsViewRef}>
          <button
            type="button"
            onClick={() => setLeadsViewOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[17px] font-bold text-[#111]"
          >
            My Leads
            <ChevronDown
              size={16}
              className={`text-[#9CA3AF] transition-transform ${leadsViewOpen ? "rotate-180" : ""}`}
            />
          </button>
          {leadsViewOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] min-w-[160px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-40 py-1 overflow-hidden">
              {MY_LEADS_VIEWS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setLeadsView(opt.id);
                    setLeadsViewOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                    opt.id === leadsView
                      ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold"
                      : "text-[#4B5563] hover:bg-[#FAFAFB]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            {[
              { label: "Low Probability", color: "#E8395B" },
              { label: "Medium",           color: "#F59E0B" },
              { label: "High",             color: "#16A34A" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                <Flag size={12} style={{ color: f.color }} fill={f.color} strokeWidth={0} />
                {f.label}
              </span>
            ))}
          </div>
          <PeriodSelect value={period} onChange={setPeriod} compact />
        </div>
      </div>

      <div className="border border-black/8 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "9%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-black/8">
              {[
                { label: "Client Name", key: "name" },
                { label: "Stage", key: "stage" },
                { label: "Priority", key: "priority" },
                { label: "Lead\nScore", key: "leadScore" },
                { label: "Profile\nCompletion", key: "profileCompletion" },
                { label: "Source", key: "source" },
                { label: "Follow Up\nTime Left", key: "followUp" },
                { label: "Actions", key: "actions", unsortable: true },
              ].map((h) => (
                <SortableTh
                  key={h.key}
                  label={h.label}
                  sortKey={h.key}
                  sort={sort}
                  onSort={toggle}
                  unsortable={h.unsortable}
                  className={`text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide py-2 align-bottom ${
                    h.key === "name" ? "pl-2.5 pr-3" : "px-2"
                  }`}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead, i) => {
              const priority = PRIORITY_STYLES[lead.priority];
              const stageKey = stageKeyFromLead(lead);
              const canMove = stageKey === "P0" || stageKey === "P1";
              const stageBody = (
                <>
                  {lead.stage}
                  {lead.stageTone && (
                    <span className={`ml-1 text-[11px] font-semibold ${lead.stageTone === "Won" ? "text-[#16A34A]" : lead.stageTone === "Lost" ? "text-[#E8395B]" : "text-[#3B82F6]"}`}>
                      ({lead.stageTone})
                    </span>
                  )}
                </>
              );
              return (
                <tr
                  key={`${lead.id}-${lead.name}-${i}`}
                  onClick={() => onOpenDeal?.(lead)}
                  className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors cursor-pointer"
                >
                  <td className="pl-2.5 pr-3 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: LEAD_DOT_COLORS[i % LEAD_DOT_COLORS.length] }} />
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <p className="text-[13px] font-bold text-[#111] truncate">{lead.name}</p>
                          {lead.starred && <Star size={12} className="text-[#F59E0B] shrink-0" fill="#F59E0B" strokeWidth={0} />}
                        </span>
                        <p className="text-[10px] text-[#9CA3AF] truncate">{lead.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    {canMove ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveStage?.(lead, stageKey);
                        }}
                        className="text-left text-[12px] text-[#374151] leading-tight hover:text-[#7A0A17] hover:underline decoration-[#7A0A17]/40 underline-offset-2 transition-colors"
                        title={stageKey === "P0" ? "Move to P1" : "Move to P2"}
                      >
                        {stageBody}
                      </button>
                    ) : (
                      <p className="text-[12px] text-[#374151] leading-tight">{stageBody}</p>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md ${priority.bg}`} style={{ color: priority.color }}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScoreLead(lead);
                      }}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-[#111] hover:bg-[#F3F4F6] px-1.5 py-0.5 rounded transition-colors"
                      title="Click to view Lead Score Details"
                    >
                      {lead.leadScore.toFixed(1)}
                      <Flag size={11} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-[12px] text-[#6B7280]">{lead.profileCompletion}%</td>
                  <td className="px-2 py-3 text-[12px] text-[#6B7280] leading-tight">{lead.source}</td>
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <FollowUpHoverCard
                      lastDiscussionAt={lead.lastDiscussion}
                      nextActionAt={lead.nextAction}
                      nextActionNote={lead.nextActionNote}
                      urgency={lead.followUp}
                      onFollowUp={() => toast.info("Follow-up history coming soon.")}
                    >
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${lead.followUpTone}`}>
                        <Clock size={11} className="shrink-0" /> {lead.followUp}
                      </span>
                      <p className="text-[10px] text-[#9CA3AF] leading-tight">{lead.followUpNote}</p>
                    </FollowUpHoverCard>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-0 flex-nowrap">
                      <button
                        type="button"
                        onClick={() => setMessageOpen(true)}
                        className="p-1.5 text-[#F59E0B] hover:bg-black/4 rounded-lg transition-colors"
                        title="Message"
                        aria-label="Message"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <EmailActivityButton
                        className="relative p-1.5 text-[#3B82F6] hover:bg-black/4 rounded-lg transition-colors"
                        hasUnread={i % 2 === 0}
                        recipientName={lead.name}
                      />
                      <button type="button" className="p-1.5 text-[#6B7280] hover:bg-black/4 rounded-lg transition-colors" title="More Options" aria-label="More Options">
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
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function Dashboard() {
  const [period, setPeriod] = useState("this_month");
  const [search, setSearch] = useState("");
  const [dealLead, setDealLead] = useState(null);
  const [dealStage, setDealStage] = useState(null);
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [myLeads, setMyLeads] = useState(MY_LEADS);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const visibleLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return myLeads;
    return myLeads.filter((l) => `${l.name} ${l.id} ${l.stage} ${l.source}`.toLowerCase().includes(q));
  }, [myLeads, search]);

  const openDeal = (lead, stageKey) => {
    setDealLead(lead);
    setDealStage(stageKey || stageKeyFromLead(lead));
  };

  const updateLeadStage = (lead, nextStage, patch = {}) => {
    const stageLabel = STAGE_LABELS_DASH[nextStage] || nextStage;
    setMyLeads((prev) =>
      prev.map((l) =>
        l.name === lead.name && l.id === lead.id
          ? { ...l, ...patch, stage: stageLabel, starred: patch.starred ?? l.starred }
          : l
      )
    );
    setDealLead((prev) => (prev ? { ...prev, ...patch, stage: stageLabel } : prev));
    setDealStage(nextStage);
  };

  if (showAddProspect) {
    return (
      <AddP0ProspectPage
        onBack={() => setShowAddProspect(false)}
        onAddProspect={(newLead) => {
          toast.success(`Prospect "${newLead.name}" created successfully in P0 Prospect!`);
        }}
      />
    );
  }

  if (dealLead) {
    return (
      <DealDetailPage
        lead={{ name: dealLead.name, mmlId: dealLead.id, starred: dealLead.starred }}
        currentStage={dealStage || stageKeyFromLead(dealLead)}
        onBack={() => {
          setDealLead(null);
          setDealStage(null);
        }}
        onAdvance={(lead, stageKey) => {
          const next = NEXT_STAGE_DASH[stageKey];
          if (!next) return;
          updateLeadStage(lead, next);
          toast.success(`Lead "${lead.name || dealLead.name}" moved to ${STAGE_LABELS_DASH[next]}!`);
        }}
        onP0DetailsSaved={(lead, details) => {
          updateLeadStage(lead, "P1", {
            starred: details?.premium === "Yes",
          });
          toast.success(`Details saved. Lead "${lead.name || dealLead.name}" moved to P1 Qualified!`);
        }}
        onPremiumChange={(premium) => {
          setDealLead((prev) => (prev ? { ...prev, starred: premium } : prev));
          setMyLeads((prev) =>
            prev.map((l) => (l.name === dealLead.name && l.id === dealLead.id ? { ...l, starred: premium } : l))
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">
          {greeting}, {USER.name}
        </h1>

        <div className="flex items-center gap-2.5 shrink-0">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search here..."
            className="w-[240px] sm:w-[280px]"
          />
          <PeriodSelect value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
          <QuickActionsCard onCreateLead={() => setShowAddProspect(true)} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
          <PerformanceScoreCard />
          <AIAssistant />
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-stretch gap-3">
              <UpNextCard />
              <UnscheduledCard />
            </div>
            <RecentUpdatesCard />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 items-start">
          <MyLeadsCard
            leads={visibleLeads}
            onOpenDeal={(lead) => openDeal(lead)}
            onMoveStage={(lead, stageKey) => openDeal(lead, stageKey)}
          />
          <SalesFunnelCard />
        </div>
      </div>
    </div>
  );
}
