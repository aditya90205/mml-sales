import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Crown,
  Download,
  Eye,
  Flag,
  Gift,
  Globe,
  Heart,
  History,
  IndianRupee,
  MapPin,
  Pencil,
  Megaphone,
  Infinity,
  Link2,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Star,
  Sun,
  Upload,
  UserRound,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import EmailActivityButton from "../../../components/common/EmailActivityButton.jsx";
import SendMessageModal from "../../../components/common/SendMessageModal.jsx";
import BiodataUploadModal from "../../../components/pipeline/BiodataUploadModal";
import BiodataProfileModal from "../../../components/pipeline/BiodataProfileModal";
import Modal from "../../../components/ui/Modal";
import CreateMeetingEventModal from "../../../components/calendar/CreateMeetingEventModal";
import TaskDetailsModal, { calendarEventToTaskView } from "../../../components/calendar/TaskDetailsModal";
import EventDetailsModal, { calendarEventToEventView } from "../../../components/calendar/EventDetailsModal";
import MeetingDetailsModal, { calendarEventToMeetingView } from "../../../components/calendar/MeetingDetailsModal";
import OthersDetailsModal, { calendarEventToOtherView } from "../../../components/calendar/OthersDetailsModal";
import LeadActivityHistory from "./LeadActivityHistory";
import PackageQuoteTab from "./PackageQuoteTab";
import P6ChecklistTab from "./P6ChecklistTab";
import { atLeast } from "./stageContent.jsx";
import { INITIAL_EVENTS } from "../../CalendarPage";
import {
  addExtraEvent,
  meetingFormToCalendarItem,
  mergeCalendarEvents,
  readExtraEvents,
  subscribeCalendar,
} from "../../../utils/calendarStore.js";
import {
  ensureLeadHistory,
  recordLeadActivity,
  subscribeLeadActivity,
} from "../../../utils/leadActivityStore.js";
import { formatLookingForLabel } from "../../../utils/leadFields.js";
import { upsertClientFromBiodata } from "../../../utils/clientsData.js";
import { findLeadById, moveLeadToStage, updateLead } from "../../../utils/pipelineStore.js";
import {
  buildLeadIntakePayload,
  leadPatchFromIntake,
  pipelinePatchFromBiodata,
  setPendingBiodata,
  takePendingBiodata,
} from "../../../utils/biodataDraftStore.js";
import {
  assignPendingBiodataFile,
  rememberBiodataFile,
  rememberPendingBiodataFile,
} from "../../../utils/biodataFileStore.js";

