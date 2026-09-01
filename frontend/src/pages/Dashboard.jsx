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
  Trophy,
  Medal,
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
} from "lucide-react";
import TopBar, { USER } from "../components/layout/TopBar";
import funnelImg from "../assets/pipeline.png";

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

function ActiveContestCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="size-7 rounded-lg bg-[#FFF3E4] grid place-items-center">
            <Trophy size={15} className="text-[#F59E0B]" strokeWidth={1.8} />
          </span>
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
                  <div className="flex items-center gap-2.5">
                    <span className="size-7 rounded-lg bg-[#E8F2FE] grid place-items-center shrink-0">
                      <Target size={14} className="text-[#3B82F6]" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{c.title}</p>
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
          <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center">
            <Medal size={15} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
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
      </div>
    </div>
  );
}