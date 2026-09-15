import { useEffect, useState } from "react";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Flag,
  Layers,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Truck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";

const PRIORITY_FILL = {
  Low: "bg-[#E7F8EF] text-[#16A34A]",
  Medium: "bg-[#FFF3E4] text-[#D97706]",
  High: "bg-[#FDECEE] text-[#E8395B]",
};

const DURATION_MINUTES = {
  "30 minutes": 30,
  "1 hour": 60,
  "2 hours": 120,
  "3 hours": 180,
  "5 hours": 300,
};

function fmtDate(d) {
  if (!d) return "—";
  if (typeof d === "string" && /^\d{2}-\d{2}-\d{2,4}$/.test(d)) return d;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function fmtDateTime(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return `${fmtDate(date)} · ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function computeEndTime(startTime, durationLabel) {
  if (!startTime || !durationLabel) return "";
  if (durationLabel === "Full day") return "All day";
  const mins = DURATION_MINUTES[durationLabel];
  if (mins == null) return "";
  const [h, m] = String(startTime).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = (h * 60 + m + mins) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const period = hh >= 12 ? "PM" : "AM";
  let hh12 = hh % 12;
  if (hh12 === 0) hh12 = 12;
  return `${hh12}:${String(mm).padStart(2, "0")} ${period}`;
}

function fmtClock(timeStr, hourFallback) {
  if (timeStr) {
    if (/[AP]M/i.test(timeStr) || String(timeStr).toLowerCase() === "all day") return timeStr;
    const [h, m] = String(timeStr).split(":");
    if (h != null) {
      const hour = Number(h);
      const period = hour >= 12 ? "PM" : "AM";
      const hh12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hh12}:${String(m || "00").padStart(2, "0")} ${period}`;
    }
  }
  if (hourFallback == null) return "—";
  const period = hourFallback >= 12 ? "PM" : "AM";
  const hh12 = hourFallback % 12 === 0 ? 12 : hourFallback % 12;
  return `${hh12}:00 ${period}`;
}

function DetailItem({ label, icon: Icon, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8f95a5] uppercase tracking-wide">
        {Icon ? <Icon size={13} className="text-[#8f95a5]" strokeWidth={1.75} /> : null}
        {label}
      </p>
      <div className="text-[14px] font-medium text-[#111] mt-1.5 break-words">{children ?? "—"}</div>
    </div>
  );
}

