import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ChevronRight,
  ChevronDown,
  Wallet,
  AlertTriangle,
  Clock,
  Trophy,
  Target,
  Receipt,
  Activity,
  Send,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  MessageSquare,
  X,
  Plus,
  AlertCircle,
  FileText,
  Download,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  BarChart3,
  LayoutGrid,
  Lock,
  Image as ImageIcon,
  Info,
  Coffee,
  ArrowLeftRight,
  Hand,
} from "lucide-react";
import { USER } from "../components/layout/TopBar";
import Modal from "../components/ui/Modal";
import TimesheetDetailsModal from "../components/hrms/TimesheetDetailsModal";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
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
  { type: "Study Leave",       total: 23, used: 8, available: 15, info: "Leave to attend exams, courses, or certifications." },
  { type: "Marriage Leave",    total: 23, used: 8, available: 15, info: "Leave granted for an employee's own wedding." },
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
  "Attendance",
  "Timesheet",
  "Salary & Payslip",
  "Trainings",
  "Incentives",
  "Goals & Reviews",
  "Documents",
  "Asset",
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

const LEADERBOARD_MEMBERS = [
  { rank: 1, name: "Kuhu Sharma", location: "Rajouri Garden", xp: "140 XP", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" },
  { rank: 2, name: "Ankur Sharma", isYou: true, location: "South Extension", xp: "140 XP", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { rank: 3, name: "Arjun Mehta", location: "Rajouri Garden", xp: "140 XP", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { rank: 4, name: "Priya Singh", location: "Gurugram", xp: "135 XP", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { rank: 5, name: "Rohan Verma", location: "Noida", xp: "120 XP", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ATTENDANCE_STATUS_PATTERN = [
  "WO", "WO", "WO", "X", "P", "H", "P", "WO", "WO", "1/2",
  "P", "P", "P", "X", "WO", "WO", "P", "H", "P", "1/2",
  "X", "WO", "WO", "P", "P", "1/2", "X", "P", "P", "P", "P",
];

function YouHandIcon() {
  return (
    <span className="relative inline-flex shrink-0 group/you">
      <Hand size={13} className="text-[#7A0A17]" strokeWidth={2.2} />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap rounded-md bg-[#111] px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover/you:opacity-100 transition-opacity z-20 shadow-sm">
        it's you
      </span>
    </span>
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
    return {
      day: String(i + 1).padStart(2, "0"),
      week: WEEKDAY_SHORT[dow],
      status,
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
  { id: 5, title: "Learn New Software Tools", employee: "Ananya Mishra", goalType: "Learning and Training Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 6, title: "Expand Technical Expertise", employee: "Akshay Kumar", goalType: "Career Development Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 55, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 7, title: "Reduce Response Time",     employee: "Priya Raheja",  goalType: "Customer Success",           startDate: "26-08-2026", endDate: "26-08-2026", progress: 70, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 8, title: "Certification Completion", employee: "Vivek Sharma",  goalType: "Learning and Training Goals", startDate: "26-08-2026", endDate: "26-08-2026", progress: 40, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
  { id: 9, title: "Team Mentorship",          employee: "Aditya Sharma", goalType: "Career Development Goals",  startDate: "26-08-2026", endDate: "26-08-2026", progress: 85, status: "In Progress", remarks: "Comprehensive quarterly review pending sign-off from the reporting manager before the next cycle begins." },
];

const DOC_BORDER_COLORS = ["#F59E0B", "#3B82F6", "#16A34A", "#EAB308"];

const INITIAL_DOCUMENTS = [
  { id: 1, title: "Employee Contract",            category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 2, title: "Offer Letter",                  category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 3, title: "Salary Certificate",            category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 4, title: "Experience Certificate",        category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 5, title: "Data Privacy and Security Policy", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 6, title: "Emergency Contact Form",        category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 7, title: "Expense Reimbursement Policy",  category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 8, title: "Remote Work Policy",            category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 9, title: "Code of Conduct Policy",        category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
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
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-black/12 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#7A0A17]"
          />
        </div>
        <button
          type="button"
          className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs flex items-center gap-1"
        >
          <Search size={14} /> Search
        </button>
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
              n === page ? "bg-[#16A34A] text-white" : "border border-black/10 bg-white hover:bg-[#FAFAFB] text-[#374151]"
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

const HRMS_TH = "px-4 py-3";

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
      <div className="text-sm font-bold text-[#111827]">{children}</div>
    </div>
  );
}

function HrmsSortHead({ cols, sort, onSort }) {
  return (
    <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold">
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
            <td className="px-4 py-3 font-extrabold text-[#3B82F6]">{row.hours}</td>
          </tr>
        ))}
      </tbody>
    </>
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
            <td className="px-4 py-3 font-extrabold text-[#3B82F6]">{row.hours}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button type="button" className="text-[#16A34A] hover:opacity-80"><CheckCircle2 size={16} /></button>
                <button type="button" className="text-[#DC2626] hover:opacity-80"><X size={16} /></button>
                <button type="button" className="text-[#0284C7] hover:opacity-80"><Edit size={15} /></button>
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
            { label: "Client Name", key: "client" },
            { label: "Registration", key: "registration" },
            { label: "Net of GST", key: "net" },
            { label: "Slab", key: "slab" },
            { label: "Incentive", key: "incentive" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.client}>
            <td className="px-4 py-2.5 font-bold">{row.client}</td>
            <td className="px-4 py-2.5">{row.registration}</td>
            <td className="px-4 py-2.5 text-[#6B7280]">{row.net}</td>
            <td className="px-4 py-2.5 text-[#7A0A17] font-bold">{row.slab}</td>
            <td className="px-4 py-2.5 font-bold">{row.incentive}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-extrabold">
          <td className="px-4 py-3" colSpan={4}>Subtotal</td>
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
            { label: "Count", key: "count" },
            { label: "Rate", key: "rate" },
            { label: "Amount", key: "amount" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.item}>
            <td className="px-4 py-2.5 font-bold">{row.item}</td>
            <td className="px-4 py-2.5">{row.count}</td>
            <td className="px-4 py-2.5">{row.rate}</td>
            <td className={`px-4 py-2.5 ${row.amount === "-" ? "text-[#9CA3AF]" : "font-bold"}`}>{row.amount}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-extrabold">
          <td className="px-4 py-3" colSpan={3}>Subtotal</td>
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
            { label: "Rule", key: "rule" },
            { label: "Count", key: "count" },
            { label: "Rate", key: "rate" },
            { label: "Amount", key: "amount" },
          ]}
        />
      </thead>
      <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
        {sorted.map((row) => (
          <tr key={row.item}>
            <td className="px-4 py-2.5 font-bold">{row.item}</td>
            <td className="px-4 py-2.5 text-[#6B7280]">{row.rule}</td>
            <td className="px-4 py-2.5">{row.count}</td>
            <td className={`px-4 py-2.5 ${row.amountTone}`}>{row.rate}</td>
            <td className={`px-4 py-2.5 font-bold ${row.amountTone}`}>{row.amount}</td>
          </tr>
        ))}
        <tr className="bg-[#FAFAFB] font-extrabold">
          <td className="px-4 py-3" colSpan={4}>Subtotal</td>
          <td className="px-4 py-3 text-[#7A0A17]">₹1,420</td>
        </tr>
      </tbody>
    </>
  );
}

export default function HrmsPage() {
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [activeTab, setActiveTab] = useState("Summary");

  const attendanceDays = useMemo(
    () => getAttendanceDays(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );
  const attendancePresent = attendanceDays.reduce((sum, d) => {
    if (d.status === "P") return sum + 1;
    if (d.status === "1/2") return sum + 0.5;
    return sum;
  }, 0);

  // Expenses & Leaves State
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [timesheetModal, setTimesheetModal] = useState(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [applyLeaveFormOpen, setApplyLeaveFormOpen] = useState(false);
  const [leaveMenuOpen, setLeaveMenuOpen] = useState(false);
  const [shiftChangeFormOpen, setShiftChangeFormOpen] = useState(false);
  const [shiftChangeRequests, setShiftChangeRequests] = useState(INITIAL_SHIFT_CHANGE_REQUESTS);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [addManualRowOpen, setAddManualRowOpen] = useState(false);

  // Trainings / Goals & Reviews / Documents / Asset tab state
  const [searchTraining, setSearchTraining] = useState("");
  const [trainingPage, setTrainingPage] = useState(1);
  const [searchGoal, setSearchGoal] = useState("");
  const [goalPage, setGoalPage] = useState(1);
  const [expandedRemarks, setExpandedRemarks] = useState({});
  const [searchDocument, setSearchDocument] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [searchAsset, setSearchAsset] = useState("");
  const [assetPage, setAssetPage] = useState(1);

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

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
    toast.info("Expense removed.");
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
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
    setApplyLeaveOpen(false);
  };

  const filteredTrainings = INITIAL_TRAININGS.filter((t) =>
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

  const filteredGoals = INITIAL_GOALS.filter((g) => g.title.toLowerCase().includes(searchGoal.toLowerCase()));
  const { sorted: sortedGoals, sort: goalSort, toggle: toggleGoalSort } = useTableSort(filteredGoals, { defaultKey: "title" });
  const goalPageSize = 6;
  const goalTotalPages = Math.max(1, Math.ceil(filteredGoals.length / goalPageSize));
  const pagedGoals = sortedGoals.slice((goalPage - 1) * goalPageSize, goalPage * goalPageSize);

  const filteredDocuments = INITIAL_DOCUMENTS.filter((d) =>
    d.title.toLowerCase().includes(searchDocument.toLowerCase())
  );
  const documentPageSize = 8;
  const documentTotalPages = Math.max(1, Math.ceil(filteredDocuments.length / documentPageSize));
  const pagedDocuments = filteredDocuments.slice(
    (documentPage - 1) * documentPageSize,
    documentPage * documentPageSize
  );

  const filteredAssets = INITIAL_ASSETS.filter((a) =>
    a.name.toLowerCase().includes(searchAsset.toLowerCase())
  );
  const { sorted: sortedAssets, sort: assetSort, toggle: toggleAssetSort } = useTableSort(filteredAssets, {
    defaultKey: "name",
  });
  const assetPageSize = 10;
  const assetTotalPages = Math.max(1, Math.ceil(filteredAssets.length / assetPageSize));
  const pagedAssets = sortedAssets.slice((assetPage - 1) * assetPageSize, assetPage * assetPageSize);

  const { sorted: sortedLeaveTypes, sort: leaveSort, toggle: toggleLeaveSort } = useTableSort(LEAVE_BALANCE_TYPES, {
    defaultKey: "type",
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F7F8FA] text-[#111827] font-sans">
      {/* TopBar is rendered by Layout; removed per global header update */}

      {/* ── Page Content Container ───────────────────────────────────────── */}
      <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-[1550px] w-full mx-auto">
        
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
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#E8395B]">
                YOU ARE VIEWING
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
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

        {/* ── Tab View Content ──────────────────────────────────────────── */}
        
        {/* 1. SUMMARY TAB */}
        {activeTab === "Summary" && (
          <>
            {/* Top Row Quick Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative group hover:border-[#7A0A17]/30 transition-all">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0 shadow-sm">
                      <Wallet size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#374151]">This Month's Incentive</p>
                      <p className="text-2xl font-black text-[#111827] leading-tight mt-0.5">₹38,000</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2 font-medium">
                    earned at <span className="text-[#16A34A] font-bold">118%</span> of target
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-2">
                  <div className="inline-flex items-center gap-1.5 bg-white border border-black/8 rounded-lg px-2.5 py-1 text-xs font-bold text-[#111827] shadow-2xs">
                    <span>Rank</span>
                    <span className="text-[#7A0A17] text-sm">2</span>
                    <span>🏆</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Incentives")}
                    className="size-8 rounded-xl bg-white border border-black/10 hover:bg-[#7A0A17] hover:text-white text-[#4B5563] grid place-items-center transition-all shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative group hover:border-[#7A0A17]/30 transition-all">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0 shadow-sm">
                      <AlertTriangle size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#374151]">Warning Issued</p>
                      <p className="text-xs text-[#6B7280] leading-snug mt-1 font-medium max-w-[180px]">
                        Late arrivals flagged twice this month.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setNoticeModalOpen(true)}
                    className="border border-[#7A0A17] text-[#7A0A17] hover:bg-[#7A0A17] hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    View Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeModalOpen(true)}
                    className="size-8 rounded-xl bg-white border border-black/10 hover:bg-[#7A0A17] hover:text-white text-[#4B5563] grid place-items-center transition-all shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-[#F4FBF7] border border-[#16A34A]/20 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative group hover:border-[#16A34A]/40 transition-all">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#15803D] text-white grid place-items-center shrink-0 shadow-sm">
                      <Clock size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#374151]">My Shift</p>
                      <p className="text-xs text-[#6B7280] font-medium">General Shift</p>
                      <p className="text-sm font-black text-[#111827] mt-0.5">9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => setShiftModalOpen(true)}
                    className="border border-[#15803D] text-[#15803D] hover:bg-[#15803D] hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs bg-white"
                  >
                    Change Shift
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftModalOpen(true)}
                    className="size-8 rounded-xl bg-white border border-black/10 hover:bg-[#15803D] hover:text-white text-[#4B5563] grid place-items-center transition-all shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-black/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="size-8 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                        <Trophy size={15} />
                      </span>
                      <p className="text-xs font-bold text-[#111827]">This Month Leaderboard</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeaderboardModalOpen(true)}
                      className="border border-black/15 hover:border-[#7A0A17] text-[#4B5563] hover:text-[#7A0A17] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {LEADERBOARD_MEMBERS.slice(0, 3).map((item) => (
                      <div
                        key={item.rank}
                        className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.isYou ? "bg-[#FCF5F6] border border-[#7A0A17]/20" : "bg-[#FAFAFB]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-[#6B7280] text-[11px] w-3 shrink-0">{item.rank}.</span>
                          {item.isYou && <YouHandIcon />}
                          <span className="text-[#111827] truncate font-bold">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-[#6B7280] hidden xl:inline">{item.location}</span>
                          <span className="font-extrabold text-[#111827] text-[11px]">{item.xp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Today's Timesheet */}
            <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="size-11 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0 shadow-sm">
                  <Clock size={20} />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#111827]">Today's Timesheet</h2>
                  <p className="text-xs font-semibold text-[#6B7280]">Aug 7, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto py-1">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#9CA3AF] tracking-wider">LOGIN</p>
                  <p className="text-sm font-extrabold text-[#16A34A] mt-0.5">09:02 AM</p>
                </div>
                <div className="h-7 w-px bg-black/10 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#9CA3AF] tracking-wider">LOGOUT</p>
                  <p className="text-sm font-extrabold text-[#DC2626] mt-0.5">06:10 PM</p>
                </div>
                <div className="h-7 w-px bg-black/10 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#9CA3AF] tracking-wider">SYSTEM</p>
                  <p className="text-sm font-extrabold text-[#111827] mt-0.5">8.50h</p>
                </div>
                <div className="h-7 w-px bg-black/10 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#9CA3AF] tracking-wider">MANUAL</p>
                  <p className="text-sm font-extrabold text-[#111827] mt-0.5">1.00h</p>
                </div>
                <div className="h-7 w-px bg-black/10 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-[#9CA3AF] tracking-wider">TOTAL</p>
                  <p className="text-sm font-extrabold text-[#3B82F6] mt-0.5">9.50h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setTimesheetModal("edit")}
                  className="border border-[#7A0A17] text-[#7A0A17] hover:bg-[#FCF5F6] px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-2xs"
                >
                  Regularize
                </button>
                <button
                  type="button"
                  onClick={() => setTimesheetModal("view")}
                  className="bg-[#7A0A17] hover:bg-[#600712] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-2xs"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Row 3: Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch lg:h-[640px]">
              <div className="flex flex-col gap-5 h-full min-h-0">
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="size-9 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                      <Target size={17} />
                    </span>
                    <h3 className="text-base font-extrabold text-[#111827]">KPI Scorecard</h3>
                  </div>
                  <div className="divide-y divide-black/6 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Registration Value</span>
                      <span className="font-extrabold text-[#111827] text-sm">19.5 lakh</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Qualifying meetings</span>
                      <span className="font-extrabold text-[#111827] text-sm">46/30</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Google reviews</span>
                      <span className="font-extrabold text-[#111827] text-sm">7</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Testimonial videos</span>
                      <span className="font-extrabold text-[#111827] text-sm">3/5</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Wedding photo uploads</span>
                      <span className="font-extrabold text-[#111827] text-sm">5</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#4B5563] font-semibold">Negative reviews</span>
                      <span className="font-extrabold text-[#111827] text-sm">1</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="size-9 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                        <Receipt size={17} />
                      </span>
                      <h3 className="text-base font-extrabold text-[#111827]">My Expenses</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddExpenseOpen(true)}
                      className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Expense
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
                    {expenses.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-black/6 hover:border-black/15 transition-all"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#111827] truncate">{item.purpose}</p>
                          <p className="text-[11px] text-[#6B7280] font-medium mt-0.5 truncate">{item.destination} &middot; {item.startDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewExpense(item)}
                            className="size-7 rounded-lg bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] grid place-items-center transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setViewExpense(item); toast.info("Edit mode enabled"); }}
                            className="size-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] grid place-items-center transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(item.id)}
                            className="size-7 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5] grid place-items-center transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 h-full min-h-0">
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="size-9 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                      <Activity size={17} />
                    </span>
                    <h3 className="text-base font-extrabold text-[#111827]">Recent Activity</h3>
                  </div>
                  <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-black/8">
                    <div className="flex items-start justify-between gap-3 relative pl-8">
                      <span className="absolute left-1 top-0.5 size-6 rounded-full bg-[#DCFCE7] text-[#16A34A] grid place-items-center ring-4 ring-white">
                        <CheckCircle2 size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#111827]">Check-in</p>
                        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">Today at 9:00 AM</p>
                      </div>
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[#16A34A]/20">
                        On Time
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 relative pl-8">
                      <span className="absolute left-1 top-0.5 size-6 rounded-full bg-[#DCFCE7] text-[#16A34A] grid place-items-center ring-4 ring-white">
                        <FileCheck size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#111827]">Leave Approved</p>
                        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">August 3</p>
                      </div>
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[#16A34A]/20">
                        Approved
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 relative pl-8">
                      <span className="absolute left-1 top-0.5 size-6 rounded-full bg-[#E0F2FE] text-[#0284C7] grid place-items-center ring-4 ring-white">
                        <ShieldCheck size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#111827]">Attendance Regularized</p>
                        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">July 30</p>
                      </div>
                      <span className="bg-[#E0F2FE] text-[#0284C7] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[#0284C7]/20">
                        Date
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 relative pl-8">
                      <span className="absolute left-1 top-0.5 size-6 rounded-full bg-[#FFEDD5] text-[#EA580C] grid place-items-center ring-4 ring-white">
                        <Clock size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#111827]">Check-in</p>
                        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">July 29 at 9:10 AM</p>
                      </div>
                      <span className="bg-[#FFEDD5] text-[#C2410C] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[#EA580C]/20">
                        Late
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 shrink-0">
                    <span className="size-9 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                      <Send size={17} />
                    </span>
                    <h3 className="text-base font-extrabold text-[#111827]">Your Request</h3>
                  </div>
                  <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
                    {MY_REQUESTS.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-black/6">
                        <div>
                          <p className="text-xs font-extrabold text-[#111827]">{req.title}</p>
                          <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">{req.submitted}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSendMessageOpen(true)}
                            className="text-[#F59E0B] hover:text-[#D97706] p-1 rounded transition-colors"
                            aria-label="Send message"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${
                              req.status === "Approved"
                                ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                                : "bg-[#FFEDD5] text-[#C2410C] border-[#EA580C]/20"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm h-full min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                      <Calendar size={17} />
                    </span>
                    <h3 className="text-base font-extrabold text-[#111827]">My Leave Application</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApplyLeaveOpen(true)}
                    className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                  >
                    Apply Leave
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-black/8 mb-3 text-xs font-bold shrink-0">
                  <span className="text-[#374151]">Leave Balance</span>
                  <span className="text-[#3B82F6]">1 day available</span>
                </div>
                <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFB] border border-black/6 hover:border-black/15 transition-all"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-[#111827]">{leave.type}</p>
                        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">{leave.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSendMessageOpen(true)}
                          className="text-[#F59E0B] hover:text-[#D97706] p-1 rounded transition-colors"
                          aria-label="Send message"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                            leave.status === "Approved"
                              ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                              : "bg-[#FFEDD5] text-[#C2410C] border-[#EA580C]/20"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. ATTENDANCE TAB */}
        {activeTab === "Attendance" && (
          <div className="flex flex-col gap-6">
            {/* Top Attendance Records Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-[#111827]">Attendance Records</h2>
                <button
                  type="button"
                  onClick={() => setTimesheetModal("edit")}
                  className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-2xs"
                >
                  Regularize
                </button>
              </div>

              {/* User Meta Row */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt=""
                  className="size-10 rounded-full object-cover border border-black/10"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-[#111827]">Ankur Sharma</h4>
                  <p className="text-xs text-[#6B7280] font-medium">Relationship Manager</p>
                </div>
              </div>

              {/* Calendar Grid Matrix */}
              <div className="overflow-x-auto pb-2 scrollbar-none">
                <div className="flex items-center gap-2 min-w-max">
                  {attendanceDays.map((d, index) => {
                    return (
                      <div key={index} className="flex flex-col items-center gap-1.5 w-7 text-center">
                        <span className="text-[10px] font-bold text-[#9CA3AF]">{d.day}</span>
                        <span className="text-[10px] font-extrabold text-[#111827]">{d.week}</span>

                        {/* Status Icon */}
                        {d.status === "P" && (
                          <span className="size-6 rounded-full bg-[#DCFCE7] text-[#15803D] grid place-items-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                        {d.status === "X" && (
                          <span className="size-6 rounded-full bg-[#FEE2E2] text-[#DC2626] grid place-items-center text-xs font-bold">
                            ✕
                          </span>
                        )}
                        {d.status === "1/2" && (
                          <span className="size-6 rounded-full bg-[#FEF3C7] text-[#D97706] grid place-items-center text-[10px] font-black">
                            ½
                          </span>
                        )}
                        {d.status === "H" && (
                          <span className="size-6 rounded-full bg-[#F3E8FF] text-[#9333EA] grid place-items-center text-[10px] font-black">
                            H
                          </span>
                        )}
                        {d.status === "WO" && (
                          <span className="size-6 rounded-full bg-[#475569] text-white grid place-items-center text-[9px] font-bold">
                            WO
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Total Summary */}
                  <div className="flex flex-col items-center justify-center pl-4 border-l border-black/10">
                    <span className="text-[10px] font-extrabold text-[#6B7280] uppercase">Total</span>
                    <span className="text-sm font-black text-[#111827] mt-2">{Number.isInteger(attendancePresent) ? attendancePresent : attendancePresent.toFixed(1)}<span className="text-xs text-[#9CA3AF]">/{attendanceDays.length}</span></span>
                  </div>
                </div>
              </div>

              {/* Legend Footer */}
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

            {/* Bottom Attendance Policies Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#111827] mb-4">Attendance Policies</h3>

              <div className="space-y-4">
                {/* Policy 1: Working Hours */}
                <div className="bg-[#FFF8F7] border border-[#7A0A17]/15 rounded-xl p-4 border-l-4 border-l-[#7A0A17]">
                  <div className="flex items-center gap-2 mb-2 text-[#7A0A17] font-extrabold text-sm">
                    <Clock size={16} /> Working Hours
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
                    <li>General Shift: 9:00 AM - 6:00 PM (9 hours)</li>
                    <li>Lunch Break: 1:00 PM - 2:00 PM (1 hour)</li>
                    <li>Working Days: Monday - Friday</li>
                  </ul>
                </div>

                {/* Policy 2: Leave Policy */}
                <div className="bg-[#F4FBF7] border border-[#16A34A]/20 rounded-xl p-4 border-l-4 border-l-[#16A34A]">
                  <div className="flex items-center gap-2 mb-2 text-[#15803D] font-extrabold text-sm">
                    <Calendar size={16} /> Leave Policy
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
                    <li>Casual Leave: 12 days per annum (non-cumulative)</li>
                    <li>Sick Leave: 8 days per annum (cumulative up to 30 days)</li>
                    <li>Earned Leave: 18 days per annum (can carry forward 10 days)</li>
                    <li>Minimum 2 days notice required for leave applications</li>
                  </ul>
                </div>

                {/* Policy 3: Attendance Rules */}
                <div className="bg-[#F8FAFC] border border-black/10 rounded-xl p-4 border-l-4 border-l-[#6366F1]">
                  <div className="flex items-center gap-2 mb-2 text-[#4F46E5] font-extrabold text-sm">
                    <AlertTriangle size={16} /> Attendance Policy
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#374151] font-semibold list-disc list-inside">
                    <li>Minimum 80% attendance required per month</li>
                    <li>Late arrival after 9:15 AM requires regularization</li>
                    <li>3 consecutive absences without intimation may result in show-cause notice</li>
                    <li>Proxy attendance is strictly prohibited</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TIMESHEET TAB */}
        {activeTab === "Timesheet" && (
          <div className="flex flex-col gap-6">
            {/* Header User Session Bar */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt=""
                  className="size-11 rounded-full object-cover border border-black/10"
                />
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">Ankur Sharma</h3>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] font-medium mt-0.5">
                    <span>Relationship Manager</span>
                    <span className="bg-[#FCF5F6] text-[#7A0A17] font-bold text-[10px] px-2 py-0.5 rounded-md border border-[#7A0A17]/20">EMP00116</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 text-xs font-bold">
                <div>
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Date</p>
                  <p className="text-sm font-extrabold text-[#111827] mt-0.5">26-08-2026</p>
                </div>
                <div className="h-7 w-px bg-black/10" />
                <div>
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Login Time</p>
                  <p className="text-sm font-extrabold text-[#16A34A] mt-0.5">09:00 AM</p>
                </div>
                <div className="h-7 w-px bg-black/10" />
                <div>
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Logout Time</p>
                  <p className="text-sm font-extrabold text-[#DC2626] mt-0.5">02:00 PM</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTimesheetModal("edit")}
                  className="bg-[#7A0A17] text-white hover:bg-[#600712] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs ml-2"
                >
                  <Edit size={14} /> Edit
                </button>
              </div>
            </div>

            {/* Hourly Work Details Table */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#111827] mb-4">Hourly Work Details</h3>

              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <HourlyWorkTable />
                </table>

                {/* Subtotal System Hours Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#EFF6FF] text-[#1E40AF] font-extrabold text-xs border-t border-black/6">
                  <span>Total Hours Calculated by System</span>
                  <span className="text-sm">6.00h</span>
                </div>
              </div>

              {/* Manual Entry Add Controls */}
              <div className="mt-5 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setAddManualRowOpen(true)}
                  className="border border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start transition-all"
                >
                  <Plus size={14} /> Add Row (Manual Entry)
                </button>
                <p className="text-xs text-[#DC2626] font-semibold">
                  Note: All manual entries will require regularization or approval.
                </p>
              </div>

              {/* Manual Entries Table */}
              <div className="mt-4 overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <TimesheetManualTable />
                </table>

                {/* Comment Rejection Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#FFF1F2] border-t border-black/6 text-xs font-bold">
                  <span className="text-[#4B5563]">
                    <span className="text-[#3B82F6]">Comment:</span> We can't give you leave on that particular date.
                  </span>
                  <span className="text-[#DC2626] font-extrabold">Regularization Rejected</span>
                </div>

                {/* Subtotal Manual Hours Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#EFF6FF] text-[#1E40AF] font-extrabold text-xs border-t border-black/6">
                  <span>Total Hours Calculated by Manual</span>
                  <span className="text-sm">3.00h</span>
                </div>
              </div>
            </div>

            {/* Bottom Work Summary Footer */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-extrabold text-[#111827] mb-3">Hourly Work Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-black/8 rounded-xl p-3.5 text-center">
                  <p className="text-[11px] font-bold text-[#6B7280]">Total Working Hours</p>
                  <p className="text-lg font-black text-[#3B82F6] mt-1">9.00h</p>
                </div>
                <div className="border border-black/8 rounded-xl p-3.5 text-center">
                  <p className="text-[11px] font-bold text-[#6B7280]">Break Hours</p>
                  <p className="text-lg font-black text-[#F59E0B] mt-1">1.00h</p>
                </div>
                <div className="border border-black/8 rounded-xl p-3.5 text-center">
                  <p className="text-[11px] font-bold text-[#6B7280]">System Calculated</p>
                  <p className="text-lg font-black text-[#3B82F6] mt-1">6.00h</p>
                </div>
                <div className="border border-black/8 rounded-xl p-3.5 text-center">
                  <p className="text-[11px] font-bold text-[#6B7280]">Manual Calculated</p>
                  <p className="text-lg font-black text-[#3B82F6] mt-1">3.00h</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SALARY & PAYSLIP TAB */}
        {activeTab === "Salary & Payslip" && (
          <div className="flex flex-col gap-6">
            {/* Header Payroll Selector Bar */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-[#FCF5F6] text-[#7A0A17] grid place-items-center border border-[#7A0A17]/20">
                  <Receipt size={20} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">Ankur Sharma</h3>
                  <p className="text-xs text-[#6B7280] font-medium">December 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select className="appearance-none bg-white border border-black/12 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-[#374151] cursor-pointer outline-none">
                    <option>December 2026 Payroll (12/1/2026 - 12/31/2026)</option>
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
                  <p className="text-2xl font-black text-[#111827] mt-1">₹75,000.00</p>
                </div>
                <span className="size-10 rounded-full bg-[#FEE2E2] text-[#DC2626] grid place-items-center font-bold">
                  ₹
                </span>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#6B7280]">Gross Pay</p>
                  <p className="text-2xl font-black text-[#111827] mt-1">₹91,295.65</p>
                </div>
                <span className="size-10 rounded-full bg-[#DCFCE7] text-[#15803D] grid place-items-center">
                  <TrendingUp size={20} />
                </span>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#6B7280]">Net Salary</p>
                  <p className="text-2xl font-black text-[#111827] mt-1">₹74,033.15</p>
                </div>
                <span className="size-10 rounded-full bg-[#DCFCE7] text-[#15803D] grid place-items-center font-bold">
                  ₹
                </span>
              </div>
            </div>

            {/* Attendance Summary Bar */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-extrabold text-[#111827] mb-3 uppercase tracking-wider">Attendance Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#111827]">23</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Working Days</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#16A34A]">15</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Full Present</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#D97706]">6.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Half Days</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#9333EA]">0</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Holidays</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#3B82F6]">0.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Paid Leave</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#6B7280]">0.00</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Unpaid Leave</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#DC2626]">2</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">Absent</p>
                </div>
                <div className="border border-black/8 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-[#111827]">4.0h</p>
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
                <div className="flex items-center gap-2 mb-4 text-[#16A34A] font-extrabold text-sm">
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
                  <div className="py-3 flex justify-between text-sm font-black border-t-2 border-black/10">
                    <span className="text-[#111827]">Total Earnings</span>
                    <span className="text-[#16A34A]">₹107,000.00</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#DC2626] font-extrabold text-sm">
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
                  <div className="py-3 flex justify-between text-sm font-black border-t-2 border-black/10">
                    <span className="text-[#111827]">Total Deductions</span>
                    <span className="text-[#DC2626]">₹17,262.50</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Calculation Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-extrabold text-[#111827] mb-3">Final Calculation</h4>
              
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
                <div className="py-3 flex justify-between text-sm font-black">
                  <span>Gross Pay</span>
                  <span className="text-[#111827]">₹91,295.65</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#374151]">Component Deductions (Tax, PF etc.)</span>
                  <span className="text-[#DC2626]">- ₹17,262.50</span>
                </div>
                <div className="py-3 flex justify-between text-base font-black bg-[#FCF5F6] p-3 rounded-xl border border-[#7A0A17]/20 text-[#7A0A17]">
                  <span>Net Salary (Take Home)</span>
                  <span>₹74,033.15</span>
                </div>
              </div>
            </div>

            {/* Daily Attendance Records */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-extrabold text-[#111827] mb-3">Daily Attendance Records</h4>
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <DailyAttendanceTable />
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. INCENTIVES TAB */}
        {activeTab === "Incentives" && (
          <div className="flex flex-col gap-6">
            {/* Header Statement Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-[#111827]">My Incentive Statement</h2>
              <button
                type="button"
                onClick={() => toast.success("Incentive statement report generated!")}
                className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-2xs self-start"
              >
                + Download statement
              </button>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">1. Registration incentive</p>
                <p className="text-2xl font-black text-[#111827] mt-1">₹67,924</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">5 deals • slab 3-6% • net of GST</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">2. Meetings incentive</p>
                <p className="text-2xl font-black text-[#111827] mt-1">₹2,100</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">42 meetings • ₹50 tier</p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#6B7280]">3. Performance bonuses</p>
                <p className="text-2xl font-black text-[#111827] mt-1">₹1,420</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1 font-semibold">reviews, videos, photos • net of 1 penalty</p>
              </div>

              <div className="bg-[#FCF5F6] border border-[#7A0A17]/20 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-[#7A0A17]">Net payable</p>
                <p className="text-2xl font-black text-[#7A0A17] mt-1">₹71,444</p>
                <p className="text-[10px] text-[#7A0A17]/80 mt-1 font-bold">paid with July salary</p>
              </div>
            </div>

            {/* Section 1: Registration Incentive Amount */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#111827] mb-3">1. Incentive on registration amount</h3>
              
              {/* 4 Rule Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-[#6B7280] font-bold">Above ₹5,00,000</p>
                  <p className="text-base font-black text-[#7A0A17] mt-0.5">6%</p>
                </div>
                <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-[#6B7280] font-bold">Above ₹5,00,000</p>
                  <p className="text-base font-black text-[#7A0A17] mt-0.5">6%</p>
                </div>
                <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-[#6B7280] font-bold">Above ₹5,00,000</p>
                  <p className="text-base font-black text-[#7A0A17] mt-0.5">6%</p>
                </div>
                <div className="bg-[#FCF5F6] border border-[#7A0A17]/15 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-[#6B7280] font-bold">Above ₹5,00,000</p>
                  <p className="text-base font-black text-[#7A0A17] mt-0.5">6%</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <RegistrationIncentiveTable />
                </table>
              </div>
            </div>

            {/* Section 2: Meetings Incentive */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#111827]">2. Meetings incentive (monthly)</h3>
              <p className="text-2xl font-black text-[#111827] mt-1">42 <span className="text-xs text-[#6B7280] font-normal">qualifying meetings</span></p>

              {/* Progress Bar & Note */}
              <div className="mt-3 max-w-xl">
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
              <div className="mt-4 overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <MeetingsIncentiveTable />
                </table>
              </div>
            </div>

            {/* Section 3: Performance Incentives */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#111827] mb-3">3. Additional performance incentives</h3>
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <PerformanceIncentiveTable />
                </table>
              </div>
            </div>

            {/* Footer Summary Banner */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold">
              <p className="text-[#6B7280] max-w-2xl">
                Registration slabs are applied to values net of applicable meeting and bonus rewards are flat. All figures are indicative and settle with the July payroll cycle.
              </p>
              <div className="flex items-center gap-4 shrink-0 text-sm">
                <span>Gross incentive: <strong className="text-[#111827]">₹71,444</strong></span>
                <span className="text-[#7A0A17] font-black">Net payable (post-GST): ₹71,444</span>
              </div>
            </div>
          </div>
        )}

        {/* TRAININGS TAB */}
        {activeTab === "Trainings" && (
          <div className="flex flex-col gap-6">
            <TabToolbar search={searchTraining} onSearchChange={(v) => { setSearchTraining(v); setTrainingPage(1); }} />

            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold">
                      <SortableTh label="#" sortKey="id" unsortable className={HRMS_TH} />
                      <SortableTh label="Program" sortKey="program" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Date & Time" sortKey="dateTime" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Location" sortKey="location" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Status" sortKey="status" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Score" sortKey="score" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Attendance" sortKey="attendance" sort={trainingSort} onSort={toggleTrainingSort} className={HRMS_TH} />
                      <SortableTh label="Actions" sortKey="actions" unsortable className={HRMS_TH} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
                    {pagedTrainings.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-[#FAFAFB] transition-colors align-top">
                        <td className="px-4 py-3 font-bold text-[#6B7280]">{(trainingPage - 1) * trainingPageSize + idx + 1}</td>
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
                              <p className="font-extrabold">{t.score.toFixed(1)}%</p>
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
                              onClick={() => toast.info(`Viewing ${t.program}`)}
                              className="size-7 rounded-lg bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] grid place-items-center"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info(`Editing ${t.program}`)}
                              className="size-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] grid place-items-center"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info(`Removing ${t.program}`)}
                              className="size-7 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5] grid place-items-center"
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

              <div className="mt-4">
                <Pagination
                  page={trainingPage}
                  totalPages={trainingTotalPages}
                  totalItems={filteredTrainings.length}
                  pageSize={trainingPageSize}
                  itemLabel="training sessions"
                  onChange={setTrainingPage}
                />
              </div>
            </div>
          </div>
        )}

        {/* GOALS & REVIEWS TAB */}
        {activeTab === "Goals & Reviews" && (
          <div className="flex flex-col gap-6">
            <TabToolbar search={searchGoal} onSearchChange={(v) => { setSearchGoal(v); setGoalPage(1); }} />

            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <HrmsSortHead
                      sort={goalSort}
                      onSort={toggleGoalSort}
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
                              onClick={() => setExpandedRemarks((p) => ({ ...p, [g.id]: !p[g.id] }))}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3B82F6] mt-0.5"
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
                                onClick={() => toast.info(`Viewing ${g.title}`)}
                                className="size-7 rounded-lg bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] grid place-items-center"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.info(`Editing ${g.title}`)}
                                className="size-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] grid place-items-center"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.info(`Viewing progress history for ${g.title}`)}
                                className="size-7 rounded-lg bg-[#EEF0FE] text-[#6366F1] hover:bg-[#DCE0FC] grid place-items-center"
                              >
                                <BarChart3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.info(`Removing ${g.title}`)}
                                className="size-7 rounded-lg bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5] grid place-items-center"
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

              <div className="mt-4">
                <Pagination
                  page={goalPage}
                  totalPages={goalTotalPages}
                  totalItems={filteredGoals.length}
                  pageSize={goalPageSize}
                  itemLabel="employee goals"
                  onChange={setGoalPage}
                />
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "Documents" && (
          <div className="flex flex-col gap-6">
            <TabToolbar search={searchDocument} onSearchChange={(v) => { setSearchDocument(v); setDocumentPage(1); }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {pagedDocuments.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm border-t-4"
                  style={{ borderTopColor: DOC_BORDER_COLORS[idx % DOC_BORDER_COLORS.length] }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-extrabold text-[#111827] leading-snug">{doc.title}</h3>
                    <button
                      type="button"
                      onClick={() => toast.info(`Viewing ${doc.title}`)}
                      className="text-[#9CA3AF] hover:text-[#111] shrink-0"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mb-2.5">Last Update: {doc.updated}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20">
                        {doc.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#9CA3AF]">{doc.version}</span>
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB]/20 mb-3">
                    Published
                  </span>

                  <div className="flex items-center justify-between pt-3 border-t border-black/6">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
                        alt=""
                        className="size-6 rounded-full object-cover shrink-0"
                      />
                      <span className="text-[11px] font-bold text-[#374151] truncate">Company</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Download size={13} className="text-[#9CA3AF]" />
                        <span className="text-[11px] font-bold text-[#6B7280]">{doc.downloads}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toast.success(`Downloading ${doc.title}`)}
                        className="text-[#16A34A] hover:opacity-70"
                        aria-label="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info(`More options for ${doc.title}`)}
                        className="text-[#9CA3AF] hover:text-[#111]"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={documentPage}
              totalPages={documentTotalPages}
              totalItems={filteredDocuments.length}
              pageSize={documentPageSize}
              itemLabel="documents"
              onChange={setDocumentPage}
            />
          </div>
        )}

        {/* ASSET TAB */}
        {activeTab === "Asset" && (
          <div className="flex flex-col gap-6">
            <TabToolbar search={searchAsset} onSearchChange={(v) => { setSearchAsset(v); setAssetPage(1); }} />

            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <div className="overflow-x-auto border border-black/8 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <HrmsSortHead
                      sort={assetSort}
                      onSort={toggleAssetSort}
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
                    {pagedAssets.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-[#FAFAFB] transition-colors">
                        <td className="px-4 py-3 font-bold text-[#6B7280]">{(assetPage - 1) * assetPageSize + idx + 1}</td>
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
                                className="size-7 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] grid place-items-center"
                                aria-label="Reassign"
                              >
                                <img src={yellowLoopIcon} alt="" className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.success(`${a.name} marked as returned`)}
                                className="size-7 rounded-lg bg-[#FEE2E2] hover:bg-[#FCA5A5] grid place-items-center"
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

              <div className="mt-4">
                <Pagination
                  page={assetPage}
                  totalPages={assetTotalPages}
                  totalItems={filteredAssets.length}
                  pageSize={assetPageSize}
                  itemLabel="assets"
                  onChange={setAssetPage}
                />
              </div>
            </div>
          </div>
        )}

        {/* Placeholder View for remaining tabs */}
        {!["Summary", "Attendance", "Timesheet", "Salary & Payslip", "Incentives", "Trainings", "Goals & Reviews", "Documents", "Asset"].includes(activeTab) && (
          <div className="bg-white border border-black/8 rounded-2xl p-12 text-center my-6 shadow-sm">
            <div className="size-16 rounded-2xl bg-[#FCF5F6] border border-[#7A0A17]/15 text-[#7A0A17] grid place-items-center mx-auto mb-4">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-[#111827]">{activeTab} Details</h3>
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
            <h3 className="text-lg font-bold text-[#111] mb-2">Add Manual Timesheet Entry</h3>
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
              <span className="size-10 rounded-xl bg-[#FCF5F6] text-[#7A0A17] grid place-items-center">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#111]">Report an Issue</h3>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setNoticeModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="size-10 rounded-xl bg-[#FCF5F6] text-[#7A0A17] grid place-items-center">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#111]">Official Warning Notice</h3>
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
              <span className="size-8 rounded-lg bg-white text-[#D97706] grid place-items-center shrink-0">
                <Clock size={16} />
              </span>
              <div>
                <p className="font-bold text-[#111827]">General</p>
                <p className="text-[#6B7280]">9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg bg-white text-[#D97706] grid place-items-center shrink-0">
                <Calendar size={16} />
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
              <p className="font-extrabold text-[#111827] mt-1">8 hours</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <Coffee size={12} /> Break Duration
              </span>
              <p className="font-extrabold text-[#111827] mt-1">1 hour</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <AlertCircle size={12} /> Grace Period
              </span>
              <p className="font-extrabold text-[#111827] mt-1">15 minutes</p>
            </div>
            <div className="border border-black/8 rounded-xl p-3">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF] font-bold uppercase text-[10px]">
                <CheckCircle2 size={12} /> Status
              </span>
              <p className="font-extrabold text-[#16A34A] mt-1">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h3 className="font-extrabold text-[#111827]">Shift Change Request</h3>
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
        iconBg="#DCFCE7"
        iconColor="#15803D"
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

      {/* 4. Leaderboard Modal */}
      {leaderboardModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setLeaderboardModalOpen(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="size-10 rounded-xl bg-[#7A0A17] text-white grid place-items-center">
                <Trophy size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#111]">This Month Leaderboard</h3>
                <p className="text-xs text-[#6B7280]">Top Performing Team Members</p>
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {LEADERBOARD_MEMBERS.map((member) => (
                <div
                  key={member.rank}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    member.isYou ? "bg-[#FCF5F6] border-[#7A0A17]/30" : "bg-[#FAFAFB] border-black/6"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-[#7A0A17] w-4">#{member.rank}</span>
                    <img src={member.avatar} alt="" className="size-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-[#111] flex items-center gap-1.5">
                        {member.isYou && <YouHandIcon />}
                        {member.name}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">{member.location}</p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-[#111]">{member.xp}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setLeaderboardModalOpen(false)} className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                <ImageIcon size={14} />
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
        iconBg="#E7F8EF"
        iconColor="#16A34A"
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
                  <span className="inline-flex items-center gap-2 text-[#3B82F6] font-semibold">
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
        onClose={() => { setApplyLeaveOpen(false); setLeaveMenuOpen(false); }}
        width="max-w-lg"
        title="Leave Balances"
      >
        <div className="-mt-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
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
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLeaveMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-black/5 transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>
            {leaveMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-44 bg-white border border-black/10 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setLeaveMenuOpen(false); setApplyLeaveFormOpen(true); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors"
                >
                  <Plus size={14} className="text-[#7A0A17]" /> Apply for Leave
                </button>
              </div>
            )}
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
        subtitle="Available Balance: 15 days"
        icon={<Calendar size={17} />}
        iconBg="#FDE9EC"
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
            <button type="submit" form="apply-leave-form" className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl font-bold text-xs">
              Submit Application
            </button>
          </>
        }
      >
        <form id="apply-leave-form" onSubmit={(e) => { handleApplyLeave(e); setApplyLeaveFormOpen(false); }} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">Leave Type</label>
            <select
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              className="w-full border border-black/15 rounded-xl p-2.5 font-semibold outline-none focus:border-[#7A0A17]"
            >
              {LEAVE_BALANCE_TYPES.map((lt) => (
                <option key={lt.type} value={lt.type}>{lt.type}</option>
              ))}
            </select>
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
