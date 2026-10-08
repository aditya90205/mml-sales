import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  IndianRupee,
  Laptop,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquare,
  Pencil,
  Receipt,
  Send,
  Settings,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { USER } from "../layout/TopBar";
import SendMessageModal from "../common/SendMessageModal.jsx";
import Modal from "../ui/Modal.jsx";
import AnnouncementsPage, { AnnouncementDetailModal } from "../../pages/AnnouncementsPage.jsx";
import { markAnnouncementRead, readAnnouncements, subscribeAnnouncements } from "../../utils/announcements.js";
import conductReviewIcon from "../../assets/conduct-review.png";

const TIMESHEET_SLICES = [
  { label: "Active (Productive)", time: "6h 10m", color: "#7FC9A9" },
  { label: "Idle (1/Tab)", time: "42m", color: "#DA9644" },
  { label: "Break (Lunch / Tea)", time: "30m", color: "#5596CD" },
  { label: "Meeting / Call", time: "1h 10m", color: "#B86FBE" },
  { label: "Unexplained Idle", time: "12m", color: "#E8395B" },
];

// Visual ring only. Slice sizes follow the design (even gaps, no slice dominates),
// not the raw minute totals, which would collapse four categories into slivers.
const DONUT_R = 15.2;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;
const DONUT_SEGMENTS = [
  { color: "#E8395B", start: 348, sweep: 28 },
  { color: "#5596CD", start: 20, sweep: 22 },
  { color: "#7FC9A9", start: 46, sweep: 78 },
  { color: "#288270", start: 128, sweep: 50 },
  { color: "#DA9644", start: 182, sweep: 30 },
  { color: "#C27C27", start: 216, sweep: 42 },
  { color: "#B86FBE", start: 262, sweep: 48 },
  { color: "#BF4C70", start: 314, sweep: 30 },
].map((segment) => {
  const len = (segment.sweep / 360) * DONUT_CIRC;
  return {
    ...segment,
    len,
    gap: DONUT_CIRC - len,
    offset: (segment.start / 360) * DONUT_CIRC,
  };
});

const GOAL_PREVIEW = ["Certification Completion", "Launch New Product Feature", "Match"];
const IDLE_MINUTE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
const IDLE_ALERT_KEY = "hrms-idle-alert-minutes";

function readIdleMinutes() {
  try {
    const value = Number(localStorage.getItem(IDLE_ALERT_KEY));
    if (IDLE_MINUTE_OPTIONS.includes(value)) return value;
  } catch {
    /* stored value is optional */
  }
  return 15;
}

