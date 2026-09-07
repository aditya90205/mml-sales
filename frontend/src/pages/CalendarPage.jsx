import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Sparkles,
  CheckSquare,
  Users2,
  Pencil,
  CalendarDays,
  CircleDot,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";

/* ───────────────────────── Categories ───────────────────────── */

const CATEGORIES = {
  event: { label: "Event", dot: "#A02868", bg: "#FDECF3", text: "#A02868", border: "#BB8D5833" },
  task: { label: "Task", dot: "#7C6CB0", bg: "#F5EFFC", text: "#7C6CB0", border: "#7C6CB033" },
  meeting: { label: "Meetings & Appointments", dot: "#41703D", bg: "#F6FFF5", text: "#41703D", border: "#41703D33" },
  other: { label: "Others", dot: "#6F7886", bg: "#EEEEE", text: "#6F7886", border: "#6F788633"},
};

/* ───────────────────────── Date helpers ───────────────────────── */

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 AM – 6 PM

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function fmtHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}
function fmtTime(h, m = 0) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
function fmtDate(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}
function toDateInput(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const STAGE_OPTIONS = ["New", "In Progress", "Review", "Blocked", "Done"];
const PRIORITY_STYLES = {
  Critical: { color: "#E8395B" },
  High: { color: "#F59E0B" },
  Medium: { color: "#3B82F6" },
  Low: { color: "#16A34A" },
};

/* ───────────────────────── Mock data ───────────────────────── */

const TODAY = new Date();
const ANCHOR = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

function mk(dayOffset, startH, endH, title, category, meta = {}) {
  const date = addDays(startOfWeek(ANCHOR), dayOffset);
  return {
    id: `${dayOffset}-${startH}-${title}`,
    date,
    startH,
    endH,
    title,
    category,
    meta: {
      priority: "Medium",
      clientRelated: false,
      client: "",
      assignees: ["Priya Sharma"],
      stage: "New",
      dueDate: addDays(date, 3),
      stars: 10,
      description: "",
      ...meta,
    },
  };
}

const INITIAL_EVENTS = [
  mk(0, 13, 15, "Client Meeting with ABC Pvt. Ltd", "meeting", {
    link: "Join on Google Meet",
    clientRelated: true,
    client: "ABC Pvt. Ltd",
    assignees: ["Aditya Sharma"],
    priority: "High",
    stage: "In Progress",
    stars: 20,
    description: "Discuss package options and next steps with ABC Pvt. Ltd.",
  }),
  mk(0, 15, 16, "Team Follow-up Call", "task", {
    assignees: ["Rahul Verma"],
    stage: "In Progress",
    description: "Align on open follow-ups from yesterday’s client calls.",
  }),
  mk(0, 17, 18, "Send Proposal to Client", "other", {
    clientRelated: true,
    client: "Sethi Family",
    assignees: ["Sana Iqbal"],
    priority: "High",
    stars: 15,
    description: "Email the revised pricing proposal and wait for confirmation.",
  }),
  mk(1, 9, 10, "Review Sales Dashboard", "task", {
    assignees: ["Priya Sharma"],
    priority: "Medium",
    stage: "New",
    stars: 12,
    description: "Review yesterday’s pipeline metrics and flag any stuck deals.",
  }),
  mk(1, 10, 11, "Share Invoice with Client", "task", {
    clientRelated: true,
    client: "Agarwal Contract",
    assignees: ["Dev Malhotra"],
    priority: "Critical",
    stars: 18,
    description: "Send the pending invoice and confirm receipt.",
  }),
  mk(1, 11, 12, "Prepare Client Report", "task", {
    clientRelated: true,
    client: "Malhotra Family",
    assignees: ["Neha Kapoor"],
    description: "Compile weekly activity summary for the client review.",
  }),
  mk(1, 14, 16, "Product Launch Event", "event", {
    location: "Main Hall",
    assignees: ["Ishaan Roy", "Priya Sharma"],
    priority: "High",
    stage: "In Progress",
    stars: 25,
    description: "Host the product launch session in the main hall.",
  }),
  mk(2, 9, 11, "Project Update Meeting", "meeting", {
    link: "Join on Google Meet",
    assignees: ["Aditya Sharma"],
    stage: "Review",
    description: "Weekly project status sync with the sales leads.",
  }),
  mk(2, 11, 12, "Follow up on Payment", "task", {
    clientRelated: true,
    client: "Kapoor Family",
    assignees: ["Rahul Verma"],
    priority: "Critical",
    stars: 22,
    description: "Follow up on the outstanding payment and share payment link.",
  }),
  mk(2, 14, 16, "Project Update Meeting", "meeting", {
    link: "Join on Google Meet",
    assignees: ["Sana Iqbal"],
    description: "Afternoon sync on pipeline blockers.",
  }),
  mk(2, 16, 17, "Team Follow-up Call", "task", {
    assignees: ["Priya Sharma"],
    description: "Wrap up remaining action items from morning standup.",
  }),
  mk(3, 9, 10, "Prepare Client Report", "task", {
    clientRelated: true,
    client: "Bansal Family",
    assignees: ["Neha Kapoor"],
  }),
  mk(3, 10, 12, "Strategy Meeting with Marketing Team", "meeting", {
    link: "Join on Google Meet",
    assignees: ["Aditya Sharma", "Sana Iqbal"],
    priority: "High",
    stage: "In Progress",
    stars: 20,
    description: "Align campaign calendar with sales follow-up capacity.",
  }),
  mk(3, 12, 13, "Prepare Monthly Report", "task", {
    assignees: ["Dev Malhotra"],
    stage: "Review",
    stars: 16,
    description: "Draft the monthly sales performance report.",
  }),
  mk(4, 9, 10, "Prepare Client Report", "task", {
    clientRelated: true,
    client: "Gupta Family",
    assignees: ["Neha Kapoor"],
  }),
  mk(4, 11, 13, "Product Launch Event", "event", {
    location: "Main Hall",
    assignees: ["Ishaan Roy"],
    priority: "High",
    stars: 25,
  }),
  mk(4, 13, 15, "Client Meeting with ABC Pvt. Ltd", "meeting", {
    link: "Join on Google Meet",
    clientRelated: true,
    client: "ABC Pvt. Ltd",
    assignees: ["Aditya Sharma"],
    priority: "High",
  }),
  mk(4, 17, 18, "Update Meeting Notes", "other", {
    assignees: ["Priya Sharma"],
    description: "Capture and share notes from today’s client meetings.",
  }),
  mk(5, 9, 10, "Check Client Feedback", "task", {
    clientRelated: true,
    client: "Sethi Family",
    assignees: ["Rahul Verma"],
    stage: "In Progress",
    description: "Review feedback forms submitted this week.",
  }),
  mk(5, 11, 13, "Strategy Meeting with Marketing Team", "meeting", {
    link: "Join on Google Meet",
    assignees: ["Sana Iqbal"],
    priority: "High",
  }),
  mk(5, 15, 16, "Send Event Invites to Clients", "other", {
    clientRelated: true,
    client: "Multiple",
    assignees: ["Neha Kapoor"],
    stars: 14,
    description: "Send invites for next week’s community event.",
  }),
  mk(6, 9, 10, "Prepare Pricing Proposal", "task", {
    clientRelated: true,
    client: "Agarwal Contract",
    assignees: ["Dev Malhotra"],
    priority: "Critical",
    stars: 18,
    description: "Finalize slab pricing options for Agarwal Contract.",
  }),
  mk(6, 11, 12, "Call Back Pending Leads", "task", {
    assignees: ["Priya Sharma"],
    priority: "High",
    stars: 15,
    description: "Return calls to leads marked pending from Friday.",
  }),
  mk(6, 16, 17, "Prepare Client Report", "task", {
    clientRelated: true,
    client: "Malhotra Family",
    assignees: ["Neha Kapoor"],
  }),
];

const INITIAL_UNSCHEDULED = [
  { id: "u1", title: "Call back Sethi", type: "Lead", duration: "30 min" },
  { id: "u2", title: "Draft Agarwal Contract", type: "Lead", duration: "30 min" },
];

const DAY_STATUS = { 3: "free", 9: "free", 11: "filling", 17: "busy", 26: "busy" };

/* ───────────────────────── Small pieces ───────────────────────── */

function CategoryChip({ id, checked, onToggle, count }) {
  const cat = CATEGORIES[id];
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap transition-opacity ${
        checked ? "opacity-100" : "opacity-40"
      }`}
    >
      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.dot }} />
      <span className="text-[#374151]">
        {cat.label}
        {count != null && <span className="text-[#9CA3AF]">({count})</span>}
      </span>
    </button>
  );
}

function EventBlock({ ev, onClick, dense }) {
  const cat = CATEGORIES[ev.category] || CATEGORIES.other;
  return (
    <button
      type="button"
      onClick={() => onClick(ev)}
      className="w-full text-left rounded-lg px-2.5 py-2 hover:brightness-[0.97] transition-[filter] shrink-0"
      style={{ backgroundColor: cat.bg, border: `1px solid ${cat.border}` }}
    >
      {!dense && (
        <p className="text-[11px] font-semibold" style={{ color: cat.text }}>
          {fmtTime(ev.startH)} - {fmtTime(ev.endH)}
        </p>
      )}
      <p className="text-[12.5px] font-bold leading-snug mt-0.5" style={{ color: cat.text }}>{ev.title}</p>
      {!dense && ev.meta?.location && (
        <p className="text-[11px] text-[#6B7280] mt-0.5">({ev.meta.location})</p>
      )}
      {!dense && ev.meta?.link && (
        <p className="text-[11px] font-semibold mt-1" style={{ color: cat.text }}>
          {ev.meta.link}
        </p>
      )}
    </button>
  );
}

function DetailField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <div className="text-[13px] font-semibold text-[#111] mt-1.5 break-words">{children}</div>
    </div>
  );
}

const INPUT =
  "w-full h-9 px-3 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 transition-colors";

function buildFormFromEvent(event) {
  const meta = event.meta || {};
  return {
    title: event.title || "",
    priority: meta.priority || "Medium",
    clientRelated: Boolean(meta.clientRelated),
    client: meta.client || "",
    assignees: Array.isArray(meta.assignees) ? meta.assignees.join(", ") : meta.assignees || "",
    stage: meta.stage || "New",
    startDate: toDateInput(event.date),
    dueDate: toDateInput(meta.dueDate || addDays(event.date, 3)),
    stars: meta.stars ?? 10,
    startH: event.startH,
    endH: event.endH,
    description: meta.description || "",
    location: meta.location || "",
    link: meta.link || "",
  };
}

function EventDetailModal({ event, onClose, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!event) return;
    setEditing(false);
    setForm(buildFormFromEvent(event));
  }, [event]);

  if (!event || !form) return null;

  const cat = CATEGORIES[event.category] || CATEGORIES.other;
  const meta = event.meta || {};
  const assignees = Array.isArray(meta.assignees) ? meta.assignees : meta.assignees ? [meta.assignees] : [];
  const priorityStyle = PRIORITY_STYLES[meta.priority] || PRIORITY_STYLES.Medium;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (Number(form.endH) <= Number(form.startH)) {
      toast.error("End time must be after start time.");
      return;
    }
    const assigneeList = form.assignees
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...event,
      title: form.title.trim(),
      date: new Date(`${form.startDate}T00:00:00`),
      startH: Number(form.startH),
      endH: Number(form.endH),
      meta: {
        ...meta,
        priority: form.priority,
        clientRelated: form.clientRelated,
        client: form.clientRelated ? form.client.trim() : "",
        assignees: assigneeList,
        stage: form.stage,
        dueDate: new Date(`${form.dueDate}T00:00:00`),
        stars: Number(form.stars) || 0,
        description: form.description.trim(),
        location: form.location.trim(),
        link: form.link.trim(),
      },
    });
    setEditing(false);
    toast.success("Details updated.");
  };

  return (
    <Modal
      open={!!event}
      onClose={handleClose}
      title="Task Details"
      subtitle={editing ? form.title || event.title : event.title}
      width="max-w-2xl"
      footer={
        editing ? (
          <>
            <button
              type="button"
              onClick={() => {
                setForm(buildFormFromEvent(event));
                setEditing(false);
              }}
              className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors inline-flex items-center gap-1.5"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Close
            </button>
          </>
        )
      }
    >
      {editing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={INPUT}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Client Related</label>
              <select
                value={form.clientRelated ? "Yes" : "No"}
                onChange={(e) => set("clientRelated", e.target.value === "Yes")}
                className={INPUT}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Client</label>
              <input
                value={form.client}
                onChange={(e) => set("client", e.target.value)}
                disabled={!form.clientRelated}
                placeholder={form.clientRelated ? "Client name" : "—"}
                className={`${INPUT} disabled:bg-[#F7F8FA] disabled:text-[#9CA3AF]`}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Assignees</label>
              <input
                value={form.assignees}
                onChange={(e) => set("assignees", e.target.value)}
                placeholder="Comma-separated names"
                className={INPUT}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Stage</label>
              <select value={form.stage} onChange={(e) => set("stage", e.target.value)} className={INPUT}>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Stars (XP)</label>
              <input
                type="number"
                min={0}
                value={form.stars}
                onChange={(e) => set("stars", e.target.value)}
                className={INPUT}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Start</label>
                <select value={form.startH} onChange={(e) => set("startH", Number(e.target.value))} className={INPUT}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{fmtHour(h)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">End</label>
                <select value={form.endH} onChange={(e) => set("endH", Number(e.target.value))} className={INPUT}>
                  {HOURS.concat(19).map((h) => (
                    <option key={h} value={h}>{fmtHour(h)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {(event.category === "event" || event.category === "meeting") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.category === "event" && (
                <div>
                  <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Location</label>
                  <input value={form.location} onChange={(e) => set("location", e.target.value)} className={INPUT} />
                </div>
              )}
              {event.category === "meeting" && (
                <div>
                  <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Meeting Link</label>
                  <input value={form.link} onChange={(e) => set("link", e.target.value)} className={INPUT} />
                </div>
              )}
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 transition-colors resize-y min-h-[80px]"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.dot }} />
            <span className="text-[13px] font-semibold" style={{ color: cat.text }}>{cat.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <DetailField label="Title">{event.title}</DetailField>
            <DetailField label="Priority">
              <span style={{ color: priorityStyle.color }}>{meta.priority || "Medium"}</span>
            </DetailField>
            <DetailField label="Client Related">{meta.clientRelated ? "Yes" : "No"}</DetailField>
            <DetailField label="Client">{meta.clientRelated && meta.client ? meta.client : "—"}</DetailField>
            <DetailField label="Assignees">
              {assignees.length === 0 ? (
                "—"
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {assignees.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F1F2F4] text-[12px] font-semibold text-[#374151]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </DetailField>
            <DetailField label="Stage">{meta.stage || "New"}</DetailField>
            <DetailField label="Start Date">{fmtDate(event.date)}</DetailField>
            <DetailField label="Due Date">{fmtDate(meta.dueDate || addDays(event.date, 3))}</DetailField>
            <DetailField label="Stars (XP)">{meta.stars ?? 10}</DetailField>
            <DetailField label="Scheduled Time">
              {fmtTime(event.startH)} – {fmtTime(event.endH)}
            </DetailField>
            {meta.location && <DetailField label="Location">{meta.location}</DetailField>}
            {meta.link && (
              <DetailField label="Meeting Link">
                <span className="text-[#3B82F6]">{meta.link}</span>
              </DetailField>
            )}
          </div>

          <DetailField label="Description">
            <span className="font-medium text-[#374151]">
              {meta.description || "No description added."}
            </span>
          </DetailField>
        </div>
      )}
    </Modal>
  );
}

/* ───────────────────────── Create event modal ───────────────────────── */

function CreateEventModal({ open, onClose, onCreate, defaultDate }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("event");
  const [date, setDate] = useState(defaultDate);
  const [startH, setStartH] = useState(10);
  const [endH, setEndH] = useState(11);

  const reset = () => {
    setTitle("");
    setCategory("event");
    setStartH(10);
    setEndH(11);
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create event"
      subtitle="Add a new item to the calendar"
      icon={<Plus size={16} />}
      iconBg={CATEGORIES.event.bg}
      iconColor={CATEGORIES.event.text}
      footer={
        <>
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                toast.error("Please enter a title.");
                return;
              }
              if (endH <= startH) {
                toast.error("End time must be after start time.");
                return;
              }
              onCreate({ title: title.trim(), category, date, startH: Number(startH), endH: Number(endH) });
              reset();
              onClose();
            }}
            className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Create
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Follow up with client"
            className="w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  category === id ? "border-transparent" : "border-black/10 text-[#6B7280] hover:bg-[#FAFAFB]"
                }`}
                style={category === id ? { backgroundColor: cat.bg, color: cat.text } : undefined}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.dot }} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Date</label>
            <input
              type="date"
              value={date.toISOString().slice(0, 10)}
              onChange={(e) => setDate(new Date(e.target.value + "T00:00:00"))}
              className="w-full h-10 px-3 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Start</label>
            <select
              value={startH}
              onChange={(e) => setStartH(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 transition-colors"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{fmtHour(h)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">End</label>
            <select
              value={endH}
              onChange={(e) => setEndH(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 transition-colors"
            >
              {HOURS.concat(19).map((h) => (
                <option key={h} value={h}>{fmtHour(h)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────────────────── Mini calendar ───────────────────────── */

function MiniCalendar({ cursor, onCursorChange, selected, onSelect }) {
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[13px] font-bold text-[#111]">
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-1 rounded-md text-[#6B7280] hover:bg-[#F1F2F4] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-1 rounded-md text-[#6B7280] hover:bg-[#F1F2F4] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[9.5px] font-semibold text-[#9CA3AF] pb-1">{d[0]}</span>
        ))}
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = sameDay(d, TODAY);
          const isSelected = sameDay(d, selected);
          const status = inMonth ? DAY_STATUS[d.getDate()] : null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(d)}
              className={`relative h-7 grid place-items-center text-[11.5px] rounded-full mx-auto w-7 transition-colors ${
                !inMonth ? "text-[#D1D5DB]" : isSelected ? "bg-[#7A0A17] text-white font-bold" : isToday ? "text-[#7A0A17] font-bold" : "text-[#374151] hover:bg-[#F1F2F4]"
              }`}
            >
              {d.getDate()}
              {status && !isSelected && (
                <span
                  className="absolute bottom-0.5 size-1 rounded-full"
                  style={{
                    backgroundColor: status === "free" ? "#16A34A" : status === "filling" ? "#F59E0B" : "#E8395B",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/8">
        {[
          { label: "Free", color: "#16A34A" },
          { label: "Filling", color: "#F59E0B" },
          { label: "Busy", color: "#E8395B" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function CalendarPage() {
  const [view, setView] = useState("Week");
  const [viewOpen, setViewOpen] = useState(false);
  const [anchorDate, setAnchorDate] = useState(ANCHOR);
  const [miniCursor, setMiniCursor] = useState(ANCHOR);
  const [activeCats, setActiveCats] = useState(new Set(Object.keys(CATEGORIES)));
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [unscheduled, setUnscheduled] = useState(INITIAL_UNSCHEDULED);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [dragOverCell, setDragOverCell] = useState(null);

  const allChecked = activeCats.size === Object.keys(CATEGORIES).length;

  const toggleCat = (id) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setActiveCats(allChecked ? new Set() : new Set(Object.keys(CATEGORIES)));
  };

  const visibleEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => activeCats.has(ev.category) && (!q || ev.title.toLowerCase().includes(q)));
  }, [events, activeCats, search]);

  const days = useMemo(() => {
    if (view === "Day") return [anchorDate];
    if (view === "Month") {
      const gridStart = startOfWeek(startOfMonth(anchorDate));
      return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    }
    const ws = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [view, anchorDate]);

  const rangeLabel = useMemo(() => {
    if (view === "Day") {
      return anchorDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    }
    if (view === "Month") {
      return `${MONTH_LABELS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
    }
    const ws = startOfWeek(anchorDate);
    const we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth()) return `${MONTH_LABELS[ws.getMonth()]} ${ws.getFullYear()}`;
    return `${MONTH_LABELS[ws.getMonth()].slice(0, 3)} - ${MONTH_LABELS[we.getMonth()].slice(0, 3)} ${we.getFullYear()}`;
  }, [view, anchorDate]);

  const goPrev = () => {
    if (view === "Day") setAnchorDate((d) => addDays(d, -1));
    else if (view === "Month") setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    else setAnchorDate((d) => addDays(d, -7));
  };
  const goNext = () => {
    if (view === "Day") setAnchorDate((d) => addDays(d, 1));
    else if (view === "Month") setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    else setAnchorDate((d) => addDays(d, 7));
  };

  const jumpTo = (date) => {
    setAnchorDate(date);
    setMiniCursor(date);
  };

  const upNext = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((ev) => {
        const start = new Date(ev.date);
        start.setHours(ev.startH, 0, 0, 0);
        return start >= now;
      })
      .sort((a, b) => {
        const as = new Date(a.date); as.setHours(a.startH);
        const bs = new Date(b.date); bs.setHours(b.startH);
        return as - bs;
      })[0];
  }, [events]);

  const handleDrop = (day, hour) => {
    if (!dragOverCell?.itemId) return;
    const item = unscheduled.find((u) => u.id === dragOverCell.itemId);
    if (!item) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `sched-${item.id}-${Date.now()}`,
        date: day,
        startH: hour,
        endH: hour + 1,
        title: item.title,
        category: "task",
        meta: {
          priority: "Medium",
          clientRelated: false,
          client: "",
          assignees: ["Priya Sharma"],
          stage: "New",
          dueDate: addDays(day, 3),
          stars: 10,
          description: `Scheduled from unscheduled: ${item.type} · ${item.duration}`,
        },
      },
    ]);
    setUnscheduled((prev) => prev.filter((u) => u.id !== item.id));
    setDragOverCell(null);
    toast.success(`"${item.title}" scheduled.`);
  };

  const eventsFor = (day) => visibleEvents.filter((ev) => sameDay(ev.date, day));

  return (
    <div className="flex flex-1 min-h-0" style={{ height: "calc(100vh - 56px)" }}>
      {/* ── Left utility rail (page-local, sits beside the app sidebar) ── */}
      <aside className="w-[236px] shrink-0 border-r border-black/8 bg-white flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#7A0A17] text-white text-[13.5px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
        >
          <Plus size={16} /> Create
        </button>

        <button
          type="button"
          onClick={() => toast.info("Ask AI: try “find me a free slot tomorrow”.")}
          className="text-left bg-[#FCF5F6] border border-[#7A0A17]/12 rounded-2xl p-3.5 hover:bg-[#F9ECEE] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#7A0A17]">
              <Sparkles size={15} /> Ask AI
            </span>
            <ChevronDown size={14} className="text-[#7A0A17]/60 -rotate-90" />
          </div>
          <p className="text-[11.5px] text-[#6B7280] mt-1.5 leading-relaxed">
            Free slots, reschedules, client history, slab progress.
          </p>
        </button>

        {upNext && (
          <div className="bg-white border border-black/8 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold text-[#9CA3AF] tracking-wide">
                UP NEXT · {fmtTime(upNext.startH).toUpperCase()}
              </p>
              <span className="text-[10px] font-bold text-[#E8395B] bg-[#FDECEE] px-1.5 py-0.5 rounded-md">
                {sameDay(upNext.date, TODAY) ? "Today" : upNext.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <p className="text-[13px] font-bold text-[#111] leading-snug">{upNext.title}</p>
              <button
                type="button"
                onClick={() => setSelectedEvent(upNext)}
                className="text-[11.5px] font-semibold text-[#3B82F6] shrink-0 hover:underline"
              >
                Details
              </button>
            </div>
            <p className="text-[11.5px] text-[#9CA3AF] mt-1">
              {fmtTime(upNext.startH)} – {fmtTime(upNext.endH)}
            </p>
          </div>
        )}

        <MiniCalendar cursor={miniCursor} onCursorChange={setMiniCursor} selected={anchorDate} onSelect={jumpTo} />

        <div className="bg-white border border-black/8 rounded-2xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold text-[#9CA3AF] tracking-wide">UNSCHEDULED</p>
            <p className="text-[10.5px] text-[#9CA3AF]">drag onto grid</p>
          </div>
          {unscheduled.length === 0 ? (
            <p className="text-[12px] text-[#9CA3AF] py-2">All caught up.</p>
          ) : (
            unscheduled.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragOverCell({ itemId: item.id })}
                onDragEnd={() => setDragOverCell((c) => (c?.itemId ? null : c))}
                className="flex items-start gap-2.5 rounded-xl border border-black/8 p-2.5 cursor-grab active:cursor-grabbing hover:bg-[#FAFAFB] transition-colors"
              >
                <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#111] leading-snug">{item.title}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.type} · {item.duration}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main calendar ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-black/8 bg-white flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={goPrev} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F1F2F4] transition-colors" aria-label="Previous">
              <ChevronLeft size={17} />
            </button>
            <button type="button" onClick={goNext} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F1F2F4] transition-colors" aria-label="Next">
              <ChevronRight size={17} />
            </button>
            <h1 className="text-[19px] font-bold text-[#111] tracking-tight ml-1">{rangeLabel}</h1>
            <button
              type="button"
              onClick={() => jumpTo(new Date())}
              className="ml-1 text-[11.5px] font-semibold text-[#7A0A17] border border-[#7A0A17]/20 rounded-lg px-2.5 py-1 hover:bg-[#FCF5F6] transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3.5 flex-wrap flex-1 min-w-[280px]">
            <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#374151] cursor-pointer">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[#7A0A17] size-3.5" />
              All
            </label>
            {Object.keys(CATEGORIES).map((id) => (
              <CategoryChip
                key={id}
                id={id}
                checked={activeCats.has(id)}
                onToggle={toggleCat}
                count={events.filter((e) => e.category === id).length}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className={`p-2 rounded-lg transition-colors ${searchOpen ? "bg-[#F1F2F4] text-[#111]" : "text-[#6B7280] hover:bg-[#F1F2F4]"}`}
                aria-label="Search events"
              >
                <Search size={16} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] p-2 z-30">
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="w-full h-9 px-3 rounded-lg bg-[#F7F8FA] text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setViewOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
              >
                {view}
                <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${viewOpen ? "rotate-180" : ""}`} />
              </button>
              {viewOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] min-w-[110px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 overflow-hidden">
                  {["Day", "Week", "Month"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setView(v); setViewOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                        v === view ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {view === "Month" ? (
          <MonthGrid days={days} anchorDate={anchorDate} eventsFor={eventsFor} onEventClick={setSelectedEvent} onDayClick={(d) => { jumpTo(d); setView("Day"); }} />
        ) : (
          <WeekDayGrid
            days={days}
            eventsFor={eventsFor}
            onEventClick={setSelectedEvent}
            dragOverCell={dragOverCell}
            setDragOverCell={setDragOverCell}
            onDrop={handleDrop}
          />
        )}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSave={(updated) => {
          setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
          setSelectedEvent(updated);
        }}
      />
      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDate={anchorDate}
        onCreate={(ev) =>
          setEvents((prev) => [
            ...prev,
            {
              id: `new-${Date.now()}`,
              ...ev,
              meta: {
                priority: "Medium",
                clientRelated: false,
                client: "",
                assignees: ["Priya Sharma"],
                stage: "New",
                dueDate: addDays(ev.date, 3),
                stars: 10,
                description: "",
                ...(ev.meta || {}),
              },
            },
          ])
        }
      />
    </div>
  );
}

/* ───────────────────────── Week / Day grid ───────────────────────── */

function WeekDayGrid({ days, eventsFor, onEventClick, dragOverCell, setDragOverCell, onDrop }) {
  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="min-w-[720px]">
        {/* Day header row */}
        <div className="grid sticky top-0 z-20 bg-white border-b border-black/8" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
          <div className="border-r border-black/8" />
          {days.map((d) => {
            const isToday = sameDay(d, TODAY);
            return (
              <div key={d.toISOString()} className="flex flex-col items-center justify-center py-2.5 border-r border-black/8 last:border-r-0">
                <span className="text-[10.5px] font-semibold text-[#9CA3AF] tracking-wide">{DAY_LABELS[d.getDay()]}</span>
                <span
                  className={`mt-1 text-[17px] font-bold grid place-items-center size-8 rounded-full ${
                    isToday ? "bg-[#7A0A17] text-white" : "text-[#111]"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* All-day row */}
        <div className="grid border-b border-black/8 bg-[#FAFAFB]" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
          <div className="flex items-center justify-center border-r border-black/8 py-2">
            <span className="text-[10px] font-semibold text-[#9CA3AF]">All Day</span>
          </div>
          {days.map((d) => {
            const dayEvents = eventsFor(d);
            const counts = {
              event: dayEvents.filter((e) => e.category === "event").length,
              task: dayEvents.filter((e) => e.category === "task").length,
              meeting: dayEvents.filter((e) => e.category === "meeting").length,
              other: dayEvents.filter((e) => e.category === "other").length,
            };
            const chips = [
              { id: "event", count: counts.event, label: counts.event === 1 ? "Event" : "Events", Icon: CalendarDays },
              { id: "task", count: counts.task, label: "Tasks", Icon: CheckSquare },
              { id: "meeting", count: counts.meeting, label: counts.meeting === 1 ? "Meeting" : "Meetings", Icon: Users2 },
              { id: "other", count: counts.other, label: "Others", Icon: CircleDot },
            ];
            return (
              <div key={d.toISOString()} className="flex items-center justify-center gap-1.5 py-2 border-r border-black/8 last:border-r-0 flex-wrap px-1">
                {chips.map(({ id, count, label, Icon }) =>
                  count > 0 ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-md"
                      style={{ color: CATEGORIES[id].text, backgroundColor: CATEGORIES[id].bg }}
                    >
                      <Icon size={11} /> {count} {label}
                    </span>
                  ) : null
                )}
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="grid" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
          {HOURS.map((h) => (
            <Fragment key={h}>
              <div className="border-r border-b border-black/8 flex items-start justify-center pt-1.5">
                <span className="text-[10.5px] font-medium text-[#9CA3AF]">{fmtHour(h)}</span>
              </div>
              {days.map((d) => {
                const isDrag = dragOverCell?.day && sameDay(dragOverCell.day, d) && dragOverCell.hour === h;
                const cellEvents = eventsFor(d).filter((e) => e.startH === h);
                return (
                  <div
                    key={`${d.toISOString()}-${h}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverCell((c) => (c ? { ...c, day: d, hour: h } : c)); }}
                    onDrop={(e) => { e.preventDefault(); onDrop(d, h); }}
                    className={`relative border-r border-b border-black/8 last:border-r-0 min-h-[62px] px-1.5 py-1 flex flex-col gap-1 transition-colors ${
                      isDrag ? "bg-[#FCF5F6]" : "hover:bg-[#FAFAFB]"
                    }`}
                  >
                    {cellEvents.map((ev) => (
                      <EventBlock key={ev.id} ev={ev} onClick={onEventClick} />
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Month grid ───────────────────────── */

function MonthGrid({ days, anchorDate, eventsFor, onEventClick, onDayClick }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto scrollbar-thin">
      <div className="grid grid-cols-7 border-b border-black/8 bg-white sticky top-0 z-10">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center py-2 text-[10.5px] font-semibold text-[#9CA3AF] border-r border-black/8 last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: "minmax(110px, 1fr)" }}>
        {days.map((d) => {
          const inMonth = d.getMonth() === anchorDate.getMonth();
          const isToday = sameDay(d, TODAY);
          const dayEvents = eventsFor(d);
          return (
            <div
              key={d.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(d)}
              onKeyDown={(e) => e.key === "Enter" && onDayClick(d)}
              className={`border-r border-b border-black/8 text-left p-2 flex flex-col gap-1 overflow-hidden transition-colors hover:bg-[#FAFAFB] cursor-pointer ${
                inMonth ? "bg-white" : "bg-[#FAFAFB]"
              }`}
            >
              <span
                className={`text-[12px] font-bold size-6 grid place-items-center rounded-full ${
                  isToday ? "bg-[#7A0A17] text-white" : inMonth ? "text-[#111]" : "text-[#D1D5DB]"
                }`}
              >
                {d.getDate()}
              </span>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    onKeyDown={(e) => e.key === "Enter" && onEventClick(ev)}
                  >
                    <EventBlock ev={ev} onClick={onEventClick} dense />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10.5px] text-[#9CA3AF] font-medium px-1">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
