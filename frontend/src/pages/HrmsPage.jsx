import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import {
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Clock,
  Trophy,
  Target,
  Receipt,
  Calendar,
  Eye,
  Edit,
  Pencil,
  Trash2,
  CheckCircle2,
  BadgeCheck,
  X,
  Plus,
  AlertCircle,
  FileText,
  Download,
  TrendingUp,
  Filter,
  BarChart3,
  LayoutGrid,
  Lock,
  Image as ImageIcon,
  Upload,
  Info,
  Coffee,
  ArrowLeftRight,
  CalendarCheck,
  CalendarPlus,
  GraduationCap,
  Laptop,
  LogOut,
} from "lucide-react";
import { USER } from "../components/layout/TopBar";
import Modal from "../components/ui/Modal";
import HrmsDashboard from "../components/hrms/HrmsDashboard.jsx";
import {
  AchievementKpiModal,
  ComplaintsWarningsPanel,
  WarningsComplaintsModal,
} from "../components/hrms/HrmsSummaryModals.jsx";
import TimesheetDetailsModal from "../components/hrms/TimesheetDetailsModal";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
import {
  ConfirmDeleteModal,
  GoalConductReviewModal,
  GoalEditModal,
  GoalViewModal,
  TrainingEditModal,
  TrainingViewModal,
} from "../components/hrms/HrmsEntityModals.jsx";
import conductReviewIcon from "../assets/conduct-review.png";
import ExitTab from "../components/hrms/ExitTab.jsx";
import DocumentsPage from "./DocumentsPage.jsx";
import { PromotionsTransfersSection } from "../components/hrms/PromotionTransferSection.jsx";
import SearchField from "../components/common/SearchField.jsx";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import yellowLoopIcon from "../assets/yellow-loop.png";
import redBackIcon from "../assets/red-back.png";

// ── Dummy / State Data ────────────────────────────────────────────────────────
const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEAR_OPTIONS = ["2024", "2025", "2026"];

const EMPLOYEE_OPTIONS = ["Ankur Sharma", "Aditya Sharma", "Kuhu Sharma", "Rohit Sharma", "Priya Raheja"];

const LEAVE_BALANCE_TYPES = [
  { type: "Annual Leave",      total: 23, used: 8, available: 15, info: "Paid time off for planned personal travel or downtime." },
  { type: "Paternity Leave",   total: 23, used: 8, available: 15, info: "Leave for new fathers following the birth or adoption of a child." },
  { type: "Maternity Leave",   total: 23, used: 8, available: 15, info: "Leave for new mothers before and after childbirth." },
  { type: "Sick Leave",        total: 23, used: 8, available: 15, info: "Paid leave for illness or medical appointments." },
  { type: "Emergency Leave",   total: 23, used: 8, available: 15, info: "Short-notice leave for unforeseen personal emergencies." },
  { type: "Personal Leave",    total: 23, used: 8, available: 15, info: "Leave for personal matters not covered by other categories." },
  { type: "Casual Leave",      total: 23, used: 8, available: 15, info: "Short leave for everyday personal reasons." },
  { type: "Study Leave",       total: 5,  used: 5, available: 0,  info: "Leave to attend exams, courses, or certifications." },
  { type: "Marriage Leave",    total: 5,  used: 5, available: 0,  info: "Leave granted for an employee's own wedding." },
  { type: "Bereavement Leave", total: 23, used: 8, available: 15, info: "Leave following the loss of an immediate family member." },
];

const SHIFT_OPTIONS = [
  "Morning Shift (8:00 AM - 5:00 PM)",
  "General Shift (9:00 AM - 6:00 PM)",
  "Evening Shift (2:00 PM - 11:00 PM)",
  "Late Shift (11:00 AM - 8:00 PM)",
];

const INITIAL_SHIFT_CHANGE_REQUESTS = [
  { id: 1, from: "General (9:00 AM - 6:00 PM)", to: "Evening (2:00 PM - 11:00 PM)", effective: "August 2026", status: "Pending" },
];

const HRMS_TABS = [
  "Summary",
  "Incentives",
  "Attendance & Timesheet",
  "Salary & Payslip",
  "Trainings",
  "Goals & Reviews",
  "Asset",
  "Awards & Contest",
  "Promotion and Transfer",
  "Complaint & Warning",
  "Exit",
];

const INITIAL_AWARDS = [
  {
    id: 1,
    awardType: "Leadership Award",
    awardDate: "2026-01-15",
    gift: "Extra Leave Days",
    certificateLabel: "leadership-award-cert.pdf",
    certificateUrl: "#leadership-award-cert",
    photoLabel: "award-ceremony.jpg",
    photoUrl: "#award-ceremony",
    description: "Mentored team members and contributed to their professional development",
  },
  {
    id: 2,
    awardType: "Sales Excellence",
    awardDate: "2026-02-28",
    gift: "Amazon Voucher ₹5,000",
    certificateLabel: "sales-excellence-cert.pdf",
    certificateUrl: "#sales-excellence-cert",
    photoLabel: "sales-booster-photo.jpg",
    photoUrl: "#sales-booster-photo",
    description: "Highest qualified leads converted in Q1 across South Extension branch",
  },
  {
    id: 3,
    awardType: "Best Closer",
    awardDate: "2025-11-20",
    gift: "Cash Bonus ₹10,000",
    certificateLabel: "best-closer-cert.pdf",
    certificateUrl: "#best-closer-cert",
    photoLabel: "conversion-king.jpg",
    photoUrl: "#conversion-king",
    description: "Closed 8 premium memberships within the contest window",
  },
  {
    id: 4,
    awardType: "Team Player",
    awardDate: "2025-09-12",
    gift: "Recognition Badge",
    certificateLabel: "team-player-cert.pdf",
    certificateUrl: "#team-player-cert",
    photoLabel: "client-delight.jpg",
    photoUrl: "#client-delight",
    description: "Highest CSAT scores and zero open complaints during the campaign week",
  },
  {
    id: 5,
    awardType: "Rising Star",
    awardDate: "2025-06-05",
    gift: "Trophy + Gift Hamper",
    certificateLabel: "rising-star-cert.pdf",
    certificateUrl: "#rising-star-cert",
    photoLabel: "rising-star-photo.jpg",
    photoUrl: "#rising-star-photo",
    description: "Fastest ramp-up to target among new sales managers this half-year",
  },
];

const INITIAL_CONTESTS = [
  {
    id: 1,
    challengeName: "Logging Framework",
    typeReward: "Individual - XP",
    earnedXp: 10,
    period: "02-07-26 - 20-08-26",
    project: "Security Audit & Compliance",
    criteria: "Problem Solving",
    difficulty: "Easy",
    challengeStatus: "In Progress",
    activeStatus: "Active",
    members: ["Rahul Sharma", "Anil Gupta", "Sushant Mehta", "Adyasha Sahu"],
    description: "Problem Solving",
  },
  {
    id: 2,
    challengeName: "Mega Lead Hunter",
    typeReward: "Team - Badge",
    earnedXp: 25,
    period: "01-08-26 - 31-08-26",
    project: "Pipeline Acceleration",
    criteria: "Lead Generation",
    difficulty: "Medium",
    challengeStatus: "Completed",
    activeStatus: "Closed",
    members: ["Ankur Sharma", "Kuhu Sharma", "Priya Singh"],
    description: "Generate maximum qualified leads and top the branch dashboard",
  },
  {
    id: 3,
    challengeName: "Sales Booster Sprint",
    typeReward: "Individual - Cash",
    earnedXp: 40,
    period: "10-06-26 - 30-06-26",
    project: "Q2 Revenue Push",
    criteria: "Conversions",
    difficulty: "Hard",
    challengeStatus: "Completed",
    activeStatus: "Closed",
    members: ["Ankur Sharma", "Rohan Verma"],
    description: "Close more deals and boost sales numbers this month",
  },
  {
    id: 4,
    challengeName: "Client Delight Week",
    typeReward: "Team - XP",
    earnedXp: 15,
    period: "05-09-26 - 12-09-26",
    project: "Post-Sale Experience",
    criteria: "Customer Satisfaction",
    difficulty: "Easy",
    challengeStatus: "Not Started",
    activeStatus: "Active",
    members: ["Ankur Sharma", "Aditya Sharma", "Neha Kapoor"],
    description: "Maintain CSAT and resolve open complaints within SLA",
  },
  {
    id: 5,
    challengeName: "Conversion King",
    typeReward: "Individual - Trophy",
    earnedXp: 50,
    period: "01-05-26 - 31-05-26",
    project: "Membership Closures",
    criteria: "Deal Closure Rate",
    difficulty: "Hard",
    challengeStatus: "In Progress",
    activeStatus: "Active",
    members: ["Ankur Sharma", "Arjun Mehta", "Sana Iqbal"],
    description: "Convert meetings into successful memberships",
  },
];

const INITIAL_EXPENSES = [
  {
    id: 1,
    employee: "Ankur Sharma",
    purpose: "Site Visit",
    destination: "Rajouri Garden, Delhi",
    startDate: "24-05-2026",
    endDate: "24-05-2026",
    status: "Cancelled",
    advanceAmount: "21,800.44",
    advanceStatus: "Active",
    totalExpenses: "-",
    documentName: null,
    description: "Visiting client site or project location to assess requirements, progress, and coordinate implementation activities.",
    expectedOutcomes: "Lorem Ipsum",
  },
  {
    id: 2,
    employee: "Ankur Sharma",
    purpose: "Client Meal",
    destination: "Connaught Place, Delhi",
    startDate: "11-02-2026",
    endDate: "11-02-2026",
    status: "Approved",
    advanceAmount: "1,200.00",
    advanceStatus: "Active",
    totalExpenses: "₹1,200",
    documentName: "receipt.pdf",
    description: "Client lunch meeting to discuss ongoing project requirements and next steps.",
    expectedOutcomes: "Signed off scope for Q3 rollout.",
  },
];

const INITIAL_LEAVES = [
  { id: 1, type: "Casual Leave", date: "August 8", status: "Pending", comment: "Family function in hometown." },
  { id: 2, type: "Casual Leave", date: "August 8", status: "Pending", comment: "Personal work." },
  { id: 3, type: "Sick Leave", date: "July 25 - 26", status: "Approved", comment: "Viral fever and doctor advice." },
  { id: 4, type: "Casual Leave", date: "August 8", status: "Pending", comment: "Bank paperwork." },
  { id: 5, type: "Earned Leave", date: "July 10 - 14", status: "Approved", comment: "Annual vacation." },
  { id: 6, type: "Sick Leave", date: "July 25 - 26", status: "Approved", comment: "Dental procedure." },
  { id: 7, type: "Earned Leave", date: "July 10 - 14", status: "Approved", comment: "Outstation travel." },
];

const MY_REQUESTS = [
  { id: 1, title: "Late Arrival on July 30",    submitted: "Submitted on July 30 at 6:30 PM", status: "Pending" },
  { id: 2, title: "Early Departure on July 25", submitted: "Submitted on July 25 at 5:45 PM", status: "Approved" },
  { id: 3, title: "Work From Home on July 22",  submitted: "Submitted on July 22 at 9:15 AM",  status: "Approved" },
];


const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NINE_HOURS_MIN = 9 * 60;

