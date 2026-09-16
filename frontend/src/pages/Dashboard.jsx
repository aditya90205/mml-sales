import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  History,
  Activity,
  Users,
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
  SquareCheck,
  FileText,
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
import CreateLeadModal from "../components/pipeline/CreateLeadModal";
import CreateMeetingEventModal from "../components/calendar/CreateMeetingEventModal";
import CreateTaskModal from "../components/calendar/CreateTaskModal";
import SearchField from "../components/common/SearchField.jsx";
import { toast } from "react-toastify";
import { USER } from "../components/layout/TopBar";
import {
  markAllNotificationsRead,
  readNotifications,
  subscribeNotifications,
} from "../utils/notifications.js";
import {
  addExtraEvent,
  meetingFormToCalendarItem,
  readUnscheduled,
  removeUnscheduled,
  subscribeCalendar,
  unscheduledToMeetingForm,
} from "../utils/calendarStore.js";
import salesFunnelSvg from "../assets/sales-funnel.svg";
import salesPersonProfile from "../assets/sale-person-profile.jpg";
import visitsArrow from "../assets/Monthly-visits-  Meetings-arrow.png";
import revenueArrow from "../assets/Revenue-arrow.png";
import callsArrow from "../assets/Calls per Day-arrow.png";
import conversionArrow from "../assets/Conversion Rate-arrow.png";
import registrationsArrow from "../assets/No. of registrations-arrow.svg";
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
  { label: "Total Clients", value: "34", note: "+10% vs Month",   noteTone: "green", icon: Users,          bg: "#FDECEE", fg: "#E8395B", to: "/clients" },
  { label: "New Leads",     value: "12", note: "+10% Last Month", noteTone: "green", icon: UserPlus,       bg: "#EEF0FE", fg: "#6366F1", to: "/pipeline?stage=P0" },
  { label: "Today's tasks", value: "12", note: "3 high priority", noteTone: "red",   icon: ClipboardList,  bg: "#FFF3E4", fg: "#F59E0B", to: "/tasks?today=1&sort=priority" },
];

const QUICK_ACTIONS = [
  { label: "Create Lead",     icon: UserPlus,   bg: "#FDECEE", fg: "#E8395B", action: "lead" },
  { label: "Create Task",     icon: SquareCheck, bg: "#E8F2FE", fg: "#3B82F6", action: "task" },
  { label: "Create Meeting",  icon: Calendar,   bg: "#F0EBFE", fg: "#8B5CF6", action: "meeting" },
  { label: "Upload Biodata",  icon: FileText,   bg: "#E7F8EF", fg: "#16A34A", to: "#" },
];

