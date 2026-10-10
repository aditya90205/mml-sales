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
    <section id={id} className={`hrms-card min-w-0 bg-white border border-black/8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </section>
  );
}

function MaroonIcon({ icon: Icon, filled = false, compact = false }) {
  return (
    <span
      className={`${compact ? "size-6 -ml-0.5" : "size-8"} rounded-lg grid place-items-center shrink-0 text-[#7A0A17]`}
    >
      <Icon size={compact ? 15 : 16} strokeWidth={2} fill={filled ? "currentColor" : "none"} />
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
      className={`h-7 max-w-full px-2.5 rounded-full border hrms-chip font-bold shrink-0 ${tones[tone]}`}
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
      className="h-7 max-w-full px-2.5 rounded-full bg-[#7A0A17] hover:bg-[#600712] text-white hrms-chip font-bold shrink-0"
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
        className="appearance-none bg-white border border-black/10 hover:border-[#7A0A17]/30 rounded-xl h-10 pl-4 pr-9 hrms-control font-semibold text-[#4B5563] shadow-sm cursor-pointer outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
    </div>
  );
}

function TimesheetDonut() {
  return (
    <div className="relative hrms-donut shrink-0">
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
          <p className="hrms-tiny font-bold text-[#7A0A17] leading-none">8h 0m</p>
          <p className="hrms-tiny text-[#9CA3AF] mt-0.5">Total</p>
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
  if (type === "Holiday" || type === "Event") return CalendarDays;
  if (type === "Training") return GraduationCap;
  return FileText;
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
            <p className="hrms-meta text-[#6B7280]">Welcome Back,</p>
            <div className="flex items-center gap-2">
              <h1 className="hrms-page-title tracking-tight leading-tight">{USER.name}</h1>
              <Link to="/profile" className="text-[#D97706] hover:text-[#B45309]" aria-label="View profile" title="View profile">
                <Eye size={15} />
              </Link>
              <Link to="/profile" className="text-[#2563EB] hover:text-[#1D4ED8]" aria-label="Edit profile" title="Edit profile">
                <Pencil size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 hrms-meta text-[#6B7280]">
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
            className="h-10 px-4 rounded-xl bg-[#7A0A17] hover:bg-[#600712] text-white hrms-control font-bold shadow-sm"
          >
            Report an issue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] gap-4 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <KpiCard
              icon={CalendarDays}
              iconBg="#E9F6EC"
              iconFg="#288270"
              title="Attendance"
              value="18 / 22 Days"
              note="This Month"
              onOpen={onOpenAttendance}
            />
            <KpiCard
              id="target-achievement"
              icon={Target}
              iconBg="#F6E6F8"
              iconFg="#B86FBE"
              title="Target Achievement"
              value="82%"
              note="This Month"
              onOpen={onOpenAchievement}
            />
            <KpiCard
              icon={IndianRupee}
              iconBg="#E9F6EC"
              iconFg="#16A34A"
              title="Incentive Earned"
              value="₹ 38,000"
              note="120% of target"
              noteTone="green"
              onOpen={onOpenIncentives}
            />
            <KpiCard
              icon={Trophy}
              iconBg="#FFF3E4"
              iconFg="#F59E0B"
              title="Awards & Contests"
              value="#2"
              note="My Rank · Out of 18"
              onOpen={onOpenAwards}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.05fr)_minmax(0,1.15fr)_minmax(0,1fr)] gap-3">
            <Card className="p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MaroonIcon icon={Clock} compact />
                  <div className="min-w-0">
                    <p className="hrms-title leading-tight truncate">Timesheet</p>
                    <p className="hrms-tiny text-[#9CA3AF] font-medium">Today</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  <SolidPill onClick={onRegularize}>Regularize</SolidPill>
                  <SolidPill onClick={onTimesheetDetails}>Details</SolidPill>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2.5 min-w-0">
                <TimesheetDonut />
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {TIMESHEET_SLICES.map((slice) => (
                    <li key={slice.label} className="flex items-center justify-between gap-2 hrms-tiny min-w-0">
                      <span className="inline-flex items-center gap-1.5 min-w-0 text-[#6B7280] font-medium">
                        <span className="size-2 rounded-full shrink-0" style={{ background: slice.color }} />
                        <span className="truncate">{slice.label}</span>
                      </span>
                      <span className="font-bold text-[#111] shrink-0 tabular-nums">{slice.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1">
                <div className="flex items-center gap-1 min-w-0">
                  <MaroonIcon icon={CalendarDays} compact />
                  <p className="hrms-title whitespace-nowrap">Leaves</p>
                </div>
                <SolidPill onClick={onApplyLeave}>Apply</SolidPill>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <p className="hrms-stat text-[#111] leading-none">2/7</p>
                <p className="hrms-meta text-[#6B7280]">used this year</p>
              </div>
              <button
                type="button"
                onClick={onLeaveBalance}
                className="mt-1.5 text-left hrms-link text-[#7A0A17] hover:underline leading-snug"
              >
                Leave Balance - 1 day available
              </button>
            </Card>

            <Card className="p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 mb-3">
                <div className="flex items-center gap-1 min-w-0">
                  <MaroonIcon icon={Receipt} compact />
                  <p className="hrms-title whitespace-nowrap">My Expenses</p>
                </div>
                <SolidPill onClick={onApplyExpense}>Apply</SolidPill>
              </div>
              <div className="space-y-2">
                {expenses.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-white border border-black/8 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="hrms-row font-bold text-[#111] truncate leading-tight">{item.purpose}</p>
                      <p className="hrms-tiny text-[#9CA3AF] font-medium truncate">
                        {item.destination.split(",")[0]}: {item.startDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onViewExpense(item)}
                        className="size-7 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] grid place-items-center"
                        aria-label={`View ${item.purpose}`}
                      >
                        <Eye size={15} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewExpense(item)}
                        className="size-7 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] grid place-items-center"
                        aria-label={`Edit ${item.purpose}`}
                      >
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 mb-3">
                <div className="flex items-center gap-1 min-w-0">
                  <MaroonIcon icon={FileText} compact />
                  <p className="hrms-title whitespace-nowrap">Salary Slips</p>
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
                  <div key={month} className="flex items-center justify-between gap-2 rounded-xl bg-white border border-black/8 px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => onOpenSalary?.(month)}
                      className="min-w-0 flex-1 text-left hrms-row font-bold text-[#111] hover:text-[#7A0A17] truncate"
                    >
                      {month} {selectedYear}
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`${month} ${selectedYear} payslip download started.`)}
                      className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center"
                      aria-label={`Download ${month} ${selectedYear} payslip`}
                    >
                      <Download size={15} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <MaroonIcon icon={TrendingUp} />
                  <div className="min-w-0">
                    <p className="hrms-title leading-tight">Promotions and Transfers</p>
                    <p className="hrms-meta text-[#6B7280] mt-1 leading-snug">
                      You can see your promotions and transfers till today
                    </p>
                    <p className="hrms-meta font-bold text-[#16A34A] mt-2">Promoted 2 times last year</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onViewPromotions}
                  className="inline-flex items-center gap-1 h-7 hrms-link text-[#7A0A17] hover:text-[#5C0811] transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            </Card>

            <Card id="warnings-complaints" className="p-3.5 bg-[#FCF5F6] border-[#7A0A17]/15">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                    <AlertTriangle size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="hrms-title leading-tight">Warnings and Complaints</p>
                    <p className="hrms-meta text-[#6B7280] mt-1 leading-snug">
                      Late arrivals flagged twice this month.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onViewWarnings}
                  className="inline-flex items-center gap-1 h-7 hrms-link text-[#7A0A17] hover:text-[#5C0811] transition-colors shrink-0"
                >
                  View Notice
                </button>
              </div>
            </Card>

            <div className="hrms-card min-w-0 rounded-2xl border border-[#7A0A17]/15 bg-white p-3.5 shadow-[0_1px_2px_rgba(122,10,23,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MaroonIcon icon={Clock} />
                  <p className="hrms-title text-[#7A0A17] leading-tight truncate">Idle Alert Settings</p>
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
              <p className="hrms-meta text-[#6B7280] mt-3 pl-10 leading-snug">
                You will be alerted after {idleMinutes} minutes of inactivity.
              </p>
            </div>
          </div>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-left">
                <MaroonIcon icon={Target} />
                <span className="hrms-panel-title">Goals & Review</span>
              </div>
              <button
                type="button"
                onClick={onViewGoals}
                className="inline-flex items-center gap-1 hrms-link text-[#7A0A17] hover:text-[#5C0811] transition-colors shrink-0"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="hrms-table-head text-[#9CA3AF]">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Employee</th>
                    <th className="py-2 pr-3">Goal Type</th>
                    <th className="py-2 pr-3">Start Date</th>
                    <th className="py-2 pr-3">End Date</th>
                    <th className="py-2 pr-3">Progress</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((goal, index) => {
                    const name = splitName(goal.employee);
                    const open = expandedRemarks[goal.id];
                    return (
                      <tr key={goal.id} className="border-t border-black/5 align-top">
                        <td className="py-3 pr-3 hrms-table-cell font-bold text-[#6B7280]">{index + 1}</td>
                        <td className="py-3 pr-3 hrms-table-cell font-bold text-[#111] max-w-[140px]">{goal.title}</td>
                        <td className="py-3 pr-3 hrms-table-cell font-semibold text-[#374151] whitespace-nowrap">
                          {name.first}
                          {name.last ? <><br />{name.last}</> : null}
                        </td>
                        <td className="py-3 pr-3 hrms-table-cell text-[#6B7280] max-w-[120px]">{goal.goalType}</td>
                        <td className="py-3 pr-3 hrms-table-cell text-[#6B7280] whitespace-nowrap">{goal.startDate}</td>
                        <td className="py-3 pr-3 hrms-table-cell text-[#6B7280] whitespace-nowrap">{goal.endDate}</td>
                        <td className="py-3 pr-3 min-w-[210px]">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 max-w-[92px] rounded-full bg-[#E9F6EC] overflow-hidden">
                              <div className="h-full rounded-full bg-[#7FC9A9]" style={{ width: `${goal.progress}%` }} />
                            </div>
                            <span className="hrms-table-cell font-bold text-[#111]">{goal.progress}%</span>
                          </div>
                          <p className={`hrms-tiny text-[#6B7280] mt-1 ${open ? "" : "line-clamp-1"}`}>
                            <span className="text-[#E8395B] font-bold">Remarks: </span>
                            {goal.remarks}
                          </p>
                          <button
                            type="button"
                            onClick={() => onToggleRemark(goal.id)}
                            className="inline-flex items-center gap-0.5 hrms-link text-[#7A0A17] mt-0.5"
                          >
                            {open ? "Show less" : "Show more"}
                            <ChevronDown size={12} className={open ? "rotate-180" : ""} />
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="inline-block hrms-badge px-2 py-0.5 rounded-md whitespace-nowrap bg-[#E8F2FE] text-[#3B82F6]">
                            {goal.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => onGoalAction("view", goal)} className="size-7 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] grid place-items-center" aria-label={`View ${goal.title}`}>
                              <Eye size={14} />
                            </button>
                            <button type="button" onClick={() => onGoalAction("edit", goal)} className="size-7 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] grid place-items-center" aria-label={`Edit ${goal.title}`}>
                              <Pencil size={14} />
                            </button>
                            <button type="button" onClick={() => onGoalAction("review", goal)} className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center" aria-label={`Review ${goal.title}`}>
                              <img src={conductReviewIcon} alt="" className="size-3.5 object-contain" />
                            </button>
                            <button type="button" onClick={() => onGoalAction("delete", goal)} className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center" aria-label={`Delete ${goal.title}`}>
                              <Trash2 size={14} />
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

        <div className="flex flex-col gap-4 min-w-0">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <MaroonIcon icon={Megaphone} />
                <p className="text-[15px] font-extrabold text-[#111] leading-tight truncate">Recent Announcements</p>
              </div>
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="inline-flex items-center gap-1 h-7 text-[11px] font-semibold text-[#7A0A17] hover:text-[#5C0811] transition-colors shrink-0"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recent.map((item) => {
                const Icon = recentItemIcon(item.type);
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white border border-black/8 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <span className="size-7 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <span className="text-[13px] font-bold text-[#111] leading-tight truncate">{item.title}</span>
                    </button>
                    <span className={`hrms-badge px-2 py-0.5 rounded-md shrink-0 ${priorityClass(item.priority)}`}>{item.priority}</span>
                    <button
                      type="button"
                      onClick={() => openComment(item)}
                      className="size-7 rounded-lg text-[#7A0A17] grid place-items-center shrink-0 hover:bg-[#FDF2F3] transition-colors"
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
              <p className="text-[15px] font-extrabold text-[#111] leading-tight truncate">Your Request</p>
            </div>
            <div className="space-y-2">
              {requests.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-white border border-black/8 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111] leading-tight truncate">{item.title}</p>
                    <p className="text-[11px] text-[#9CA3AF] font-medium leading-snug mt-0.5 truncate">{item.submitted}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hrms-badge px-2 py-0.5 rounded-md shrink-0 ${requestStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCommentFor(item)}
                      className="size-7 rounded-lg text-[#7A0A17] grid place-items-center shrink-0 hover:bg-[#FDF2F3] transition-colors"
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
                <span className="hrms-title">Trainings</span>
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
            <button
              type="button"
              onClick={onOpenTrainings}
              className="mt-3 w-full flex items-center justify-between gap-2 pl-1 text-left"
            >
              <p className="hrms-row font-semibold text-[#374151] min-w-0 truncate">{posh?.title || "Mandatory POSH training"}</p>
              <span className={`hrms-badge px-2 py-0.5 rounded-md ${priorityClass(posh?.priority || "High")}`}>
                {posh?.priority || "High"}
              </span>
            </button>
          </Card>

          <Card className="p-4">
            <button type="button" onClick={onOpenAssets} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="flex items-center gap-2">
                <MaroonIcon icon={Laptop} />
                <span className="hrms-title">Assets</span>
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
          </Card>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={onOpenExit} className="flex items-center gap-2 text-left min-w-0">
                <MaroonIcon icon={LogOut} />
                <span className="hrms-title">Exit & Separation</span>
              </button>
              <button
                type="button"
                onClick={onOpenExit}
                className="h-8 px-2.5 rounded-lg border border-[#7A0A17] text-[#7A0A17] hrms-chip font-bold hover:bg-[#FCF5F6] shrink-0"
              >
                Initiate resignation
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <button type="button" onClick={onOpenDocuments} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="flex items-center gap-2">
                <MaroonIcon icon={FileText} />
                <span className="hrms-title">Documents & Media</span>
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
        iconBg="transparent"
        iconColor="#7A0A17"
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
        iconBg="transparent"
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
          <p className="hrms-row font-bold text-[#374151]">Alert after</p>
          <div className="grid grid-cols-3 gap-2">
            {IDLE_MINUTE_OPTIONS.map((minutes) => {
              const selected = idleDraft === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setIdleDraft(minutes)}
                  aria-pressed={selected}
                  className={`h-11 rounded-xl border hrms-control font-bold transition-colors ${
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

function KpiCard({ icon: Icon, iconBg, iconFg, title, value, note, noteTone, onOpen, id }) {
  return (
    <Card
      id={id}
      className="px-3.5 py-3 cursor-pointer hover:border-black/15 hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#7A0A17]/35"
    >
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
        className="flex items-center gap-3 min-w-0"
      >
        <span
          className="size-10 rounded-[10px] grid place-items-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconFg }} strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="hrms-kpi-title text-[#111] leading-tight truncate">{title}</p>
          <p className="hrms-kpi-value text-[#111] leading-tight mt-0.5 truncate">{value}</p>
          {note && (
            <p
              className={`hrms-kpi-note mt-0.5 leading-tight truncate ${
                noteTone === "green"
                  ? "text-[#16A34A] font-bold"
                  : noteTone === "red"
                    ? "text-[#E8395B] font-bold"
                    : "text-[#6B7280] font-semibold"
              }`}
            >
              {note}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
