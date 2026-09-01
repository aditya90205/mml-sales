import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Star,
  UserCheck,
  Video,
  Camera,
  CalendarCheck,
  TrendingUp,
  Send,
  Paperclip,
  Mic,
  RotateCcw,
  History,
  Activity,
  Plus,
  RefreshCw,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Trash2,
  Edit3,
  X,
  Bell,
  Clock,
  LogOut,
  User,
  Settings,
  CheckCheck,
} from "lucide-react";
import TopBar from "../components/layout/TopBar";

// ─── Constants ────────────────────────────────────────────────────────────────

const USER = {
  name: "Ankur Sharma",
  role: "Sales Manager",
  email: "ankur@makemylagan.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
};

const PERIOD_OPTIONS = [
  { id: "this_month",    label: "This Month" },
  { id: "last_month",    label: "Last Month" },
  { id: "this_quarter",  label: "This Quarter" },
  { id: "this_year",     label: "This Year" },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    actor: "Rahul Sharma",
    title: "New lead assigned",
    message: "A high-value lead from Delhi has been assigned to you.",
    time: "2 min ago",
    unread: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 2,
    actor: "Priya Verma",
    title: "Follow-up reminder",
    message: "You have a scheduled follow-up call with Ananya Gupta today.",
    time: "15 min ago",
    unread: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 3,
    actor: "System",
    title: "Approval required",
    message: "Discount request from Vikram Chawla is awaiting your approval.",
    time: "1 hr ago",
    unread: false,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
  },
];

const STATS = [
  {
    label: "Total Clients",
    value: "34",
    delta: "+4% vs Month",
    deltaUp: true,
    icon: Users,
    iconBg: "#fde8e8",
    iconColor: "#c0392b",
  },
  {
    label: "Total Google Reviews",
    value: "12",
    delta: "+8% Last Month",
    deltaUp: true,
    icon: Star,
    iconBg: "#fff8e1",
    iconColor: "#f59e0b",
  },
  {
    label: "Profiles Captured",
    value: "148",
    delta: "+15.3% this Month",
    deltaUp: true,
    icon: UserCheck,
    iconBg: "#e8f4fd",
    iconColor: "#2980b9",
  },
  {
    label: "Client Testimonial Videos",
    value: "7",
    delta: "18.4% Conversion",
    deltaUp: null,
    icon: Video,
    iconBg: "#e8fdf4",
    iconColor: "#27ae60",
  },
  {
    label: "Wedding Pictures Uploaded",
    value: "6",
    delta: null,
    icon: Camera,
    iconBg: "#f3e8fd",
    iconColor: "#8e44ad",
  },
  {
    label: "Total Meetings Conducted",
    value: "56",
    delta: "14 Calls  |  12 Video Calls",
    deltaUp: null,
    icon: CalendarCheck,
    iconBg: "#fef3e2",
    iconColor: "#e67e22",
  },
];

const ASSESSMENT_TAGS = ["Summary of the month", "Tomorrow Meetings", "Yesterday Feedbacks"];

const AI_PROMPTS = [
  { id: 1, icon: "🚀", text: "Summary of the week" },
  { id: 2, icon: "🎯", text: "Today's top priority" },
  { id: 3, icon: "📝", text: "Make summary notes of attached document" },
];

// Funnel: colours match the reference image exactly
// P0 light-steel-blue → P1 medium-blue → P2 tan/gold → P3 tan → P4 grey → P5 dark-red → P6 darker-red
const FUNNEL_STAGES = [
  { id: "P0", label: "New",                   value: 1248, pct: null,  color: "#a8c4e0" },
  { id: "P1", label: "Qualified",             value: 842,  pct: "67%", color: "#5b8fc9" },
  { id: "P2", label: "Profile Creation",      value: 421,  pct: "33%", color: "#c9a96e" },
  { id: "P3", label: "Video call/Visit",      value: 218,  pct: "17%", color: "#b89050" },
  { id: "P4", label: "Negotiation",           value: 96,   pct: "8%",  color: "#9a9a9a" },
  { id: "P5", label: "Closed - Payment Done", value: 42,   pct: "3%",  color: "#8b1a1a" },
  { id: "P6", label: "Post Sale Onboarding",  value: 24,   pct: "2%",  color: "#5a0a0a" },
];