const PERFORMANCE_SEGMENTS = [
  {
    key: "visits",
    label: "Monthly visits /\nMeetings",
    value: "12",
    target: "15",
    color: "#7FC9A9",
    labelColor: "#545454",
    valueColor: "#288270",
    targetColor: "#000000",
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
    labelColor: "#545454",
    valueColor: "#89518E",
    targetColor: "#000000",
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
    labelColor: "#545454",
    valueColor: "#811A3A",
    targetColor: "#000000",
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
    labelColor: "#545454",
    valueColor: "#2C76B5",
    capsuleBg: "#E7EEF8",
    iconSrc: conversionIcon,
    layout: "row",
    arrow: conversionArrow,
    pos: { top: "79%", right: "0%" },
    arrowStyle: { right: "calc(100% + 12px)", top: "-32%", width: "16.5cqw" },
  },
  {
    key: "registrations",
    label: "No. of\nregistrations",
    value: "14",
    target: "50",
    note: "28% of target",
    color: "#E76B3D",
    labelColor: "#545454",
    valueColor: "#C94818",
    targetColor: "#545454",
    noteColor: "#000000",
    capsuleBg: "#FEE9D8",
    iconSrc: registrationsIcon,
    layout: "row",
    arrow: registrationsArrow,
    pos: { top: "74%", left: "0%" },
    arrowStyle: { left: "50%", bottom: "calc(100% - 4px)", top: "auto", width: "14.5cqw" },
  },
  {
    key: "followup",
    label: "Follow-up\nDiscipline",
    value: "92",
    target: "100",
    color: "#DA9644",
    labelColor: "#545454",
    valueColor: "#C27C27",
    targetColor: "#545454",
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


const LEAD_HEALTH = [
  { key: "hot",  label: "Hot Leads",  count: 18, icon: Flame,     bg: "#FDECEE", fg: "#E8395B" },
  { key: "warm", label: "Warm Leads", count: 18, icon: Flame,     bg: "#FFF3E4", fg: "#F59E0B" },
  { key: "cold", label: "Cold Leads", count: 18, icon: Snowflake, bg: "#E8F2FE", fg: "#3B82F6" },
];

const FUNNEL_ROWS = [
  { key: "new",         stageId: "P0", label: "New",                stat: "P0 - 482", pct: "100%", to: "to P1", top: "7.8%",  height: "13.2%", width: "92%", color: "#84A8DE" },
  { key: "contacted",   stageId: "P0", label: "Contacted",          stat: "P0 - 482", pct: "100%", to: "to P1", top: "21.2%", height: "12.2%", width: "86%", color: "#6394D7" },
  { key: "qualified",   stageId: "P1", label: "Qualified",          stat: "P1 - 395", pct: "82%",  to: "to P2", dropPct: "18%", dropCount: "87", top: "33.4%", height: "11.4%", width: "80%", color: "#386FB8" },
  { key: "profile",     stageId: "P2", label: "Profile Creation",   stat: "P2 - 351", pct: "75%",  to: "to P3", dropPct: "11%", dropCount: "87", top: "44.8%", height: "11.0%", width: "72%", color: "#D7AB77" },
  { key: "video",       stageId: "P3", label: "Video call / Visit", stat: "P3 - 295", pct: "60%",  to: "to P4", dropPct: "16%", dropCount: "87", top: "55.6%", height: "10.6%", width: "64%", color: "#BB8D58" },
  { key: "negotiation", stageId: "P4", label: "Negotiation",        stat: "P4 - 260", pct: "52%",  to: "to P5", dropPct: "14%", dropCount: "87", top: "65.8%", height: "10.4%", width: "56%", color: "#8A909C" },
  { key: "payment",     stageId: "P5", label: "Payment",            stat: "P5 - 224", pct: "44%",  to: "to P6", dropPct: "8%",  dropCount: "118", top: "76.0%", height: "10.6%", width: "48%", color: "#A11620" },
  { key: "handover",    stageId: "P6", label: "Handover",           stat: "P6 - 224", pct: "43%",  to: "Final Conversion", dropCount: "87", isFinal: true, top: "86.2%", height: "11.2%", width: "42%", color: "#6E0F16" },
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
  { id: "MML-ID-D-10428", name: "Kuhu Sharma",    starred: true,  stage: "P0 - New",              temperature: "Hot",  stageTone: null,   priority: "High",   leadScore: 8.5, profileCompletion: 100, source: "Outbound Calls",   followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Outbound follow-up call" },
  { id: "MML-ID-D-10428", name: "Harshit Sharma", starred: false, stage: "P1 - Qualified",        temperature: "Hot",  stageTone: "Lost", priority: "High",   leadScore: 8.5, profileCompletion: 50,  source: "Brand Walking",    followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: true,  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Re-engagement call" },
  { id: "MML-ID-D-10428", name: "Aditya Sharma",  starred: false, stage: "P3 - Video Call/Visit", temperature: "Cold", stageTone: "Cold", priority: "Medium", leadScore: 8.5, profileCompletion: 85,  source: "Channel Partner",  followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Confirm video call slot" },
  { id: "MML-ID-D-10428", name: "Vivek Sharma",   starred: false, stage: "P4 - Negotiation",      temperature: "Cold", stageTone: null,   priority: "Low",    leadScore: 9.0, profileCompletion: 90,  source: "Reference - Satish", followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Call Client for pricing confirmation at 8 PM" },
  { id: "MML-ID-D-10429", name: "Vivek Sharma",   starred: false, stage: "P4 - Negotiation",      temperature: "Warm", stageTone: null,   priority: "Low",    leadScore: 9.0, profileCompletion: 90,  source: "Reference - Satish", followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Call Client for pricing confirmation at 8 PM" },
  { id: "MML-ID-D-10428", name: "Virat Sharma",   starred: false, stage: "P6 - Service Handover", temperature: "Warm", stageTone: null,   priority: "Low",    leadScore: 8.5, profileCompletion: 90,  source: "Online - Insta",   followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start Time: 12:00", lost: false, lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", nextActionNote: "Confirm handover checklist" },
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
  const navigate = useNavigate();
  const Icon = stat.icon;
  const clickable = Boolean(stat.to);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => clickable && navigate(stat.to)}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(stat.to);
        }
      }}
      className={`bg-white border border-black/8 rounded-2xl px-3.5 py-3 flex items-center gap-3 min-w-0 ${
        clickable ? "cursor-pointer hover:border-black/15 hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A0A17]/35" : ""
      }`}
    >
      <span className="size-10 rounded-[10px] grid place-items-center shrink-0" style={{ backgroundColor: stat.bg }}>
        <Icon size={18} style={{ color: stat.fg }} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#6B7280] leading-snug truncate">{stat.label}</p>
        <p className="text-[20px] font-bold text-[#111] leading-tight mt-0.5">{stat.value}</p>
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

function QuickActionsCard({ onCreateLead, onCreateTask, onCreateMeeting }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-black/8 rounded-2xl px-4 py-3 h-full flex flex-col justify-center gap-2 min-w-0">
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap size={15} className="text-[#E8395B]" fill="#E8395B" strokeWidth={0} />
        <p className="text-[13.5px] font-bold text-[#111] whitespace-nowrap">Quick Actions</p>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {QUICK_ACTIONS.map(({ label, icon: Icon, bg, fg, to, action }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (action === "lead") onCreateLead?.();
              else if (action === "task") onCreateTask?.();
              else if (action === "meeting") onCreateMeeting?.();
              else if (to) navigate(to);
            }}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl flex-1 min-w-0 transition-opacity hover:opacity-85"
            style={{ backgroundColor: bg }}
          >
            <Icon size={14} style={{ color: fg }} strokeWidth={1.9} className="shrink-0" />
            <span className="text-[12px] font-semibold text-[#111] whitespace-nowrap truncate">{label}</span>
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
                      style={{ color: s.labelColor, fontSize: stacked ? 11 : 11.5 }}
                    >
                      {s.label}
                    </p>
                    <p className="text-[15px] font-bold leading-tight mt-0.5" style={{ color: s.valueColor }}>
                      {s.value}
                      {s.target && (
                        <span className="text-[12.5px] font-semibold" style={{ color: s.targetColor }}>
                          {" "}/ {s.target}
                        </span>
                      )}
                    </p>
                    {s.note && (
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: s.noteColor }}>
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
    <div className="relative overflow-hidden flex-1 min-w-0 rounded-2xl border border-[#7A0A17]/15 bg-gradient-to-br from-[#FFF5F6] to-[#FDECEE] p-3.5 shadow-[0_1px_2px_rgba(122,10,23,0.06)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-[#7A0A17]" />
      <div className="flex items-center justify-between gap-2 pl-1.5">
        <p className="text-[10.5px] font-bold text-[#7A0A17] tracking-wide whitespace-nowrap">{UP_NEXT.dateLabel}</p>
        <span className="text-[10px] font-bold text-white bg-[#7A0A17] rounded-md px-1.5 py-0.5">{UP_NEXT.badge}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-2 pl-1.5">
        <p className="text-[13.5px] font-bold text-[#111] leading-snug">{UP_NEXT.title}</p>
        <Link to="/calendar" className="text-[11.5px] font-semibold text-[#3B82F6] hover:underline shrink-0">
          Details
        </Link>
      </div>
      <p className="inline-flex items-center mt-2.5 ml-1.5 text-[11.5px] font-semibold text-[#374151] bg-white px-2.5 py-[3px] rounded-lg">
        {UP_NEXT.time}
      </p>
    </div>
  );
}

function UnscheduledCard({ item, onSchedule }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-3.5 flex-1 min-w-0">
      <p className="text-[10.5px] font-bold text-[#9CA3AF] tracking-wide">UNSCHEDULED</p>
      {!item ? (
        <p className="text-[12px] text-[#9CA3AF] mt-3">All caught up.</p>
      ) : (
        <button
          type="button"
          onClick={() => onSchedule?.(item)}
          className="flex items-start gap-2 mt-3 w-full text-left rounded-xl hover:bg-[#FAFAFB] transition-colors -mx-1 px-1 py-1"
        >
          <span className="size-2 rounded-full bg-[#E8395B] shrink-0 mt-1.5" />
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-[#111] leading-snug truncate">{item.title}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              {item.type} • {item.duration}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

function RecentUpdatesCard() {
  const [items, setItems] = useState(readNotifications);
  useEffect(() => subscribeNotifications(setItems), []);
  const preview = items.slice(0, 5);
  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-3 mb-1 px-0.5">
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-[#FFF3E4] grid place-items-center">
            <Bell size={15} className="text-[#F59E0B]" strokeWidth={2} />
          </span>
          <h2 className="text-[15px] font-bold text-[#111]">Recent Updates</h2>
        </div>
        <button
          type="button"
          onClick={() => markAllNotificationsRead()}
          disabled={unreadCount === 0}
          className="text-[11.5px] font-semibold text-[#7A0A17] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <div className="flex flex-col divide-y divide-black/6">
        {preview.map((u) => (
          <div key={u.id} className="flex items-start gap-3 py-3">
            <img src={u.avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] leading-tight ${u.unread ? "font-bold text-[#111]" : "font-semibold text-[#111]"}`}>
                {u.title}
              </p>
              <p className="text-[12px] text-[#9CA3AF] leading-snug mt-0.5">{u.message}</p>
            </div>
            <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap shrink-0 pt-0.5">{u.time}</span>
          </div>
        ))}
      </div>

      <Link
        to="/notifications"
        className="text-center text-[13px] font-semibold text-[#7A0A17] hover:underline mt-auto pt-3 border-t border-black/6"
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

function SalesFunnelCard({ activeStage, onSelectStage }) {
  const [period, setPeriod] = useState("Daily");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectStage = (stageId) => {
    onSelectStage?.(activeStage === stageId ? null : stageId);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 sm:p-5 flex flex-col h-full min-w-0 [container-type:inline-size]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#111] flex items-center gap-2">
          <Filter size={16} className="text-[#7A0A17]" fill="#7A0A17" strokeWidth={2} />
          Sales Funnel (P0 - P6)
        </h2>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-black/10 text-[12px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
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

      <div className="flex items-center justify-center mt-4 flex-1 min-h-[380px] [@container(min-width:420px)]:min-h-[440px]">
        <div className="flex items-stretch gap-3 sm:gap-5 w-full">
          <div
            className="relative w-full max-w-[230px] [@container(min-width:420px)]:max-w-[270px] [@container(min-width:520px)]:max-w-[300px] shrink-0"
            style={{ aspectRatio: "301 / 386" }}
          >
            <img
              src={salesFunnelSvg}
              alt=""
              className="absolute inset-0 w-full h-full object-contain object-center select-none pointer-events-none"
            />
            {FUNNEL_ROWS.map((row) => {
              const isActive = activeStage === row.stageId;
              const dimOthers = Boolean(activeStage) && !isActive;
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => selectStage(row.stageId)}
                  title={`Filter My Leads by ${row.label}`}
                  aria-pressed={isActive}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-sm transition-opacity duration-150"
                  style={{
                    top: row.top,
                    height: row.height,
                    width: row.width,
                    opacity: dimOthers ? 0.45 : 1,
                  }}
                >
                  <span
                    className="text-white leading-tight text-center whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-[font-weight,text-shadow] duration-150"
                    style={{
                      fontSize: row.key === "video" || row.key === "profile" ? 11.5 : 12.5,
                      fontWeight: isActive ? 800 : 600,
                      textShadow: isActive
                        ? "0 0 10px rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.35)"
                        : "0 1px 2px rgba(0,0,0,0.28)",
                    }}
                  >
                    {row.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 min-w-0 max-w-[52%] [@container(min-width:420px)]:min-w-[148px] [@container(min-width:520px)]:min-w-[168px]">
            {FUNNEL_ROWS.map((row) => {
              const isActive = activeStage === row.stageId;
              const dimOthers = Boolean(activeStage) && !isActive;
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => selectStage(row.stageId)}
                  aria-pressed={isActive}
                  className="absolute inset-x-0 flex items-center gap-2 text-left transition-opacity duration-150"
                  style={{
                    top: row.top,
                    height: row.height,
                    opacity: dimOthers ? 0.4 : 1,
                  }}
                >
                  <span
                    className="text-[12.5px] leading-none whitespace-nowrap tabular-nums transition-colors duration-150"
                    style={{
                      fontWeight: isActive ? 800 : 700,
                      color: isActive ? "#111" : "#111",
                    }}
                  >
                    {row.stat}
                  </span>
                  <span className="text-[#D1D5DB] text-[12px] leading-none">→</span>
                  <div className="min-w-0">
                    {row.isFinal ? (
                      <p className="text-[11.5px] leading-tight whitespace-nowrap">
                        <span className={`font-medium ${isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}>Final </span>
                        <span className={`tabular-nums ${isActive ? "font-extrabold text-[#111]" : "font-bold text-[#111]"}`}>{row.pct}</span>
                        <span className={`font-medium ${isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}> ({row.dropCount})</span>
                      </p>
                    ) : (
                      <p className="text-[11.5px] leading-tight whitespace-nowrap">
                        <span className={`tabular-nums ${isActive ? "font-extrabold text-[#111]" : "font-bold text-[#111]"}`}>{row.pct}</span>
                        <span className={`font-medium ${isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"}`}> {row.to}</span>
                        {row.dropPct && (
                          <span className="ml-1.5 pl-1.5 border-l border-[#E5E7EB]">
                            <span className={isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"}>Drop </span>
                            <span className={`tabular-nums ${isActive ? "font-extrabold text-[#E11D48]" : "font-bold text-[#E11D48]"}`}>{row.dropPct}</span>
                            <span className={isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"}> ({row.dropCount})</span>
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
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

function MyLeadsCard({
  leads,
  healthFilter,
  onHealthFilter,
  healthCounts,
  stageFilter,
  onClearStageFilter,
  onOpenDeal,
  onMoveStage,
}) {
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

  const toggleHealth = (key) => {
    onHealthFilter?.(healthFilter === key ? null : key);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 sm:p-5 flex flex-col min-w-0 h-full">
      <LeadScoreModal lead={scoreLead} onClose={() => setScoreLead(null)} />
      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} />

      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[16px] font-bold text-[#111] flex items-center gap-2 shrink-0">
          <Heart size={15} className="text-[#E8395B]" fill="#E8395B" strokeWidth={0} />
          Lead Health
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {LEAD_HEALTH.map((h) => {
            const active = healthFilter === h.key;
            const count = healthCounts?.[h.key] ?? h.count;
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => toggleHealth(h.key)}
                aria-pressed={active}
                title={`Filter table by ${h.label}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-2.5 py-1.5 border-2 transition-[background-color,color,border-color,box-shadow] duration-150"
                style={
                  active
                    ? {
                        backgroundColor: h.fg,
                        color: "#fff",
                        borderColor: h.fg,
                        boxShadow: `0 4px 12px ${h.fg}40`,
                      }
                    : {
                        backgroundColor: h.bg,
                        color: h.fg,
                        borderColor: "transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (active) return;
                  e.currentTarget.style.borderColor = h.fg;
                  e.currentTarget.style.backgroundColor = h.bg;
                }}
                onMouseLeave={(e) => {
                  if (active) return;
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.backgroundColor = h.bg;
                }}
              >
                <h.icon size={12} fill={active ? "#fff" : h.fg} strokeWidth={0} />
                {h.label}
                <span
                  className="font-bold tabular-nums min-w-[1.25rem] text-center rounded-md px-1"
                  style={{
                    backgroundColor: active ? "rgba(255,255,255,0.22)" : `${h.fg}18`,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative" ref={leadsViewRef}>
            <button
              type="button"
              onClick={() => setLeadsViewOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[16px] font-bold text-[#111]"
            >
              My Leads
              <ChevronDown
                size={15}
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
          {stageFilter && (
            <button
              type="button"
              onClick={() => onClearStageFilter?.()}
              className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-lg bg-[#FCF5F6] text-[11px] font-semibold text-[#7A0A17] border border-[#7A0A17]/15 hover:bg-[#F9EDEF] transition-colors"
              title="Clear stage filter"
            >
              {stageFilter}
              <X size={12} className="opacity-70" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Low Probability", color: "#E8395B" },
              { label: "Medium",           color: "#F59E0B" },
              { label: "High",             color: "#16A34A" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]">
                <Flag size={11} style={{ color: f.color }} fill={f.color} strokeWidth={0} />
                {f.label}
              </span>
            ))}
          </div>
          <PeriodSelect value={period} onChange={setPeriod} compact />
        </div>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-black/6 bg-[#FAFAFB]/80">
              {[
                { label: "Client Name", key: "name", className: "pl-3 pr-2 w-[18%]" },
                { label: "Stage", key: "stage", className: "px-2 w-[14%]" },
                { label: "Priority", key: "priority", className: "px-2 w-[9%]" },
                { label: "Lead\nScore", key: "leadScore", className: "px-2 w-[9%]" },
                { label: "Profile\nCompletion", key: "profileCompletion", className: "px-2 w-[10%]" },
                { label: "Source", key: "source", className: "px-2 w-[12%]" },
                { label: "Follow Up\nTime Left", key: "followUp", className: "px-2 w-[14%]" },
                { label: "Actions", key: "actions", unsortable: true, className: "px-2 w-[10%]" },
              ].map((h) => (
                <SortableTh
                  key={h.key}
                  label={h.label}
                  sortKey={h.key}
                  sort={sort}
                  onSort={toggle}
                  unsortable={h.unsortable}
                  className={`text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide py-2.5 align-bottom whitespace-pre-line ${h.className}`}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-[13px] text-[#9CA3AF]">
                  No leads match the selected filters.
                </td>
              </tr>
            ) : sorted.map((lead, i) => {
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
                  className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB] transition-colors cursor-pointer"
                >
                  <td className="pl-3 pr-2 py-2.5">
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
                  <td className="px-2 py-2.5">
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
                  <td className="px-2 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap ${priority.bg}`} style={{ color: priority.color }}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScoreLead(lead);
                      }}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-[#111] hover:bg-[#F3F4F6] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap"
                      title="Click to view Lead Score Details"
                    >
                      {lead.leadScore.toFixed(1)}
                      <Flag size={11} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
                    </button>
                  </td>
                  <td className="px-2 py-2.5 text-[12px] text-[#6B7280] whitespace-nowrap">{lead.profileCompletion}%</td>
                  <td className="px-2 py-2.5 text-[12px] text-[#6B7280] leading-tight whitespace-nowrap">{lead.source}</td>
                  <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                  <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
  const navigate = useNavigate();
  const [period, setPeriod] = useState("this_month");
  const [search, setSearch] = useState("");
  const [dealLead, setDealLead] = useState(null);
  const [dealStage, setDealStage] = useState(null);
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetingPrefill, setMeetingPrefill] = useState(null);
  const [schedulingUnscheduledId, setSchedulingUnscheduledId] = useState(null);
  const [unscheduledItems, setUnscheduledItems] = useState(readUnscheduled);
  const [myLeads, setMyLeads] = useState(MY_LEADS);
  const [stageFilter, setStageFilter] = useState(null);
  const [healthFilter, setHealthFilter] = useState(null);

  useEffect(() => subscribeCalendar(() => setUnscheduledItems(readUnscheduled())), []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const healthCounts = useMemo(() => {
    const counts = { hot: 0, warm: 0, cold: 0 };
    myLeads.forEach((l) => {
      const key = String(l.temperature || "").toLowerCase();
      if (key in counts) counts[key] += 1;
    });
    return counts;
  }, [myLeads]);

  const visibleLeads = useMemo(() => {
    let list = myLeads;
    if (stageFilter) {
      list = list.filter((l) => stageKeyFromLead(l) === stageFilter);
    }
    if (healthFilter) {
      list = list.filter((l) => String(l.temperature || "").toLowerCase() === healthFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((l) => `${l.name} ${l.id} ${l.stage} ${l.source}`.toLowerCase().includes(q));
  }, [myLeads, search, stageFilter, healthFilter]);

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
      <CreateLeadModal
        open={showCreateLead}
        onClose={() => setShowCreateLead(false)}
        onCreate={(lead) => {
          const nextAction =
            lead.meeting === "Meeting Agreed"
              ? "Schedule meeting"
              : lead.meeting === "Call Agreed"
                ? "Follow-up call"
                : lead.meeting === "Callback Later"
                  ? "Callback"
                  : "Initial Contact";
          setMyLeads((prev) => [
            {
              id: `MML-ID-D-${Math.floor(10000 + Math.random() * 90000)}`,
              name: lead.name,
              starred: false,
              stage: "P0 - New",
              temperature: lead.meeting === "Meeting Agreed" ? "Hot" : "Warm",
              stageTone: null,
              priority: "High",
              leadScore: 8.0,
              profileCompletion: 25,
              source: lead.source,
              followUp: "24 HRS Left",
              followUpTone: "text-[#6B7280]",
              followUpNote: "Start Time: —",
              lost: false,
              lastDiscussion: "Just now",
              nextAction,
              nextActionNote: [lead.city, lead.area].filter(Boolean).join(" · ") || "Initial contact",
              mobile: lead.mobile,
              email: lead.email,
            },
            ...prev,
          ]);
          toast.success(`Lead "${lead.name}" created.`);
        }}
      />
      <CreateMeetingEventModal
        open={showCreateMeeting}
        onClose={() => {
          setShowCreateMeeting(false);
          setMeetingPrefill(null);
          setSchedulingUnscheduledId(null);
        }}
        entityLabel="Meeting"
        defaultDate={new Date()}
        initial={meetingPrefill}
        onSave={(form) => {
          const item = addExtraEvent(meetingFormToCalendarItem(form, "meeting"));
          if (schedulingUnscheduledId) {
            removeUnscheduled(schedulingUnscheduledId);
            setSchedulingUnscheduledId(null);
            setMeetingPrefill(null);
            navigate(`/calendar?focus=${encodeURIComponent(item.id)}`);
          }
        }}
      />
      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        defaultDate={new Date()}
        onSave={() => {}}
      />
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
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[44%] lg:shrink-0">
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
          <div className="lg:flex-1 min-w-0">
            <QuickActionsCard
              onCreateLead={() => setShowCreateLead(true)}
              onCreateTask={() => setShowCreateTask(true)}
              onCreateMeeting={() => {
                setMeetingPrefill(null);
                setSchedulingUnscheduledId(null);
                setShowCreateMeeting(true);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
          <PerformanceScoreCard />
          <AIAssistant />
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-stretch gap-3">
              <UpNextCard />
              <UnscheduledCard
                item={unscheduledItems[0] || null}
                onSchedule={(item) => {
                  setSchedulingUnscheduledId(item.id);
                  setMeetingPrefill(unscheduledToMeetingForm(item));
                  setShowCreateMeeting(true);
                }}
              />
            </div>
            <RecentUpdatesCard />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(400px,1.05fr)] gap-4 items-stretch">
          <div className="min-w-0">
            <MyLeadsCard
              leads={visibleLeads}
              healthFilter={healthFilter}
              onHealthFilter={setHealthFilter}
              healthCounts={healthCounts}
              stageFilter={stageFilter}
              onClearStageFilter={() => setStageFilter(null)}
              onOpenDeal={(lead) => openDeal(lead)}
              onMoveStage={(lead, stageKey) => openDeal(lead, stageKey)}
            />
          </div>
          <SalesFunnelCard
            activeStage={stageFilter}
            onSelectStage={setStageFilter}
          />
        </div>
      </div>
    </div>
  );
}
