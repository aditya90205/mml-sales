import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  History,
  Activity,
  Users,
  UserRoundCheck,
  Video,
  ArrowRight,
  X,
  Edit3,
  Trash2,
  Paperclip,
  Copy,
  Download,
  Mic,
  Send,
  CalendarClock,
  History as HistoryIcon,
  ScanFace,
  Target,
  Star,
  Flag,
  Phone,
  PhoneOff,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  SlidersHorizontal,
  TrendingUp,
  PieChart as PieChartIcon,
  Megaphone,
  MessageCircle,
  ArrowUpRight,
  Info,
  CalendarDays,
  Globe,
  Share2,
  Smartphone,
  Store,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ReferenceLine,
  LabelList,
  Label,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TopBar, { USER } from "../components/layout/TopBar";
import funnelImg from "../assets/pipeline.png";
import contestIcon from "../assets/contest.png";
import leaderboardIcon from "../assets/leaderboard.png";

/* ───────────────────────── Data ───────────────────────── */

const PERIOD_OPTIONS = [
  { id: "this_month",   label: "This Month" },
  { id: "last_month",   label: "Last Month" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "this_year",    label: "This Year" },
];

const STATS = [
  { label: "Total Clients",             value: "34",  note: "+10% vs Month",          noteTone: "green", icon: Users,           bg: "#FDECEE", fg: "#E8395B" },
  { label: "Total Google Reviews",      value: "12",  note: "+10% Last Month",        noteTone: "green", icon: Users,           bg: "#EEF0FE", fg: "#6366F1" },
  { label: "Biodata Captured",          value: "148", note: "+15.3% this Month",      noteTone: "green", icon: Users,           bg: "#FDECEE", fg: "#E8395B" },
  { label: "Client Testimonial Videos", value: "7",   note: "18.4% Conversion",       noteTone: "green", icon: UserRoundCheck,  bg: "#E7F8EF", fg: "#16A34A" },
  { label: "Wedding Pictures Uploaded", value: "6",   note: null,                     noteTone: null,    icon: UserRoundCheck,  bg: "#E7F8EF", fg: "#16A34A" },
  { label: "Total Meetings Conducted",  value: "56",  note: "14 Calls  |  12 Video Calls", noteTone: "grey", icon: Users,       bg: "#FFF3E4", fg: "#F59E0B" },
];

const AI_ACTIONS = [
  { label: "Create",   icon: Plus,      color: "#16A34A" },
  { label: "Refresh",  icon: RefreshCw, color: "#3B82F6" },
  { label: "History",  icon: History,   color: "#E8395B" },
  { label: "Activity", icon: Activity,  color: "#8B5CF6" },
];

const AI_PROMPTS = [
  { id: 1, text: "Summary of the week" },
  { id: 2, text: "Today's top priority" },
  { id: 3, text: "Make summary notes of attached document" },
];

const AI_TAGS = ["Summary of the month", "Tomorrow Meetings", "Yesterday Feedbacks"];

const PRIORITY_ITEMS = [
  "5 high-value leads waiting for follow-up",
  "₹18,400 in discount approvals pending across 3 requests",
  "2 client profiles awaiting completion before their meetings",
  "You're at 74% of this month's ₹2.5L target",
  "1 urgent complaint flagged — needs a same-day response",
  "AI recommends contacting clients Ananya Verma and Vikram Chawla today — both are close to closing",
];

/**
 * Funnel stage counts. Percentages are derived from P0 at render time,
 * so changing a `value` here (or feeding these from the API) updates the
 * labels drawn over the funnel artwork automatically.
 */
const FUNNEL_STAGES = [
  { id: "P0", label: "New",                   value: 1248 },
  { id: "P1", label: "Qualified",             value: 842 },
  { id: "P2", label: "Profile Creation",      value: 421 },
  { id: "P3", label: "Video call/Visit",      value: 218 },
  { id: "P4", label: "Negotiation",           value: 96 },
  { id: "P5", label: "Closed - Payment Done", value: 42 },
  { id: "P6", label: "Post Sale Onboarding",  value: 24 },
];

/**
 * Geometry measured directly off `pipeline.png` (733 × 482).
 * Each cone band's vertical centre, as a % of image height. The horizontal
 * centre of the cone to the right of the white slash is a constant 66.6%.
 */
const BAND_TOP_PCT = [18.26, 30.6, 42.84, 55.19, 67.74, 80.29, 93.26];
const BAND_LEFT_PCT = 66.6;

const CONVERT_TIMES = [
  { days: "18.6", scope: "P0 to P5 (Payment Done)" },
  { days: "23.4", scope: "P0 to P6 (Onboarding)" },
];

const PENDING_TASKS = [
  { type: "Leave Request",    description: "Casual Leave (2 Days)",          requestedOn: "01 Jun 2026", dueDate: "01 Jun 2026", status: "pending",  statusLabel: "Pending" },
  { type: "Discount Request", description: "Notice Period - 30 Days",        requestedOn: "01 Jun 2026", dueDate: "01 Jun 2026", status: "review",   statusLabel: "HR Review" },
  { type: "Send Profiles",    description: "Promotion to Team Lead Letter",  requestedOn: "01 Jun 2026", dueDate: "01 Jun 2026", status: "approved", statusLabel: "Approved Required" },
];

const STATUS_STYLES = {
  pending:  "bg-[#FFF1E6] text-[#F97C3B]",
  review:   "bg-[#E8F2FE] text-[#3B82F6]",
  approved: "bg-[#E4F8EC] text-[#16A34A]",
  rejected: "bg-[#FDECEE] text-[#E8395B]",
};