function formatHoursMinutes(totalMinutes) {
  const safe = Math.max(0, Number(totalMinutes) || 0);
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Dummy login / logout / hours for each attendance status. */
function getDummyTimesheet(status, dayIndex) {
  if (status === "WO" || status === "H") {
    return { login: "—", logout: "—", systemMin: 0, totalMin: 0 };
  }
  if (status === "X") {
    return { login: "—", logout: "—", systemMin: 0, totalMin: 0 };
  }
  if (status === "1/2") {
    return { login: "09:15 AM", logout: "01:40 PM", systemMin: 280, totalMin: 260 };
  }
  const shortDay = dayIndex % 3 !== 0;
  if (shortDay) {
    return { login: "09:15 AM", logout: "06:25 PM", systemMin: 496, totalMin: 490 };
  }
  return { login: "09:00 AM", logout: "06:18 PM", systemMin: 558, totalMin: 550 };
}

const DEDUCTION_RATE_PER_HOUR = 150;

function getDeduction(totalMin, status) {
  if (status === "WO" || status === "H") {
    return { minutes: 0, billedHours: 0, amount: 0 };
  }
  if (totalMin >= NINE_HOURS_MIN) {
    return { minutes: 0, billedHours: 0, amount: 0 };
  }
  const minutes = NINE_HOURS_MIN - totalMin;
  const billedHours = Math.round((minutes / 60) * 100) / 100;
  return { minutes, billedHours, amount: billedHours * DEDUCTION_RATE_PER_HOUR };
}

function formatRupees(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

const ATTENDANCE_STATUS_PATTERN = [
  "WO", "WO", "WO", "X", "P", "H", "P", "WO", "WO", "1/2",
  "P", "P", "P", "X", "WO", "WO", "P", "H", "P", "1/2",
  "X", "WO", "WO", "P", "P", "1/2", "X", "P", "P", "P", "P",
];

function AttendanceDayCell({ d, onRegularize }) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);
  const ts = d.timesheet;
  const underHours = ts.totalMin < NINE_HOURS_MIN;
  const showRegularize = underHours && d.status !== "WO" && d.status !== "H";
  const deduction = getDeduction(ts.totalMin, d.status);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = 280;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const below = r.bottom + 8;
    const top = below + 280 > window.innerHeight ? r.top - 8 : below;
    setPos({
      top,
      left,
      placeAbove: below + 280 > window.innerHeight,
    });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 120);
  };

  return (
    <>
      <div
        ref={ref}
        className="flex flex-col items-center gap-1.5 flex-1 min-w-0 text-center cursor-pointer"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
      >
        <span className="text-[10px] font-bold text-[#9CA3AF]">{d.day}</span>
        <span className="text-[10px] font-bold text-[#111827] whitespace-nowrap">{d.week}</span>
        {d.status === "P" && (
          <span className="size-6 rounded-full bg-[#DCFCE7] text-[#15803D] grid place-items-center text-xs font-bold">✓</span>
        )}
        {d.status === "X" && (
          <span className="size-6 rounded-full bg-[#FEE2E2] text-[#DC2626] grid place-items-center text-xs font-bold">✕</span>
        )}
        {d.status === "1/2" && (
          <span className="size-6 rounded-full bg-[#FEF3C7] text-[#D97706] grid place-items-center text-[10px] font-bold">½</span>
        )}
        {d.status === "H" && (
          <span className="size-6 rounded-full bg-[#F3E8FF] text-[#9333EA] grid place-items-center text-[10px] font-bold">H</span>
        )}
        {d.status === "WO" && (
          <span className="size-6 rounded-full bg-[#475569] text-white grid place-items-center text-[9px] font-bold">WO</span>
        )}
      </div>

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] w-[280px] bg-white border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-4"
            style={{
              top: pos.placeAbove ? undefined : pos.top,
              bottom: pos.placeAbove ? window.innerHeight - pos.top : undefined,
              left: pos.left,
            }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            <p className="text-[13px] font-bold text-[#111827]">Attendance Details</p>
            <p className="text-[11px] text-[#9CA3AF] font-semibold mt-0.5 mb-3">{d.dateLabel}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Login</p>
                <p className="text-[13px] font-bold text-[#16A34A] mt-0.5">{ts.login}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Logout</p>
                <p className="text-[13px] font-bold text-[#16A34A] mt-0.5">{ts.logout}</p>
              </div>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6B7280] font-semibold">System Time</span>
                <span className="font-bold text-[#111827]">{formatHoursMinutes(ts.systemMin)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>
                  <span className="block font-bold text-[#111827]">Total</span>
                  <span className="block text-[10px] text-[#9CA3AF] font-semibold">(Total Time Worked)</span>
                </span>
                <span className={`font-bold ${underHours ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                  {formatHoursMinutes(ts.totalMin)}
                </span>
              </div>
              <div className="h-px bg-black/8" />
              <div className="flex items-start justify-between gap-3">
                <span>
                  <span className="block font-bold text-[#111827]">Deduction</span>
                  <span className="block text-[10px] text-[#9CA3AF] font-semibold">(Time / Amount Deducted)</span>
                </span>
                <span className="text-right">
                  <span className={`block font-bold ${deduction.minutes > 0 ? "text-[#DC2626]" : "text-[#111827]"}`}>
                    {formatHoursMinutes(deduction.minutes)}
                  </span>
                  <span className="block text-[10px] text-[#9CA3AF] font-semibold mt-0.5">
                    {deduction.billedHours > 0
                      ? `${deduction.billedHours.toFixed(2)} × ₹${DEDUCTION_RATE_PER_HOUR} = ${formatRupees(deduction.amount)}`
                      : formatRupees(0)}
                  </span>
                </span>
              </div>
            </div>

            {showRegularize && (
              <button
                type="button"
                onClick={() => onRegularize?.()}
                className="mt-3.5 w-full h-9 rounded-xl bg-[#7A0A17] hover:bg-[#600712] text-white text-[12px] font-bold transition-colors"
              >
                Regularize
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

function getAttendanceDays(monthName, year) {
  const monthIndex = MONTH_OPTIONS.indexOf(monthName);
  const y = Number(year);
  if (monthIndex < 0 || !y) return [];
  const daysInMonth = new Date(y, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(y, monthIndex, i + 1);
    const dow = date.getDay();
    let status = ATTENDANCE_STATUS_PATTERN[i % ATTENDANCE_STATUS_PATTERN.length];
    if (dow === 0 || dow === 6) status = "WO";
    const timesheet = getDummyTimesheet(status, i);
    return {
      day: String(i + 1).padStart(2, "0"),
      week: WEEKDAY_SHORT[dow],
      weekdayLong: WEEKDAY_LONG[dow],
      dateLabel: `${i + 1} ${monthName}, ${y} (${WEEKDAY_LONG[dow]})`,
      dateShort: `${String(i + 1).padStart(2, "0")} ${monthName.slice(0, 3)} ${y}`,
      status,
      timesheet,
    };
  });
}

const INITIAL_TRAININGS = [
  { id: 1, program: "Evening Online Session",  track: "Executive Leadership Program",        dateTime: "01-12-2026 23:30 - 31-12-2026 01:30", location: "Zoom Meeting",     locationType: "Virtual",  status: "Completed", score: 95.5, result: "Passed", attendance: 10 },
  { id: 2, program: "Weekend Intensive Session", track: "Executive Leadership Program",       dateTime: "01-12-2026 23:30 - 31-12-2026 01:30", location: "Conference Hall",  locationType: "Physical", status: "Scheduled", score: 95.5, result: "Passed", attendance: 10 },
  { id: 3, program: "Virtual Workshop Session", track: "Database Management Certification",   dateTime: "01-12-2026 23:30 - 31-12-2026 01:30", location: "Online Platform",  locationType: "Virtual",  status: "Completed", score: 33.5, result: "Fail",   attendance: 10 },
  { id: 4, program: "Afternoon Session - Batch B", track: "Database Management Certification", dateTime: "01-12-2026 23:30 - 31-12-2026 01:30", location: "Training Room 2",  locationType: "Physical", status: "Completed", score: 95.5, result: "Passed", attendance: 10 },
  { id: 5, program: "Morning Onboarding Session", track: "New Hire Onboarding",                dateTime: "05-12-2026 09:30 - 05-12-2026 13:00", location: "Zoom Meeting",     locationType: "Virtual",  status: "Completed", score: 88.0, result: "Passed", attendance: 9 },
  { id: 6, program: "Sales Certification Sprint", track: "Sales Enablement",                   dateTime: "08-12-2026 10:00 - 08-12-2026 16:00", location: "Conference Hall",  locationType: "Physical", status: "Scheduled", score: 0,    result: null,     attendance: 0 },
  { id: 7, program: "Compliance Refresher",       track: "Statutory Compliance",                dateTime: "12-12-2026 15:00 - 12-12-2026 17:00", location: "Online Platform",  locationType: "Virtual",  status: "Completed", score: 72.0, result: "Passed", attendance: 8 },
  { id: 8, program: "Advanced Excel Workshop",    track: "Skill Development",                   dateTime: "15-12-2026 11:00 - 15-12-2026 14:00", location: "Training Room 2",  locationType: "Physical", status: "Completed", score: 41.0, result: "Fail",   attendance: 7 },
  { id: 9, program: "Leadership Roundtable",      track: "Executive Leadership Program",        dateTime: "20-12-2026 23:30 - 20-12-2026 01:30", location: "Zoom Meeting",     locationType: "Virtual",  status: "Scheduled", score: 0,    result: null,     attendance: 0 },
];

const INITIAL_GOALS = [
  { id: 1, title: "Subscription Sold",       employee: "Rahul Sharma",  goalType: "Sales/Subscription",         startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 2, title: "New Clients",             employee: "Rohit Sharma",  goalType: "Client Acquisition",         startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 3, title: "Match",                   employee: "Kushali Verma", goalType: "Matchmaking",                startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 4, title: "Launch New Product Feature", employee: "Adyasha Singh", goalType: "Project Goals",            startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 5, title: "MML CRM & Package Pitch Training", employee: "Ananya Mishra", goalType: "Learning and Training Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Completing MML sales CRM modules and Premium/Exclusive package pitch drills; final assessment pending before client-facing certification." },
  { id: 6, title: "Relationship Manager Promotion Track", employee: "Akshay Kumar", goalType: "Career Development Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Shadowing senior RMs on Premium matchmaking cases and home visits; promotion review scheduled after closing 3 verified handovers." },
  { id: 7, title: "Reduce Response Time",     employee: "Priya Raheja",  goalType: "Customer Success",           startDate: "26-08-2026", endDate: "26-08-2026", progress: 70, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 8, title: "Certification Completion", employee: "Vivek Sharma",  goalType: "Learning and Training Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 40, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 9, title: "Team Mentorship",          employee: "Aditya Sharma", goalType: "Career Development Goals",  startDate: "26-08-2026", endDate: "26-08-2026", progress: 85, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
];

const INITIAL_ASSETS = [
  { id: 1, name: "TP-Link Wireless Router", category: "Network Equipment", code: "NET002", subCode: "TP001", status: "Available", assignedDate: "15-01-2025", returnDate: null },
  { id: 2, name: "Cisco Catalyst Switch",   category: "Network Equipment", code: "NET002", subCode: "TP001", status: "Returned",  assignedDate: "15-01-2025", returnDate: "16-01-2026" },
  { id: 3, name: "Company Car - Honda City 2022", category: "Vehicle",     code: "VEH014", subCode: "HC022", status: "Available", assignedDate: "15-01-2025", returnDate: null },
  { id: 4, name: "Laptop - Dell Latitude 5420", category: "IT Equipment", code: "IT0088",  subCode: "DL542", status: "Returned",  assignedDate: "15-01-2025", returnDate: "16-01-2026" },
];

// ── Shared tab pieces ──────────────────────────────────────────────────────
function TabToolbar({ search, onSearchChange, placeholder = "Search..." }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder={placeholder}
          size="sm"
          className="flex-1"
        />
        <button
          type="button"
          className="bg-white border border-black/12 hover:bg-[#FAFAFB] text-[#374151] text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <Filter size={14} /> Filter
        </button>
      </div>
    </div>
  );
}

/** Compact column: icon + hover popup (members list or description text). */
function HoverIconTip({
  icon: Icon = Eye,
  ariaLabel,
  title,
  panelTitle,
  width = 240,
  children,
}) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const below = r.bottom + 8;
    const placeAbove = below + 180 > window.innerHeight;
    setPos({
      top: placeAbove ? undefined : below,
      bottom: placeAbove ? window.innerHeight - r.top + 8 : undefined,
      left,
    });
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
        className="inline-flex items-center justify-center size-8 rounded-lg border border-black/10 text-[#6B7280] hover:text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
        aria-label={ariaLabel}
        title={title}
      >
        <Icon size={14} />
      </button>

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] bg-white border border-black/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-3"
            style={{ top: pos.top, bottom: pos.bottom, left: pos.left, width }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            {panelTitle && (
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
                {panelTitle}
              </p>
            )}
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

function MembersHoverView({ members = [] }) {
  if (!members.length) {
    return <span className="text-[#9CA3AF]">—</span>;
  }

  return (
    <HoverIconTip
      icon={Eye}
      ariaLabel={`View ${members.length} members`}
      title="View members"
      panelTitle={`Selected members (${members.length})`}
      width={220}
    >
      <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
        {members.map((name) => (
          <li key={name} className="text-[12.5px] font-semibold text-[#111827]">
            {name}
          </li>
        ))}
      </ul>
    </HoverIconTip>
  );
}

function DescriptionHoverView({ description }) {
  if (!description) {
    return <span className="text-[#9CA3AF]">—</span>;
  }

  return (
    <HoverIconTip
      icon={FileText}
      ariaLabel="View description"
      title="View description"
      panelTitle="Description"
      width={280}
    >
      <p className="text-[12.5px] font-medium text-[#374151] leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </HoverIconTip>
  );
}

function Pagination({ page, totalPages, totalItems, pageSize, itemLabel, onChange }) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
      <p>
        Showing {start} to {end} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`size-7 rounded-lg font-bold ${
              n === page ? "bg-[#7A0A17] text-white" : "border border-black/10 bg-white hover:bg-[#FAFAFB] text-[#374151]"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

const HOURLY_WORK_ROWS = [
  { start: "09:00:00 AM", end: "10:00:35 AM", module: "Calendar", description: "Meetings with clients", by: "System", hours: "1.00h" },
  { start: "10:00:00 AM", end: "10:30:00 AM", module: "Dashboard", description: "Requirement gathering and analysis", by: "System", hours: "1.50h" },
  { start: "10:30:00 AM", end: "02:00:00 PM", module: "Communication", description: "Sending mails and assigning tasks", by: "System", hours: "3.50h" },
];

const TIMESHEET_MANUAL_ROWS = [
  { start: "03:00 PM", end: "06:00 PM", module: "Field Work", description: "House visit with customer for collection", by: "Manual", hours: "3.00h" },
];

const DAILY_ATTENDANCE_ROWS = [
  {
    date: "2026-12-01", clockIn: "09:25", clockOut: "18:00", totalHours: "7.58h", overtime: "-", status: "Half Day Late",
    badges: [
      { text: "Half Day", className: "bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md mr-1" },
      { text: "Late", className: "bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-md" },
    ],
  },
  {
    date: "2026-12-02", clockIn: "09:00", clockOut: "17:20", totalHours: "7.33h", overtime: "-", status: "Half Day Early",
    badges: [
      { text: "Half Day", className: "bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md mr-1" },
      { text: "Early", className: "bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md" },
    ],
  },
  {
    date: "2026-12-03", clockIn: "09:00", clockOut: "10:00", totalHours: "1.00h", overtime: "-", status: "Absent Early",
    badges: [
      { text: "Absent", className: "bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-md mr-1" },
      { text: "Early", className: "bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md" },
    ],
  },
  {
    date: "2026-12-04", clockIn: "09:00", clockOut: "18:00", totalHours: "8.00h", overtime: "-", status: "Present",
    badges: [{ text: "Present", className: "bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold px-2 py-0.5 rounded-md" }],
  },
];

const REGISTRATION_INCENTIVE_ROWS = [
  { client: "Aditi & Rohan", registration: "₹85,000", net: "₹72,034", slab: "3%", incentive: "₹2,161" },
  { client: "Priya & karan", registration: "₹85,000", net: "₹72,034", slab: "3%", incentive: "₹2,161" },
  { client: "Sneha & Arjun", registration: "₹85,000", net: "₹72,034", slab: "3%", incentive: "₹2,161" },
  { client: "Meera & Arjun", registration: "₹85,000", net: "₹72,034", slab: "3%", incentive: "₹2,161" },
];

const MEETINGS_INCENTIVE_ROWS = [
  { item: ">30 meetings", count: "6", rate: "₹70", amount: "₹2,100" },
  { item: ">50 meetings", count: "-", rate: "₹100", amount: "-" },
];

const PERFORMANCE_INCENTIVE_ROWS = [
  { item: "Google Reviews", rule: ">5 - ₹70 each", count: "6", rate: "₹70", amount: "₹420", amountTone: "" },
  { item: "Testimonial videos", rule: ">5 - ₹70 each", count: "6", rate: "₹150", amount: "₹900", amountTone: "" },
  { item: "Wedding photos published", rule: "₹50 per case", count: "4", rate: "₹50", amount: "₹200", amountTone: "" },
  { item: "Negative review", rule: "-₹100 penalty", count: "1", rate: "-₹100", amount: "-₹100", amountTone: "text-[#DC2626]" },
];

/** Label + icon + value pair used in the Expense Details modal's two-column grid. */
function DetailField({ icon: Icon, label, children, full = false }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-1">
        <Icon size={12} />
        {label}
      </p>
      <div className="hrms-sub-title">{children}</div>
    </div>
  );
}

const HRMS_TH = "px-4 py-3";

function HrmsSortHead({ cols, sort, onSort }) {
  return (
    <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-bold">
      {cols.map((c) => (
        <SortableTh
          key={c.key}
          label={c.label}
          sortKey={c.key}
          sort={sort}
          onSort={onSort}
          unsortable={c.unsortable}
          className={c.align === "center" ? `${HRMS_TH} text-center` : HRMS_TH}
        />
      ))}
    </tr>
  );
}

function HourlyWorkTable() {
  const { sorted, sort, toggle } = useTableSort(HOURLY_WORK_ROWS, { defaultKey: "start" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Start Time", key: "start" },
            { label: "End Time", key: "end" },
            { label: "Project/Module", key: "module" },
            { label: "Description", key: "description" },
            { label: "By", key: "by" },
            { label: "Hours", key: "hours" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={`${row.start}-${row.module}`}>
            <td className="px-4 py-3 font-bold">{row.start}</td>
            <td className="px-4 py-3 font-bold">{row.end}</td>
            <td className="px-4 py-3">{row.module}</td>
            <td className="px-4 py-3 text-[#4B5563]">{row.description}</td>
            <td className="px-4 py-3 text-[#6B7280]">{row.by}</td>
            <td className="px-4 py-3 font-bold text-[#7A0A17]">{row.hours}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

function AttendancePanel({ kpis, days, onRegularize }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((card) => (
          <AttendanceStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="hrms-panel-title">Attendance Records</h2>
          <button
            type="button"
            onClick={onRegularize}
            className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs"
          >
            Regularize
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
            alt=""
            className="size-10 rounded-full object-cover border border-black/10"
          />
          <div>
            <h4 className="hrms-panel-title">Ankur Sharma</h4>
            <p className="text-xs text-[#6B7280] font-medium">Relationship Manager</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="flex w-full min-w-[680px] items-start justify-between gap-1">
            {days.map((d, index) => (
              <AttendanceDayCell
                key={index}
                d={d}
                onRegularize={onRegularize}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-black/8 text-xs font-bold flex-wrap">
          <span className="flex items-center gap-1.5 text-[#15803D]">
            <span className="size-4 rounded-full bg-[#DCFCE7] grid place-items-center text-[10px]">✓</span> Present
          </span>
          <span className="flex items-center gap-1.5 text-[#DC2626]">
            <span className="size-4 rounded-full bg-[#FEE2E2] grid place-items-center text-[10px]">✕</span> Absent
          </span>
          <span className="flex items-center gap-1.5 text-[#D97706]">
            <span className="size-4 rounded-full bg-[#FEF3C7] grid place-items-center text-[9px]">½</span> Half Day
          </span>
          <span className="flex items-center gap-1.5 text-[#9333EA]">
            <span className="size-4 rounded-full bg-[#F3E8FF] grid place-items-center text-[9px]">H</span> Holiday
          </span>
          <span className="flex items-center gap-1.5 text-[#475569]">
            <span className="size-4 rounded-full bg-[#475569] text-white grid place-items-center text-[8px]">WO</span> Weekly Off
          </span>
        </div>
      </div>

      <RegularizationPendingTable days={days} onRegularize={onRegularize} />

      <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
        <h3 className="hrms-panel-title mb-4">Attendance Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFF5F5] border border-[#FECACA] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-[#7A0A17] font-bold text-sm">
              <Clock size={16} /> Working Hours
            </div>
            <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
              <li>General Shift: 9:00 AM - 6:00 PM (9 hours)</li>
              <li>Lunch Break: 1:00 PM - 2:00 PM (1 hour)</li>
              <li>Working Days: Monday - Friday</li>
            </ul>
          </div>

          <div className="bg-[#FCF5F6] border border-[#7A0A17]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-[#7A0A17] font-bold text-sm">
              <BadgeCheck size={16} /> Standard Attendance Policy
            </div>
            <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
              <li>Late Arrival Grace: 15 Minutes</li>
              <li>Early Departure Grace: 15 Minutes</li>
              <li>Overtime Rate: ₹150/hr</li>
            </ul>
          </div>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-[#15803D] font-bold text-sm">
              <Calendar size={16} /> Leave Policy
            </div>
            <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
              <li>Casual Leave: 12 days per annum</li>
              <li>Sick Leave: 8 days per annum</li>
              <li>Earned Leave: 18 days per annum</li>
              <li>Minimum 2 days notice for leave applications</li>
            </ul>
          </div>

          <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-[#6D28D9] font-bold text-sm">
              <AlertTriangle size={16} /> Late Arrival Policy
            </div>
            <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
              <li>Min. 80% attendance required per month</li>
              <li>Late arrival after 9:15 AM requires regularization</li>
              <li>3 consecutive absences without intimation may result in show-cause notice</li>
              <li>Proxy attendance is prohibited</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncentivesPanel() {
  return (
          <div className="flex flex-col gap-6">
            {/* Header Statement Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="hrms-panel-title">My Incentive Statement</h2>
              <button
                type="button"
                onClick={() => toast.success("Incentive statement report generated!")}
                className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs self-start"
              >
                + Download statement
              </button>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">1. Registration incentive</p>
                <p className="hrms-metric-value text-[#111827] mt-1">₹67,924</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">5 deals • slab 3-6% • net of GST</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">2. Meetings incentive</p>
                <p className="hrms-metric-value text-[#111827] mt-1">₹2,100</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">42 meetings • ₹50 tier</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">3. Performance bonuses</p>
                <p className="hrms-metric-value text-[#111827] mt-1">₹1,420</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">reviews, videos, photos • net of 1 penalty</p>
              </div>

              <div className="bg-[#FCF5F6] border border-[#7A0A17]/20 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#7A0A17]">Net payable</p>
                <p className="hrms-metric-value text-[#7A0A17] mt-1">₹71,444</p>
                <p className="text-[10px] text-[#7A0A17]/80 mt-1 font-bold">paid with July salary</p>
              </div>
            </div>

            {/* Sections 1–3 in one row — equal height cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              {/* Section 1: Registration Incentive Amount */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col h-full">
                <h3 className="hrms-sub-title mb-3">1. Incentive on registration amount</h3>
                <div className="overflow-x-auto border border-black/8 rounded-xl flex-1">
                  <table className="w-full text-left border-collapse text-xs h-full">
                    <RegistrationIncentiveTable />
                  </table>
                </div>
              </div>

              {/* Section 2: Meetings Incentive */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col h-full">
                <h3 className="hrms-sub-title">2. Meetings incentive (monthly)</h3>
                <p className="hrms-metric-value text-[#111827] mt-1">42 <span className="text-xs text-[#6B7280] font-normal">qualifying meetings</span></p>

                {/* Progress Bar & Note */}
                <div className="mt-3">
                  <div className="h-3 w-full bg-black/8 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7A0A17] w-[80%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[#6B7280] mt-1">
                    <span>30 - ₹50 tier</span>
                    <span>50 - ₹100 tier</span>
                  </div>
                  <div className="bg-[#FFF3E4] border border-[#F59E0B]/30 rounded-xl p-2.5 mt-3 text-xs text-[#B45309] font-bold">
                    8 more meetings unlocks the ₹100 tier - ₹4,200 for the month.
                  </div>
                </div>

                {/* Table */}
                <div className="mt-4 overflow-x-auto border border-black/8 rounded-xl flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <MeetingsIncentiveTable />
                  </table>
                </div>
              </div>

              {/* Section 3: Performance Incentives */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col h-full">
                <h3 className="hrms-sub-title mb-3">3. Additional performance incentives</h3>
                <div className="overflow-x-auto border border-black/8 rounded-xl flex-1">
                  <table className="w-full text-left border-collapse text-xs h-full">
                    <PerformanceIncentiveTable />
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Summary Banner */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold">
              <p className="text-[#6B7280] max-w-2xl">
                Registration slabs are applied to values net of applicable meeting and bonus rewards are flat. All figures are indicative and settle with the July payroll cycle.
              </p>
              <div className="flex items-center gap-4 shrink-0 text-sm">
                <span>Gross incentive: <strong className="text-[#111827]">₹71,444</strong></span>
                <span className="text-[#7A0A17] font-bold">Net payable (post-GST): ₹71,444</span>
              </div>
            </div>
          </div>
  );
}

function AwardsContestPanel({
  searchAward, setSearchAward, setAwardPage,
  awardSort, toggleAwardSort,
  pagedAwards, awardPage, awardPageSize, awardTotalPages, filteredAwards,
  searchContest, setSearchContest, setContestPage,
  contestSort, toggleContestSort,
  pagedContests, contestPage, contestPageSize, contestTotalPages, filteredContests,
}) {
  return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total awards", value: String(INITIAL_AWARDS.length), sub: "On your record" },
                { label: "Active contests", value: String(INITIAL_CONTESTS.filter((c) => c.activeStatus === "Active").length), sub: "Open challenges" },
                { label: "Latest award", value: "Leadership Award", sub: "15 Jan 2026" },
              ].map((card) => (
                <div key={card.label} className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                  <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{card.label}</p>
                  <p className="hrms-metric-value text-[#111827] mt-1.5">{card.value}</p>
                  <p className="text-[12.5px] text-[#6B7280] mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Awards table */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                    <Trophy size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="hrms-panel-title">My awards</h3>
                    <p className="text-[12.5px] text-[#6B7280]">Award type, gifts, certificates and photos</p>
                  </div>
                </div>
                <TabToolbar
                  search={searchAward}
                  onSearchChange={(v) => {
                    setSearchAward(v);
                    setAwardPage(1);
                  }}
                  placeholder="Search awards..."
                />
              </div>

              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <HrmsSortHead
                      sort={awardSort}
                      onSort={toggleAwardSort}
                      cols={[
                        { label: "#", key: "id", unsortable: true },
                        { label: "Award Type", key: "awardType" },
                        { label: "Award Date", key: "awardDate" },
                        { label: "Gift", key: "gift" },
                        { label: "Certificate", key: "certificateLabel", unsortable: true },
                        { label: "Photo", key: "photoLabel", unsortable: true },
                        { label: "Description", key: "description" },
                      ]}
                    />
                  </thead>
                  <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
                    {pagedAwards.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                          No awards found.
                        </td>
                      </tr>
                    ) : (
                      pagedAwards.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                          <td className="px-4 py-3 font-bold text-[#6B7280]">
                            {(awardPage - 1) * awardPageSize + idx + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Trophy size={12} className="text-[#7A0A17] shrink-0" />
                              {row.awardType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.awardDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{row.gift}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <a
                              href={row.certificateUrl}
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info(`Opening certificate: ${row.certificateLabel}`);
                              }}
                              className="inline-flex items-center gap-1 text-[#7A0A17] hover:underline font-semibold"
                            >
                              <ExternalLink size={12} />
                              {row.certificateLabel}
                            </a>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <a
                              href={row.photoUrl}
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info(`Opening photo: ${row.photoLabel}`);
                              }}
                              className="inline-flex items-center gap-1 text-[#7A0A17] hover:underline font-semibold"
                            >
                              <ExternalLink size={12} />
                              {row.photoLabel}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-[#6B7280] font-medium min-w-[220px] max-w-[320px]">
                            {row.description}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={awardPage}
                totalPages={awardTotalPages}
                totalItems={filteredAwards.length}
                pageSize={awardPageSize}
                itemLabel="awards"
                onChange={setAwardPage}
              />
            </div>

            {/* Contests / Challenges table */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                    <Target size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="hrms-panel-title">My contests</h3>
                    <p className="text-[12.5px] text-[#6B7280]">Challenge details, XP, difficulty and status</p>
                  </div>
                </div>
                <TabToolbar
                  search={searchContest}
                  onSearchChange={(v) => {
                    setSearchContest(v);
                    setContestPage(1);
                  }}
                  placeholder="Search contests..."
                />
              </div>

              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <HrmsSortHead
                      sort={contestSort}
                      onSort={toggleContestSort}
                      cols={[
                        { label: "#", key: "id", unsortable: true, align: "center" },
                        { label: "Challenge Name", key: "challengeName" },
                        { label: "Type & Reward", key: "typeReward" },
                        { label: "XP", key: "earnedXp", align: "center" },
                        { label: "Project", key: "project" },
                        { label: "Criteria", key: "criteria" },
                        { label: "Difficulty", key: "difficulty", align: "center" },
                        { label: "Challenge Status", key: "challengeStatus", align: "center" },
                        { label: "Status", key: "activeStatus", align: "center" },
                        { label: "Members", key: "members", unsortable: true, align: "center" },
                        { label: "Description", key: "description", unsortable: true, align: "center" },
                      ]}
                    />
                  </thead>
                  <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
                    {pagedContests.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                          No contests found.
                        </td>
                      </tr>
                    ) : (
                      pagedContests.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                          <td className="px-3 py-3 font-bold text-[#6B7280] text-center align-middle">
                            {(contestPage - 1) * contestPageSize + idx + 1}
                          </td>
                          <td className="px-3 py-3 align-middle">
                            <p className="font-bold text-[#111827] whitespace-nowrap">{row.challengeName}</p>
                            <p className="text-[11px] font-medium text-[#9CA3AF] mt-0.5 whitespace-nowrap">{row.period}</p>
                          </td>
                          <td className="px-3 py-3 text-[#374151] align-middle whitespace-nowrap">{row.typeReward}</td>
                          <td className="px-3 py-3 text-center align-middle whitespace-nowrap">{row.earnedXp}</td>
                          <td className="px-3 py-3 align-middle whitespace-nowrap">{row.project}</td>
                          <td className="px-3 py-3 align-middle whitespace-nowrap">{row.criteria}</td>
                          <td className="px-3 py-3 text-center align-middle">
                            <span
                              className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                row.difficulty === "Easy"
                                  ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                                  : row.difficulty === "Medium"
                                    ? "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                                    : "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20"
                              }`}
                            >
                              {row.difficulty}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle">
                            <span
                              className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                row.challengeStatus === "In Progress"
                                  ? "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                                  : row.challengeStatus === "Completed"
                                    ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                                    : "bg-[#F3F4F6] text-[#4B5563] border-black/10"
                              }`}
                            >
                              {row.challengeStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle">
                            <span
                              className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                row.activeStatus === "Active"
                                  ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                                  : "bg-[#F3F4F6] text-[#4B5563] border-black/10"
                              }`}
                            >
                              {row.activeStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle">
                            <MembersHoverView members={row.members} />
                          </td>
                          <td className="px-3 py-3 text-center align-middle">
                            <DescriptionHoverView description={row.description} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={contestPage}
                totalPages={contestTotalPages}
                totalItems={filteredContests.length}
                pageSize={contestPageSize}
                itemLabel="contests"
                onChange={setContestPage}
              />
            </div>
          </div>
  );
}

function AttendanceStatCard({ title, value, sub, icon: Icon, bg, fg }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl px-3.5 py-3 flex items-center gap-3 min-w-0">
      <span
        className="size-10 rounded-[10px] grid place-items-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon size={18} style={{ color: fg }} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#111] leading-tight truncate">{title}</p>
        <p className="hrms-metric-value text-[#111] leading-tight mt-0.5">{value}</p>
        {sub && (
          <p className="text-[12px] font-semibold text-[#6B7280] mt-0.5 leading-tight">{sub}</p>
        )}
      </div>
    </div>
  );
}

function RegularizationPendingTable({ days, onRegularize }) {
  const rows = (days || [])
    .filter((d) => d.status !== "WO" && d.status !== "H" && d.timesheet.totalMin < NINE_HOURS_MIN)
    .map((d) => {
      const deduction = getDeduction(d.timesheet.totalMin, d.status);
      return {
        key: d.dateShort,
        date: d.dateShort,
        day: d.week,
        hours: formatHoursMinutes(d.timesheet.totalMin),
        shortBy: formatHoursMinutes(deduction.minutes),
        calc: `${deduction.billedHours.toFixed(2)} x ${DEDUCTION_RATE_PER_HOUR}`,
        deduction: deduction.amount.toFixed(2),
        amount: deduction.amount,
      };
    });
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
      <h3 className="hrms-sub-title mb-4">
        Days Pending for Regularization (Less than 9 Working Hours)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-black/8 bg-[#F9FAFB]">
              {["Sr. No.", "Date", "Day", "Actual Working Hours", "Short by", "Calculation", "Deduction (₹)", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-[#9CA3AF] font-medium">
                  No days pending regularization this month.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.key} className="border-b border-black/6">
                <td className="px-4 py-3 text-[13px] font-semibold text-[#111827]">{i + 1}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#111827]">{row.date}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-[#4B5563]">{row.day}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#111827]">{row.hours}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#E8395B]">{row.shortBy}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-[#4B5563]">{row.calc}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#111827]">{row.deduction}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={onRegularize}
                    className="h-8 px-3 rounded-lg text-[12px] font-bold border border-[#7A0A17] text-[#7A0A17] bg-white hover:bg-[#FCF5F6] transition-colors"
                  >
                    Regularize
                  </button>
                </td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr>
                <td colSpan={6} />
                <td className="px-4 py-3.5 text-[13px] font-bold text-[#111827] whitespace-nowrap">Total Deduction</td>
                <td className="px-4 py-3.5 text-[15px] font-bold text-[#7A0A17] whitespace-nowrap">
                  {formatRupees(total)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimesheetManualTable() {
  const { sorted, sort, toggle } = useTableSort(TIMESHEET_MANUAL_ROWS, { defaultKey: "start" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Start Time", key: "start" },
            { label: "End Time", key: "end" },
            { label: "Project/Module", key: "module" },
            { label: "Description", key: "description" },
            { label: "By", key: "by" },
            { label: "Hours", key: "hours" },
            { label: "Actions", key: "actions", unsortable: true },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={`${row.start}-${row.module}`}>
            <td className="px-4 py-3 font-bold">{row.start}</td>
            <td className="px-4 py-3 font-bold">{row.end}</td>
            <td className="px-4 py-3">{row.module}</td>
            <td className="px-4 py-3 text-[#4B5563]">{row.description}</td>
            <td className="px-4 py-3 text-[#6B7280]">{row.by}</td>
            <td className="px-4 py-3 font-bold text-[#7A0A17]">{row.hours}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button type="button" className="text-[#16A34A] hover:opacity-80"><CheckCircle2 size={16} /></button>
                <button type="button" className="text-[#DC2626] hover:opacity-80"><X size={16} /></button>
                <button type="button" className="text-[#2563EB] hover:opacity-80"><Edit size={15} /></button>
                <button type="button" className="text-[#DC2626] hover:opacity-80"><Trash2 size={15} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

function DailyAttendanceTable() {
  const { sorted, sort, toggle } = useTableSort(DAILY_ATTENDANCE_ROWS, { defaultKey: "date" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Date", key: "date" },
            { label: "Clock In", key: "clockIn" },
            { label: "Clock Out", key: "clockOut" },
            { label: "Total Hours", key: "totalHours" },
            { label: "Overtime", key: "overtime" },
            { label: "Status", key: "status" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.date}>
            <td className="px-4 py-3">{row.date}</td>
            <td className="px-4 py-3 text-[#16A34A]">{row.clockIn}</td>
            <td className="px-4 py-3 text-[#DC2626]">{row.clockOut}</td>
            <td className="px-4 py-3 font-bold">{row.totalHours}</td>
            <td className="px-4 py-3 text-[#9CA3AF]">{row.overtime}</td>
            <td className="px-4 py-3">
              {row.badges.map((b) => (
                <span key={b.text} className={b.className}>{b.text}</span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

function RegistrationIncentiveTable() {
  const { sorted, sort, toggle } = useTableSort(REGISTRATION_INCENTIVE_ROWS, { defaultKey: "client" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Client", key: "client" },
            { label: "Incentive", key: "incentive" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.client}>
            <td className="px-4 py-2.5 font-bold">{row.client}</td>
            <td className="px-4 py-2.5 font-bold">{row.incentive}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-bold">
          <td className="px-4 py-3">Subtotal</td>
          <td className="px-4 py-3 text-[#7A0A17]">₹67,924</td>
        </tr>
      </tbody>
    </>
  );
}

function MeetingsIncentiveTable() {
  const { sorted, sort, toggle } = useTableSort(MEETINGS_INCENTIVE_ROWS, { defaultKey: "item" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Item", key: "item" },
            { label: "Amount", key: "amount" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.item}>
            <td className="px-4 py-2.5 font-bold">{row.item}</td>
            <td className={`px-4 py-2.5 ${row.amount === "-" ? "text-[#9CA3AF]" : "font-bold"}`}>{row.amount}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-bold">
          <td className="px-4 py-3">Subtotal</td>
          <td className="px-4 py-3 text-[#7A0A17]">₹2,100</td>
        </tr>
      </tbody>
    </>
  );
}

function PerformanceIncentiveTable() {
  const { sorted, sort, toggle } = useTableSort(PERFORMANCE_INCENTIVE_ROWS, { defaultKey: "item" });
  return (
    <>
      <thead>
        <HrmsSortHead
          sort={sort}
          onSort={toggle}
          cols={[
            { label: "Item", key: "item" },
            { label: "Amount", key: "amount" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.item}>
            <td className="px-4 py-2.5 font-bold">{row.item}</td>
            <td className={`px-4 py-2.5 font-bold ${row.amountTone}`}>{row.amount}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-bold">
          <td className="px-4 py-3">Subtotal</td>
          <td className="px-4 py-3 text-[#7A0A17]">₹1,420</td>
        </tr>
      </tbody>
    </>
  );
}

function SalaryPayslipPanel({ period = "December 2026" }) {
  return (
    <div className="flex flex-col gap-6">
            {/* Header Payroll Selector Bar */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                  <Receipt size={16} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="hrms-sub-title">Ankur Sharma</h3>
                  <p className="text-xs text-[#6B7280] font-medium">{period}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select className="appearance-none bg-white border border-black/12 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-[#374151] cursor-pointer outline-none">
                    <option>{period} Payroll</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Downloading Payslip PDF...")}
                  className="size-9 rounded-xl bg-white border border-black/12 hover:bg-[#FAFAFB] text-[#4B5563] grid place-items-center shadow-2xs"
                  title="Download Payslip"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Top 3 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#6B7280]">Basic Salary</p>
                  <p className="hrms-metric-value text-[#111827] mt-1">₹75,000.00</p>
                </div>
                <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17] text-[16px] font-bold">
                  ₹
                </span>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#6B7280]">Gross Pay</p>
                  <p className="hrms-metric-value text-[#111827] mt-1">₹91,295.65</p>
                </div>
                <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                  <TrendingUp size={16} strokeWidth={2} />
                </span>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#6B7280]">Net Salary</p>
                  <p className="hrms-metric-value text-[#111827] mt-1">₹74,033.15</p>
                </div>
                <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17] text-[16px] font-bold">
                  ₹
                </span>
              </div>
            </div>

            {/* Attendance Summary Bar */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-[#111827] mb-3 uppercase tracking-wider">Attendance Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#111827]">23</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Working Days</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#16A34A]">15</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Full Present</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#D97706]">6.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Half Days</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#9333EA]">0</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Holidays</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#3B82F6]">0.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Paid Leave</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#6B7280]">0.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Unpaid Leave</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#DC2626]">2</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Absent</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="hrms-stat-sm text-[#111827]">4.0h</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Overtime</p>
                </div>
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-bold mt-3">
                Present Days: Full Present + Holidays + Paid Leave + (Half Days × 0.5) = 18.00 | LOP Days: 5.00 | Unpaid Leave: 0.00 days
              </p>
            </div>

            {/* Earnings & Deductions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Earnings */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#16A34A] font-bold text-sm">
                  <TrendingUp size={16} /> Earnings
                </div>
                <div className="divide-y divide-black/6 text-xs font-semibold">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Basic Salary</span>
                    <span className="font-bold text-[#16A34A]">₹75,000.00</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Transport Allowance</span>
                    <span className="font-bold text-[#16A34A]">₹2,000.00</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">House Rent Allowance (HRA)</span>
                    <span className="font-bold text-[#16A34A]">₹30,000.00</span>
                  </div>
                  <div className="py-3 flex justify-between text-sm font-bold border-t-2 border-black/10">
                    <span className="text-[#111827]">Total Earnings</span>
                    <span className="text-[#16A34A]">₹107,000.00</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#DC2626] font-bold text-sm">
                  <AlertTriangle size={16} /> Component Deductions
                </div>
                <div className="divide-y divide-black/6 text-xs font-semibold">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Income Tax (TDS)</span>
                    <span className="font-bold text-[#DC2626]">₹7,500.00</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Professional Tax</span>
                    <span className="font-bold text-[#DC2626]">₹200.00</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Provident Fund (PF)</span>
                    <span className="font-bold text-[#DC2626]">₹9,000.00</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#374151]">Employee State Insurance (ESI)</span>
                    <span className="font-bold text-[#DC2626]">₹562.50</span>
                  </div>
                  <div className="py-3 flex justify-between text-sm font-bold border-t-2 border-black/10">
                    <span className="text-[#111827]">Total Deductions</span>
                    <span className="text-[#DC2626]">₹17,262.50</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Calculation Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="hrms-panel-title mb-3">Final Calculation</h4>
              
              <div className="bg-[#FFF5F5] border border-[#7A0A17]/15 rounded-xl p-3.5 text-[11px] text-[#7A0A17] font-semibold space-y-1 mb-4">
                <p><strong>Gross Pay Formula:</strong> Total Earnings (Basic Salary + Component Earnings) - LOP Deduction - Unpaid Leave Deduction + Overtime Earnings</p>
                <p><strong>Net Salary Formula:</strong> Gross Pay - Total Component Deductions</p>
                <p><strong>LOP Deduction Formula:</strong> (Basic Salary / Total Working Days) × LOP Days</p>
              </div>

              <div className="divide-y divide-black/6 text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Basic Salary</span>
                  <span>₹75,000.00</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Component Earnings</span>
                  <span className="text-[#16A34A]">+ ₹32,000.00</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-[#111827]">
                  <span>Total Earnings</span>
                  <span>₹107,000.00</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">LOP Deduction (5.00 days × ₹3,260.87/day)</span>
                  <span className="text-[#DC2626]">- ₹16,304.35</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Unpaid Leave Deduction (0.00 days)</span>
                  <span className="text-[#DC2626]">- ₹0.00</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Overtime Amount</span>
                  <span className="text-[#16A34A]">+ ₹600.00</span>
                </div>
                <div className="py-3 flex justify-between text-sm font-bold">
                  <span>Gross Pay</span>
                  <span className="text-[#111827]">₹91,295.65</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Component Deductions (Tax, PF etc.)</span>
                  <span className="text-[#DC2626]">- ₹17,262.50</span>
                </div>
                <div className="py-3 flex justify-between text-base font-bold bg-[#FCF5F6] p-3 rounded-xl border border-[#7A0A17]/20 text-[#7A0A17]">
                  <span>Net Salary (Take Home)</span>
                  <span>₹74,033.15</span>
                </div>
              </div>
            </div>

            {/* Daily Attendance Records */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="hrms-panel-title mb-3">Daily Attendance Records</h4>
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <DailyAttendanceTable />
                </table>
              </div>
            </div>
          </div>
  );
}

function GoalsReviewsPanel({
  searchGoal,
  onSearchChange,
  goalSort,
  onSort,
  pagedGoals,
  goalPage,
  goalPageSize,
  goalTotalPages,
  totalItems,
  onPageChange,
  expandedRemarks,
  onToggleRemark,
  onGoalAction,
  embedded = false,
}) {
  return (
    <div className={`flex flex-col min-w-0 ${embedded ? "" : "gap-6"}`}>
      <TabToolbar search={searchGoal} onSearchChange={onSearchChange} />

      <div className={embedded ? "min-w-0 mt-4" : "min-w-0 bg-white border border-black/10 rounded-2xl p-5 shadow-sm"}>
        <div className="overflow-x-auto min-w-0 border border-black/8 rounded-xl">
          <table className="w-full min-w-[960px] text-left border-collapse text-xs">
            <thead>
              <HrmsSortHead
                sort={goalSort}
                onSort={onSort}
                cols={[
                  { label: "#", key: "id", unsortable: true },
                  { label: "Title", key: "title" },
                  { label: "Employee", key: "employee" },
                  { label: "Goal Type", key: "goalType" },
                  { label: "Start Date", key: "startDate" },
                  { label: "End Date", key: "endDate" },
                  { label: "Progress", key: "progress" },
                  { label: "Status", key: "status" },
                  { label: "Actions", key: "actions", unsortable: true },
                ]}
              />
            </thead>
            <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
              {pagedGoals.map((g, idx) => {
                const isExpanded = expandedRemarks[g.id];
                return (
                  <tr key={g.id} className="hover:bg-[#FAFAFB] transition-colors align-top">
                    <td className="px-4 py-3 font-bold text-[#6B7280]">{(goalPage - 1) * goalPageSize + idx + 1}</td>
                    <td className="px-4 py-3 font-bold">{g.title}</td>
                    <td className="px-4 py-3">{g.employee}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{g.goalType}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{g.startDate}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{g.endDate}</td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-[#EDEEF1] overflow-hidden shrink-0">
                          <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${g.progress}%` }} />
                        </div>
                        <span className="font-bold text-[#111827] shrink-0">{g.progress}%</span>
                      </div>
                      <p className={`text-[11px] text-[#374151] mt-1.5 ${isExpanded ? "" : "line-clamp-1"}`}>
                        <span className="text-[#DC2626] font-bold">Remarks: </span>
                        {g.remarks}
                      </p>
                      <button
                        type="button"
                        onClick={() => onToggleRemark(g.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7A0A17] mt-0.5"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                        <ChevronDown size={11} className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20 whitespace-nowrap">
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onGoalAction("view", g)}
                          className="size-7 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] grid place-items-center"
                          title="View"
                          aria-label={`View ${g.title}`}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onGoalAction("edit", g)}
                          className="size-7 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] grid place-items-center"
                          title="Edit"
                          aria-label={`Edit ${g.title}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onGoalAction("review", g)}
                          className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center transition-colors"
                          title="Conduct review"
                          aria-label={`Conduct review for ${g.title}`}
                        >
                          <img src={conductReviewIcon} alt="" className="size-3.5 object-contain" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onGoalAction("delete", g)}
                          className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center"
                          title="Delete"
                          aria-label={`Delete ${g.title}`}
                        >
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

        {!embedded && (
          <div className="mt-4">
            <Pagination
              page={goalPage}
              totalPages={goalTotalPages}
              totalItems={totalItems}
              pageSize={goalPageSize}
              itemLabel="employee goals"
              onChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingsPanel({
  search,
  onSearchChange,
  sort,
  onSort,
  rows,
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onAction,
  embedded = false,
}) {
  return (
    <div className={`flex flex-col min-w-0 ${embedded ? "" : "gap-6"}`}>
      <TabToolbar search={search} onSearchChange={onSearchChange} />

      <div className={embedded ? "min-w-0 mt-4" : "min-w-0 bg-white border border-black/10 rounded-2xl p-5 shadow-sm"}>
        <div className="overflow-x-auto min-w-0 border border-black/8 rounded-xl">
          <table className="w-full min-w-[860px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-bold">
                <SortableTh label="#" sortKey="id" unsortable className={HRMS_TH} />
                <SortableTh label="Program" sortKey="program" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Date & Time" sortKey="dateTime" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Location" sortKey="location" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Status" sortKey="status" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Score" sortKey="score" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Attendance" sortKey="attendance" sort={sort} onSort={onSort} className={HRMS_TH} />
                <SortableTh label="Actions" sortKey="actions" unsortable className={HRMS_TH} />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
              {rows.map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#FAFAFB] transition-colors align-top">
                  <td className="px-4 py-3 font-bold text-[#6B7280]">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{t.program}</p>
                    <p className="text-[#9CA3AF] font-medium">{t.track}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{t.dateTime}</td>
                  <td className="px-4 py-3">
                    <p>{t.location}</p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 ${
                        t.locationType === "Virtual"
                          ? "bg-[#EEF0FE] text-[#6366F1] border-[#6366F1]/20"
                          : "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                      }`}
                    >
                      {t.locationType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        t.status === "Completed"
                          ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                          : "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === "Completed" ? (
                      <>
                        <p className="font-bold">{t.score.toFixed(1)}%</p>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                            t.result === "Passed" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
                          }`}
                        >
                          {t.result}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{t.attendance || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAction("view", t)}
                        className="size-7 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] grid place-items-center"
                        title="View"
                        aria-label={`View ${t.program}`}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("edit", t)}
                        className="size-7 rounded-lg bg-[#E8F2FE] hover:bg-[#DBEAFE] text-[#2563EB] grid place-items-center"
                        title="Edit"
                        aria-label={`Edit ${t.program}`}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", t)}
                        className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center"
                        title="Delete"
                        aria-label={`Delete ${t.program}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!embedded && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel="training sessions"
              onChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AssetsPanel({
  search,
  onSearchChange,
  sort,
  onSort,
  rows,
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  embedded = false,
}) {
  return (
    <div className={`flex flex-col min-w-0 ${embedded ? "" : "gap-6"}`}>
      <TabToolbar search={search} onSearchChange={onSearchChange} />

      <div className={embedded ? "min-w-0 mt-4" : "min-w-0 bg-white border border-black/10 rounded-2xl p-5 shadow-sm"}>
        <div className="overflow-x-auto min-w-0 border border-black/8 rounded-xl">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <HrmsSortHead
                sort={sort}
                onSort={onSort}
                cols={[
                  { label: "#", key: "id", unsortable: true },
                  { label: "Name", key: "name" },
                  { label: "Asset Code", key: "code" },
                  { label: "Status", key: "status" },
                  { label: "Assigned Date", key: "assignedDate" },
                  { label: "Return Date", key: "returnDate" },
                  { label: "Actions", key: "actions", unsortable: true },
                ]}
              />
            </thead>
            <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
              {rows.map((a, idx) => (
                <tr key={a.id} className="hover:bg-[#FAFAFB] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#6B7280]">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{a.name}</p>
                    <p className="text-[#9CA3AF] font-medium">{a.category}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    <p className="font-bold text-[#111827]">{a.code}</p>
                    <p>{a.subCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        a.status === "Available"
                          ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                          : "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{a.assignedDate}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{a.returnDate || "-"}</td>
                  <td className="px-4 py-3">
                    {a.status === "Available" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toast.info(`Reassigning ${a.name}`)}
                          className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center"
                          aria-label="Reassign"
                        >
                          <img src={yellowLoopIcon} alt="" className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(`${a.name} marked as returned`)}
                          className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center"
                          aria-label="Mark returned"
                        >
                          <img src={redBackIcon} alt="" className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!embedded && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel="assets"
              onChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const SUMMARY_EMPLOYEE = {
  name: USER.name,
  id: "MML-E-1001",
  email: USER.email,
  branch: "South Extension",
  department: "Sales",
  designation: USER.role,
};

const SUMMARY_SECTION_IDS = new Set(["warnings-complaints", "target-achievement"]);

export default function HrmsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [activeTab, setActiveTab] = useState(() => {
    const section = window.location.hash.replace("#", "");
    if (SUMMARY_SECTION_IDS.has(section)) return "Summary";
    return HRMS_TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "Summary";
  });

  useEffect(() => {
    const section = location.hash.replace("#", "");
    if (!SUMMARY_SECTION_IDS.has(section)) return;
    setActiveTab("Summary");
    const timer = window.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.search]);

  const attendanceDays = useMemo(
    () => getAttendanceDays(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );
  const attendancePresent = attendanceDays.reduce((sum, d) => {
    if (d.status === "P") return sum + 1;
    if (d.status === "1/2") return sum + 0.5;
    return sum;
  }, 0);
  const attendanceKpis = useMemo(() => {
    const totalDays = attendanceDays.length;
    const presentDays = attendanceDays.filter((d) => d.status === "P").length;
    const lateDays = attendanceDays.filter((d) => d.status === "P" && d.timesheet.login === "09:15 AM").length;
    const leaveDays = attendanceDays.filter((d) => d.status === "X").length;
    const halfDays = attendanceDays.filter((d) => d.status === "1/2").length;
    const grand = Number.isInteger(attendancePresent) ? String(attendancePresent) : attendancePresent.toFixed(1);
    return [
      {
        title: "Total Present Days",
        value: `${presentDays} Days`,
        sub: `Out of ${totalDays} Days`,
        icon: CalendarCheck,
        bg: "#E9F6EC",
        fg: "#288270",
      },
      {
        title: "Late Days",
        value: `${lateDays} Days`,
        sub: "Total late arrivals",
        icon: Clock,
        bg: "#FFF3E4",
        fg: "#F59E0B",
      },
      {
        title: "Total Leaves",
        value: `${leaveDays} Days`,
        sub: "Absent days this month",
        icon: CalendarPlus,
        bg: "#FDECEE",
        fg: "#E8395B",
      },
      {
        title: "Half Days",
        value: `${halfDays} Days`,
        sub: "Total half days",
        icon: Coffee,
        bg: "#E8F2FE",
        fg: "#3B82F6",
      },
      {
        title: "Grand Total",
        value: `${grand}/${totalDays}`,
        sub: "Present days this month",
        icon: BarChart3,
        bg: "#EEF0FE",
        fg: "#6366F1",
      },
    ];
  }, [attendanceDays, attendancePresent]);

  // Expenses & Leaves State
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [timesheetModal, setTimesheetModal] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(
    () => searchParams.get("open") === "achievement"
  );
  const [incentivesModalOpen, setIncentivesModalOpen] = useState(false);
  const [awardsModalOpen, setAwardsModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(
    () => searchParams.get("open") === "warnings"
  );
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [trainingsModalOpen, setTrainingsModalOpen] = useState(false);
  const [assetsModalOpen, setAssetsModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [salarySlip, setSalarySlip] = useState(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [applyLeaveFormOpen, setApplyLeaveFormOpen] = useState(false);
  const [shiftChangeFormOpen, setShiftChangeFormOpen] = useState(false);
  const [shiftChangeRequests, setShiftChangeRequests] = useState(INITIAL_SHIFT_CHANGE_REQUESTS);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [addManualRowOpen, setAddManualRowOpen] = useState(false);

  const deepLinkOpenedAt = useRef(0);
  const deepLink = searchParams.get("open");
  if ((deepLink === "achievement" || deepLink === "warnings") && deepLinkOpenedAt.current === 0) {
    deepLinkOpenedAt.current = Date.now();
  }

  const closeDeepLinkModal = (key, setOpen) => {
    if (Date.now() - deepLinkOpenedAt.current < 400) return;
    setOpen(false);
    setSearchParams((prev) => {
      if (prev.get("open") !== key) return prev;
      const next = new URLSearchParams(prev);
      next.delete("open");
      return next;
    }, { replace: true });
  };

  const closeAchievementModal = () => closeDeepLinkModal("achievement", setAchievementModalOpen);
  const closeWarningsModal = () => closeDeepLinkModal("warnings", setWarningModalOpen);

  useEffect(() => {
    const open = searchParams.get("open");
    if (open !== "achievement" && open !== "warnings") return;
    setActiveTab("Summary");
    deepLinkOpenedAt.current = Date.now();
    if (open === "achievement") setAchievementModalOpen(true);
    if (open === "warnings") setWarningModalOpen(true);
  }, [searchParams]);

  // Trainings / Goals & Reviews / Asset tab state
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [trainingModal, setTrainingModal] = useState(null); // { mode: 'view'|'edit'|'delete', item }
  const [goalModal, setGoalModal] = useState(null); // { mode: 'view'|'edit'|'review'|'delete', item }
  const [searchTraining, setSearchTraining] = useState("");
  const [trainingPage, setTrainingPage] = useState(1);
  const [searchGoal, setSearchGoal] = useState("");
  const [goalPage, setGoalPage] = useState(1);
  const [expandedRemarks, setExpandedRemarks] = useState({});
  const [searchAsset, setSearchAsset] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [searchAward, setSearchAward] = useState("");
  const [awardPage, setAwardPage] = useState(1);
  const [searchContest, setSearchContest] = useState("");
  const [contestPage, setContestPage] = useState(1);

  // Form Fields
  const [issueText, setIssueText] = useState("");
  const [newShift, setNewShift] = useState("Morning Shift (8:00 AM - 5:00 PM)");
  const [expenseForm, setExpenseForm] = useState({
    employee: "",
    purpose: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    expectedOutcomes: "",
    advanceAmount: "",
  });
  const [expenseDocument, setExpenseDocument] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ type: "Casual Leave", startDate: "", endDate: "", comment: "" });

  // Handle Submissions
  const handleReportIssue = (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    toast.success("Issue reported successfully. HR team will review shortly.");
    setIssueText("");
    setReportModalOpen(false);
  };

  const handleChangeShift = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      from: "General (9:00 AM - 6:00 PM)",
      to: newShift.replace(" Shift", ""),
      effective: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      status: "Pending",
    };
    setShiftChangeRequests([newRequest, ...shiftChangeRequests]);
    toast.success(`Shift change request submitted for ${newShift}`);
    setShiftChangeFormOpen(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.employee || !expenseForm.purpose || !expenseForm.destination || !expenseForm.startDate || !expenseForm.endDate) return;
    const newEntry = {
      id: Date.now(),
      employee: expenseForm.employee,
      purpose: expenseForm.purpose,
      destination: expenseForm.destination,
      startDate: expenseForm.startDate,
      endDate: expenseForm.endDate,
      status: "Pending",
      advanceAmount: expenseForm.advanceAmount ? Number(expenseForm.advanceAmount).toFixed(2) : "0.00",
      advanceStatus: "Active",
      totalExpenses: "-",
      documentName: expenseDocument?.name || null,
      description: expenseForm.description,
      expectedOutcomes: expenseForm.expectedOutcomes,
    };
    setExpenses([newEntry, ...expenses]);
    toast.success("Expense added successfully!");
    setExpenseForm({
      employee: "", purpose: "", destination: "", startDate: "", endDate: "",
      description: "", expectedOutcomes: "", advanceAmount: "",
    });
    setExpenseDocument(null);
    setAddExpenseOpen(false);
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    const selected = LEAVE_BALANCE_TYPES.find((lt) => lt.type === leaveForm.type);
    if (!selected || selected.available <= 0) {
      toast.error(`No ${leaveForm.type} balance remaining. You cannot apply for this category.`);
      return;
    }
    if (!leaveForm.startDate) return;
    const dateStr = leaveForm.endDate && leaveForm.endDate !== leaveForm.startDate
      ? `${leaveForm.startDate} - ${leaveForm.endDate}`
      : leaveForm.startDate;
    const newLeave = {
      id: Date.now(),
      type: leaveForm.type,
      date: dateStr,
      status: "Pending",
      comment: leaveForm.comment || "Requested leave.",
    };
    setLeaves([newLeave, ...leaves]);
    toast.success("Leave application submitted successfully!");
    setLeaveForm({ type: "Casual Leave", startDate: "", endDate: "", comment: "" });
    setApplyLeaveFormOpen(false);
    return true;
  };

  const filteredTrainings = trainings.filter((t) =>
    t.program.toLowerCase().includes(searchTraining.toLowerCase())
  );
  const { sorted: sortedTrainings, sort: trainingSort, toggle: toggleTrainingSort } = useTableSort(filteredTrainings, {
    defaultKey: "program",
  });
  const trainingPageSize = 4;
  const trainingTotalPages = Math.max(1, Math.ceil(filteredTrainings.length / trainingPageSize));
  const pagedTrainings = sortedTrainings.slice(
    (trainingPage - 1) * trainingPageSize,
    trainingPage * trainingPageSize
  );

  const filteredGoals = goals.filter((g) => g.title.toLowerCase().includes(searchGoal.toLowerCase()));
  const { sorted: sortedGoals, sort: goalSort, toggle: toggleGoalSort } = useTableSort(filteredGoals, { defaultKey: "title" });
  const goalPageSize = 20;
  const goalTotalPages = Math.max(1, Math.ceil(filteredGoals.length / goalPageSize));
  const pagedGoals = sortedGoals.slice((goalPage - 1) * goalPageSize, goalPage * goalPageSize);

  const handleSaveTraining = (updated) => {
    setTrainings((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setTrainingModal(null);
    toast.success("Training updated successfully.");
  };

  const handleDeleteTraining = () => {
    const item = trainingModal?.item;
    if (!item) return;
    setTrainings((prev) => prev.filter((t) => t.id !== item.id));
    setTrainingModal(null);
    toast.success(`“${item.program}” deleted.`);
  };

  const handleSaveGoal = (updated) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setGoalModal(null);
    toast.success("Goal updated successfully.");
  };

  const handleSaveGoalReview = (updated) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
    setGoalModal(null);
    toast.success("Goal review saved successfully.");
  };

  const handleDeleteGoal = () => {
    const item = goalModal?.item;
    if (!item) return;
    setGoals((prev) => prev.filter((g) => g.id !== item.id));
    setGoalModal(null);
    toast.success(`“${item.title}” deleted.`);
  };

  const filteredAssets = INITIAL_ASSETS.filter((a) =>
    a.name.toLowerCase().includes(searchAsset.toLowerCase())
  );
  const { sorted: sortedAssets, sort: assetSort, toggle: toggleAssetSort } = useTableSort(filteredAssets, {
    defaultKey: "name",
  });
  const assetPageSize = 10;
  const assetTotalPages = Math.max(1, Math.ceil(filteredAssets.length / assetPageSize));
  const pagedAssets = sortedAssets.slice((assetPage - 1) * assetPageSize, assetPage * assetPageSize);

  const filteredAwards = INITIAL_AWARDS.filter((a) => {
    const q = searchAward.toLowerCase();
    return (
      a.awardType.toLowerCase().includes(q) ||
      a.gift.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });
  const { sorted: sortedAwards, sort: awardSort, toggle: toggleAwardSort } = useTableSort(filteredAwards, {
    defaultKey: "awardDate",
  });
  const awardPageSize = 10;
  const awardTotalPages = Math.max(1, Math.ceil(filteredAwards.length / awardPageSize));
  const pagedAwards = sortedAwards.slice((awardPage - 1) * awardPageSize, awardPage * awardPageSize);

  const filteredContests = INITIAL_CONTESTS.filter((c) => {
    const q = searchContest.toLowerCase();
    return (
      c.challengeName.toLowerCase().includes(q) ||
      c.project.toLowerCase().includes(q) ||
      c.criteria.toLowerCase().includes(q) ||
      c.challengeStatus.toLowerCase().includes(q)
    );
  });
  const { sorted: sortedContests, sort: contestSort, toggle: toggleContestSort } = useTableSort(filteredContests, {
    defaultKey: "challengeName",
  });
  const contestPageSize = 10;
  const contestTotalPages = Math.max(1, Math.ceil(filteredContests.length / contestPageSize));
  const pagedContests = sortedContests.slice((contestPage - 1) * contestPageSize, contestPage * contestPageSize);
  const awardsPanelProps = {
    searchAward,
    setSearchAward,
    setAwardPage,
    awardSort,
    toggleAwardSort,
    pagedAwards,
    awardPage,
    awardPageSize,
    awardTotalPages,
    filteredAwards,
    searchContest,
    setSearchContest,
    setContestPage,
    contestSort,
    toggleContestSort,
    pagedContests,
    contestPage,
    contestPageSize,
    contestTotalPages,
    filteredContests,
  };

  const { sorted: sortedLeaveTypes, sort: leaveSort, toggle: toggleLeaveSort } = useTableSort(LEAVE_BALANCE_TYPES, {
    defaultKey: "type",
  });

  const selectedLeaveBalance = LEAVE_BALANCE_TYPES.find((lt) => lt.type === leaveForm.type);
  const selectedAvailable = selectedLeaveBalance?.available ?? 0;
  const selectedPending = leaves.filter((l) => l.type === leaveForm.type && l.status === "Pending").length;
  const canApplySelectedLeave = selectedAvailable > 0;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F7F8FA] text-[#111] font-sans">
      {/* TopBar is rendered by Layout; removed per global header update */}

      {/* ── Page Content Container ───────────────────────────────────────── */}
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-5 w-full max-w-none">
        
        {activeTab !== "Summary" && (
          <>
          {/* ── Section Header: Breadcrumb & Title & Selectors ───────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Breadcrumb */}
              {/* <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span className="hover:text-[#7A0A17] cursor-pointer transition-colors">Dashboard</span>
                <ChevronRight size={13} className="text-[#9CA3AF]" />
                <span className="hover:text-[#7A0A17] cursor-pointer transition-colors">My Workspace</span>
                <ChevronRight size={13} className="text-[#9CA3AF]" />
                <span className="text-[#111827] font-bold">HRMS</span>
              </div> */}
  
              {/* Title */}
              <div className="mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8395B]">
                  YOU ARE VIEWING
                </p>
                <h1 className="hrms-page-title tracking-tight">
                  {selectedMonth} {selectedYear}
                </h1>
              </div>
            </div>
  
            {/* Controls Right */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Month Dropdown */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-white border border-black/12 hover:border-[#7A0A17]/40 rounded-xl px-4 py-2 pr-9 text-sm font-semibold text-[#374151] shadow-sm cursor-pointer outline-none transition-all"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              </div>
  
              {/* Year Dropdown */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-black/12 hover:border-[#7A0A17]/40 rounded-xl px-4 py-2 pr-9 text-sm font-semibold text-[#374151] shadow-sm cursor-pointer outline-none transition-all"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              </div>
  
              {/* Report an Issue Button */}
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="bg-[#7A0A17] hover:bg-[#600712] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
              >
                Report an issue
              </button>
            </div>
          </div>
  
          {/* ── Tabs Navigation Bar ────────────────────────────────────────── */}
          <div className="border-b border-black/10 overflow-x-auto scrollbar-none">
            <nav className="flex items-center gap-6 sm:gap-8 min-w-max">
              {HRMS_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                      isActive
                        ? "text-[#7A0A17]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7A0A17] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          </>
        )}

        {activeTab === "Summary" && (
          <HrmsDashboard
            months={MONTH_OPTIONS}
            years={YEAR_OPTIONS}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onReportIssue={() => setReportModalOpen(true)}
            onOpenTrainings={() => setTrainingsModalOpen(true)}
            onOpenAssets={() => setAssetsModalOpen(true)}
            onOpenExit={() => setExitModalOpen(true)}
            onOpenDocuments={() => setDocumentsModalOpen(true)}
            onViewPromotions={() => setPromotionModalOpen(true)}
            onViewWarnings={() => setWarningModalOpen(true)}
            onViewGoals={() => setGoalsModalOpen(true)}
            onOpenAttendance={() => setAttendanceModalOpen(true)}
            onOpenAchievement={() => setAchievementModalOpen(true)}
            onOpenIncentives={() => setIncentivesModalOpen(true)}
            onOpenAwards={() => setAwardsModalOpen(true)}
            onRegularize={() => setTimesheetModal("edit")}
            onTimesheetDetails={() => setTimesheetModal("view")}
            onApplyLeave={() => setApplyLeaveFormOpen(true)}
            onLeaveBalance={() => setApplyLeaveOpen(true)}
            onApplyExpense={() => setAddExpenseOpen(true)}
            onViewExpense={setViewExpense}
            expenses={expenses}
            leaves={leaves}
            requests={MY_REQUESTS}
            goals={goals}
            expandedRemarks={expandedRemarks}
            onToggleRemark={(id) => setExpandedRemarks((prev) => ({ ...prev, [id]: !prev[id] }))}
            onGoalAction={(mode, item) => setGoalModal({ mode, item })}
            onOpenSalary={(month) => setSalarySlip(month ? `${month} ${selectedYear}` : `${selectedMonth} ${selectedYear}`)}
          />
        )}

        {/* 2. ATTENDANCE & TIMESHEET TAB */}
        {activeTab === "Attendance & Timesheet" && (
          <AttendancePanel
            kpis={attendanceKpis}
            days={attendanceDays}
            onRegularize={() => setTimesheetModal("edit")}
          />
        )}

        {/* 4. SALARY & PAYSLIP TAB */}
        {activeTab === "Salary & Payslip" && <SalaryPayslipPanel />}

        {/* 5. INCENTIVES TAB */}
        {activeTab === "Incentives" && <IncentivesPanel />}

        {/* TRAININGS TAB */}
        {activeTab === "Trainings" && (
          <TrainingsPanel
            search={searchTraining}
            onSearchChange={(v) => { setSearchTraining(v); setTrainingPage(1); }}
            sort={trainingSort}
            onSort={toggleTrainingSort}
            rows={pagedTrainings}
            page={trainingPage}
            pageSize={trainingPageSize}
            totalPages={trainingTotalPages}
            totalItems={filteredTrainings.length}
            onPageChange={setTrainingPage}
            onAction={(mode, item) => setTrainingModal({ mode, item })}
          />
        )}

        {/* GOALS & REVIEWS TAB */}
        {activeTab === "Goals & Reviews" && (
          <GoalsReviewsPanel
            searchGoal={searchGoal}
            onSearchChange={(v) => { setSearchGoal(v); setGoalPage(1); }}
            goalSort={goalSort}
            onSort={toggleGoalSort}
            pagedGoals={pagedGoals}
            goalPage={goalPage}
            goalPageSize={goalPageSize}
            goalTotalPages={goalTotalPages}
            totalItems={filteredGoals.length}
            onPageChange={setGoalPage}
            expandedRemarks={expandedRemarks}
            onToggleRemark={(id) => setExpandedRemarks((p) => ({ ...p, [id]: !p[id] }))}
            onGoalAction={(mode, item) => setGoalModal({ mode, item })}
          />
        )}

        {/* ASSET TAB */}
        {activeTab === "Asset" && (
          <AssetsPanel
            search={searchAsset}
            onSearchChange={(v) => { setSearchAsset(v); setAssetPage(1); }}
            sort={assetSort}
            onSort={toggleAssetSort}
            rows={pagedAssets}
            page={assetPage}
            pageSize={assetPageSize}
            totalPages={assetTotalPages}
            totalItems={filteredAssets.length}
            onPageChange={setAssetPage}
          />
        )}

        {/* AWARDS & CONTEST TAB */}
        {activeTab === "Awards & Contest" && <AwardsContestPanel {...awardsPanelProps} />}

        {/* PROMOTION AND TRANSFER TAB */}
        {activeTab === "Promotion and Transfer" && (
          <PromotionsTransfersSection employee={SUMMARY_EMPLOYEE} />
        )}

        {/* COMPLAINT & WARNING TAB */}
        {activeTab === "Complaint & Warning" && (
          <ComplaintsWarningsPanel onViewNotice={() => setNoticeModalOpen(true)} />
        )}

        {/* EXIT TAB */}
        {activeTab === "Exit" && <ExitTab />}

        {/* Placeholder View for remaining tabs */}
        {!["Summary", "Attendance & Timesheet", "Salary & Payslip", "Incentives", "Trainings", "Goals & Reviews", "Asset", "Awards & Contest", "Complaint & Warning", "Promotion and Transfer", "Exit"].includes(activeTab) && (
          <div className="bg-white border border-black/8 rounded-2xl p-12 text-center my-6 shadow-sm">
            <div className="size-16 rounded-2xl bg-[#FCF5F6] border border-[#7A0A17]/15 text-[#7A0A17] grid place-items-center mx-auto mb-4">
              <FileText size={28} />
            </div>
            <h3 className="hrms-modal-title">{activeTab} Details</h3>
            <p className="text-sm text-[#6B7280] mt-1.5 max-w-md mx-auto">
              Viewing details and records for {activeTab} in {selectedMonth} {selectedYear}. All data synced from company database.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("Summary")}
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#7A0A17] bg-[#FCF5F6] border border-[#7A0A17]/20 px-4 py-2 rounded-xl hover:bg-[#F9ECEE] transition-colors"
            >
              Return to Summary
            </button>
          </div>
        )}

      </div>

      {/* ── MODALS SECTION ────────────────────────────────────────────────── */}

      {/* Add Manual Entry Modal */}
      {addManualRowOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAddManualRowOpen(false)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]"
            >
              <X size={18} />
            </button>
            <h3 className="hrms-modal-title mb-2">Add Manual Timesheet Entry</h3>
            <p className="text-xs text-[#6B7280] mb-4">Note: Manual entries require manager approval.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Project / Module</label>
                <input type="text" placeholder="e.g. Field Work" className="w-full border border-black/15 rounded-xl p-2.5 outline-none" />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Work Description</label>
                <input type="text" placeholder="e.g. Client visit..." className="w-full border border-black/15 rounded-xl p-2.5 outline-none" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddManualRowOpen(false)}
                className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Manual row submitted for regularization approval!");
                  setAddManualRowOpen(false);
                }}
                className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl text-xs font-bold"
              >
                Submit Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Report Issue Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setReportModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                <AlertCircle size={16} strokeWidth={2} />
              </span>
              <div>
                <h3 className="hrms-modal-title">Report an Issue</h3>
                <p className="text-xs text-[#6B7280]">Send a ticket to HR / IT support</p>
              </div>
            </div>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Issue Description</label>
                <textarea
                  rows={4}
                  required
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Describe your issue or query here..."
                  className="w-full border border-black/15 rounded-xl p-3 text-xs outline-none focus:border-[#7A0A17]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4B5563]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl text-xs font-bold">
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Notice Modal */}
      {noticeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setNoticeModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                <AlertTriangle size={16} strokeWidth={2} />
              </span>
              <div>
                <h3 className="hrms-modal-title">Official Warning Notice</h3>
                <p className="text-xs text-[#6B7280]">Issued on April 12, 2025</p>
              </div>
            </div>
            <div className="bg-[#FCF5F6] border border-[#7A0A17]/20 rounded-xl p-4 text-xs text-[#374151] space-y-2">
              <p className="font-bold text-[#7A0A17]">Subject: Attendance & Punctuality Advisory</p>
              <p>Our records show late check-ins logged twice in the current billing month (July 29 & July 30). Please ensure compliance with standard shift hours (9:00 AM - 6:00 PM).</p>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setNoticeModalOpen(false)} className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl text-xs font-bold">
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Change Shift Modal */}
      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)} title="My Shift" width="max-w-md">
        <div className="flex flex-col gap-4 text-xs">
          <div className="bg-[#FFF3E4] border border-[#F59E0B]/20 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                <Clock size={16} strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-[#111827]">General</p>
                <p className="text-[#6B7280]">9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
                <Calendar size={16} strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-[#111827]">Days</p>
                <p className="text-[#6B7280]">Monday to Friday (5 days per week)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <Clock size={12} /> Working Time
              </span>
              <p className="font-bold text-[#111827] mt-1">8 hours</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <Coffee size={12} /> Break Duration
              </span>
              <p className="font-bold text-[#111827] mt-1">1 hour</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <AlertCircle size={12} /> Grace Period
              </span>
              <p className="font-bold text-[#111827] mt-1">15 minutes</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <CheckCircle2 size={12} /> Status
              </span>
              <p className="font-bold text-[#16A34A] mt-1">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h3 className="font-bold text-[#111827]">Shift Change Request</h3>
            <button
              type="button"
              onClick={() => setShiftChangeFormOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#7A0A17] hover:bg-[#600712] text-white font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              Request Shift Change <Plus size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
            {shiftChangeRequests.map((req) => (
              <div key={req.id} className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ArrowLeftRight size={14} className="text-[#7A0A17] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-[#111827] truncate">
                      {req.from} <span className="text-[#7A0A17]">&rarr;</span> {req.to}
                    </p>
                    <p className="text-[#6B7280]">Effective from {req.effective}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Request Shift Change form */}
      <Modal
        open={shiftChangeFormOpen}
        onClose={() => setShiftChangeFormOpen(false)}
        title="Request Shift Change"
        subtitle="Current Shift: General Shift (9:00 AM - 6:00 PM)"
        icon={<Clock size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShiftChangeFormOpen(false)}
              className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="shift-change-form"
              className="px-5 py-2 bg-[#15803D] hover:bg-[#116C31] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Submit Request
            </button>
          </>
        }
      >
        <form id="shift-change-form" onSubmit={handleChangeShift} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Select Preferred Shift</label>
            <select
              value={newShift}
              onChange={(e) => setNewShift(e.target.value)}
              className="w-full border border-black/15 rounded-xl p-2.5 font-semibold outline-none focus:border-[#7A0A17] bg-white text-[#111827]"
            >
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        title="Attendance"
        subtitle={`${selectedMonth} ${selectedYear} · 18 / 22 Days · 82%`}
        icon={<Calendar size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <AttendancePanel
          kpis={attendanceKpis}
          days={attendanceDays}
          onRegularize={() => setTimesheetModal("edit")}
        />
      </Modal>

      <AchievementKpiModal open={achievementModalOpen} onClose={closeAchievementModal} />

      <Modal
        open={incentivesModalOpen}
        onClose={() => setIncentivesModalOpen(false)}
        title="Incentives"
        subtitle={`${selectedMonth} ${selectedYear} · Target 82% · ₹ 38,000 earned`}
        icon={<Target size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <IncentivesPanel />
      </Modal>

      <Modal
        open={awardsModalOpen}
        onClose={() => setAwardsModalOpen(false)}
        title="Awards & Contests"
        subtitle="My rank #2 · Out of 18"
        icon={<Trophy size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <AwardsContestPanel {...awardsPanelProps} />
      </Modal>

      <Modal
        open={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        title="Promotions and Transfers"
        subtitle="Promotions and transfers till today"
        icon={<TrendingUp size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <PromotionsTransfersSection employee={SUMMARY_EMPLOYEE} embedded />
      </Modal>

      <WarningsComplaintsModal open={warningModalOpen} onClose={closeWarningsModal} />

      <Modal
        open={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        title="Goals & Review"
        subtitle="Employee goals and reviews"
        icon={<Target size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
        footer={
          <div className="flex-1 min-w-0">
            <Pagination
              page={goalPage}
              totalPages={goalTotalPages}
              totalItems={filteredGoals.length}
              pageSize={goalPageSize}
              itemLabel="employee goals"
              onChange={setGoalPage}
            />
          </div>
        }
      >
        <GoalsReviewsPanel
          embedded
          searchGoal={searchGoal}
          onSearchChange={(v) => { setSearchGoal(v); setGoalPage(1); }}
          goalSort={goalSort}
          onSort={toggleGoalSort}
          pagedGoals={pagedGoals}
          goalPage={goalPage}
          goalPageSize={goalPageSize}
          goalTotalPages={goalTotalPages}
          totalItems={filteredGoals.length}
          onPageChange={setGoalPage}
          expandedRemarks={expandedRemarks}
          onToggleRemark={(id) => setExpandedRemarks((p) => ({ ...p, [id]: !p[id] }))}
          onGoalAction={(mode, item) => setGoalModal({ mode, item })}
        />
      </Modal>

      <Modal
        open={trainingsModalOpen}
        onClose={() => setTrainingsModalOpen(false)}
        title="Trainings"
        subtitle="Assigned programs and sessions"
        icon={<GraduationCap size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
        footer={
          <div className="flex-1 min-w-0">
            <Pagination
              page={trainingPage}
              totalPages={trainingTotalPages}
              totalItems={filteredTrainings.length}
              pageSize={trainingPageSize}
              itemLabel="training sessions"
              onChange={setTrainingPage}
            />
          </div>
        }
      >
        <TrainingsPanel
          embedded
          search={searchTraining}
          onSearchChange={(v) => { setSearchTraining(v); setTrainingPage(1); }}
          sort={trainingSort}
          onSort={toggleTrainingSort}
          rows={pagedTrainings}
          page={trainingPage}
          pageSize={trainingPageSize}
          totalPages={trainingTotalPages}
          totalItems={filteredTrainings.length}
          onPageChange={setTrainingPage}
          onAction={(mode, item) => setTrainingModal({ mode, item })}
        />
      </Modal>

      <Modal
        open={assetsModalOpen}
        onClose={() => setAssetsModalOpen(false)}
        title="Assets"
        subtitle="Assigned company assets"
        icon={<Laptop size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
        footer={
          <div className="flex-1 min-w-0">
            <Pagination
              page={assetPage}
              totalPages={assetTotalPages}
              totalItems={filteredAssets.length}
              pageSize={assetPageSize}
              itemLabel="assets"
              onChange={setAssetPage}
            />
          </div>
        }
      >
        <AssetsPanel
          embedded
          search={searchAsset}
          onSearchChange={(v) => { setSearchAsset(v); setAssetPage(1); }}
          sort={assetSort}
          onSort={toggleAssetSort}
          rows={pagedAssets}
          page={assetPage}
          pageSize={assetPageSize}
          totalPages={assetTotalPages}
          totalItems={filteredAssets.length}
          onPageChange={setAssetPage}
        />
      </Modal>

      <Modal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Exit & Separation"
        subtitle="Termination record and resignation"
        icon={<LogOut size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-4xl"
        zClass="z-40"
        contain
      >
        <ExitTab />
      </Modal>

      <Modal
        open={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        title="Documents & Media"
        subtitle="Company documents, media library, and tutorials"
        icon={<FileText size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <DocumentsPage embedded />
      </Modal>

      <Modal
        open={!!salarySlip}
        onClose={() => setSalarySlip(null)}
        title="Salary & Payslip"
        subtitle={salarySlip || undefined}
        icon={<Receipt size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-40"
        contain
      >
        <SalaryPayslipPanel period={salarySlip || "December 2026"} />
      </Modal>

      <TimesheetDetailsModal
        open={!!timesheetModal}
        onClose={() => setTimesheetModal(null)}
        mode={timesheetModal === "view" ? "view" : "edit"}
        employee={{
          name: USER.name,
          role: USER.role || "Relationship Manager",
          id: "EMP00116",
          avatar: USER.avatar,
        }}
      />

      <TrainingViewModal
        open={trainingModal?.mode === "view"}
        training={trainingModal?.item}
        onClose={() => setTrainingModal(null)}
      />
      <TrainingEditModal
        open={trainingModal?.mode === "edit"}
        training={trainingModal?.item}
        onClose={() => setTrainingModal(null)}
        onSave={handleSaveTraining}
      />
      <ConfirmDeleteModal
        open={trainingModal?.mode === "delete"}
        entityLabel="training"
        itemName={trainingModal?.item?.program}
        onClose={() => setTrainingModal(null)}
        onConfirm={handleDeleteTraining}
      />

      <GoalViewModal
        open={goalModal?.mode === "view"}
        goal={goalModal?.item}
        onClose={() => setGoalModal(null)}
      />
      <GoalEditModal
        open={goalModal?.mode === "edit"}
        goal={goalModal?.item}
        onClose={() => setGoalModal(null)}
        onSave={handleSaveGoal}
      />
      <GoalConductReviewModal
        open={goalModal?.mode === "review"}
        goal={goalModal?.item}
        onClose={() => setGoalModal(null)}
        onSave={handleSaveGoalReview}
      />
      <ConfirmDeleteModal
        open={goalModal?.mode === "delete"}
        entityLabel="goal"
        itemName={goalModal?.item?.title}
        onClose={() => setGoalModal(null)}
        onConfirm={handleDeleteGoal}
      />

      {/* 7. Add Expense Modal */}
      <Modal
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        title="Add New Expense"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddExpenseOpen(false)}
              className="px-4 py-2 border border-black/10 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-expense-form"
              className="px-5 py-2 bg-[#7A0A17] hover:bg-[#600712] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <form id="add-expense-form" onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">
              Employee <span className="text-[#DC2626]">*</span>
            </label>
            <select
              required
              value={expenseForm.employee}
              onChange={(e) => setExpenseForm({ ...expenseForm, employee: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17] bg-white text-[#111827]"
            >
              <option value="" disabled>Select employee</option>
              {EMPLOYEE_OPTIONS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              Purpose <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Client Meeting"
              value={expenseForm.purpose}
              onChange={(e) => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              Destination <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajouri Garden"
              value={expenseForm.destination}
              onChange={(e) => setExpenseForm({ ...expenseForm, destination: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              Start Date <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              required
              value={expenseForm.startDate}
              onChange={(e) => setExpenseForm({ ...expenseForm, startDate: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              End Date <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              required
              value={expenseForm.endDate}
              onChange={(e) => setExpenseForm({ ...expenseForm, endDate: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Additional details"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">Expected Outcomes</label>
            <input
              type="text"
              placeholder="e.g. Sign contract"
              value={expenseForm.expectedOutcomes}
              onChange={(e) => setExpenseForm({ ...expenseForm, expectedOutcomes: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">Documents</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                placeholder="Select document file..."
                value={expenseDocument?.name || ""}
                className="flex-1 min-w-0 border border-black/15 rounded-xl p-2.5 outline-none bg-[#FAFAFB] text-[#374151]"
              />
              <label className="shrink-0 inline-flex items-center gap-1.5 border border-black/15 rounded-xl px-3.5 py-2.5 font-bold text-[#374151] cursor-pointer hover:bg-[#FAFAFB] transition-colors">
                <Upload size={14} />
                Browse
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setExpenseDocument(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">Advance Amount</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 500.00"
              value={expenseForm.advanceAmount}
              onChange={(e) => setExpenseForm({ ...expenseForm, advanceAmount: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none focus:border-[#7A0A17]"
            />
          </div>
        </form>
      </Modal>

      {/* 8. View Expense Detail Modal */}
      <Modal
        open={!!viewExpense}
        onClose={() => setViewExpense(null)}
        title="Expense Details"
        icon={<BarChart3 size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-md"
      >
        {viewExpense && (
          <div className="flex flex-col gap-5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <DetailField icon={LayoutGrid} label="Purpose">{viewExpense.purpose}</DetailField>
              <DetailField icon={LayoutGrid} label="Destination">{viewExpense.destination}</DetailField>
              <DetailField icon={LayoutGrid} label="Start Date">{viewExpense.startDate}</DetailField>
              <DetailField icon={LayoutGrid} label="End Date">{viewExpense.endDate}</DetailField>
              <DetailField icon={Lock} label="Status">
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    viewExpense.status === "Approved"
                      ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                      : viewExpense.status === "Cancelled"
                      ? "bg-[#FDECEE] text-[#DC2626] border-[#DC2626]/20"
                      : "bg-[#FFEDD5] text-[#C2410C] border-[#EA580C]/20"
                  }`}
                >
                  {viewExpense.status}
                </span>
              </DetailField>
              <DetailField icon={Lock} label="Advance Amount">
                <span className="inline-flex items-center gap-2">
                  ₹{viewExpense.advanceAmount}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20">
                    {viewExpense.advanceStatus}
                  </span>
                </span>
              </DetailField>
              <DetailField icon={LayoutGrid} label="Total Expenses" full>{viewExpense.totalExpenses}</DetailField>
              <DetailField icon={LayoutGrid} label="Documents" full>
                {viewExpense.documentName ? (
                  <span className="inline-flex items-center gap-2 text-[#7A0A17] font-semibold">
                    <FileText size={14} /> {viewExpense.documentName}
                  </span>
                ) : (
                  <div className="h-32 rounded-xl bg-[#EDEEF1] grid place-items-center text-[#9CA3AF]">
                    <ImageIcon size={22} />
                  </div>
                )}
              </DetailField>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-1">
                <FileText size={12} /> Description
              </p>
              <p className="text-[13px] text-[#374151] leading-relaxed">{viewExpense.description || "—"}</p>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-1">
                <FileText size={12} /> Expected Outcomes
              </p>
              <p className="text-[13px] text-[#374151] leading-relaxed">{viewExpense.expectedOutcomes || "—"}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. Leave Balances Overview Modal */}
      <Modal
        open={applyLeaveOpen}
        onClose={() => setApplyLeaveOpen(false)}
        width="max-w-lg"
        title="Leave Balances"
      >
        <div className="-mt-2 mb-4 flex items-center gap-3 min-w-0">
          <img
            src={USER.avatar}
            alt={USER.name}
            className="size-11 rounded-full object-cover shrink-0 ring-2 ring-[#7A0A17]/10"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#111] truncate">{USER.name}</p>
            <p className="text-xs text-[#6B7280]">Relationship Manager</p>
          </div>
        </div>

        <div className="border border-black/8 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] text-[#6B7280] uppercase text-[10px] tracking-wide">
                <SortableTh label="Leave Type" sortKey="type" sort={leaveSort} onSort={toggleLeaveSort} className="text-left font-bold px-3 py-2" />
                <SortableTh label="Total" sortKey="total" sort={leaveSort} onSort={toggleLeaveSort} className="text-center font-bold px-2 py-2" />
                <SortableTh label="Used" sortKey="used" sort={leaveSort} onSort={toggleLeaveSort} className="text-center font-bold px-2 py-2" />
                <SortableTh label="Available" sortKey="available" sort={leaveSort} onSort={toggleLeaveSort} className="text-center font-bold px-2 py-2" />
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {sortedLeaveTypes.map((lt) => (
                <tr key={lt.type} className="hover:bg-[#FAFAFB]/60 transition-colors">
                  <td className="px-3 py-2 font-semibold text-[#111]">{lt.type}</td>
                  <td className="px-2 py-2 text-center text-[#374151]">{lt.total}</td>
                  <td className="px-2 py-2 text-center text-[#374151]">{lt.used}</td>
                  <td className="px-2 py-2 text-center font-bold text-[#16A34A]">{lt.available}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => toast.info(lt.info)}
                      className="text-[#9CA3AF] hover:text-[#7A0A17] transition-colors"
                      aria-label={`${lt.type} info`}
                    >
                      <Info size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* 9b. Apply Leave Form Modal */}
      <Modal
        open={applyLeaveFormOpen}
        onClose={() => setApplyLeaveFormOpen(false)}
        title="Apply for Leave"
        subtitle={`Available Balance: ${selectedAvailable} day${selectedAvailable === 1 ? "" : "s"}`}
        icon={<Calendar size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setApplyLeaveFormOpen(false)}
              className="px-4 py-2 border border-black/10 rounded-xl font-bold text-[#4B5563] text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="apply-leave-form"
              disabled={!canApplySelectedLeave}
              className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Application
            </button>
          </>
        }
      >
        <form id="apply-leave-form" onSubmit={handleApplyLeave} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Leave Type</label>
            <select
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 font-semibold outline-none focus:border-[#7A0A17]"
            >
              {LEAVE_BALANCE_TYPES.map((lt) => (
                <option key={lt.type} value={lt.type}>
                  {lt.type}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] font-semibold text-[#E8395B]">
              {selectedPending} pending leave{selectedPending === 1 ? "" : "s"} in this category
              {selectedAvailable === 0 ? " · 0 days available — you cannot apply" : ""}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full border border-black/15 rounded-xl p-2 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#374151] mb-1">End Date</label>
              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full border border-black/15 rounded-xl p-2 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-[#374151] mb-1">Reason / Comment</label>
            <textarea
              rows={2}
              value={leaveForm.comment}
              onChange={(e) => setLeaveForm({ ...leaveForm, comment: e.target.value })}
              placeholder="State reason..."
              className="w-full border border-black/15 rounded-xl p-2.5 outline-none"
            />
          </div>
        </form>
      </Modal>

      <SendMessageModal open={sendMessageOpen} onClose={() => setSendMessageOpen(false)} />

    </div>
  );
}