function ChipList({ items }) {
  if (!items?.length) return <span className="text-[#9CA3AF]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F1F2F4] text-[12px] font-medium text-[#374151]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-[#f1f1f4] rounded-xl p-1 w-fit mb-6 max-w-full overflow-x-auto scrollbar-thin">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`px-4 sm:px-5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
            active === t.key ? "bg-white text-black shadow-sm" : "text-[#6f7886]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LinkValue({ href }) {
  if (!href) return "—";
  const isHttp = String(href).startsWith("http");
  return (
    <a
      href={isHttp ? href : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#3B82F6] hover:underline break-all font-medium"
      onClick={(e) => {
        if (!isHttp) e.preventDefault();
      }}
    >
      {href}
    </a>
  );
}

/** Normalize calendar event → event details view model */
export function calendarEventToEventView(ev) {
  if (!ev) return null;
  const m = ev.meta || {};
  const employees = Array.isArray(m.people) && m.people.length
    ? m.people
    : Array.isArray(m.assignees)
      ? m.assignees
      : [];
  const duration = m.duration || "";
  const endTime =
    m.endTime && /[AP]M|all day/i.test(String(m.endTime))
      ? m.endTime
      : computeEndTime(m.startTime, duration) || fmtClock(m.endTime, ev.endH);

  return {
    id: ev.id,
    title: ev.title,
    category: m.eventCategory || m.eventType || m.formDescription || "Internal meeting",
    priority: m.priority || "High",
    mode: m.eventMode || "In-person",
    visibility: m.visibility || "Branch only",
    venue: m.venue || m.location || "",
    logisticsRequired: Boolean(m.logisticsRequired),
    branches: Array.isArray(m.branches) ? m.branches : [],
    employees,
    clients: Array.isArray(m.clients) ? m.clients : [],
    startDate: ev.date,
    endDate: m.dueDate || ev.date,
    startTime: fmtClock(m.startTime, ev.startH),
    duration: duration || "—",
    endTime: endTime || "—",
    reminderChannels: Array.isArray(m.reminderChannels) ? m.reminderChannels : [],
    messageTemplate: m.messageTemplate || "No template — plain text",
    reminderFrequency: Array.isArray(m.reminderFrequency)
      ? m.reminderFrequency[0] || "On day of event"
      : m.reminderFrequency || "On day of event",
    vendors: Array.isArray(m.vendors) ? m.vendors : [],
    attachment: m.attachment || "",
    attachments: Array.isArray(m.attachments)
      ? m.attachments
      : m.attachment
        ? [{ name: m.attachment, size: "—" }]
        : [],
    referenceLink: m.referenceLink || "",
    specialInstructions: m.specialInstructions || "",
    comments: Array.isArray(m.comments) ? m.comments : [],
  };
}

export default function EventDetailsModal({
  open,
  event,
  onClose,
  onEdit,
  onUpdateEvent,
}) {
  const [tab, setTab] = useState("details");
  const [commentText, setCommentText] = useState("");
  const [mediaText, setMediaText] = useState("");

  useEffect(() => {
    if (open) {
      setTab("details");
      setCommentText("");
      setMediaText("");
    }
  }, [open, event?.id]);

  if (!open || !event) return null;

  const comments = event.comments || [];
  const attachments = event.attachments || [];

  const patch = (updater) => {
    const next = typeof updater === "function" ? updater(event) : { ...event, ...updater };
    onUpdateEvent?.(next);
  };

  const tabs = [
    { key: "details", label: "Details" },
    { key: "comments", label: `Comments (${comments.length})` },
    { key: "attachments", label: "Attachments" },
  ];

  return (
    <Modal open={open} onClose={onClose} hideHeader width="max-w-[640px]">
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-black/10 -mt-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-[#FDECEE] grid place-items-center shrink-0">
            <ClipboardList size={18} className="text-[#E8395B]" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-black truncate">{event.title}</h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="p-1.5 rounded-lg text-[#2b7fff] hover:bg-[#E8F2FE] transition-colors"
              aria-label="Edit event"
            >
              <Pencil size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === "details" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <DetailItem label="Event Category" icon={ClipboardList}>{event.category || "—"}</DetailItem>
            <DetailItem label="Priority" icon={Flag}>
              <span
                className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                  PRIORITY_FILL[event.priority] || PRIORITY_FILL.High
                }`}
              >
                {event.priority || "High"}
              </span>
            </DetailItem>
            <DetailItem label="Event Mode" icon={Layers}>{event.mode || "—"}</DetailItem>
            <DetailItem label="Visibility" icon={Eye}>{event.visibility || "—"}</DetailItem>
            <DetailItem label="Venue / Location" icon={MapPin}>{event.venue || "—"}</DetailItem>
            <DetailItem label="Company Vehicle / Logistics" icon={Truck}>
              {event.logisticsRequired ? "Required" : "Not required"}
            </DetailItem>
            <DetailItem label="Branches" icon={Layers}>
              <ChipList items={event.branches} />
            </DetailItem>
            <DetailItem label="Start Date" icon={CalendarDays}>{fmtDate(event.startDate)}</DetailItem>
            <DetailItem label="End Date" icon={CalendarDays}>{fmtDate(event.endDate)}</DetailItem>
            <DetailItem label="Start Time" icon={CalendarClock}>{event.startTime || "—"}</DetailItem>
            <DetailItem label="Duration" icon={CalendarClock}>{event.duration || "—"}</DetailItem>
            <DetailItem label="End Time" icon={CalendarClock}>{event.endTime || "—"}</DetailItem>
            <DetailItem label="Reminder Frequency" icon={Bell}>{event.reminderFrequency || "—"}</DetailItem>
          </div>

          <DetailItem label="Employees Invited" icon={UserCheck}>
            <ChipList items={event.employees} />
          </DetailItem>
          <DetailItem label="Clients / Families Invited" icon={Users}>
            <ChipList items={event.clients} />
          </DetailItem>
          <DetailItem label="Send Reminders Via" icon={Bell}>
            <ChipList items={event.reminderChannels} />
          </DetailItem>
          <DetailItem label="Message Template" icon={FileText}>
            {event.messageTemplate || "—"}
          </DetailItem>
          <DetailItem label="Vendors & Arrangements" icon={Layers}>
            <ChipList items={event.vendors} />
          </DetailItem>
          {event.referenceLink ? (
            <DetailItem label="Reference Link" icon={Paperclip}>
              <LinkValue href={event.referenceLink} />
            </DetailItem>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8f95a5] uppercase tracking-wide">
              <FileText size={13} className="text-[#8f95a5]" strokeWidth={1.75} /> Special Instructions
            </p>
            <p className="text-[14px] text-[#111] leading-relaxed">
              {event.specialInstructions || "No special instructions added."}
            </p>
          </div>
        </div>
      )}

      {tab === "comments" && (
        <div className="flex flex-col gap-4">
          {comments.length === 0 && (
            <p className="text-[13px] text-[#6f7886]">No comments yet. Be the first to add one.</p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="border border-black/10 rounded-xl p-4 flex flex-col gap-2">
              <div>
                <p className="text-[13px] font-semibold text-black">{c.author}</p>
                <p className="text-[11px] text-[#a8a8a8]">{fmtDateTime(c.date)}</p>
              </div>
              <p className="text-[13px] text-[#111]">{c.text}</p>
            </div>
          ))}

          <p className="text-[13px] font-semibold text-black mt-1">Post Comment</p>
          <div className="relative">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write the message here..."
              className="w-full px-3.5 py-2.5 pr-14 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 resize-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!commentText.trim()) return;
                patch({
                  ...event,
                  comments: [
                    ...comments,
                    {
                      author: "Priya Sharma",
                      text: commentText.trim(),
                      date: new Date().toISOString(),
                    },
                  ],
                });
                setCommentText("");
              }}
              className="absolute bottom-3 right-3 size-8 rounded-full bg-[#0D9488] text-white grid place-items-center hover:bg-[#0F766E]"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {tab === "attachments" && (
        <div className="flex flex-col gap-4">
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Paperclip size={26} className="text-[#D1D5DB]" />
              <p className="text-[13px] font-semibold text-[#111] mt-1">No attachments yet</p>
              <p className="text-[12px] text-[#9CA3AF]">Upload files to share with your team!</p>
            </div>
          ) : (
            attachments.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-black/10 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Paperclip size={16} className="text-[#6B7280] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#111] truncate">{a.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{a.size || "—"}</p>
                  </div>
                </div>
                <button type="button" className="p-1 text-[#6B7280] hover:bg-[#FAFAFB] rounded-md" aria-label="Download">
                  <Download size={16} />
                </button>
              </div>
            ))
          )}

          <p className="text-[13px] font-semibold text-[#111] mt-1">Add Media</p>
          <div className="flex items-center gap-2">
            <input
              value={mediaText}
              onChange={(e) => setMediaText(e.target.value)}
              placeholder="Add media..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!mediaText.trim()) return;
                patch({
                  ...event,
                  attachments: [...attachments, { name: mediaText.trim(), size: "—" }],
                });
                setMediaText("");
              }}
              className="h-10 px-4 shrink-0 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