const ACTIVE_CONTESTS = [
  { id: 1, title: "Mega Lead Hunter", desc: "Generate maximum qualified leads and top the dashboard", timeLeft: "3d 12h Left", timeTone: "text-[#E8395B]", prize: "₹25,000" },
  { id: 2, title: "Sales Booster",    desc: "Close more deals and boost your sales numbers this month", timeLeft: "5d 18h Left", timeTone: "text-[#F59E0B]", prize: "₹15,000" },
  { id: 3, title: "Conversion King",  desc: "Convert your meetings into successful memberships",        timeLeft: "7d 27h Left", timeTone: "text-[#16A34A]", prize: "₹35,000" },
];

const LEADERBOARD = [
  { rank: 1, name: "Kuhu Sharma",   role: "Senior Sales Manager", branch: "Rajouri Garden",   xp: 102 },
  { rank: 2, name: "Satish Pal",    role: "Senior Sales Manager", branch: "Gurugram",         xp: 98 },
  { rank: 3, name: "Aditya Verma",  role: "Senior Sales Manager", branch: "Rajouri Garden",   xp: 94 },
  { rank: 5, name: "Ankur Sharma",  role: "Senior Sales Manager", branch: "South Extension",  xp: 90, self: true },
];

const RANK_MEDAL_COLORS = { 1: "#F59E0B", 2: "#9CA3AF", 3: "#B87333" };

const PRIORITY_STYLES = {
  High:   { color: "#E8395B", bg: "bg-[#FDECEE]" },
  Medium: { color: "#F59E0B", bg: "bg-[#FFF3E4]" },
  Low:    { color: "#16A34A", bg: "bg-[#E7F8EF]" },
};

const LEAD_DOT_COLORS = ["#E8395B", "#F59E0B", "#3B82F6", "#E8395B", "#16A34A", "#F59E0B", "#3B82F6"];