function Card({ children, className = "", id }) {
  return (
    <section id={id} className={`bg-white border border-black/8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </section>
  );
}

function MaroonIcon({ icon: Icon, tone = "rose", filled = false }) {
  const tones = {
    rose: "bg-[#FDECEE] text-[#E8395B]",
    purple: "bg-[#F0EBFE] text-[#8B5CF6]",
    green: "bg-[#E7F8EF] text-[#16A34A]",
    orange: "bg-[#FFF3E4] text-[#F59E0B]",
  };
  return (
    <span className={`size-9 rounded-full grid place-items-center shrink-0 ${tones[tone] || tones.rose}`}>
      <Icon size={16} strokeWidth={2.2} fill={filled ? "currentColor" : "none"} />
    </span>
  );
}

function OutlinePill({ children, onClick, tone = "maroon" }) {
  const tones = {
    maroon: "border-[#7A0A17] text-[#7A0A17] hover:bg-[#FCF5F6]",
    ghost: "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]",
    notice: "border-[#7A0A17]/20 bg-white text-[#7A0A17] hover:bg-[#FCF5F6]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 px-3 rounded-full border text-[11px] font-bold shrink-0 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function SolidPill({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-3.5 rounded-full bg-[#7A0A17] hover:bg-[#600712] text-white text-[11px] font-bold shrink-0"
    >
      {children}
    </button>
  );
}

function SelectPill({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-black/10 hover:border-[#7A0A17]/30 rounded-xl h-10 pl-4 pr-9 text-sm font-semibold text-[#4B5563] shadow-sm cursor-pointer outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
    </div>
  );
}

function ProgressRing({ value }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  const len = (value / 100) * c;
  return (
    <div className="relative size-[72px] shrink-0">
      <svg viewBox="0 0 42 42" className="size-full -rotate-90">
        <circle cx="21" cy="21" r={r} fill="none" stroke="#E9F6EC" strokeWidth="4.2" />
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke="#7FC9A9"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray={`${len} ${c - len}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[13px] font-extrabold text-[#288270]">{value}%</span>
    </div>
  );
}

function MiniBars({ bars }) {
  const gap = 5;
  const width = 86;
  const barW = (width - gap * (bars.length - 1)) / bars.length;
  return (
    <svg viewBox={`0 0 ${width} 48`} className="w-[86px] h-12 shrink-0" aria-hidden="true">
      {bars.map((bar, i) => (
        <rect key={i} x={i * (barW + gap)} y={48 - bar.h} width={barW} height={bar.h} rx="2.2" fill={bar.fill} />
      ))}
    </svg>
  );
}

const TARGET_BARS = [
  { h: 16, fill: "#F6E6F8" },
  { h: 26, fill: "#E8D0EC" },
  { h: 18, fill: "#D4B0DC" },
  { h: 32, fill: "#C490CC" },
  { h: 22, fill: "#B86FBE" },
  { h: 40, fill: "#89518E" },
];

const INCENTIVE_BARS = [
  { h: 12, fill: "#E9F6EC" },
  { h: 18, fill: "#C8E8D4" },
  { h: 24, fill: "#A8D8C0" },
  { h: 30, fill: "#7FC9A9" },
  { h: 36, fill: "#4AA88A" },
  { h: 44, fill: "#288270" },
];

const AWARD_BARS = [
  { h: 12, fill: "#FEE9D8" },
  { h: 18, fill: "#F8D4B8" },
  { h: 24, fill: "#F0B888" },
  { h: 30, fill: "#E89060" },
  { h: 36, fill: "#E76B3D" },
  { h: 44, fill: "#C94818" },
];

function TimesheetDonut() {
  return (
    <div className="relative size-[92px] shrink-0">
      <svg viewBox="0 0 42 42" className="size-full -rotate-90">
        {DONUT_SEGMENTS.map((slice) => (
          <circle
            key={`${slice.color}-${slice.start}`}
            cx="21"
            cy="21"
            r={DONUT_R}
            fill="none"
            stroke={slice.color}
            strokeWidth="6.4"
            strokeDasharray={`${slice.len} ${slice.gap}`}
            strokeDashoffset={-slice.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[12px] font-extrabold text-[#7A0A17] leading-none">8h 0m</p>
          <p className="text-[10px] font-semibold text-[#9CA3AF] mt-0.5">Total</p>
        </div>
      </div>
    </div>
  );
}

function priorityClass(priority) {
  if (priority === "High") return "bg-[#FDECEE] text-[#E8395B]";
  if (priority === "Medium") return "bg-[#FFF3E4] text-[#F59E0B]";
  return "bg-[#F3F4F6] text-[#6B7280]";
}

function recentItemIcon(type) {
  if (type === "Holiday" || type === "Event") {
    return { Icon: CalendarDays, className: "bg-[#E7F8EF] text-[#16A34A]" };
  }
  if (type === "Training") {
    return { Icon: GraduationCap, className: "bg-[#F0EBFE] text-[#8B5CF6]" };
  }
  return { Icon: FileText, className: "bg-[#EEF0FE] text-[#6366F1]" };
}

function requestStatusClass(status) {
  if (status === "Approved") return "bg-[#E7F8EF] text-[#16A34A]";
  if (status === "Rejected" || status === "Cancelled") return "bg-[#FDECEE] text-[#E8395B]";
  return "bg-[#FFF3E4] text-[#F59E0B]";
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length < 2) return { first: name, last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts.at(-1) };
}

export default function HrmsDashboard({
  months,
  years,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onReportIssue,
  onOpenTrainings,
  onOpenAssets,
  onOpenExit,
  onOpenDocuments,
  onViewPromotions,
  onViewWarnings,
  onViewGoals,
  onOpenAttendance,
  onOpenAchievement,
  onOpenIncentives,
  onOpenAwards,
  onRegularize,
  onTimesheetDetails,
  onApplyLeave,
  onLeaveBalance,
  onApplyExpense,
  onViewExpense,
  expenses,
  requests,
  goals,
  expandedRemarks,
  onToggleRemark,
  onGoalAction,
  onOpenSalary,
}) {
  const [announcements, setAnnouncements] = useState(readAnnouncements);
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [commentFor, setCommentFor] = useState(null);
  const [idleMinutes, setIdleMinutes] = useState(readIdleMinutes);
  const [idleDraft, setIdleDraft] = useState(readIdleMinutes);
  const [idleModalOpen, setIdleModalOpen] = useState(false);

  useEffect(() => subscribeAnnouncements(setAnnouncements), []);

  const recent = announcements.slice(0, 3);
  const posh = announcements.find((item) => /posh/i.test(item.title));
  const previewGoals = GOAL_PREVIEW.map((title) => goals.find((goal) => goal.title === title)).filter(Boolean);
  const rows = previewGoals.length ? previewGoals : goals.slice(0, 3);

  const openComment = (item) => {
    markAnnouncementRead(item.id);
    setCommentFor(item);
  };

  const openDetail = (item) => {
    markAnnouncementRead(item.id);
    setActive(item);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={USER.avatar}
            alt=""
            className="size-14 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#6B7280]">Welcome Back,</p>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-extrabold text-[#111] tracking-tight leading-tight">{USER.name}</h1>
              <Link to="/profile" className="text-[#9CA3AF] hover:text-[#374151]" aria-label="View profile" title="View profile">
                <Eye size={15} />
              </Link>
              <Link to="/profile" className="text-[#7A0A17] hover:text-[#600712]" aria-label="Edit profile" title="Edit profile">
                <Pencil size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-[12px] text-[#6B7280] font-medium">
              <span>Senior Sales Manager</span>
              <span className="inline-flex items-center gap-1">
                <User size={12} className="text-[#9CA3AF]" />
                Reporting Manager: Rohit Verma
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-[#9CA3AF]" />
                Rajouri Garden
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SelectPill label="Month" value={selectedMonth} onChange={onMonthChange} options={months} />
          <SelectPill label="Year" value={selectedYear} onChange={onYearChange} options={years} />
          <button
            type="button"
            onClick={onReportIssue}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] hover:bg-[#600712] text-white text-sm font-bold shadow-sm"
          >
            Report an issue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              icon={CalendarDays}
              tone="rose"
              title="Attendance"
              onOpen={onOpenAttendance}
              chart={<ProgressRing value={82} />}
            >
              <p className="text-[20px] font-extrabold text-[#111] leading-none mt-3">18 / 22 Days</p>
              <p className="text-[13px] font-semibold text-[#6B7280] mt-1.5">This Month</p>
            </KpiCard>

            <KpiCard
              id="target-achievement"
              icon={Target}
              tone="purple"
              title="Target Achievement"
              onOpen={onOpenAchievement}
              chart={<MiniBars bars={TARGET_BARS} />}
            >
              <p className="text-[22px] font-extrabold text-[#111] leading-none mt-3">82%</p>
              <p className="text-[13px] font-semibold text-[#6B7280] mt-1.5">This Month</p>
            </KpiCard>

            <KpiCard
              icon={IndianRupee}
              tone="green"
              title="Incentive Earned"
              onOpen={onOpenIncentives}
              chart={<MiniBars bars={INCENTIVE_BARS} />}
            >
              <p className="text-[22px] font-extrabold text-[#111] leading-none mt-3">₹ 38,000</p>
              <p className="text-[13px] font-bold text-[#16A34A] mt-1.5">120% of target</p>
            </KpiCard>

            <KpiCard
              icon={Trophy}
              tone="orange"
              title="Awards & Contests"
              onOpen={onOpenAwards}
              trailing={<ChevronRight size={16} className="text-[#9CA3AF]" />}
              chart={<MiniBars bars={AWARD_BARS} />}
            >
              <p className="text-[11px] font-semibold text-[#9CA3AF] mt-2">My Rank</p>
              <p className="text-[22px] font-extrabold text-[#111] leading-none">#2</p>
              <p className="text-[12px] font-medium text-[#9CA3AF] mt-0.5">Out of 18</p>
            </KpiCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.05fr)_minmax(0,1.15fr)_minmax(0,0.95fr)] gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <MaroonIcon icon={Clock} />
                  <div>
                    <p className="text-[14px] font-extrabold text-[#111] leading-tight">Timesheet</p>
                    <p className="text-[11px] text-[#9CA3AF] font-medium">Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <OutlinePill onClick={onRegularize}>Regularize</OutlinePill>
                  <OutlinePill onClick={onTimesheetDetails} tone="ghost">Details</OutlinePill>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <TimesheetDonut />
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {TIMESHEET_SLICES.map((slice) => (
                    <li key={slice.label} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 min-w-0 text-[#6B7280] font-medium">
                        <span className="size-2 rounded-full shrink-0" style={{ background: slice.color }} />
                        <span className="whitespace-nowrap">{slice.label}</span>
                      </span>
                      <span className="font-bold text-[#111] shrink-0 tabular-nums">{slice.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <MaroonIcon icon={CalendarDays} />
                  <p className="text-[14px] font-extrabold text-[#111]">Leaves</p>
                </div>
                <SolidPill onClick={onApplyLeave}>Apply</SolidPill>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <p className="text-[35px] font-bold text-[#111] leading-none">2/7</p>
                <p className="text-[13px] text-[#6B7280] font-medium">used this year</p>
              </div>
              <button
                type="button"
                onClick={onLeaveBalance}
                className="mt-1.5 text-left text-[13px] font-medium text-[#7A0A17] hover:underline whitespace-nowrap"
              >
                Leave Balance - 1 day available
              </button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <MaroonIcon icon={Receipt} />
                  <p className="text-[14px] font-extrabold text-[#111]">My Expenses</p>
                </div>
                <SolidPill onClick={onApplyExpense}>Apply</SolidPill>
              </div>
              <div className="space-y-2">
                {expenses.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#FCF5F6] px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111] truncate">{item.purpose}</p>
                      <p className="text-[11px] text-[#9CA3AF] font-medium leading-snug">
                        {item.destination.split(",")[0]}: <span className="whitespace-nowrap">{item.startDate}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[#7A0A17]">
                      <button
                        type="button"
                        onClick={() => onViewExpense(item)}
                        className="size-7 rounded-lg hover:text-[#600712] grid place-items-center"
                        aria-label={`View ${item.purpose}`}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewExpense(item)}
                        className="size-7 rounded-lg hover:text-[#600712] grid place-items-center"
                        aria-label={`Edit ${item.purpose}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <MaroonIcon icon={FileText} />
                  <p className="text-[14px] font-extrabold text-[#111]">Salary Slips</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSalary?.()}
                  aria-label="Open salary and payslip"
                  className="size-7 text-[#9CA3AF] hover:text-[#7A0A17] grid place-items-center"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {["March", "February"].map((month) => (
                  <div key={month} className="flex items-center justify-between gap-2 rounded-xl bg-[#FCF5F6] px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenSalary?.(month)}
                      className="min-w-0 flex-1 text-left text-[13px] font-bold text-[#111] hover:text-[#7A0A17]"
                    >
                      {month} {selectedYear}
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`${month} ${selectedYear} payslip download started.`)}
                      className="size-7 rounded-lg text-[#7A0A17] hover:bg-white grid place-items-center"
                      aria-label={`Download ${month} ${selectedYear} payslip`}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <MaroonIcon icon={TrendingUp} />
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#111]">Promotions and Transfers</p>
                    <p className="text-[12px] text-[#6B7280] font-medium mt-1 leading-snug">
                      You can see your promotions and transfers till today
                    </p>
                    <p className="text-[12px] font-bold text-[#16A34A] mt-2">Promoted 2 times last year</p>
                  </div>
                </div>
                <OutlinePill onClick={onViewPromotions}>View</OutlinePill>
              </div>
            </Card>

            <Card id="warnings-complaints" className="p-4 bg-[#FCF5F6] border-[#7A0A17]/15">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="size-9 rounded-full bg-[#FDECEE] text-[#E8395B] grid place-items-center shrink-0">
                    <AlertTriangle size={18} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#111] leading-tight">Warnings and Complaints</p>
                    <p className="text-[12px] text-[#6B7280] font-medium mt-1 leading-snug">
                      Late arrivals flagged twice this month.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <OutlinePill onClick={onViewWarnings} tone="notice">View Notice</OutlinePill>
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </div>
              </div>
            </Card>

            <div className="rounded-2xl border border-[#7A0A17]/15 bg-gradient-to-br from-[#FFF5F6] to-[#FDECEE] p-4 shadow-[0_1px_2px_rgba(122,10,23,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MaroonIcon icon={Clock} />
                  <p className="text-[14px] font-extrabold text-[#7A0A17]">Idle Alert Settings</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdleDraft(idleMinutes);
                    setIdleModalOpen(true);
                  }}
                  className="size-8 rounded-lg text-[#7A0A17] hover:bg-white grid place-items-center shrink-0"
                  aria-label="Idle alert settings"
                >
                  <Settings size={15} />
                </button>
              </div>
              <p className="text-[12.5px] text-[#6B7280] font-medium mt-3 pl-[46px] max-w-[260px] leading-snug">
                You will be alerted after {idleMinutes} minutes of inactivity.
              </p>
            </div>
          </div>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-left">
                <MaroonIcon icon={Target} />
                <span className="text-[15px] font-extrabold text-[#111]">Goals & Review</span>
              </div>
              <button
                type="button"
                onClick={onViewGoals}
                className="text-[12px] font-bold text-[#7A0A17] hover:underline shrink-0"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-extrabold tracking-wider text-[#9CA3AF] uppercase">
                    <th className="py-2 pr-3 font-extrabold">#</th>
                    <th className="py-2 pr-3 font-extrabold">Title</th>
                    <th className="py-2 pr-3 font-extrabold">Employee</th>
                    <th className="py-2 pr-3 font-extrabold">Goal Type</th>
                    <th className="py-2 pr-3 font-extrabold">Start Date</th>
                    <th className="py-2 pr-3 font-extrabold">End Date</th>
                    <th className="py-2 pr-3 font-extrabold">Progress</th>
                    <th className="py-2 pr-3 font-extrabold">Status</th>
                    <th className="py-2 font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((goal, index) => {
                    const name = splitName(goal.employee);
                    const open = expandedRemarks[goal.id];
                    return (
                      <tr key={goal.id} className="border-t border-black/5 align-top">
                        <td className="py-3 pr-3 text-[12px] font-bold text-[#6B7280]">{index + 1}</td>
                        <td className="py-3 pr-3 text-[12.5px] font-bold text-[#111] max-w-[140px]">{goal.title}</td>
                        <td className="py-3 pr-3 text-[12px] font-semibold text-[#374151] whitespace-nowrap">
                          {name.first}
                          {name.last ? <><br />{name.last}</> : null}
                        </td>
                        <td className="py-3 pr-3 text-[12px] text-[#6B7280] font-medium max-w-[120px]">{goal.goalType}</td>
                        <td className="py-3 pr-3 text-[12px] text-[#6B7280] font-medium whitespace-nowrap">{goal.startDate}</td>
                        <td className="py-3 pr-3 text-[12px] text-[#6B7280] font-medium whitespace-nowrap">{goal.endDate}</td>
                        <td className="py-3 pr-3 min-w-[210px]">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 max-w-[92px] rounded-full bg-[#E9F6EC] overflow-hidden">
                              <div className="h-full rounded-full bg-[#7FC9A9]" style={{ width: `${goal.progress}%` }} />
                            </div>
                            <span className="text-[12px] font-extrabold text-[#111]">{goal.progress}%</span>
                          </div>
                          <p className={`text-[11px] text-[#6B7280] mt-1 ${open ? "" : "line-clamp-1"}`}>
                            <span className="text-[#E8395B] font-bold">Remarks: </span>
                            {goal.remarks}
                          </p>
                          <button
                            type="button"
                            onClick={() => onToggleRemark(goal.id)}
                            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#7A0A17] mt-0.5"
                          >
                            {open ? "Show less" : "Show more"}
                            <ChevronDown size={12} className={open ? "rotate-180" : ""} />
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap bg-[#E8F2FE] text-[#3B82F6]">
                            {goal.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => onGoalAction("view", goal)} className="size-7 rounded-lg bg-[#FFF3E4] text-[#F59E0B] grid place-items-center" aria-label={`View ${goal.title}`}>
                              <Eye size={13} />
                            </button>
                            <button type="button" onClick={() => onGoalAction("edit", goal)} className="size-7 rounded-lg bg-[#E8F2FE] text-[#3B82F6] grid place-items-center" aria-label={`Edit ${goal.title}`}>
                              <Edit size={13} />
                            </button>
                            <button type="button" onClick={() => onGoalAction("review", goal)} className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center" aria-label={`Review ${goal.title}`}>
                              <img src={conductReviewIcon} alt="" className="size-3.5 object-contain" />
                            </button>
                            <button type="button" onClick={() => onGoalAction("delete", goal)} className="size-7 rounded-lg bg-[#FDECEE] text-[#E8395B] grid place-items-center" aria-label={`Delete ${goal.title}`}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <MaroonIcon icon={Megaphone} />
                <p className="text-[15px] font-extrabold text-[#111] truncate">Recent Announcements</p>
              </div>
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="h-8 px-3.5 rounded-full border border-[#7A0A17]/25 bg-white text-[12px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] shrink-0"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recent.map((item) => {
                const { Icon, className } = recentItemIcon(item.type);
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl bg-[#FAFAFB] border border-black/6 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <span className={`size-7 rounded-lg grid place-items-center shrink-0 ${className}`}>
                        <Icon size={14} />
                      </span>
                      <span className="text-[13px] font-bold text-[#111] truncate">{item.title}</span>
                    </button>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${priorityClass(item.priority)}`}>{item.priority}</span>
                    <button
                      type="button"
                      onClick={() => openComment(item)}
                      className="size-7 rounded-lg bg-[#FDF2F3] text-[#7A0A17] grid place-items-center shrink-0 hover:bg-[#F6E4E8] transition-colors"
                      aria-label={`Comment on ${item.title}`}
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <MaroonIcon icon={Send} filled />
              <p className="text-[15px] font-extrabold text-[#111]">Your Request</p>
            </div>
            <div className="space-y-2">
              {requests.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#FAFAFB] border border-black/6 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#9CA3AF] font-medium truncate">{item.submitted}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${requestStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCommentFor(item)}
                      className="size-7 rounded-lg bg-[#FDF2F3] text-[#7A0A17] grid place-items-center shrink-0 hover:bg-[#F6E4E8] transition-colors"
                      aria-label={`Comment on ${item.title}`}
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <button type="button" onClick={onOpenTrainings} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="flex items-center gap-2">
                <MaroonIcon icon={GraduationCap} />
                <span className="text-[13px] font-extrabold text-[#111]">Trainings</span>
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
            <button
              type="button"
              onClick={onOpenTrainings}
              className="mt-3 w-full flex items-center justify-between gap-2 pl-1 text-left"
            >
              <p className="text-[12.5px] font-semibold text-[#374151]">{posh?.title || "Mandatory POSH training"}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityClass(posh?.priority || "High")}`}>
                {posh?.priority || "High"}
              </span>
            </button>
          </Card>

          <Card className="p-4">
            <button type="button" onClick={onOpenAssets} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="flex items-center gap-2">
                <MaroonIcon icon={Laptop} />
                <span className="text-[13px] font-extrabold text-[#111]">Assets</span>
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={onOpenExit} className="flex items-center gap-2 text-left min-w-0">
                <MaroonIcon icon={LogOut} />
                <span className="text-[13px] font-extrabold text-[#111]">Exit & Separation</span>
              </button>
              <button
                type="button"
                onClick={onOpenExit}
                className="h-8 px-3 rounded-lg border border-[#7A0A17] text-[#7A0A17] text-[11px] font-bold hover:bg-[#FCF5F6] shrink-0"
              >
                Initiate resignation
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <button type="button" onClick={onOpenDocuments} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="flex items-center gap-2">
                <MaroonIcon icon={FileText} />
                <span className="text-[13px] font-extrabold text-[#111]">Documents & Media</span>
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
          </Card>
        </div>
      </div>

      <Modal
        open={listOpen}
        onClose={() => setListOpen(false)}
        title="Announcements"
        subtitle="All announcements"
        icon={<Megaphone size={17} />}
        iconBg="#FDECEE"
        iconColor="#E8395B"
        width="max-w-3xl"
      >
        <AnnouncementsPage embedded />
      </Modal>

      <AnnouncementDetailModal
        item={active}
        onClose={() => setActive(null)}
        onComment={(item) => {
          setCommentFor(item);
          setActive(null);
        }}
      />

      <SendMessageModal
        open={!!commentFor}
        onClose={() => setCommentFor(null)}
        title={commentFor ? `Comment · ${commentFor.title}` : "Comment"}
      />

      <Modal
        open={idleModalOpen}
        onClose={() => setIdleModalOpen(false)}
        title="Idle Alert Settings"
        subtitle="Choose how long inactivity should wait before you are alerted."
        icon={<Clock size={17} />}
        iconBg="#FDECEE"
        iconColor="#7A0A17"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIdleModalOpen(false)}
              className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIdleMinutes(idleDraft);
                try {
                  localStorage.setItem(IDLE_ALERT_KEY, String(idleDraft));
                } catch {
                  /* setting still applies for this session */
                }
                setIdleModalOpen(false);
                toast.success(`Idle alert set to ${idleDraft} minutes.`);
              }}
              className="px-5 py-2 bg-[#7A0A17] hover:bg-[#600712] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#374151]">Alert after</p>
          <div className="grid grid-cols-3 gap-2">
            {IDLE_MINUTE_OPTIONS.map((minutes) => {
              const selected = idleDraft === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setIdleDraft(minutes)}
                  aria-pressed={selected}
                  className={`h-11 rounded-xl border text-[13px] font-bold transition-colors ${
                    selected
                      ? "border-[#7A0A17] bg-[#FCF5F6] text-[#7A0A17]"
                      : "border-black/10 bg-white text-[#374151] hover:border-[#7A0A17]/30"
                  }`}
                >
                  {minutes} min
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function KpiCard({ icon, title, tone = "rose", onOpen, chart, children, trailing, id }) {
  return (
    <Card id={id} className="p-4 cursor-pointer hover:border-[#7A0A17]/25">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen?.();
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MaroonIcon icon={icon} tone={tone} />
            <p className="text-[13px] font-extrabold text-[#111] leading-tight">{title}</p>
          </div>
          {trailing}
        </div>
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="min-w-0">{children}</div>
          {chart}
        </div>
      </div>
    </Card>
  );
}