const PRIORITY_ITEMS = [
  "5 high-value leads waiting for follow-up.",
  "₹18,400 in discount approvals pending across 3 requests.",
  "2 client profiles awaiting completion before their meetings.",
  "You're at 74% of this month's ₹2.5L target.",
  "1 urgent complaint flagged — needs a same-day response.",
  "AI recommends contacting clients Ananya Verma and Vikram Chawla today — both are close to closing.",
];

const PENDING_TASKS = [
  {
    type: "Leave Request",
    description: "Casual Leave (2 Days)",
    requestedOn: "01 Jun 2026",
    dueDate: "01 Jun 2026",
    status: "pending",
    statusLabel: "Pending",
  },
  {
    type: "Discount Request",
    description: "Notice Period - 30 Days",
    requestedOn: "01 Jun 2026",
    dueDate: "01 Jun 2026",
    status: "review",
    statusLabel: "HR Review",
  },
  {
    type: "Send Profiles",
    description: "Promotion to Team Lead Letter",
    requestedOn: "01 Jun 2026",
    dueDate: "01 Jun 2026",
    status: "approved",
    statusLabel: "Approved Required",
  },
];

const STATUS_STYLES = {
  pending:  "bg-[#FFF0E5] text-[#F97C3B]",
  review:   "bg-[#E5F2FF] text-[#0085FF]",
  approved: "bg-[#E5FAEC] text-[#00C142]",
  rejected: "bg-[#fde5eb] text-[#F4124D]",
};

// ─── Dashboard header sub-components ─────────────────────────────────────────

function PeriodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PERIOD_OPTIONS.find((o) => o.id === value) ?? PERIOD_OPTIONS[0];

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#515052] border border-black/15 rounded-xl px-3 py-2 bg-white hover:bg-[#fafafa] transition-colors"
      >
        <Clock size={13} className="text-[#8f95a5]" />
        {selected.label}
        <ChevronDown size={13} className={`text-[#8f95a5] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] bg-white border border-black/10 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                opt.id === value
                  ? "bg-[#fef7f7] text-[#8b0000] font-semibold"
                  : "text-[#515052] hover:bg-[#f9f8f6]"
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

function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);
  const unread = notifications.filter((n) => n.unread).length;

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
        className="relative p-2 rounded-xl text-[#515052] hover:bg-black/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#8b0000] ring-1 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white border border-black/10 rounded-2xl shadow-xl z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            <div>
              <p className="text-sm font-semibold text-black">Notifications</p>
              {unread > 0 && <p className="text-[11px] text-[#6f7886] mt-0.5">{unread} unread</p>}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                className="flex items-center gap-1 text-xs font-medium text-[#8b0000] hover:underline"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-black/5">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${n.unread ? "bg-[#fef7f7] hover:bg-[#fceeee]" : "hover:bg-[#f9f8f6]"}`}
              >
                <img src={n.avatar} alt="" className="size-9 rounded-full object-cover shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-black leading-snug">
                      <span className="font-semibold">{n.actor}</span>
                      <span className="text-[#454545]"> · {n.title}</span>
                    </p>
                    {n.unread && <span className="size-2 rounded-full bg-[#8b0000] shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-[#6f7886] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-[#8f95a5] mt-1">{n.time}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-black/10">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate("/notifications"); }}
              className="w-full py-3 text-sm font-semibold text-[#8b0000] hover:bg-[#fef7f7] transition-colors"
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-black/5 transition-colors"
      >
        <img src={USER.avatar} alt={USER.name} className="size-8 rounded-full object-cover" />
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{USER.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#4ade80]" />
            <p className="text-[10px] text-[#8f95a5] leading-tight">Online · {USER.role}</p>
          </div>
        </div>
        <ChevronDown size={13} className="text-[#8f95a5] hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-black/10 rounded-2xl shadow-xl z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10">
            <p className="text-sm font-semibold text-black">{USER.name}</p>
            <p className="text-xs text-[#6f7886] mt-0.5 truncate">{USER.email}</p>
          </div>
          <button type="button" onClick={() => { setOpen(false); navigate("/profile"); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-[#f9f8f6] transition-colors">
            <User size={15} /> Profile
          </button>
          <button type="button" onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-[#f9f8f6] transition-colors">
            <Settings size={15} /> Settings
          </button>
          <div className="border-t border-black/10">
            <button type="button" onClick={() => { setOpen(false); navigate("/login"); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#df264f] hover:bg-[#fef1f4] transition-colors">
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="size-10 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: stat.iconBg }}>
          <Icon size={19} style={{ color: stat.iconColor }} strokeWidth={1.75} />
        </span>
        {stat.deltaUp === true && stat.delta && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#e5faec] text-[#00c142] whitespace-nowrap">
            {stat.delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1a1a1a] leading-tight">{stat.value}</p>
        <p className="text-xs text-[#6f7886] mt-0.5 leading-snug">{stat.label}</p>
        {stat.deltaUp === null && stat.delta && (
          <p className="text-[11px] text-[#8b0000] font-semibold mt-1">{stat.delta}</p>
        )}
      </div>
    </div>
  );
}

// ─── Assessment banner ────────────────────────────────────────────────────────

function AssessmentBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-gradient-to-r from-[#fff8e6] to-[#fffdf5] border border-[#f5d97a]/60 rounded-2xl px-5 py-3.5 flex items-start gap-3">
      <span className="size-7 rounded-lg bg-[#f59e0b]/15 grid place-items-center shrink-0 mt-0.5">
        <TrendingUp size={14} className="text-[#f59e0b]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-[#92620a] uppercase tracking-wide mb-1">
          My Overall Assessment
        </p>
        <p className="text-sm text-[#5a4010] leading-relaxed">
          You are pacing well against target and currently{" "}
          <span className="font-semibold text-[#8b0000]">holding #2</span> on the leaderboard,
          showing strong and consistent performance. However,{" "}
          <span className="font-semibold text-[#e65c00]">2 high-value</span> leads are approaching
          their 24-hour reassignment window. Prioritise those calls before anything else today.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 p-1 text-[#92620a]/40 hover:text-[#92620a] rounded-lg hover:bg-black/5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

function AIAssistant() {
  const [message, setMessage] = useState("");
  return (
    <div className="bg-white border border-black/10 rounded-2xl flex flex-col">
      {/* header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-black/8">
        <span className="size-7 rounded-lg bg-[#fde8e8] grid place-items-center shrink-0">
          <Sparkles size={14} className="text-[#8b0000]" />
        </span>
        <h2 className="text-sm font-bold text-[#1a1a1a]">Your personal assistant — Ask anything</h2>
      </div>

      <div className="px-5 pt-4 pb-3">
        <p className="text-[10px] font-bold text-[#8f95a5] uppercase tracking-widest mb-2">
          Start a conversation
        </p>
        {/* action row */}
        <div className="flex items-center gap-3 mb-3">
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b0000] bg-[#fde8e8] px-2.5 py-1.5 rounded-lg hover:bg-[#fbd5d5] transition-colors">
            <Plus size={11} /> Create
          </button>
          {[
            { icon: RefreshCw, label: "Refresh" },
            { icon: History,   label: "History" },
            { icon: Activity,  label: "Activity" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="inline-flex items-center gap-1 text-xs text-[#515052] hover:text-[#1a1a1a] transition-colors">
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>

        {/* prompt rows */}
        <div className="flex flex-col gap-1.5">
          {AI_PROMPTS.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-black/10 bg-[#fafafa] hover:bg-[#f5f5f7] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm leading-none">{p.icon}</span>
                <span className="text-sm text-[#1a1a1a] truncate">{p.text}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-1 rounded text-[#6f7886] hover:text-[#1a1a1a] hover:bg-black/8 transition-colors">
                  <Edit3 size={11} />
                </button>
                <button className="p-1 rounded text-[#6f7886] hover:text-[#df264f] hover:bg-[#fde8e8] transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ASSESSMENT_TAGS.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-[#515052] bg-[#f1f1f4] px-2.5 py-1 rounded-lg">
              {tag}
              <button className="ml-0.5 text-[#8f95a5] hover:text-[#1a1a1a]"><X size={9} /></button>
            </span>
          ))}
          <button className="text-xs text-[#0085ff] font-medium hover:underline px-1">See All →</button>
        </div>
      </div>

      {/* Today's Priority */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-[10px] font-bold text-[#8f95a5] uppercase tracking-widest mb-2">
          Today's Priority
        </p>
        <ul className="flex flex-col gap-1.5">
          {PRIORITY_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#333]">
              <span className="size-1.5 rounded-full bg-[#8b0000] shrink-0 mt-[7px]" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2 border-t border-black/8 shrink-0">
        <div className="flex items-center gap-2 border border-black/15 rounded-xl px-3 py-2 bg-[#fafafa] focus-within:ring-2 focus-within:ring-[#8b0000]/20 focus-within:border-[#8b0000] transition-all">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask MML anything..."
            className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#aaa] outline-none min-w-0"
          />
          <div className="flex items-center gap-0.5 shrink-0">
            {[Paperclip, RotateCcw, Mic].map((Icon, i) => (
              <button key={i} className="p-1.5 text-[#8f95a5] hover:text-[#515052] rounded-lg hover:bg-black/5 transition-colors">
                <Icon size={13} />
              </button>
            ))}
            <button className="inline-flex items-center gap-1 ml-1 px-3 py-1.5 bg-[#8b0000] text-white text-xs font-semibold rounded-lg hover:bg-[#6e0000] transition-colors">
              Ask anything <Send size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sales Funnel — visual trapezoid layers ───────────────────────────────────

function SalesFunnelCard() {
  // Each stage renders as a centered trapezoid-like div.
  // Width shrinks from 100% → ~30% as stages go down,
  // matching the visual cone in the reference image.
  const totalStages = FUNNEL_STAGES.length;

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-[#1a1a1a]">Sales Funnel</h2>
        <Link to="/sales/funnel" className="text-xs text-[#0085ff] font-medium hover:underline">
          View All
        </Link>
      </div>

      {/* Two-column layout: labels left, funnel right */}
      <div className="flex gap-4 flex-1 items-start">

        {/* Left: stage labels */}
        <div className="flex flex-col w-[190px] shrink-0">
          {FUNNEL_STAGES.map((stage, i) => {
            // Each label row height matches the funnel layer
            const rowH = 40 + (i === 0 ? 4 : 0);
            return (
              <div
                key={stage.id}
                className="flex items-center gap-2"
                style={{ height: rowH, marginBottom: i < totalStages - 1 ? 3 : 0 }}
              >
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0 min-w-[26px] text-center"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.id}
                </span>
                <span className="text-xs text-[#333] leading-tight truncate">{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right: actual funnel shape */}
        <div className="flex-1 flex flex-col items-center justify-start gap-[3px] min-w-0">
          {FUNNEL_STAGES.map((stage, i) => {
            // Percentage of full width: starts at 100%, narrows each step
            // Using a smooth linear taper: top = 100%, bottom-most = 30%
            const topPct  = 100 - (i / totalStages) * 70;
            const botPct  = 100 - ((i + 1) / totalStages) * 70;
            const rowH    = 40 + (i === 0 ? 4 : 0);

            return (
              <div
                key={stage.id}
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  width: "100%",
                  height: rowH,
                }}
              >
                {/*
                  Trapezoid via clip-path polygon:
                  top-left inset to (100-topPct)/2 %,
                  top-right inset to same from right,
                  bottom corners follow botPct
                */}
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: stage.color,
                    clipPath: `polygon(
                      ${(100 - topPct) / 2}% 0%,
                      ${100 - (100 - topPct) / 2}% 0%,
                      ${100 - (100 - botPct) / 2}% 100%,
                      ${(100 - botPct) / 2}% 100%
                    )`,
                  }}
                />
                {/* value label — centered, z above clip */}
                <span className="absolute text-white text-[11px] font-bold drop-shadow-sm select-none">
                  {stage.value.toLocaleString()}
                  {stage.pct ? ` (${stage.pct})` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: avg conversion */}
      <div className="mt-4 pt-3 border-t border-black/8 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-lg bg-[#e5f2ff] grid place-items-center shrink-0">
            <TrendingUp size={12} className="text-[#0085ff]" />
          </span>
          <div>
            <p className="text-[10px] text-[#8f95a5]">Avg. Time to Convert Lead</p>
            <p className="text-xs font-bold text-[#1a1a1a]">18.6 days</p>
            <p className="text-[10px] text-[#8f95a5]">P0 to P5 (Payment Done)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-lg bg-[#fde8e8] grid place-items-center shrink-0">
            <CalendarCheck size={12} className="text-[#8b0000]" />
          </span>
          <div>
            <p className="text-[10px] text-[#8f95a5]">&nbsp;</p>
            <p className="text-xs font-bold text-[#1a1a1a]">23.4 days</p>
            <p className="text-[10px] text-[#8f95a5]">P0 to P6 (Onboarding)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pending tasks ────────────────────────────────────────────────────────────

function PendingTasksCard() {
  return (
    <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/8">
        <div className="flex items-center gap-2">
          <ClipboardList size={15} className="text-[#6f7886]" />
          <h2 className="text-sm font-bold text-[#1a1a1a]">Pending Task &amp; Approvals</h2>
          <span className="text-xs font-semibold text-[#6f7886] bg-[#f1f1f4] rounded-md px-2 py-0.5">148</span>
        </div>
        <Link to="/tasks" className="text-xs text-[#0085ff] font-medium hover:underline flex items-center gap-0.5">
          View All <ChevronRight size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/8">
              {["Type", "Description", "Requested On", "Due Date", "Status"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-[#8f95a5] uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PENDING_TASKS.map((task, i) => (
              <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-[#fafafa] transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#1a1a1a] text-xs whitespace-nowrap">{task.type}</td>
                <td className="px-5 py-3.5 text-[#6f7886] text-xs">{task.description}</td>
                <td className="px-5 py-3.5 text-[#6f7886] text-xs whitespace-nowrap">{task.requestedOn}</td>
                <td className="px-5 py-3.5 text-[#6f7886] text-xs whitespace-nowrap">{task.dueDate}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${STATUS_STYLES[task.status]}`}>
                    {task.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [period, setPeriod] = useState("this_month");

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Slim search-only top bar */}
      <TopBar />

      {/* ── Dashboard page header ── */}
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-0 flex-wrap">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight leading-tight">
            {getGreeting()},{" "}
            <span className="text-[#8b0000]">{USER.name}</span>
          </h1>
          <p className="text-xs text-[#8f95a5] mt-0.5">
            Here's what's happening with your leads today.
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          <PeriodSelect value={period} onChange={setPeriod} />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8b0000] text-white text-sm font-semibold hover:bg-[#6e0000] active:bg-[#5a0000] transition-colors"
          >
            <Plus size={14} />
            Create Lead
          </button>
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="px-6 pt-4 pb-8 flex flex-col gap-5">
        {/* Assessment banner */}
        <AssessmentBanner />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* AI Assistant + Sales Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AIAssistant />
          <SalesFunnelCard />
        </div>

        {/* Pending Tasks */}
        <PendingTasksCard />
      </div>
    </div>
  );
}