const MY_LEADS = [
  { id: "MML-ID-D-10428", name: "Kuhu Sharma",    starred: true,  owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P0 - New",              stageTone: null,   priority: "High",   leadScore: 8.5, profileCompletion: 100, timeAtStage: "2 Days", source: "Outbound Calls",   followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start at 12:00", lost: false },
  { id: "MML-ID-D-10428", name: "Harshit Sharma", starred: false, owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P1 - Qualified",        stageTone: "Lost", priority: "High",   leadScore: 7.0, profileCompletion: 50,  timeAtStage: "2 Days", source: "Brand Walking",    followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start at 12:00", lost: true },
  { id: "MML-ID-D-10428", name: "Ankur Sharma",   starred: false, owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P2 - Profile Creation", stageTone: null,   priority: "Medium", leadScore: 7.5, profileCompletion: 75,  timeAtStage: "2 Days", source: "Community Events", followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start at 12:00", lost: false },
  { id: "MML-ID-D-10428", name: "Aditya Sharma",  starred: true,  owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P3 - Video Call/Visit", stageTone: "Cold", priority: "Medium", leadScore: 8.5, profileCompletion: 85,  timeAtStage: "2 Days", source: "Channel Partner",  followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start at 12:00", lost: false },
  { id: "MML-ID-D-10428", name: "Vivek Sharma",   starred: false, owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P4 - Negotiation",      stageTone: null,   priority: "Low",    leadScore: 9.0, profileCompletion: 90,  timeAtStage: "2 Days", source: "Reference - Satish", followUp: "6 HRS Left",  followUpTone: "text-[#E8395B]", followUpNote: "Start at 12:00", lost: false },
  { id: "MML-ID-D-10428", name: "Rohit Sharma",   starred: false, owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P5 - Profile Creation", stageTone: "Won",  priority: "Medium", leadScore: 7.5, profileCompletion: 75,  timeAtStage: "2 Days", source: "Manual Sourcing",  followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start at 12:00", lost: false },
  { id: "MML-ID-D-10428", name: "Virat Sharma",   starred: false, owner: "Aditya Sharma", ownerRole: "Sales Manager | Rajouri Garden", stage: "P6 - Service Handover", stageTone: null,   priority: "Low",    leadScore: 8.5, profileCompletion: 90,  timeAtStage: "2 Days", source: "Online - Insta",   followUp: "24 HRS Left", followUpTone: "text-[#6B7280]", followUpNote: "Start at 12:00", lost: false },
];

const GOALS_STATS = [
  { label: "Actual Revenue",    value: "₹1.63 Cr", note: "65% of Target",  noteColor: "#3B82F6" },
  { label: "Projected Revenue", value: "₹1.55 Cr", note: "102% of Target", noteColor: "#8B5CF6" },
  { label: "Target (4 Weeks)",  value: "₹2.50 Cr", note: "Total Target",   noteColor: "#0D9488" },
  { label: "Incentive (4 Weeks)", value: "₹2.29Cr", note: "Total Incentive", noteColor: "#F59E0B" },
  { label: "Total pack sold",   value: "15",        note: "Subscription Sold", noteColor: "#F59E0B" },
];

const TIER_COLORS = {
  basic: "#3B82F6",
  standard: "#14B8A6",
  premium: "#8B5CF6",
  superPremium: "#F59E0B",
};

const TARGET_LINE_VALUE = 5.9;
const INCENTIVE_LINE_VALUE = 5.05;

/**
 * Weeks 1-4 are closed weeks (actual tier mix); weeks 5-8 are the
 * forward pipeline, drawn as flat grey bars with a dashed projection
 * line layered on top. Segment heights are split evenly per bar —
 * only the printed count label differs — since the source design
 * uses the stack purely to show tier mix, not unit-accurate height.
 */
const REVENUE_WEEKS = [
  { week: "Week 1", weekLabel: "Week 1",                current: false, totalLabel: "₹4.8 Lakh",  height: 1.6, counts: { basic: 2, standard: 2, premium: 1, superPremium: 1 } },
  { week: "Week 2", weekLabel: "Week 2",                current: false, totalLabel: "₹6.0 Lakh",  height: 2.0, counts: { basic: 1, standard: 1, premium: 1, superPremium: 2 } },
  { week: "Week 3", weekLabel: "Week 3",                current: false, totalLabel: "₹8.0 Lakh",  height: 2.7, counts: { basic: 3, standard: 3, premium: 1, superPremium: 2 } },
  { week: "Week 4", weekLabel: "Week 4 (Current Week)", current: true,  totalLabel: "₹10.0 Lakh", height: 3.3, counts: { basic: 2, standard: 1, premium: 3, superPremium: 4 } },
];

const PROJECTED_WEEKS = [
  { week: "Week 5", barLabel: "₹12.0 Lakh", pipelineLabel: "₹12 Lakh", height: 4.0 },
  { week: "Week 6", barLabel: "₹15.0 Lakh", pipelineLabel: "₹15 Lakh", height: 4.6 },
  { week: "Week 7", barLabel: "₹20.0 Lakh", pipelineLabel: "₹20 Lakh", height: 5.2 },
  { week: "Week 8", barLabel: "₹25.0 Lakh", pipelineLabel: "₹25 Lakh", height: 5.8 },
];

const REVENUE_CHART_DATA = [
  ...REVENUE_WEEKS.map((w) => ({
    week: w.week,
    weekLabel: w.weekLabel,
    current: w.current,
    totalLabel: w.totalLabel,
    basic: w.height * (w.counts.basic / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    standard: w.height * (w.counts.standard / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    premium: w.height * (w.counts.premium / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    superPremium: w.height * (w.counts.superPremium / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    basicCount: w.counts.basic,
    standardCount: w.counts.standard,
    premiumCount: w.counts.premium,
    superPremiumCount: w.counts.superPremium,
  })),
  ...PROJECTED_WEEKS.map((w) => ({
    week: w.week,
    weekLabel: w.week,
    projected: w.height,
    barLabel: w.barLabel,
    pipeline: w.height + 0.35,
    pipelineLabel: w.pipelineLabel,
  })),
];

const REVENUE_Y_TICKS = [0, 1, 2, 3, 4, 5, 6];
const revenueYTickFormatter = (v) => (v === 0 ? "₹0" : `₹${(v * 0.5).toFixed(1)} Cr`);

const CONVERSION_STATS = [
  { label: "Total Leads",     value: "2,842", note: "18.6% vs last 8 weeks" },
  { label: "Total Calls",     value: "1,896", note: "18.6% vs last 8 weeks" },
  { label: "Total Converted", value: "642",   note: "18.6% vs last 8 weeks" },
];

const FUNNEL_LEGEND = [
  { key: "leads",      label: "Leads",      color: "#2a78d6" },
  { key: "contacts",   label: "Contacts",   color: "#1baf7a" },
  { key: "converted",  label: "Converted",  color: "#4a3aa7" },
  { key: "conversion", label: "Conversion", color: "#9CA3AF" },
];

const WEEKLY_FUNNEL_DATA = [
  { week: "Week 1", range: "1-7 August",   leads: 320, contacts: 210, converted: 68, conversion: 68 },
  { week: "Week 2", range: "8-14 August",  leads: 320, contacts: 210, converted: 68, conversion: 68 },
  { week: "Week 3", range: "15-21 August", leads: 320, contacts: 210, converted: 68, conversion: 68 },
  { week: "Week 4", range: "22-28 August", leads: 320, contacts: 210, converted: 68, conversion: 68 },
];

const LEAD_TYPE_BREAKDOWN = [
  { label: "Hot Leads",  value: 312, pct: "45%", color: "#E8395B" },
  { label: "Warm Leads", value: 436, pct: "25%", color: "#F59E0B" },
  { label: "Cold Leads", value: 312, pct: "30%", color: "#3B82F6" },
];

const ACQUISITION_SOURCES = [
  { source: "Website",          totalLeads: 3596, conversion: "2%", color: "#6C93D6", icon: "website",   pct: 28 },
  { source: "Referral",         totalLeads: 2570, conversion: "1%", color: "#26437A", icon: "referral",  pct: 20 },
  { source: "Mobile App",       totalLeads: 2056, conversion: "3%", color: "#D8BD93", icon: "mobile",    pct: 16 },
  { source: "Facebook Ads",     totalLeads: 1799, conversion: "2%", color: "#BA6A38", icon: "facebook",  pct: 14 },
  { source: "Instagram Ads",    totalLeads: 1285, conversion: "1%", color: "#9AA0AC", icon: "instagram", pct: 10 },
  { source: "Google Ads",       totalLeads: 899,  conversion: "2%", color: "#7A0A17", icon: "google",    pct: 7 },
  { source: "Walk-in / Others", totalLeads: 640,  conversion: "1%", color: "#26262A", icon: "walkin",    pct: 5 },
];

const ACQUISITION_TOTAL_LEADS = "12,845";

const RECENT_ANNOUNCEMENTS = [
  { title: "New Leave Policy Update", desc: "Updated leave policy effective from June 2026", type: "Policy Update", priority: "High" },
  { title: "New Leave Policy Update", desc: "Updated leave policy effective from June 2026", type: "Policy Update", priority: "High" },
  { title: "New Leave Policy Update", desc: "Updated leave policy effective from June 2026", type: "Policy Update", priority: "High" },
  { title: "New Leave Policy Update", desc: "Updated leave policy effective from June 2026", type: "Policy Update", priority: "High" },
];

/* ───────────────────────── Header controls ───────────────────────── */

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
        className="inline-flex items-center gap-2 h-[38px] px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
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

function AssessmentBanner() {
  return (
    <div className="bg-[#F6F9FF] border border-[#DCE7FB] rounded-2xl px-4 py-3 flex items-start gap-3.5">
      <div className="flex items-center gap-2 shrink-0 pt-px">
        <span className="size-7 rounded-lg bg-[#E4EDFD] grid place-items-center">
          <ScanFace size={15} className="text-[#3B82F6]" strokeWidth={1.8} />
        </span>
        <span className="text-[13px] font-bold text-[#2563EB] whitespace-nowrap">
          My Overall Assessment
        </span>
      </div>

      <span className="w-px self-stretch bg-[#DCE7FB] shrink-0" />

      <p className="text-[13px] text-[#4B5563] leading-relaxed">
        You are pacing well against target and currently{" "}
        <span className="text-[#2563EB] underline underline-offset-2">holding #2</span>{" "}
        on the leaderboard, showing strong and consistent performance. However,{" "}
        <span className="text-[#2563EB] underline underline-offset-2">2 high-value</span>{" "}
        leads are approaching their 24-hour reassignment window. Prioritize those calls before anything else today.
      </p>
    </div>
  );
}

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
            stat.noteTone === "green" ? "text-[#16A34A] font-medium" : "text-[#6B7280]"
          }`}>
            {stat.note}
          </p>
        )}
      </div>
    </div>
  );
}

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [prompts, setPrompts] = useState(AI_PROMPTS);
  const [tags, setTags] = useState(AI_TAGS);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col gap-3.5 h-full">
      <h2 className="text-[17px] font-bold text-[#111] px-1">
        Your personal assistant - Ask anything
      </h2>

      {/* Conversation starters */}
      <div className="bg-[#FAFAFB] border border-black/6 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[13px] font-bold text-[#111]">Start a conversation</p>
          <div className="flex items-center gap-3">
            {AI_ACTIONS.map(({ label, icon: Icon, color }) => (
              <button key={label} type="button" className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] hover:text-[#111] transition-colors">
                <Icon size={13} style={{ color }} /> {label}
              </button>
            ))}
          </div>
        </div>

        {prompts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 bg-white border border-black/8 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[13px] leading-none">🚀</span>
              <span className="text-[13px] text-[#111] truncate">{p.text}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" className="text-[#3B82F6] hover:opacity-70 transition-opacity" aria-label="Edit prompt">
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPrompts((prev) => prev.filter((x) => x.id !== p.id))}
                className="text-[#EF4444] hover:opacity-70 transition-opacity"
                aria-label="Delete prompt"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-2 text-[11px] text-[#4B5563] bg-[#F1F2F4] rounded-lg px-2.5 py-1.5">
              {tag}
              <button type="button" onClick={() => setTags((t) => t.filter((x) => x !== tag))} className="text-[#6B7280] hover:text-[#111]">
                <X size={11} />
              </button>
            </span>
          ))}
          <button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] bg-[#F1F2F4] rounded-lg px-2.5 py-1.5 hover:bg-[#E9EAEC] transition-colors">
            See All <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Today's priority + composer */}
      <div className="border border-black/8 rounded-xl p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-[15px] font-bold text-[#111]">Today's Priority</h3>

        <ul className="flex flex-col gap-2 flex-1">
          {PRIORITY_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151]">
              <span className="size-[5px] rounded-full bg-[#C9CDD4] shrink-0 mt-[7px]" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <div className="border border-black/10 rounded-xl p-3 mt-1">
          <textarea
            rows={3}
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
  // Percentages are derived live from the P0 count.
  const stages = useMemo(() => {
    const base = FUNNEL_STAGES[0]?.value || 0;
    return FUNNEL_STAGES.map((s, i) => ({
      ...s,
      pct: i === 0 || !base ? null : Math.round((s.value / base) * 100),
    }));
  }, []);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <h2 className="text-[17px] font-bold text-[#111] px-1">Sales Funnel</h2>

      {/* Funnel artwork with live value/percentage overlay */}
      <div
        className="relative w-full mt-3 select-none"
        style={{ containerType: "inline-size" }}
      >
        <img src={funnelImg} alt="Sales funnel stages P0 to P6" className="w-full h-auto block" />

        {stages.map((stage, i) => (
          <span
            key={stage.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-bold text-white whitespace-nowrap"
            style={{
              left: `${BAND_LEFT_PCT}%`,
              top: `${BAND_TOP_PCT[i]}%`,
              fontSize: "clamp(10px, 3.1cqw, 17px)",
              textShadow: "0 1px 2px rgba(0,0,0,0.18)",
            }}
          >
            {stage.value.toLocaleString("en-IN")}
            {stage.pct !== null ? ` (${stage.pct}%)` : ""}
          </span>
        ))}
      </div>

      {/* Conversion time footer */}
      <div className="mt-3 bg-[#FAFAFC] border border-black/6 rounded-xl px-4 py-3 flex items-center gap-4">
        <span className="size-9 rounded-full bg-[#EEF0FE] grid place-items-center shrink-0">
          <HistoryIcon size={16} className="text-[#6366F1]" strokeWidth={1.7} />
        </span>
        <p className="text-[12px] font-semibold text-[#111] leading-tight">
          Avg. Time to Convert Lead
        </p>

        {CONVERT_TIMES.map((t) => (
          <div key={t.scope} className="flex items-center gap-4 flex-1 justify-center">
            <span className="w-px h-8 bg-black/8" />
            <div className="text-center">
              <p className="leading-tight">
                <span className="text-[15px] font-bold text-[#3B82F6]">{t.days}</span>
                <span className="text-[11px] font-semibold text-[#3B82F6]"> Days</span>
              </p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">{t.scope}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingTasksCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <CalendarClock size={19} className="text-[#374151]" strokeWidth={1.6} />
          <h2 className="text-[17px] font-bold text-[#111]">Pending Task &amp; Approvals</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2.5 py-1">148</span>
          <Link to="/tasks" className="text-[11px] font-semibold text-[#3B82F6] bg-[#E8F2FE] rounded-lg px-3 py-1 hover:bg-[#DBE9FD] transition-colors">
            View All
          </Link>
        </div>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {["Type", "Description", "Requested On", "Due Date", "Status"].map((h) => (
                <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PENDING_TASKS.map((task) => (
              <tr key={task.type} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
                <td className="px-4 py-4 text-[13px] font-bold text-[#111] whitespace-nowrap">{task.type}</td>
                <td className="px-4 py-4 text-[11px] text-[#6B7280] max-w-[150px]">{task.description}</td>
                <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{task.requestedOn}</td>
                <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{task.dueDate}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-md text-center ${STATUS_STYLES[task.status]}`}>
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

/** Small pill label anchored at a fixed fraction of the plot width, used for the Target/Incentive reference lines. */
function ReferenceLineTag({ viewBox, xFraction, text, bg, color, dy = -12 }) {
  const { x, width, y } = viewBox;
  const tx = x + width * xFraction;
  return (
    <foreignObject x={tx - 60} y={y + dy - 20} width={120} height={24} style={{ overflow: "visible" }}>
      <div
        className="inline-flex items-center justify-center h-full px-2.5 rounded-lg text-[10px] font-semibold whitespace-nowrap"
        style={{ backgroundColor: bg, color }}
      >
        {text}
      </div>
    </foreignObject>
  );
}

function TierCountLabel({ x, y, width, height, value }) {
  if (!value || height < 12) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#fff">
      {value}
    </text>
  );
}

function TotalAboveBarLabel({ x, y, width, value }) {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
      {value}
    </text>
  );
}

function GreyBarCenterLabel({ x, y, width, height, value }) {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#4B5563">
      {value}
    </text>
  );
}

function PipelinePointLabel({ x, y, value }) {
  if (!value) return null;
  return (
    <text x={x} y={y - 14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7C3AED">
      {value}
    </text>
  );
}

function PipelineDot({ cx, cy, payload }) {
  if (payload.pipeline == null) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#fff" stroke="#8B5CF6" strokeWidth={2} />;
}

function RevenueXAxisTick({ x, y, payload }) {
  const week = REVENUE_CHART_DATA.find((d) => d.week === payload.value);
  const isCurrent = week?.current;
  const [line1, line2] = (week?.weekLabel || payload.value).split(" (");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fontSize={11} fontWeight={isCurrent ? 700 : 500} fill={isCurrent ? "#111" : "#6B7280"}>
        {line1}
      </text>
      {line2 && (
        <text x={0} y={0} dy={27} textAnchor="middle" fontSize={9} fill="#9CA3AF">
          ({line2}
        </text>
      )}
    </g>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const isProjected = row?.projected != null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[150px]">
      <p className="text-[11px] font-bold text-[#111] mb-1.5">{label}</p>
      {isProjected ? (
        <p className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
          Pipeline value <span className="font-bold text-[#111]">{row.barLabel}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {[
            { key: "basicCount", name: "Basic", color: TIER_COLORS.basic },
            { key: "standardCount", name: "Standard", color: TIER_COLORS.standard },
            { key: "premiumCount", name: "Premium", color: TIER_COLORS.premium },
            { key: "superPremiumCount", name: "Super Premium", color: TIER_COLORS.superPremium },
          ].map((t) => (
            <p key={t.key} className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
              <span className="font-semibold text-[#111]">{row[t.key]}</span>
            </p>
          ))}
          <p className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280] mt-1 pt-1 border-t border-black/6">
            Revenue <span className="font-bold text-[#111]">{row.totalLabel}</span>
          </p>
        </div>
      )}
    </div>
  );
}

const REVENUE_LEGEND = [
  { label: "Basic", type: "swatch", color: TIER_COLORS.basic },
  { label: "Standard", type: "swatch", color: TIER_COLORS.standard },
  { label: "Premium", type: "swatch", color: TIER_COLORS.premium },
  { label: "Super Premium", type: "swatch", color: TIER_COLORS.superPremium },
  { label: "Projected Revenue Pipeline", type: "line", color: "#8B5CF6", dashed: true },
  { label: "Target", type: "line", color: "#0D9488", dashed: false },
  { label: "Incentive", type: "line", color: "#F59E0B", dashed: true },
];

function GoalsPerformanceCard() {
  const [period, setPeriod] = useState("this_month");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center">
            <Users size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">My Goals &amp; Performance</h2>
            <p className="text-[11px] text-[#9CA3AF]">Total Leads</p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {GOALS_STATS.map((s) => (
          <div key={s.label} className="border border-black/8 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center shrink-0">
                <Users size={13} className="text-[#6366F1]" strokeWidth={1.8} />
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-snug">{s.label}</p>
            </div>
            <p className="text-[16px] font-bold text-[#111] leading-tight">{s.value}</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: s.noteColor }}>{s.note}</p>
          </div>
        ))}
      </div>

      <p className="text-[12px] font-semibold text-[#4B5563] mb-1 px-1">Revenue (INR)</p>
      <div className="h-[380px] w-full overflow-x-auto">
      <div className="h-full min-w-[720px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={REVENUE_CHART_DATA} margin={{ top: 36, right: 16, left: 0, bottom: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="week" axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} tick={<RevenueXAxisTick />} interval={0} />
            <YAxis
              domain={[0, 6.4]}
              ticks={REVENUE_Y_TICKS}
              tickFormatter={revenueYTickFormatter}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={56}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

            <Bar dataKey="basic" stackId="tier" fill={TIER_COLORS.basic} barSize={44}>
              <LabelList dataKey="basicCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="standard" stackId="tier" fill={TIER_COLORS.standard} barSize={44}>
              <LabelList dataKey="standardCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="premium" stackId="tier" fill={TIER_COLORS.premium} barSize={44}>
              <LabelList dataKey="premiumCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="superPremium" stackId="tier" fill={TIER_COLORS.superPremium} barSize={44} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="superPremiumCount" content={TierCountLabel} />
              <LabelList dataKey="totalLabel" content={TotalAboveBarLabel} />
            </Bar>

            <Bar dataKey="projected" fill="#D1D5DB" barSize={44} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="barLabel" content={GreyBarCenterLabel} />
            </Bar>

            <ReferenceLine y={TARGET_LINE_VALUE} stroke="#0D9488" strokeWidth={2}>
              <Label content={(p) => <ReferenceLineTag viewBox={p.viewBox} xFraction={0.62} text="Target ₹2.50 Cr" bg="#E7F8EF" color="#0D9488" dy={-2} />} />
            </ReferenceLine>
            <ReferenceLine y={INCENTIVE_LINE_VALUE} stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 4">
              <Label content={(p) => <ReferenceLineTag viewBox={p.viewBox} xFraction={0.4} text="Incentive ₹2.29 Cr" bg="#FFF3E4" color="#B45309" dy={-2} />} />
            </ReferenceLine>

            <Line
              type="monotone"
              dataKey="pipeline"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={<PipelineDot />}
              activeDot={{ r: 6, fill: "#8B5CF6" }}
              connectNulls={false}
              isAnimationActive={false}
            >
              <LabelList dataKey="pipelineLabel" content={PipelinePointLabel} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 px-1">
        {REVENUE_LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
            {l.type === "swatch" ? (
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: l.color }} />
            ) : (
              <svg width="16" height="8" viewBox="0 0 16 8">
                <line x1="0" y1="4" x2="16" y2="4" stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? "4 3" : undefined} />
              </svg>
            )}
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FunnelBarLabel({ x, y, width, value }) {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#374151">
      {value}
    </text>
  );
}

