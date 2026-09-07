import { CircleDot, Pencil, Star } from "lucide-react";
import Modal from "../ui/Modal";

const PRIORITY_STYLES = {
  Critical: { color: "#E8395B", bg: "#FDECEE" },
  High: { color: "#F59E0B", bg: "#FFF3E4" },
  Medium: { color: "#3B82F6", bg: "#E8F2FE" },
  Low: { color: "#16A34A", bg: "#E7F8EF" },
};

function fmtDate(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const yy = String(date.getFullYear()).slice(-2);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${yy}`;
}

function fmtClock(timeStr, hourFallback) {
  if (timeStr) {
    const [h, m] = String(timeStr).split(":");
    if (h != null) return `${String(h).padStart(2, "0")}:${String(m || "00").padStart(2, "0")}`;
  }
  if (hourFallback == null) return "—";
  return `${String(hourFallback).padStart(2, "0")}:00`;
}

function DetailItem({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <div className="text-[13px] font-medium text-[#111] mt-1.5 break-words">{children ?? "—"}</div>
    </div>
  );
}

function ChipList({ items }) {
  if (!items?.length) return <span className="text-[#9CA3AF]">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
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

/** Normalize calendar event → others view model */
export function calendarEventToOtherView(ev) {
  if (!ev) return null;
  const m = ev.meta || {};
  const assignees = Array.isArray(m.assignees) ? m.assignees : [];
  return {
    id: ev.id,
    category: ev.category || "other",
    title: ev.title,
    date: ev.date,
    startH: ev.startH,
    endH: ev.endH,
    startTime: fmtClock(m.startTime, ev.startH),
    endTime: fmtClock(m.endTime, ev.endH),
    priority: m.priority || "Medium",
    clientRelated: Boolean(m.clientRelated),
    client: m.client || "",
    assignees,
    stars: m.stars ?? 0,
    description: m.description || "",
    stage: m.stage || "New",
  };
}

export default function OthersDetailsModal({ open, item, onClose, onEdit }) {
  if (!open || !item) return null;

  const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Others Details"
      subtitle={item.title}
      icon={<CircleDot size={16} />}
      iconBg="#F3F4F6"
      iconColor="#6F7886"
      width="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors inline-flex items-center gap-1.5"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Close
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full shrink-0 bg-[#6F7886]" />
          <span className="text-[13px] font-semibold text-[#6F7886]">Others</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <DetailItem label="Title">{item.title}</DetailItem>
          <DetailItem label="Priority">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold"
              style={{ color: priorityStyle.color, backgroundColor: priorityStyle.bg }}
            >
              {item.priority}
            </span>
          </DetailItem>

          <DetailItem label="Date">{fmtDate(item.date)}</DetailItem>
          <DetailItem label="Time">
            {item.startTime} – {item.endTime}
          </DetailItem>

          <DetailItem label="Client Related">{item.clientRelated ? "Yes" : "No"}</DetailItem>
          <DetailItem label="Client">{item.clientRelated ? item.client || "—" : "—"}</DetailItem>

          <DetailItem label="Assignees">
            <ChipList items={item.assignees} />
          </DetailItem>
          <DetailItem label="Stars (xp)">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111]">
              <Star size={14} className="text-[#F59E0B]" fill="#F59E0B" />
              {item.stars ?? 0}
            </span>
          </DetailItem>

          <DetailItem label="Status">{item.stage || "New"}</DetailItem>

          <DetailItem label="Description" className="sm:col-span-2">
            {item.description || "No description added."}
          </DetailItem>
        </div>
      </div>
    </Modal>
  );
}