const TEMPERATURE_TONES = {
  Hot: { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
  Lost: { color: "#7A0A17", bg: "#FCF5F6" },
};

const PRIORITY_TONES = {
  High: { color: "#E8395B", bg: "#FDECEE" },
  Medium: { color: "#F59E0B", bg: "#FFF3E4" },
  Low: { color: "#6B7280", bg: "#F3F4F6" },
};

const RM_FLAG_TONES = {
  amber: { color: "#F59E0B", bg: "#FFF3E4" },
  red: { color: "#E8395B", bg: "#FDECEE" },
  blue: { color: "#3B82F6", bg: "#E8F2FE" },
};

const FLAG_NOTES = {
  "Preference mismatch": "Client wants a doctor in NCR, parents will consider Punjab. Flagged for the service team.",
  "High-demand criteria": "Clinical specialisation requested is thin in the paid database. Cross-branch search likely.",
  "Parent is decision maker": "Father is the decision maker and the payer. Client defers on budget but is firm on profession fit.",
  "Cross-branch price enquiry": "Price was compared with another branch. Keep the quote aligned before the next call.",
};

const FLAG_FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

const PACKAGE_FEATURES = [
  "Profile Verification",
  "Multiple Matches",
  "Personalized Matchmaking",
  "Family Background Check",
];

const ADDON_CATALOG = [
  { id: "kundli", name: "Kundli Matching", price: 2000, icon: Sun, bg: "#FFF4E5", color: "#F59E0B" },
  { id: "priority", name: "Priority Matchmaking", price: 8000, icon: Infinity, bg: "#F3E8FF", color: "#7C3AED" },
];

const HANDOVER_PREVIEW = [
  { id: "aadhar", label: "Parent's Aadhar", status: "verified" },
  { id: "contract", label: "Contract E-Signed", status: "otp" },
  { id: "id", label: "ID & Document", status: "verified" },
  { id: "photos", label: "Profile Photos", status: "verified" },
  { id: "ocr", label: "Client Intake OCR", status: "verified" },
];

const PREVIEW_ACTIVITY = {
  payment: { icon: IndianRupee, bg: "#E7F8EF", color: "#16A34A" },
  quote: { icon: IndianRupee, bg: "#E7F8EF", color: "#16A34A" },
  call: { icon: Video, bg: "#E8F2FE", color: "#2563EB" },
  meeting: { icon: Video, bg: "#E8F2FE", color: "#2563EB" },
  handover: { icon: RefreshCw, bg: "#E7F8EF", color: "#16A34A" },
  document: { icon: UserRound, bg: "#F3E8FF", color: "#8B5CF6" },
  details: { icon: UserRound, bg: "#F3E8FF", color: "#8B5CF6" },
  stage: { icon: RefreshCw, bg: "#E7F8EF", color: "#16A34A" },
  created: { icon: UserRound, bg: "#F3E8FF", color: "#8B5CF6" },
  assignment: { icon: UserRound, bg: "#F3E8FF", color: "#8B5CF6" },
  score: { icon: Star, bg: "#FFF6E8", color: "#E8B923" },
  note: { icon: Video, bg: "#E8F2FE", color: "#2563EB" },
};

function toIsoDate(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "-") return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const slash = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDob(value) {
  const iso = toIsoDate(value);
  if (!iso) return value && value !== "-" ? value : "-";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ageFromDob(value) {
  const iso = toIsoDate(value);
  if (!iso) return "";
  const dob = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const month = now.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age > 0 && age < 120 ? String(age) : "";
}

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function shown(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  return text;
}

function areaLine(deal) {
  return [shown(deal.area || deal.areaOfHouse), shown(deal.city), shown(deal.country)]
    .filter(Boolean)
    .join(", ");
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function rupeeNumber(value) {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function formatInr(amount) {
  return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatClock(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

function formatStampDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

function splitStamp(value) {
  const text = shown(value);
  if (!text) return { date: "", time: "" };
  const [date, ...rest] = text.split(",");
  return { date: date.trim(), time: rest.join(",").trim() };
}

function isStampDate(value) {
  const text = shown(value);
  return /^\d{1,2}[/. -]\d{1,2}[/. -]\d{2,4}/.test(text) || /^\d{4}-\d{2}-\d{2}/.test(text);
}

function rowStamp(value) {
  const text = shown(value);
  if (!text) return { date: "", time: "" };
  if (isStampDate(text) && text.includes(",")) return splitStamp(text);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return { date: text, time: "" };
  return {
    date: date.toLocaleDateString("en-GB"),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

function formatClockTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function eventStart(ev) {
  if (!ev?.date || ev.startH == null) return null;
  const start = new Date(ev.date);
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(Number(ev.startH) || 0, Number(ev.startM) || 0, 0, 0);
  return start;
}

function hoursLeftLabel(ev) {
  const start = eventStart(ev);
  if (!start) return "";
  const diff = start.getTime() - Date.now();
  if (diff <= 0) return "";
  const hrs = Math.max(1, Math.round(diff / 36e5));
  if (hrs >= 48) return `${Math.round(hrs / 24)} Days Left`;
  return `${hrs} Hrs Left`;
}

const NEXT_ACTION_PREVIEW = 5;

function splitCalendarItems(events, category) {
  const now = Date.now();
  const due = [];
  const completed = [];
  for (const ev of events || []) {
    if (ev?.category !== category || String(ev.id || "").startsWith("nm-")) continue;
    const start = eventStart(ev);
    const status = String(ev.meta?.status || ev.meta?.stage || ev.meta?.activationStatus || "").toLowerCase();
    const done = status === "completed" || status === "done" || (start ? start.getTime() < now : false);
    (done ? completed : due).push(ev);
  }
  const time = (ev) => eventStart(ev)?.getTime() || 0;
  due.sort((a, b) => time(a) - time(b));
  completed.sort((a, b) => time(b) - time(a));
  return { due, completed };
}

function formatItemStamp(ev) {
  const start = eventStart(ev);
  if (!start) return "No time set";
  const date = start.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${date} · ${formatClockTime(start)}`;
}

function StatusItemList({ items, empty, onOpen, icon: Icon, iconBg, iconColor, fallback }) {
  if (!items.length) {
    return <p className="text-[13px] text-[#9CA3AF] py-6 text-center">{empty}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((ev) => (
        <button
          key={ev.id}
          type="button"
          onClick={() => onOpen(ev)}
          className="flex items-center gap-3 w-full rounded-xl border border-[#EEF1F4] px-3 py-2.5 text-left hover:border-[#E2E6EB] hover:bg-[#FAFAFB] transition-colors"
        >
          <span className="size-9 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
            <Icon size={16} strokeWidth={2.1} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-[#1F2937] truncate">{ev.title || fallback}</span>
            <span className="block text-[12px] text-[#9CA3AF] mt-0.5 truncate">
              {formatItemStamp(ev)}
              {ev.meta?.client ? ` · ${ev.meta.client}` : ev.meta?.assignees?.[0] ? ` · ${ev.meta.assignees[0]}` : ""}
            </span>
          </span>
          <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
        </button>
      ))}
    </div>
  );
}

function DueCompletedModal({
  open,
  onClose,
  title,
  icon,
  iconBg,
  iconColor,
  due,
  completed,
  tab,
  onTab,
  onOpen,
  itemIcon,
  itemIconBg,
  itemIconColor,
  fallback,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={`${due.length} due, ${completed.length} completed`}
      icon={icon}
      iconBg={iconBg}
      iconColor={iconColor}
      width="max-w-lg"
      zClass="z-[70]"
      contain
    >
      <div className="flex items-center gap-2 mb-4">
        {[
          { id: "due", label: `Due (${due.length})` },
          { id: "completed", label: `Completed (${completed.length})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={`h-8 px-3 rounded-full text-[12.5px] font-semibold transition-colors ${
              tab === item.id ? "bg-[#7A0A17] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <StatusItemList
        items={tab === "completed" ? completed : due}
        empty={tab === "completed" ? `No completed ${fallback.toLowerCase()}s.` : `No due ${fallback.toLowerCase()}s.`}
        onOpen={onOpen}
        icon={itemIcon}
        iconBg={itemIconBg}
        iconColor={itemIconColor}
        fallback={fallback}
      />
    </Modal>
  );
}

function calendarActionItems(events) {
  return (events || [])
    .filter((ev) => (ev?.category === "task" || ev?.category === "meeting") && !String(ev.id || "").startsWith("nm-"))
    .map((ev) => {
      const start = eventStart(ev);
      const assignee = ev.meta?.assignees?.[0] || ev.meta?.client || "";
      const upcoming = hoursLeftLabel(ev);
      return {
        kind: upcoming ? "soon" : "log",
        id: ev.id,
        at: start ? start.toISOString() : "",
        text: ev.title || (ev.category === "meeting" ? "Meeting" : "Task"),
        by: assignee,
        headline: upcoming || (ev.category === "meeting" ? "Meeting" : "Task"),
        startTime: formatClockTime(start),
        stage: ev.category === "meeting" ? "Meet" : "Task",
        event: ev,
        sort: start ? start.getTime() : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => {
      const now = Date.now();
      const aUpcoming = a.sort >= now;
      const bUpcoming = b.sort >= now;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? a.sort - b.sort : b.sort - a.sort;
    })
    .map((item, index, list) => {
      const firstSoon = list.findIndex((row) => row.kind === "soon");
      return index === firstSoon ? item : { ...item, kind: "log" };
    });
}

function ActionTile({ icon: Icon, iconBg, iconColor, title, titleColor = "#1F2937", subtitle, meta, detail, onClick }) {
  return (
    <div className="flex items-center gap-3 w-full bg-white border border-[#EEF1F4] rounded-2xl px-3.5 py-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#E2E6EB] transition-colors min-w-0">
      <button
        type="button"
        onClick={onClick}
        className="size-10 rounded-[12px] grid place-items-center shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
        aria-label={title}
      >
        <Icon size={18} strokeWidth={2.2} />
      </button>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onClick}
          className="block w-full text-left text-[14px] font-bold leading-tight truncate"
          style={{ color: titleColor }}
        >
          {title}
        </button>
        {detail || (
          <button
            type="button"
            onClick={onClick}
            className="mt-1 flex items-center gap-2 min-w-0 w-full text-left text-[12px] text-[#9CA3AF] leading-none"
          >
            {subtitle ? <span className="truncate">{subtitle}</span> : null}
            {meta ? <span className="truncate shrink-0">{meta}</span> : null}
          </button>
        )}
      </div>
      <button type="button" onClick={onClick} className="shrink-0 p-0.5" aria-label={title}>
        <ChevronRight size={16} className="text-[#C5CAD3]" />
      </button>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-start gap-2.5 min-w-0 ${className}`}>
      <Icon size={16} className="text-[#8E2942] shrink-0 mt-0.5" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[11.5px] text-[#9CA3AF] leading-none">{label}</p>
        <p className="text-[13px] font-semibold text-[#1F2937] mt-1 leading-snug break-words">{value || "-"}</p>
      </div>
    </div>
  );
}

function RecentActivityCards({ events, empty = "No activity yet." }) {
  if (!events.length) {
    return <p className="text-[12.5px] text-[#9CA3AF] py-3">{empty}</p>;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 min-w-0 rounded-xl border border-[#EEF1F6] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <span className="size-9 rounded-full bg-[#F3EEFF] text-[#7C3AED] grid place-items-center shrink-0">
            <Megaphone size={16} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-bold text-[#1E293B] leading-snug">{event.title}</p>
              <span className="text-[11px] font-medium text-[#9CA3AF] shrink-0 pt-0.5">{timeAgo(event.at)}</span>
            </div>
            {event.detail ? (
              <p className="text-[12px] text-[#9CA3AF] mt-0.5 leading-snug">{event.detail}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryPreview({ events }) {
  if (!events.length) {
    return <p className="text-[12.5px] text-[#9CA3AF] pb-1">No activity yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3 pb-1">
      {events.slice(0, 3).map((event) => {
        const tone = PREVIEW_ACTIVITY[event.type] || PREVIEW_ACTIVITY.note;
        const Icon = tone.icon;
        return (
          <div key={event.id} className="flex items-start gap-2 min-w-0">
            <p className="w-[58px] shrink-0 pt-1 text-[11.5px] text-[#9CA3AF] leading-tight">{formatClock(event.at)}</p>
            <span
              className="size-7 rounded-full grid place-items-center shrink-0"
              style={{ backgroundColor: tone.bg, color: tone.color }}
            >
              <Icon size={13} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#1F2937] leading-snug">{event.title}</p>
              {event.detail ? <p className="text-[11.5px] text-[#6B7280] mt-0.5 leading-snug">{event.detail}</p> : null}
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                by {event.actor || "RM"} {formatStampDate(event.at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddonsPreview({ selected, onToggle, packageAmount, onPay }) {
  const extra = ADDON_CATALOG.filter((item) => selected.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  return (
    <div className="pb-1">
      <div className="flex flex-col gap-2.5">
        {ADDON_CATALOG.map((item) => {
          const on = selected.includes(item.id);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="flex items-center gap-2.5 w-full text-left"
            >
              <span
                className="size-8 rounded-lg grid place-items-center shrink-0"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <Icon size={16} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#1F2937] leading-tight truncate">{item.name}</span>
                <span className="block text-[12px] text-[#6B7280] mt-0.5">{formatInr(item.price)}</span>
              </span>
              {on ? (
                <span className="size-5 rounded-full bg-[#22C55E] text-white grid place-items-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : (
                <span className="size-5 rounded-full border-2 border-[#D1D5DB] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2 mt-3.5">
        <p className="text-[13px] text-[#374151]">
          Total : <span className="font-bold text-[#111]">{formatInr(packageAmount + extra)}</span>
        </p>
        <button
          type="button"
          onClick={onPay}
          className="h-8 px-4 rounded-lg bg-[#8E1B32] text-white text-[12.5px] font-semibold hover:bg-[#7A1230] transition-colors"
        >
          Pay
        </button>
      </div>
    </div>
  );
}

function isEmptyFlag(flag) {
  return !flag?.label || flag.label === "-";
}

function flagTone(flag) {
  if (isEmptyFlag(flag)) return { color: "#9CA3AF", bg: "#F3F4F6" };
  return RM_FLAG_TONES[flag.tone] || RM_FLAG_TONES.amber;
}

function flagDetail(flag) {
  return flag?.note || FLAG_NOTES[flag?.label] || "";
}

function FlagsPreview({ flags, onView }) {
  if (!flags.length) {
    return <p className="text-[12.5px] text-[#9CA3AF] pb-1">No RM flags yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 pb-1">
      {flags.map((flag, index) => {
        const empty = isEmptyFlag(flag);
        const tone = flagTone(flag);
        if (empty || !onView) {
          return (
            <span
              key={`${flag.label}-${index}`}
              className="text-[11.5px] font-semibold leading-tight px-2 py-1.5 rounded-lg text-center"
              style={{ color: tone.color, backgroundColor: tone.bg }}
            >
              {flag.label || "-"}
            </span>
          );
        }
        return (
          <button
            key={`${flag.label}-${index}`}
            type="button"
            onClick={() => onView(flag)}
            className="text-[11.5px] font-semibold leading-tight px-2 py-1.5 rounded-lg text-center hover:opacity-80 transition-opacity"
            style={{ color: tone.color, backgroundColor: tone.bg }}
          >
            {flag.label}
          </button>
        );
      })}
    </div>
  );
}

function RmFlagsList({ flags, onView }) {
  const visible = flags.filter((flag) => !isEmptyFlag(flag));
  if (!visible.length) {
    return <p className="text-[13px] text-[#9CA3AF]">No RM flags yet. Add one to flag this lead for the service team.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {visible.map((flag, index) => {
        const tone = flagTone(flag);
        return (
          <div
            key={`${flag.label}-${index}`}
            className="flex items-center gap-3 rounded-xl border border-[#EEF1F4] px-3 py-2.5"
          >
            <span
              className="text-[12.5px] font-semibold leading-tight px-2.5 py-1 rounded-lg"
              style={{ color: tone.color, backgroundColor: tone.bg }}
            >
              {flag.label}
            </span>
            <button
              type="button"
              onClick={() => onView(flag)}
              className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[#7A0A17] hover:text-[#640712] shrink-0"
            >
              <Eye size={14} />
              View
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HandoverPreview({ onOpen }) {
  return (
    <div className="flex flex-col gap-2.5 pb-1">
      {HANDOVER_PREVIEW.map((item) => (
        <div key={item.id} className="flex items-center gap-1.5 min-w-0">
          <span className="size-[18px] rounded-[4px] bg-[#8E1B32] text-white grid place-items-center shrink-0">
            <Check size={11} strokeWidth={3} />
          </span>
          <span className="text-[12px] font-medium text-[#1F2937] flex-1 min-w-0 truncate">{item.label}</span>
          {item.status === "otp" ? (
            <button
              type="button"
              onClick={() => toast.success("OTP sent for contract e-sign.")}
              className="text-[10.5px] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#86EFAC] rounded-full px-2 py-0.5 shrink-0"
            >
              Generate OTP
            </button>
          ) : (
            <span className="text-[10.5px] font-semibold text-[#2563EB] bg-[#E8F1FE] rounded-full px-2 py-0.5 shrink-0">
              Verified
            </span>
          )}
          <button type="button" onClick={onOpen} className="text-[#E8B923] shrink-0" aria-label={`View ${item.label}`}>
            <Eye size={14} />
          </button>
          <button type="button" onClick={onOpen} className="text-[#22C55E] shrink-0" aria-label={`Download ${item.label}`}>
            <Download size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function isoDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function meetingPrefillFromDeal(deal) {
  const today = isoDate();
  const name = deal?.name || "";
  const code = String(deal?.dealCode || deal?.mmlId || "").replace(/\s+/g, "");
  const person = code && name ? `${code} · ${name}` : name;
  return {
    title: name ? `Meeting — ${name}` : "",
    meetingWith: "client",
    meetingWithTypes: ["client"],
    inviteGroups: ["client"],
    people: person ? [person] : [],
    description: "Follow-up",
    meetingType: "video",
    meetingTypes: ["video"],
    priority: "High",
    startDate: today,
    endDate: today,
    startTime: "10:00",
    endTime: "11:00",
    duration: "1 hour",
  };
}

function NextActionList({ items, onOpen }) {
  if (!items.length) {
    return <p className="text-[12.5px] text-[#9CA3AF]">No tasks or meetings yet.</p>;
  }
  return (
    <div className="grid grid-cols-[max-content_minmax(0,1fr)]">
      {items.map((item) => {
        if (item.kind === "soon") {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen?.(item)}
              className="col-span-2 grid grid-cols-subgrid items-center text-left"
            >
              <div className="flex items-center gap-2 py-2 pr-3">
                <Clock size={16} className="text-[#C5CAD3] shrink-0" strokeWidth={1.8} />
                <div>
                  <p className="text-[13px] font-bold text-[#1F2937] leading-none whitespace-nowrap">{item.headline}</p>
                  {item.startTime ? (
                    <p className="text-[11px] text-[#9CA3AF] mt-1 leading-none whitespace-nowrap">Start Time: {item.startTime}</p>
                  ) : null}
                </div>
              </div>
              <div className="min-w-0 h-full flex items-center gap-2 border-l border-[#E5E7EB] pl-3 py-2">
                <span className="text-[11px] font-bold text-[#7C3AED] bg-[#F3E8FF] px-1.5 py-0.5 rounded-md shrink-0">
                  {item.stage}
                </span>
                <p className="text-[13px] font-medium text-[#6B7280] leading-snug truncate">{item.text}</p>
              </div>
            </button>
          );
        }
        const stamp = rowStamp(item.at);
        return (
          <button
            key={item.id || `${item.at}-${item.text}`}
            type="button"
            onClick={() => onOpen?.(item)}
            className="col-span-2 grid grid-cols-subgrid items-center text-left"
          >
            <div className="flex items-center gap-2 py-2 pr-3">
              <Calendar size={16} className="text-[#C5CAD3] shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[13px] font-bold text-[#1F2937] leading-none whitespace-nowrap">{stamp.date}</p>
                {stamp.time ? (
                  <p className="text-[11px] text-[#9CA3AF] mt-1 leading-none whitespace-nowrap">{stamp.time}</p>
                ) : null}
              </div>
            </div>
            <div className="min-w-0 h-full flex items-center gap-2 border-l border-[#E5E7EB] pl-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#2563EB] leading-snug">{item.text}</p>
                {item.by ? <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">by {item.by}</p> : null}
              </div>
              <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CardHead({ icon: Icon, title, action, onAction, accent = false, brandAction = false }) {
  const tone = accent || brandAction ? "#7A0A17" : "#111";
  const actionClass = brandAction
    ? "text-[#7A0A17] hover:text-[#640712]"
    : accent
      ? "text-[#9CA3AF] hover:text-[#6B7280]"
      : "text-[#E8395B] hover:underline";
  return (
    <div className="flex items-center justify-between gap-2 mb-3.5">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={16} className="shrink-0" style={{ color: tone }} strokeWidth={2.2} />
        <h3 className="text-[15px] font-bold truncate" style={{ color: tone }}>{title}</h3>
      </div>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className={`inline-flex items-center gap-0.5 text-[12.5px] font-medium shrink-0 ${actionClass}`}
        >
          {action}
          {accent || brandAction ? <ChevronRight size={14} /> : null}
        </button>
      ) : null}
    </div>
  );
}

function filled(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  return text;
}

export default function OverviewDashboard({
  deal,
  currentStage,
  onSend,
  onView,
  onEdit,
  onCreateTask,
  onOpenTab,
  selectedPackageKey = null,
  onPackageSelect,
}) {
  const [openPanels, setOpenPanels] = useState([]);
  const [messageOpen, setMessageOpen] = useState(false);
  const [biodataOpen, setBiodataOpen] = useState(false);
  const [showBiodataProfile, setShowBiodataProfile] = useState(false);
  const [profileInitial, setProfileInitial] = useState(null);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [meetingsOpen, setMeetingsOpen] = useState(false);
  const [meetingsTab, setMeetingsTab] = useState("due");
  const [tasksOpen, setTasksOpen] = useState(false);
  const [tasksTab, setTasksTab] = useState("due");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  const [quotePanel, setQuotePanel] = useState("addons");
  const [nextActionOpen, setNextActionOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [flagAddOpen, setFlagAddOpen] = useState(false);
  const [viewingFlag, setViewingFlag] = useState(null);
  const [addedFlags, setAddedFlags] = useState([]);
  const [flagLabel, setFlagLabel] = useState("");
  const [flagToneValue, setFlagToneValue] = useState("amber");
  const [flagNote, setFlagNote] = useState("");
  const [selectedAddons, setSelectedAddons] = useState(["priority"]);
  const [tick, setTick] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState(() => mergeCalendarEvents(INITIAL_EVENTS, readExtraEvents()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMeetingEvent, setSelectedMeetingEvent] = useState(null);
  const [selectedTaskEvent, setSelectedTaskEvent] = useState(null);
  const [selectedOtherEvent, setSelectedOtherEvent] = useState(null);
  const navigate = useNavigate();

  const closeBiodataProfile = () => {
    setShowBiodataProfile(false);
    setProfileInitial(null);
  };

  const saveBiodataProfile = (lead) => {
    const existingId = deal?.id || lead?.existingLeadId;
    if (!existingId) {
      toast.error("Could not save this profile.");
      return;
    }

    const nextAction =
      lead.meeting === "Meeting Agreed"
        ? "Schedule meeting"
        : lead.meeting === "Call Agreed"
          ? "Follow-up call"
          : lead.meeting === "Callback Later"
            ? "Callback"
            : "Initial Contact";

    const pendingBiodata = takePendingBiodata() || {
      fields: profileInitial,
      alsoRead: lead.alsoRead || profileInitial?.alsoRead,
      intake: lead.intake || profileInitial?.intake,
      fileName: lead.fileName || profileInitial?.fileName,
    };
    const bio = buildLeadIntakePayload(lead, pendingBiodata);
    const intakePatch = leadPatchFromIntake(bio.intakeValues || lead.intakeValues || {});
    const biodataPatch = pipelinePatchFromBiodata(lead, bio, {
      lastDiscussion: "Just now",
      nextAction,
      temperature: lead.meeting === "Meeting Agreed" ? "Hot" : "Warm",
    });
    const current = findLeadById(existingId);
    const fromStage = current?.stageId || currentStage || "P0";
    const advanceToP2 = fromStage === "P0" || fromStage === "P1";
    const savePatch = {
      lastDiscussion: "Just now",
      nextAction,
      temperature: lead.meeting === "Meeting Agreed" ? "Hot" : "Warm",
      ...biodataPatch,
      overviewDetails: {
        ...(current?.lead?.overviewDetails || {}),
        ...intakePatch,
        firstName: lead.firstName || current?.lead?.firstName || "",
        lastName: lead.lastName || current?.lead?.lastName || "",
      },
    };

    if (advanceToP2) moveLeadToStage(existingId, "P2", savePatch);
    else updateLead(existingId, savePatch);

    upsertClientFromBiodata({
      clientId: lead.clientId || profileInitial?.clientId,
      name: lead.name,
      mobile: lead.mobile,
      email: lead.email,
      fields: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        city: lead.city,
        area: lead.area,
        dob: lead.dob,
        lookingFor: lead.lookingFor,
        relation: lead.relation,
        fileName: lead.fileName || bio.fileName,
      },
      alsoRead: bio?.alsoRead || [],
      owner: "Rohit Kumar",
      linkedLeadId: existingId,
    });
    if (pendingBiodata?.file) void rememberBiodataFile(existingId, pendingBiodata.file);
    else assignPendingBiodataFile(existingId);

    closeBiodataProfile();
    toast.success(
      advanceToP2
        ? `Profile saved. "${lead.name}" is in Profile Create (P2).`
        : `Profile "${lead.name}" updated.`
    );
  };

  useEffect(() => subscribeLeadActivity(() => setTick((n) => n + 1)), []);
  useEffect(
    () =>
      subscribeCalendar(() => {
        setCalendarEvents(mergeCalendarEvents(INITIAL_EVENTS, readExtraEvents()));
      }),
    []
  );

  const allEvents = useMemo(() => {
    const all = ensureLeadHistory(deal, currentStage);
    return [...all].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [deal, currentStage, tick]);
  const events = allEvents.slice(0, 4);

  const completion = Math.max(0, Math.min(100, Number(deal.profileCompletion) || 0));
  const scoreText = deal.scoreValue != null && deal.scoreValue !== "" ? Number(deal.scoreValue).toFixed(1) : "";
  const temperature = shown(deal.winLossTone) || "Warm";
  const tempTone = TEMPERATURE_TONES[temperature] || TEMPERATURE_TONES.Warm;
  const priority = shown(deal.priority);
  const priorityTone = PRIORITY_TONES[priority] || PRIORITY_TONES.Medium;
  const mmlId = String(deal.mmlId || deal.dealCode || "-").replace(/\s+/g, "");
  const formDigits = String(deal.mmlId || deal.dealCode || "").replace(/\D/g, "");
  const formNo = formDigits ? `F-${formDigits.slice(-5)}` : "-";
  const packageInterest = shown(deal.packageInterest);
  const packageName = packageInterest
    ? /package/i.test(packageInterest)
      ? packageInterest
      : `${packageInterest} Package`
    : "Premium Package";
  const meetingInitial = useMemo(
    () => meetingPrefillFromDeal(deal),
    [deal?.name, deal?.dealCode, deal?.mmlId]
  );
  const packageAmount = rupeeNumber(deal.dealValue);
  const packagePrice = packageAmount ? formatInr(packageAmount) : "₹ 1,50,000";
  const calendarActions = useMemo(() => calendarActionItems(calendarEvents), [calendarEvents]);
  const { due: meetingDue, completed: meetingDone } = useMemo(
    () => splitCalendarItems(calendarEvents, "meeting"),
    [calendarEvents]
  );
  const { due: taskDue, completed: taskDone } = useMemo(
    () => splitCalendarItems(calendarEvents, "task"),
    [calendarEvents]
  );
  const openMeetings = (tab) => {
    setMeetingsTab(tab === "completed" ? "completed" : "due");
    setMeetingsOpen(true);
  };
  const openTasks = (tab) => {
    setTasksTab(tab === "completed" ? "completed" : "due");
    setTasksOpen(true);
  };
  const nextItems = calendarActions.slice(0, NEXT_ACTION_PREVIEW);

  const openNextAction = (item) => {
    setNextActionOpen(false);
    if (item?.event) openCalendarItem(item.event);
  };

  const openCalendarItem = (ev) => {
    setSelectedEvent(null);
    setSelectedMeetingEvent(null);
    setSelectedTaskEvent(null);
    setSelectedOtherEvent(null);
    if (ev?.category === "task") setSelectedTaskEvent(ev);
    else if (ev?.category === "event") setSelectedEvent(ev);
    else if (ev?.category === "meeting") setSelectedMeetingEvent(ev);
    else if (ev) setSelectedOtherEvent(ev);
  };

  const editCalendarItem = (ev) => {
    const id = ev?.id;
    setSelectedEvent(null);
    setSelectedMeetingEvent(null);
    setSelectedTaskEvent(null);
    setSelectedOtherEvent(null);
    if (id) navigate(`/calendar?focus=${encodeURIComponent(id)}`);
  };

  const toggle = (id) =>
    setOpenPanels((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleQuotePanel = (id) => setQuotePanel((current) => (current === id ? null : id));
  const packageFeaturesOpen = quotePanel === "package";
  const addonsExpanded = quotePanel === "addons";
  const toggleAddon = (id) =>
    setSelectedAddons((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const rmFlags = [...(deal.rmFlags || []), ...addedFlags];
  const rmFlagCount = rmFlags.filter((flag) => !isEmptyFlag(flag)).length;
  const resetFlagForm = () => {
    setFlagLabel("");
    setFlagToneValue("amber");
    setFlagNote("");
  };
  const saveFlag = (e) => {
    e.preventDefault();
    const label = flagLabel.trim();
    const note = flagNote.trim();
    if (!label) {
      toast.error("Please add a flag name.");
      return;
    }
    setAddedFlags((prev) => [...prev, { label, tone: flagToneValue, note }]);
    recordLeadActivity(deal, currentStage, {
      type: "flag",
      title: `RM flag added: ${label}`,
      detail: note,
    });
    toast.success("RM flag added.");
    resetFlagForm();
    setFlagAddOpen(false);
    setFlagsOpen(true);
  };

  const panels = [
    { id: "history", label: "Lead History", icon: History, onView: () => setHistoryOpen(true) },
    {
      id: "flags",
      label: "RM Flags",
      icon: Flag,
      onAdd: () => setFlagAddOpen(true),
      onView: () => setFlagsOpen(true),
    },
    { id: "handover", label: "Handover Checklist", icon: ClipboardList, onView: () => setHandoverOpen(true) },
  ];

  const renderPanel = (item) => {
    const Icon = item.icon;
    const open = openPanels.includes(item.id);
    return (
      <div
        key={item.id}
        className={`bg-white border rounded-2xl min-w-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors duration-300 ${
          open ? "border-[#7A0A17]" : "border-[#EEF1F4]"
        }`}
      >
        <div className="flex items-center gap-2 h-12 px-3.5">
          <button
            type="button"
            onClick={() => toggle(item.id)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
            aria-expanded={open}
          >
            <Icon size={16} className="text-[#7A0A17] shrink-0" strokeWidth={2.2} />
            <span className="text-[13px] font-bold text-[#7A0A17] truncate">{item.label}</span>
            {item.id === "flags" ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#F6E4E8] text-[11px] font-bold text-[#7A0A17] tabular-nums leading-none shrink-0">
                {rmFlagCount}
              </span>
            ) : null}
          </button>
          {item.onAdd ? (
            <button
              type="button"
              onClick={item.onAdd}
              tabIndex={open ? 0 : -1}
              className={`inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#7A0A17] shrink-0 hover:text-[#640712] overflow-hidden transition-all duration-300 ${
                open ? "max-w-12 opacity-100" : "max-w-0 opacity-0 pointer-events-none"
              }`}
            >
              <span className="whitespace-nowrap">Add</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={item.onView}
            tabIndex={open ? 0 : -1}
            className={`inline-flex items-center gap-0.5 text-[12px] font-medium text-[#9CA3AF] shrink-0 hover:text-[#6B7280] overflow-hidden transition-all duration-300 ${
              open ? "max-w-24 opacity-100" : "max-w-0 opacity-0 pointer-events-none"
            }`}
          >
            <span className="whitespace-nowrap">View All</span>
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => toggle(item.id)}
            className="text-[#9CA3AF] shrink-0"
            aria-label={open ? `Close ${item.label}` : `Open ${item.label}`}
          >
            <ChevronDown size={16} className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className={`px-3.5 pb-3 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}>
              {item.id === "history" ? <HistoryPreview events={allEvents} /> : null}
              {item.id === "flags" ? (
                <FlagsPreview flags={rmFlags} onView={(flag) => setViewingFlag(flag)} />
              ) : null}
              {item.id === "handover" ? <HandoverPreview onOpen={() => setHandoverOpen(true)} /> : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)_300px] gap-3 items-stretch">
        <section className="bg-white border border-[#EEF1F4] rounded-2xl p-4 h-full shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center h-7 px-3.5 rounded-full bg-[#7A2433] text-white text-[12px] font-semibold whitespace-nowrap">
              Profile {completion}% Complete
            </span>
            <span className="inline-flex items-center gap-1.5 text-[16px] font-bold text-[#1F2937] shrink-0 leading-none">
              {scoreText || "-"}
              <Flag size={14} className="text-[#22C55E]" fill="#22C55E" strokeWidth={1.6} aria-hidden />
            </span>
          </div>
          <div className="mt-2.5 h-[5px] rounded-full bg-[#F6E4E8] overflow-hidden">
            <div className="h-full rounded-full bg-[#7A2433]" style={{ width: `${completion}%` }} />
          </div>

          <div className="flex items-start gap-3.5 mt-4">
            <span className="size-[76px] rounded-full bg-[#F3E4E6] text-[#7A0A17] text-[20px] font-bold grid place-items-center shrink-0 overflow-hidden">
              {initials(deal.name) || "—"}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-[17px] font-bold text-[#1F2937] leading-none truncate">{deal.name || "Lead"}</h2>
                <Star size={15} className="text-[#F5B400] shrink-0" fill="#F5B400" strokeWidth={0} />
                <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
                  <button
                    type="button"
                    onClick={onView}
                    className="p-0.5 rounded-md text-[#E8B923] hover:bg-[#FFF6E8] transition-colors"
                    title="View"
                    aria-label="View profile"
                  >
                    <Eye size={16} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="p-0.5 rounded-md text-[#2563EB] hover:bg-[#E8F2FE] transition-colors"
                    title="Edit"
                    aria-label="Edit profile"
                  >
                    <Pencil size={16} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = [`${deal.name || "Lead"}`, `MML ID: ${mmlId}`, `Form No: ${formNo}`].join("\n");
                      navigator.clipboard?.writeText(text).then(
                        () => toast.success("Profile details copied."),
                        () => toast.error("Could not copy profile details.")
                      );
                    }}
                    className="p-0.5 rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors"
                    title="Copy"
                    aria-label="Copy profile details"
                  >
                    <Copy size={16} strokeWidth={1.9} />
                  </button>
                </div>
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="grid grid-cols-[4.35rem_0.6rem_minmax(0,1fr)] items-baseline text-[12px] leading-snug text-[#9CA3AF]">
                  <span>MML ID</span>
                  <span>:</span>
                  <span className="truncate">{mmlId}</span>
                </p>
                <p className="grid grid-cols-[4.35rem_0.6rem_minmax(0,1fr)] items-baseline text-[12px] leading-snug text-[#9CA3AF]">
                  <span>Form No</span>
                  <span>:</span>
                  <span className="truncate">{formNo}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2.5 flex-nowrap">
                <span
                  className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
                  style={{ color: tempTone.color, backgroundColor: tempTone.bg }}
                >
                  {temperature}
                </span>
                {priority ? (
                  <span
                    className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
                    style={{ color: priorityTone.color, backgroundColor: priorityTone.bg }}
                  >
                    {priority}
                  </span>
                ) : null}
                <div className="ml-2 flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast.info("Calling via masked number...")}
                    className="p-0.5 rounded-lg text-[#16A34A] hover:bg-[#E7F8EF] transition-colors"
                    title="Call"
                    aria-label="Call"
                  >
                    <Phone size={16} strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageOpen(true)}
                    className="p-0.5 rounded-lg text-[#F59E0B] hover:bg-[#FFF3E4] transition-colors"
                    title="Message"
                    aria-label="Message"
                  >
                    <MessageSquare size={16} strokeWidth={1.9} />
                  </button>
                  <EmailActivityButton
                    className="relative p-0.5 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] transition-colors"
                    hasUnread
                    size={16}
                    recipientName={deal.name || "Client"}
                    recipientEmail={shown(deal.email)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-5">
            <ProfileStat icon={UserRound} label="Age" value={ageFromDob(deal.dob)} />
            <ProfileStat icon={Briefcase} label="Profession" value={shown(deal.profession)} />
            <ProfileStat icon={MapPin} label="Area" value={areaLine(deal)} />
            <ProfileStat
              icon={Heart}
              label="Looking For"
              value={shown(formatLookingForLabel(deal.lookingFor) || deal.lookingFor)}
            />
            <ProfileStat icon={Users} label="Inquiry By" value={shown(deal.enquiryBy)} />
            <ProfileStat icon={Calendar} label="Date of Birth" value={formatDob(deal.dob)} />
            <ProfileStat icon={IndianRupee} label="Family Income" value={shown(deal.familyIncomeBand)} />
            <ProfileStat icon={Globe} label="Source" value={shown(deal.leadSource)} />
          </div>
        </section>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionTile
              icon={Link2}
              iconBg="#E8F8EF"
              iconColor="#22C55E"
              title="Send Link"
              titleColor="#1F2937"
              subtitle="Share biodata or payment link"
              onClick={onSend}
            />
            <ActionTile
              icon={Calendar}
              iconBg="#7A0A17"
              iconColor="#FFFFFF"
              title="Create Meeting"
              titleColor="#7A0A17"
              detail={
                <span className="mt-1 flex items-center gap-2 min-w-0 text-[12px] text-[#9CA3AF] leading-none">
                  <button
                    type="button"
                    onClick={() => openMeetings("due")}
                    className="truncate hover:text-[#7A0A17] hover:underline"
                  >
                    See Meetings
                  </button>
                  <span className="truncate shrink-0">
                    <button
                      type="button"
                      onClick={() => openMeetings("due")}
                      className="hover:text-[#7A0A17] hover:underline"
                    >
                      {meetingDue.length} due
                    </button>
                    {", "}
                    <button
                      type="button"
                      onClick={() => openMeetings("completed")}
                      className="hover:text-[#7A0A17] hover:underline"
                    >
                      {meetingDone.length} completed
                    </button>
                  </span>
                </span>
              }
              onClick={() => setCreateMeetingOpen(true)}
            />
            <ActionTile
              icon={Upload}
              iconBg="#E8F1FE"
              iconColor="#3B82F6"
              title="Upload Biodata"
              titleColor="#2563EB"
              subtitle="Set next action or reminder"
              onClick={() => setBiodataOpen(true)}
            />
            <ActionTile
              icon={UserRound}
              iconBg="#F3E8FF"
              iconColor="#A78BFA"
              title="Create Task"
              titleColor="#1F2937"
              detail={
                <span className="mt-1 flex items-center gap-0 min-w-0 text-[12px] text-[#9CA3AF] leading-none">
                  <button
                    type="button"
                    onClick={() => openTasks("due")}
                    className="hover:text-[#7A0A17] hover:underline"
                  >
                    {taskDue.length} due
                  </button>
                  {", "}
                  <button
                    type="button"
                    onClick={() => openTasks("completed")}
                    className="hover:text-[#7A0A17] hover:underline"
                  >
                    {taskDone.length} completed
                  </button>
                </span>
              }
              onClick={onCreateTask}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <section className="bg-white border border-[#EEF1F4] rounded-2xl p-4 min-w-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <CardHead icon={Gift} title="Package" action="View All" accent onAction={() => setPackageOpen(true)} />
              <button
                type="button"
                onClick={() => toggleQuotePanel("package")}
                aria-expanded={packageFeaturesOpen}
                className="w-full rounded-xl bg-[#FFF2E0] px-4 py-3 flex items-center gap-2.5 text-left"
              >
                <Crown size={18} className="text-[#E8B400] shrink-0" fill="#E8B400" strokeWidth={1.5} />
                <p className="text-[14px] font-semibold text-[#1A5AA8] truncate flex-1 min-w-0">{packageName}</p>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-semibold text-[#1A5AA8] leading-none">{packagePrice}</p>
                  <p className="text-[11px] font-normal text-[#9CA3AF] leading-none mt-1">(Approx.)</p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-[#1A5AA8] shrink-0 transition-transform duration-300 ${packageFeaturesOpen ? "rotate-180" : ""}`}
                  strokeWidth={2.2}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  packageFeaturesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {PACKAGE_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-[13px] font-normal text-[#5C5C5C]">
                        <span className="size-[18px] rounded-full bg-[#10B981] text-white grid place-items-center shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-[#EEF1F4] bg-white">
                <div className="flex items-center gap-2 h-12 px-3.5">
                  <button
                    type="button"
                    onClick={() => toggleQuotePanel("addons")}
                    aria-expanded={addonsExpanded}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <span className="size-7 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                      <Plus size={14} strokeWidth={2.4} />
                    </span>
                    <h4 className="text-[15px] font-bold text-[#7A0A17] truncate">Add-ons</h4>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddonsOpen(true)}
                    tabIndex={addonsExpanded ? 0 : -1}
                    className={`inline-flex items-center gap-0.5 text-[12.5px] font-medium text-[#7A0A17] shrink-0 hover:text-[#640712] overflow-hidden transition-all duration-300 ${
                      addonsExpanded ? "max-w-24 opacity-100" : "max-w-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <span className="whitespace-nowrap">View All</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleQuotePanel("addons")}
                    className="text-[#9CA3AF] shrink-0"
                    aria-label={addonsExpanded ? "Close Add-ons" : "Open Add-ons"}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ease-out ${addonsExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    addonsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className={`px-3.5 pb-3 transition-opacity duration-300 ${addonsExpanded ? "opacity-100" : "opacity-0"}`}>
                      <AddonsPreview
                        selected={selectedAddons}
                        onToggle={toggleAddon}
                        packageAmount={rupeeNumber(packagePrice)}
                        onPay={() => onOpenTab?.("payments")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#EEF1F4] rounded-2xl p-4 min-w-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <CardHead
                icon={Clock}
                title="Next Action"
                action="View All"
                brandAction
                onAction={() => setNextActionOpen(true)}
              />
              <NextActionList items={nextItems} onOpen={openNextAction} />
            </section>
          </div>
        </div>

        <section className="bg-white border border-[#EEF1F4] rounded-2xl p-4 min-w-0 h-full shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="size-8 rounded-full bg-[#7A0A17] text-white grid place-items-center shrink-0">
                <Clock size={15} strokeWidth={2.2} />
              </span>
              <h3 className="text-[15px] font-bold text-[#7A0A17] truncate">Recent Activity</h3>
            </div>
            <button
              type="button"
              onClick={() => setRecentOpen(true)}
              className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#7A0A17] shrink-0 hover:text-[#640712]"
            >
              View All
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </div>
          <RecentActivityCards events={events} />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)_300px] gap-3 items-start">
        {renderPanel(panels[0])}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0 items-start">
          <button
            type="button"
            onClick={() => setPackageOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-2xl border border-[#8E1B32] bg-white px-3.5 py-2.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#FDF2F4] transition-colors"
          >
            <span className="size-8 rounded-full bg-[#8E1B32] text-white grid place-items-center shrink-0">
              <Zap size={15} strokeWidth={2.4} fill="currentColor" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-[#1F2937] leading-tight">Request Discount</span>
              <span className="block text-[11.5px] text-[#6B7280] mt-0.5 leading-snug">
                Get special discount on selected packages
              </span>
            </span>
            <ChevronRight size={18} className="text-[#9CA3AF] shrink-0" strokeWidth={2} />
          </button>
          {renderPanel(panels[1])}
        </div>
        {renderPanel(panels[2])}
      </div>

      <DueCompletedModal
        open={meetingsOpen}
        onClose={() => setMeetingsOpen(false)}
        title="Meetings"
        icon={<Calendar size={18} />}
        iconBg="#7A0A17"
        iconColor="#FFFFFF"
        due={meetingDue}
        completed={meetingDone}
        tab={meetingsTab}
        onTab={setMeetingsTab}
        onOpen={openCalendarItem}
        itemIcon={Calendar}
        itemIconBg="#F6E4E8"
        itemIconColor="#7A0A17"
        fallback="Meeting"
      />
      <DueCompletedModal
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        title="Tasks"
        icon={<UserRound size={18} />}
        iconBg="#F3E8FF"
        iconColor="#A78BFA"
        due={taskDue}
        completed={taskDone}
        tab={tasksTab}
        onTab={setTasksTab}
        onOpen={openCalendarItem}
        itemIcon={UserRound}
        itemIconBg="#F3E8FF"
        itemIconColor="#7C3AED"
        fallback="Task"
      />

      <CreateMeetingEventModal
        open={createMeetingOpen}
        onClose={() => setCreateMeetingOpen(false)}
        entityLabel="Meeting"
        defaultDate={new Date()}
        initial={meetingInitial}
        onSave={(form) => {
          const item = addExtraEvent(meetingFormToCalendarItem(form, "meeting"));
          recordLeadActivity(deal, currentStage, {
            type: "meeting",
            title: item.title || "Meeting scheduled",
            stage: currentStage,
          });
          toast.success("Meeting scheduled.");
        }}
      />

      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} />

      <Modal open={recentOpen} onClose={() => setRecentOpen(false)} title="Recent Activity" width="max-w-lg">
        <RecentActivityCards events={allEvents} />
      </Modal>

      <Modal
        open={nextActionOpen}
        onClose={() => setNextActionOpen(false)}
        title="Next Action"
        subtitle="Meetings and tasks from the calendar"
        icon={<Clock size={18} />}
        iconBg="#F6E4E8"
        iconColor="#7A0A17"
        width="max-w-2xl"
      >
        <NextActionList items={calendarActions} onOpen={openNextAction} />
      </Modal>

      <Modal
        open={addonsOpen}
        onClose={() => setAddonsOpen(false)}
        title="Add-ons"
        subtitle="Select extras for this package"
        icon={<Plus size={18} />}
        iconBg="#F3E8FF"
        iconColor="#7C3AED"
        width="max-w-lg"
      >
        <AddonsPreview
          selected={selectedAddons}
          onToggle={toggleAddon}
          packageAmount={rupeeNumber(packagePrice)}
          onPay={() => {
            setAddonsOpen(false);
            onOpenTab?.("payments");
          }}
        />
      </Modal>

      <Modal
        open={flagsOpen}
        onClose={() => setFlagsOpen(false)}
        title="RM Flags"
        subtitle="Flags that carry into service handover"
        icon={<Flag size={18} />}
        iconBg="#F6E4E8"
        iconColor="#7A0A17"
        width="max-w-lg"
        headerActions={
          <button
            type="button"
            onClick={() => setFlagAddOpen(true)}
            className="h-8 px-3 rounded-lg bg-[#7A0A17] text-white text-[12px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Add
          </button>
        }
      >
        <RmFlagsList flags={rmFlags} onView={(flag) => setViewingFlag(flag)} />
      </Modal>

      <Modal
        open={flagAddOpen}
        onClose={() => {
          resetFlagForm();
          setFlagAddOpen(false);
        }}
        title="Add RM flag"
        subtitle="Visible to the RM and service team"
        icon={<Flag size={18} />}
        iconBg="#FFF3E4"
        iconColor="#F59E0B"
        zClass="z-[60]"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                resetFlagForm();
                setFlagAddOpen(false);
              }}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-rm-flag-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save flag
            </button>
          </>
        }
      >
        <form id="add-rm-flag-form" onSubmit={saveFlag} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Flag</label>
            <input
              value={flagLabel}
              onChange={(e) => setFlagLabel(e.target.value)}
              placeholder="e.g. Preference mismatch"
              className={FLAG_FIELD}
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Tone</label>
            <select value={flagToneValue} onChange={(e) => setFlagToneValue(e.target.value)} className={FLAG_FIELD}>
              <option value="amber">Amber</option>
              <option value="red">Alert</option>
              <option value="blue">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Note</label>
            <textarea
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              rows={4}
              placeholder="Why this flag matters…"
              className={`${FLAG_FIELD} resize-none`}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!viewingFlag}
        onClose={() => setViewingFlag(null)}
        title={viewingFlag?.label || "RM Flag"}
        subtitle="RM flag"
        icon={<Flag size={18} />}
        iconBg="#F6E4E8"
        iconColor="#7A0A17"
        zClass="z-[60]"
      >
        {viewingFlag ? (
          <div>
            <span
              className="inline-flex text-[12px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ color: flagTone(viewingFlag).color, backgroundColor: flagTone(viewingFlag).bg }}
            >
              {viewingFlag.label}
            </span>
            <p className="mt-3 text-[13px] text-[#374151] leading-relaxed">
              {flagDetail(viewingFlag) || "No note added for this flag."}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={handoverOpen}
        onClose={() => setHandoverOpen(false)}
        title="Handover Checklist"
        subtitle="Verify every item before service handover"
        icon={<ClipboardList size={18} />}
        iconBg="#F6E4E8"
        iconColor="#7A0A17"
        width="max-w-6xl"
      >
        <P6ChecklistTab
          locked={false}
          clientName={deal.name || "Client"}
          serviceAssigned={null}
          onHandoverToServices={() => toast.success("Handover checklist updated.")}
        />
      </Modal>

      <Modal
        open={packageOpen}
        onClose={() => setPackageOpen(false)}
        title="Package"
        subtitle="Catalogue, quote and discount"
        icon={<Gift size={18} />}
        iconBg="#FFF2E0"
        iconColor="#E8B400"
        width="max-w-6xl"
      >
        <PackageQuoteTab
          empty={!atLeast(currentStage, "P4")}
          selectedKey={selectedPackageKey}
          onPackageSelect={onPackageSelect}
        />
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Lead History" width="max-w-3xl">
        <LeadActivityHistory lead={deal} currentStage={currentStage} />
      </Modal>

      <EventDetailsModal
        open={!!selectedEvent}
        event={calendarEventToEventView(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onEdit={() => selectedEvent && editCalendarItem(selectedEvent)}
      />
      <OthersDetailsModal
        open={!!selectedOtherEvent}
        item={calendarEventToOtherView(selectedOtherEvent)}
        onClose={() => setSelectedOtherEvent(null)}
        onEdit={() => selectedOtherEvent && editCalendarItem(selectedOtherEvent)}
      />
      <MeetingDetailsModal
        open={!!selectedMeetingEvent}
        meeting={calendarEventToMeetingView(selectedMeetingEvent)}
        entityLabel="Meeting"
        onClose={() => setSelectedMeetingEvent(null)}
        onEdit={() => selectedMeetingEvent && editCalendarItem(selectedMeetingEvent)}
      />
      <TaskDetailsModal
        open={!!selectedTaskEvent}
        task={calendarEventToTaskView(selectedTaskEvent)}
        onClose={() => setSelectedTaskEvent(null)}
        onEdit={() => selectedTaskEvent && editCalendarItem(selectedTaskEvent)}
      />

      <BiodataUploadModal
        open={biodataOpen}
        onClose={() => setBiodataOpen(false)}
        compareWith={deal}
        onFillForm={(payload) => {
          const f = payload?.fields || {};
          setBiodataOpen(false);
          setPendingBiodata(payload);
          if (payload?.file) void rememberPendingBiodataFile(payload.file);

          const stored = deal?.id ? findLeadById(deal.id)?.lead : null;
          setProfileInitial({
            firstName: f.firstName || filled(deal.firstName),
            lastName: f.lastName || filled(deal.lastName),
            dob: f.dob || filled(deal.dob),
            mobile: f.mobile || payload?.senderMobile || filled(deal.mobile) || filled(deal.phone),
            email: f.email || payload?.senderEmail || filled(deal.email),
            city: f.city || filled(deal.city),
            area: f.area || filled(deal.area) || filled(deal.areaOfHouse),
            lookingFor: f.lookingFor || filled(deal.lookingFor) || "Groom",
            relation: payload?.importedFields?.relation || f.relation || filled(deal.enquiryBy) || "Self",
            contactWith: "Existing Client",
            source:
              filled(deal.leadSource) && filled(deal.leadSource) !== "Website Inquiry"
                ? filled(deal.leadSource)
                : "Biodata Upload",
            fileName: payload?.fileName || "",
            existingLeadId: deal?.id,
            mode: deal?.id ? "update" : "create",
            alsoRead: payload?.alsoRead || [],
            intake: payload?.intake || {},
            biodataName: payload?.biodataName || "",
            existingValues: {
              ...(payload?.existingValues || {}),
              ...(stored?.intakeValues || {}),
            },
            importedFields: payload?.importedFields || f,
            matchName: filled(deal.name),
            fieldMeta: payload?.fieldMeta || {},
            prefillAt: Date.now(),
          });
          setShowBiodataProfile(true);
          toast.info("Check the fields, then save to update this profile.");
        }}
      />
      {showBiodataProfile ? (
        <BiodataProfileModal
          key={profileInitial?.prefillAt || profileInitial?.fileName || "biodata-profile"}
          open
          initial={profileInitial}
          onClose={closeBiodataProfile}
          onSave={saveBiodataProfile}
        />
      ) : null}
    </div>
  );
}