function FunnelXAxisTick({ x, y, payload }) {
  const row = WEEKLY_FUNNEL_DATA.find((d) => d.week === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fontSize={11} fontWeight={600} fill="#374151">
        {payload.value}
      </text>
      <text x={0} y={0} dy={27} textAnchor="middle" fontSize={9} fill="#9CA3AF">
        {row?.range}
      </text>
    </g>
  );
}

function FunnelTooltip({ active, payload, label }) {
  const row = payload?.[0]?.payload;
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[140px]">
      <p className="text-[11px] font-bold text-[#111] mb-1.5">{label}</p>
      <div className="flex flex-col gap-1">
        {FUNNEL_LEGEND.map((f) => (
          <p key={f.key} className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
            <span className="font-semibold text-[#111]">{row[f.key]}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function LeadsConversionCard() {
  const [period, setPeriod] = useState("this_month");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <Users size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">Leads to Conversion Overview</h2>
            <p className="text-[11px] text-[#9CA3AF]">Total Leads</p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {CONVERSION_STATS.map((s) => (
          <div key={s.label} className="border border-black/8 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center shrink-0">
                <Users size={13} className="text-[#6366F1]" strokeWidth={1.8} />
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-snug">{s.label}</p>
            </div>
            <p className="text-[18px] font-bold text-[#111] leading-tight">{s.value}</p>
            <p className="text-[10px] font-semibold text-[#16A34A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mb-1 px-1 flex-wrap">
        <p className="text-[12px] font-semibold text-[#4B5563]">Weekly Lead Funnel Progress</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {FUNNEL_LEGEND.map((f) => (
            <span key={f.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <div className="flex items-center justify-between px-[26px] pt-1">
          <span className="text-[11px] text-[#9CA3AF]">Count</span>
          <span className="text-[11px] text-[#9CA3AF]">Client</span>
        </div>
        <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={WEEKLY_FUNNEL_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barCategoryGap="24%" barGap={3}>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="week" axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} tick={<FunnelXAxisTick />} interval={0} />
            <YAxis
              yAxisId="left"
              domain={[0, 900]}
              ticks={[0, 150, 300, 450, 600, 750, 900]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={36}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 900]}
              ticks={[0, 150, 300, 450, 600, 750, 900]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={36}
            />
            <Tooltip content={<FunnelTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

            <Bar yAxisId="left" dataKey="leads" fill={FUNNEL_LEGEND[0].color} barSize={16} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="leads" content={FunnelBarLabel} />
            </Bar>
            <Bar yAxisId="left" dataKey="contacts" fill={FUNNEL_LEGEND[1].color} barSize={16} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="contacts" content={FunnelBarLabel} />
            </Bar>
            <Bar yAxisId="left" dataKey="converted" fill={FUNNEL_LEGEND[2].color} barSize={16} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="converted" content={FunnelBarLabel} />
            </Bar>
            <Bar yAxisId="left" dataKey="conversion" fill={FUNNEL_LEGEND[3].color} barSize={16} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="conversion" content={FunnelBarLabel} />
            </Bar>
            <Line yAxisId="right" dataKey="leads" stroke="transparent" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
      </div>

      <div className="mt-5 border border-black/8 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-[15px] font-bold text-[#111]">Lead Type Breakdown</h3>
          <span className="text-[11px] text-[#9CA3AF]">(This Month)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEAD_TYPE_BREAKDOWN.map((t) => (
            <div key={t.label} className="border border-black/8 rounded-xl px-3.5 py-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label}
              </span>
              <p className="text-[18px] font-bold text-[#111] mt-1.5">
                {t.value} <span className="text-[12px] font-semibold text-[#9CA3AF]">({t.pct})</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Small brand-style glyphs for source identity (lucide has no brand marks). */
function FacebookGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path d="M15.5 8.5h-1.4c-.5 0-.6.2-.6.7v1.3h2l-.3 2.3h-1.7V19h-2.4v-6.2H9.5v-2.3h1.6V8.9c0-1.9 1-2.9 2.9-2.9h1.5v2.5Z" fill="#fff" />
    </svg>
  );
}

function InstagramGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="igGrad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#D62976" />
          <stop offset="0.7" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="7" fill="url(#igGrad)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="#fff" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="3.1" stroke="#fff" strokeWidth="1.6" fill="none" />
      <circle cx="17" cy="7" r="1" fill="#fff" />
    </svg>
  );
}

function GoogleGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.04 5.04 0 0 1-2.19 3.31v2.75h3.54c2.07-1.9 3.35-4.71 3.35-8.07Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.54H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.65-2.84Z" />
      <path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1a11 11 0 0 0-9.82 6.06l3.65 2.84C6.7 7.3 9.13 5.36 12 5.36Z" />
    </svg>
  );
}

const ACQUISITION_ICONS = {
  website: (props) => <Globe {...props} />,
  referral: (props) => <Share2 {...props} />,
  mobile: (props) => <Smartphone {...props} />,
  facebook: ({ size }) => <FacebookGlyph size={size} />,
  instagram: ({ size }) => <InstagramGlyph size={size} />,
  google: ({ size }) => <GoogleGlyph size={size} />,
  walkin: (props) => <Store {...props} />,
};

function AcquisitionDonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const px = cx + r * Math.cos(-midAngle * RAD);
  const py = cy + r * Math.sin(-midAngle * RAD);
  if (percent < 0.04) return null;
  return (
    <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#fff">
      {Math.round(percent * 100)}%
    </text>
  );
}

function ClientAcquisitionCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <PieChartIcon size={16} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">Client Acquisition</h2>
            <p className="text-[11px] text-[#9CA3AF]">Leads by Source</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
        >
          <CalendarDays size={13} /> This Month
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full max-w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ACQUISITION_SOURCES}
                dataKey="pct"
                nameKey="source"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="100%"
                paddingAngle={1.5}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
                label={AcquisitionDonutLabel}
                labelLine={false}
              >
                {ACQUISITION_SOURCES.map((s) => (
                  <Cell key={s.source} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <p className="text-[17px] font-bold text-[#111] leading-tight">{ACQUISITION_TOTAL_LEADS}</p>
              <p className="text-[9px] text-[#9CA3AF]">Total Leads</p>
              <p className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#16A34A] mt-1 whitespace-nowrap">
                <ArrowUpRight size={10} /> 18.4%
              </p>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/8">
                {["Source", "Leads", "Conv."].map((h) => (
                  <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase px-2 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACQUISITION_SOURCES.map((s) => {
                const Icon = ACQUISITION_ICONS[s.icon];
                return (
                  <tr key={s.source} className="border-b border-black/6 last:border-0">
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-2 text-[11.5px] font-medium text-[#374151] whitespace-nowrap">
                        <span
                          className="size-5 rounded-md grid place-items-center shrink-0 overflow-hidden"
                          style={{ backgroundColor: `${s.color}1A` }}
                        >
                          <Icon size={12} style={{ color: s.color }} strokeWidth={1.8} />
                        </span>
                        {s.source}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[11.5px] text-[#374151] whitespace-nowrap">{s.totalLeads.toLocaleString("en-IN")}</td>
                    <td className="px-2 py-2 text-[11.5px] text-[#374151] whitespace-nowrap">{s.conversion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-[#F6F5FF] border border-[#E5E2FB] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
        <Info size={14} className="text-[#6366F1] shrink-0" strokeWidth={1.8} />
        <p className="text-[11px] text-[#4B5563]">Showing total leads &amp; lead conversion percentage by source.</p>
      </div>
    </div>
  );
}

function RecentAnnouncementsCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <CalendarClock size={19} className="text-[#374151]" strokeWidth={1.6} />
          <h2 className="text-[17px] font-bold text-[#111]">Recent Announcements</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2.5 py-1">148</span>
          <Link to="/announcements" className="text-[11px] font-semibold text-[#3B82F6] bg-[#E8F2FE] rounded-lg px-3 py-1 hover:bg-[#DBE9FD] transition-colors">
            View All
          </Link>
        </div>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {["Title", "Type", "Priority", "Action"].map((h) => (
                <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_ANNOUNCEMENTS.map((a, i) => (
              <tr key={i} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="size-7 rounded-lg bg-[#E8F2FE] grid place-items-center shrink-0">
                      <Megaphone size={14} className="text-[#3B82F6]" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{a.title}</p>
                      <p className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{a.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-block text-[11px] font-semibold text-[#3B82F6] bg-[#E8F2FE] rounded-md px-2.5 py-1">{a.type}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-block text-[11px] font-semibold text-[#E8395B] bg-[#FDECEE] rounded-md px-2.5 py-1">{a.priority}</span>
                </td>
                <td className="px-4 py-4">
                  <button type="button" className="size-8 rounded-lg bg-[#FFF3E4] text-[#F59E0B] grid place-items-center hover:bg-[#FFE8CC] transition-colors" aria-label="Comment">
                    <MessageCircle size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActiveContestCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <img src={contestIcon} alt="" className="size-7 object-contain" />
          <h2 className="text-[17px] font-bold text-[#111]">Active Contest</h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2.5 py-1">32</span>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {["Title", "Time Left", "Prize", "Action"].map((h) => (
                <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVE_CONTESTS.map((c) => (
              <tr key={c.id} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <span className="size-7 rounded-lg bg-[#E8F2FE] grid place-items-center shrink-0 mt-0.5">
                      <Target size={14} className="text-[#3B82F6]" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{c.title}</p>
                      <p className="text-[11px] text-[#9CA3AF] leading-snug max-w-[220px]">{c.desc}</p>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-4 text-[12px] font-semibold whitespace-nowrap ${c.timeTone}`}>{c.timeLeft}</td>
                <td className="px-4 py-4 text-[13px] font-bold text-[#111] whitespace-nowrap">{c.prize}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-[#7A0A17] border border-[#7A0A17]/30 rounded-lg px-4 py-1.5 hover:bg-[#FCF5F6] transition-colors"
                  >
                    Join
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <img src={leaderboardIcon} alt="" className="size-7 object-contain" />
          <h2 className="text-[17px] font-bold text-[#111]">Leaderboard</h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2.5 py-1">148</span>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {["#", "Name", "Branch", "Total XP"].map((h) => (
                <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((p) => (
              <tr
                key={p.rank}
                className={`border-b border-black/8 last:border-0 transition-colors ${p.self ? "bg-[#F6F9FF]" : "hover:bg-[#FAFAFB]"}`}
              >
                <td className="px-4 py-4">
                  {RANK_MEDAL_COLORS[p.rank] ? (
                    <span
                      className="size-6 rounded-full grid place-items-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: RANK_MEDAL_COLORS[p.rank] }}
                    >
                      {p.rank}
                    </span>
                  ) : (
                    <span className="text-[13px] font-semibold text-[#6B7280] pl-1.5">{p.rank}.</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{p.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{p.role}</p>
                </td>
                <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{p.branch}</td>
                <td className="px-4 py-4 text-[13px] font-bold text-[#111] whitespace-nowrap">{p.xp} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MyLeadsCard() {
  const [period, setPeriod] = useState("today");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <button type="button" className="inline-flex items-center gap-1.5 text-[17px] font-bold text-[#111]">
          My Leads <ChevronDown size={16} className="text-[#9CA3AF]" />
        </button>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            {[
              { label: "Low Probability",    color: "#16A34A" },
              { label: "Medium Probability", color: "#F59E0B" },
              { label: "High Probability",   color: "#E8395B" },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                <Flag size={12} style={{ color: f.color }} fill={f.color} strokeWidth={0} />
                {f.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            <SlidersHorizontal size={13} /> Filter
          </button>

          <button
            type="button"
            onClick={() => setPeriod((p) => (p === "today" ? "week" : "today"))}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            {period === "today" ? "Today" : "This Week"}
            <span className="inline-flex items-center gap-0.5 text-[#16A34A] font-semibold">
              <TrendingUp size={12} /> 12% (34)
            </span>
            <ChevronDown size={14} className="text-[#9CA3AF]" />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Plus size={15} />
            Create Lead
          </button>
        </div>
      </div>

      <div className="border border-black/8 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {[
                "Client Name", "Owner", "Stage", "Priority", "Lead Score",
                "Profile Completion", "Time At This Stage", "Source",
                "Follow Up Time Left", "Actions",
              ].map((h) => (
                <th key={h} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MY_LEADS.map((lead, i) => {
              const priority = PRIORITY_STYLES[lead.priority];
              return (
                <tr key={i} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: LEAD_DOT_COLORS[i % LEAD_DOT_COLORS.length] }} />
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5">
                          <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{lead.name}</p>
                          {lead.starred && <Star size={12} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />}
                        </span>
                        <p className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{lead.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[12px] font-medium text-[#374151] whitespace-nowrap">{lead.owner}</p>
                    <p className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{lead.ownerRole}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-[12px] text-[#374151]">{lead.stage}</span>
                    {lead.stageTone && (
                      <span className={`ml-1.5 text-[11px] font-semibold ${lead.stageTone === "Won" ? "text-[#16A34A]" : lead.stageTone === "Lost" ? "text-[#E8395B]" : "text-[#3B82F6]"}`}>
                        ({lead.stageTone})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${priority.bg}`} style={{ color: priority.color }}>
                      <Flag size={11} fill={priority.color} strokeWidth={0} />
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#111]">
                      {lead.leadScore.toFixed(1)}
                      <Flag size={11} className="text-[#16A34A]" fill="#16A34A" strokeWidth={0} />
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{lead.profileCompletion}%</td>
                  <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{lead.timeAtStage}</td>
                  <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap">{lead.source}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${lead.followUpTone}`}>
                      <Clock size={11} /> {lead.followUp}
                    </span>
                    <p className="text-[10px] text-[#9CA3AF]">{lead.followUpNote}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {lead.lost ? (
                        <button type="button" className="p-1.5 text-[#E8395B] hover:bg-black/4 rounded-lg transition-colors" aria-label="Call">
                          <PhoneOff size={14} />
                        </button>
                      ) : (
                        <button type="button" className="p-1.5 text-[#16A34A] hover:bg-black/4 rounded-lg transition-colors" aria-label="Call">
                          <Phone size={14} />
                        </button>
                      )}
                      <button type="button" className="p-1.5 text-[#F59E0B] hover:bg-black/4 rounded-lg transition-colors" aria-label="Message">
                        <MessageSquare size={14} />
                      </button>
                      <button type="button" className="p-1.5 text-[#3B82F6] hover:bg-black/4 rounded-lg transition-colors" aria-label="Email">
                        <Mail size={14} />
                      </button>
                      <button type="button" className="p-1.5 text-[#6B7280] hover:bg-black/4 rounded-lg transition-colors" aria-label="Schedule">
                        <Calendar size={14} />
                      </button>
                      <button type="button" className="p-1.5 text-[#6B7280] hover:bg-black/4 rounded-lg transition-colors" aria-label="More">
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

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar page="Dashboard" />

      {/* Greeting row */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">
          {greeting}, {USER.name}
        </h1>

        <div className="flex items-center gap-2.5 shrink-0">
          <PeriodSelect value={period} onChange={setPeriod} />

          <button
            type="button"
            className="inline-flex items-center gap-2 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
          >
            <Plus size={15} />
            Create Lead
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 flex flex-col gap-4">
        <AssessmentBanner />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <AIAssistant />
          <div className="flex flex-col gap-4">
            <SalesFunnelCard />
            <PendingTasksCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <ActiveContestCard />
          <LeaderboardCard />
        </div>

        <MyLeadsCard />

        <GoalsPerformanceCard />

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <LeadsConversionCard />
          </div>
          <div className="flex flex-col gap-4 min-w-0">
            <ClientAcquisitionCard />
            <RecentAnnouncementsCard />
          </div>
        </div>
      </div>
    </div>
  );
}