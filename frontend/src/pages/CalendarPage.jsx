import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  LayoutGrid,
  LayoutList,
  Eye,
  Edit2,
  Trash2,
  ListTodo,
  CalendarCheck2,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import CreateMeetingEventModal from "../components/calendar/CreateMeetingEventModal";
import CreateTaskModal from "../components/calendar/CreateTaskModal";
import CreateOtherModal from "../components/calendar/CreateOtherModal";
import TaskDetailsModal, { calendarEventToTaskView } from "../components/calendar/TaskDetailsModal";
import MeetingDetailsModal, { calendarEventToMeetingView } from "../components/calendar/MeetingDetailsModal";
import OthersDetailsModal, { calendarEventToOtherView } from "../components/calendar/OthersDetailsModal";

/* ───────────────────────── Categories ───────────────────────── */

const CATEGORIES = {
  event: { label: "Event", dot: "#A02868", bg: "#FDECF3", text: "#A02868", border: "#BB8D5833" },
  task: { label: "Task", dot: "#7C6CB0", bg: "#F5EFFC", text: "#7C6CB0", border: "#7C6CB033" },
  meeting: { label: "Meetings & Appointments", dot: "#41703D", bg: "#F6FFF5", text: "#41703D", border: "#41703D33" },
  other: { label: "Others", dot: "#6F7886", bg: "#F3F4F6", text: "#6F7886", border: "#6F788633" },
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
function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}
function getMeetingJoinUrl(meta = {}) {
  for (const candidate of [meta.meetingLink, meta.link]) {
    if (isHttpUrl(candidate)) return candidate.trim();
  }
  return null;
}

const PRIORITY_STYLES = {
  Critical: { color: "#E8395B", bg: "#FDECEE" },
  High: { color: "#F59E0B", bg: "#FFF3E4" },
  Medium: { color: "#3B82F6", bg: "#E8F2FE" },
  Low: { color: "#16A34A", bg: "#E7F8EF" },
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
  mk(0, 13, 15, "Video Call — Kapoor Family", "meeting", {
    link: "https://meet.google.com/mml-kapoor",
    meetingLink: "https://meet.google.com/mml-kapoor",
    clientRelated: true,
    client: "Kapoor Family",
    assignees: ["Anjali Gupta"],
    people: ["Anjali Gupta"],
    inviteGroups: ["employees"],
    attendeesList: "Kapoor Family",
    meetingKind: "Individual",
    meetingTypes: ["video"],
    emailIds: "anjali.gupta@makemylagan.com;",
    formDescription: "P3 video call to discuss shortlisted profiles",
    duration: "2 hours",
    startTime: "13:00",
    endTime: "15:00",
    requirements: ["Meeting Notes"],
    notesTo: ["All Participants"],
    specialInstructions: "",
    activationStatus: "Active",
    priority: "High",
    stage: "In Progress",
    stars: 20,
    description: "Walk Kapoor Family through 5 shortlisted matches and confirm next visit.",
    dueDate: addDays(startOfWeek(ANCHOR), 49),
  }),
  mk(0, 15, 16, "RM Follow-up Call", "task", {
    assignees: ["Rahul Verma"],
    stage: "In Progress",
    project: "Sales Pipeline",
    milestone: "Weekly Sync",
    progress: 55,
    description: "Align on open follow-ups from yesterday’s home visits and video calls.",
    comments: [
      { author: "Priya Sharma", text: "Please cover Sethi Family follow-up first.", date: new Date().toISOString() },
    ],
    checklist: [
      { text: "Review open P2 intake gaps", done: true, assignee: "Rahul Verma", dueDate: addDays(ANCHOR, 1) },
      { text: "Call pending prospects", done: false, assignee: "Rahul Verma", dueDate: addDays(ANCHOR, 1) },
    ],
    attachments: [{ name: "followups.pdf", size: "240 KB" }],
  }),
  mk(0, 17, 18, "Send Package Quote", "other", {
    clientRelated: true,
    client: "Sethi Family",
    assignees: ["Sana Iqbal"],
    priority: "High",
    stars: 15,
    description: "Email the Premium package quote and wait for family confirmation.",
  }),
  mk(1, 9, 10, "Review Pipeline Board", "task", {
    assignees: ["Priya Sharma"],
    priority: "Medium",
    stage: "New",
    stars: 12,
    project: "Matchmaking",
    milestone: "Planning",
    progress: 20,
    description: "Review yesterday’s P0–P3 movement and flag stuck prospects.",
    comments: [],
    checklist: [
      { text: "Check P0/P1 stuck prospects", done: false, assignee: "Priya Sharma", dueDate: addDays(ANCHOR, 2) },
    ],
    attachments: [],
  }),
  mk(1, 10, 11, "Share Payment Link", "task", {
    clientRelated: true,
    client: "Agarwal Family",
    assignees: ["Dev Malhotra"],
    priority: "Critical",
    stars: 18,
    project: "Closures",
    milestone: "Collections",
    progress: 40,
    stage: "In Progress",
    description: "Send Premium package payment link and confirm receipt.",
    comments: [],
    checklist: [],
    attachments: [{ name: "payment-agarwal.pdf", size: "128 KB" }],
  }),
  mk(1, 11, 12, "Prepare Match Shortlist", "task", {
    clientRelated: true,
    client: "Malhotra Family",
    assignees: ["Neha Kapoor"],
    project: "Matchmaking",
    milestone: "Shortlist",
    progress: 30,
    stage: "New",
    description: "Compile weekly match shortlist for the family review call.",
    comments: [],
    checklist: [],
    attachments: [],
  }),
  mk(1, 14, 16, "Branch All-Hands — Ankur Mishra", "event", {
    location: "Rajouri Garden Branch",
    venue: "Rajouri Garden Branch",
    assignees: ["Anjali Gupta", "Abhinav Pandey"],
    people: ["Anjali Gupta", "Abhinav Pandey"],
    inviteGroups: ["employees"],
    attendeesList: "Anjali Gupta, Abhinav Pandey",
    eventType: "Company Event",
    formDescription: "Branch Event",
    meetingTypes: [],
    emailIds: "ankur.mishra@makemylagan.com;",
    duration: "",
    startTime: "14:00",
    endTime: "17:00",
    meetingLink: "",
    link: "",
    specialInstructions: "",
    activationStatus: "Active",
    priority: "High",
    stage: "In Progress",
    stars: 25,
    description: "Branch all-hands covering closures, home-visit targets and package upsells.",
    dueDate: addDays(startOfWeek(ANCHOR), 1),
  }),
  mk(2, 9, 11, "Home Visit Briefing", "meeting", {
    link: "https://meet.google.com/mml-home-visit",
    meetingLink: "https://meet.google.com/mml-home-visit",
    assignees: ["Aditya Sharma"],
    stage: "Review",
    description: "Weekly sync on scheduled home visits and capture checklist readiness.",
  }),
  mk(2, 11, 12, "Follow up on Token Payment", "task", {
    clientRelated: true,
    client: "Kapoor Family",
    assignees: ["Rahul Verma"],
    priority: "Critical",
    stars: 22,
    description: "Follow up on the outstanding token payment and share the payment link.",
  }),
  mk(2, 14, 16, "Profile Curation Review", "meeting", {
    link: "https://meet.google.com/mml-profile-curation",
    meetingLink: "https://meet.google.com/mml-profile-curation",
    assignees: ["Sana Iqbal"],
    description: "Afternoon sync on profile curation blockers for Exclusive packages.",
  }),
  mk(2, 16, 17, "RM Follow-up Call", "task", {
    assignees: ["Priya Sharma"],
    description: "Wrap up remaining action items from morning visit briefings.",
  }),
  mk(3, 9, 10, "Prepare Match Shortlist", "task", {
    clientRelated: true,
    client: "Bansal Family",
    assignees: ["Neha Kapoor"],
  }),
  mk(3, 10, 12, "Community Campaign Sync", "meeting", {
    link: "https://meet.google.com/mml-campaign-sync",
    meetingLink: "https://meet.google.com/mml-campaign-sync",
    assignees: ["Aditya Sharma", "Sana Iqbal"],
    priority: "High",
    stage: "In Progress",
    stars: 20,
    description: "Align community event outreach with RM follow-up capacity.",
  }),
  mk(3, 12, 13, "Prepare Monthly Closures Report", "task", {
    assignees: ["Dev Malhotra"],
    stage: "Review",
    stars: 16,
    description: "Draft the monthly package closures and win/loss report.",
  }),
  mk(4, 9, 10, "Prepare Match Shortlist", "task", {
    clientRelated: true,
    client: "Gupta Family",
    assignees: ["Neha Kapoor"],
  }),
  mk(4, 11, 13, "Meet the Parents Evening", "event", {
    location: "Main Hall",
    venue: "Main Hall",
    assignees: ["Ishaan Roy", "Priya Sharma"],
    people: ["Ishaan Roy", "Priya Sharma"],
    inviteGroups: ["employees"],
    attendeesList: "Ishaan Roy, Priya Sharma",
    eventType: "Company Event",
    formDescription: "Community Event",
    meetingTypes: ["face"],
    emailIds: "events@makemylagan.com;",
    duration: "2 hours",
    startTime: "11:00",
    endTime: "13:00",
    specialInstructions: "",
    activationStatus: "Active",
    priority: "High",
    stage: "In Progress",
    stars: 25,
    description: "Host the Meet the Parents evening for shortlisted families in the main hall.",
  }),
  mk(4, 13, 15, "Office Visit — Malhotra Family", "meeting", {
    link: "https://meet.google.com/mml-malhotra",
    meetingLink: "https://meet.google.com/mml-malhotra",
    clientRelated: true,
    client: "Malhotra Family",
    assignees: ["Aditya Sharma"],
    priority: "High",
  }),
  mk(4, 17, 18, "Update Visit Notes", "other", {
    assignees: ["Priya Sharma"],
    description: "Capture and share notes from today’s home and office visits.",
  }),
  mk(5, 9, 10, "Check Family Feedback", "task", {
    clientRelated: true,
    client: "Sethi Family",
    assignees: ["Rahul Verma"],
    stage: "In Progress",
    description: "Review feedback forms submitted after last week’s profile shares.",
  }),
  mk(5, 11, 13, "Community Campaign Sync", "meeting", {
    link: "https://meet.google.com/mml-campaign-fri",
    meetingLink: "https://meet.google.com/mml-campaign-fri",
    assignees: ["Sana Iqbal"],
    priority: "High",
  }),
  mk(5, 15, 16, "Send Event Invites to Families", "other", {
    clientRelated: true,
    client: "Multiple",
    assignees: ["Neha Kapoor"],
    stars: 14,
    description: "Send invites for next week’s Meet the Parents evening.",
  }),
  mk(6, 9, 10, "Prepare Package Proposal", "task", {
    clientRelated: true,
    client: "Agarwal Family",
    assignees: ["Dev Malhotra"],
    priority: "Critical",
    stars: 18,
    description: "Finalize Basic / Premium / Exclusive options for Agarwal Family.",
  }),
  mk(6, 11, 12, "Call Back Pending Prospects", "task", {
    assignees: ["Priya Sharma"],
    priority: "High",
    stars: 15,
    description: "Return calls to P0 prospects marked pending from Friday.",
  }),
  mk(6, 16, 17, "Prepare Match Shortlist", "task", {
    clientRelated: true,
    client: "Malhotra Family",
    assignees: ["Neha Kapoor"],
  }),
];

const INITIAL_UNSCHEDULED = [
  { id: "u1", title: "Call back Sethi Family", type: "Prospect", duration: "30 min" },
  { id: "u2", title: "Draft Agarwal Package Quote", type: "Prospect", duration: "30 min" },
  { id: "u3", title: "Follow up with Mehta Family", type: "Prospect", duration: "30 min" },
  { id: "u4", title: "Prepare Sharma Match Shortlist", type: "Prospect", duration: "45 min" },
];

const DAY_STATUS = { 3: "free", 9: "free", 11: "filling", 17: "busy", 26: "busy" };

/* ───────────────────────── Small pieces ───────────────────────── */

function CategoryChip({ id, checked, onToggle, count }) {
  const cat = CATEGORIES[id];
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`inline-flex items-center gap-1.5 text-[12.5px] whitespace-nowrap transition-colors ${
        checked ? "font-semibold" : "font-medium"
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

function EventBlock({ ev, onClick, dense, draggable: canDrag = false, onDragStart, onDragEnd }) {
  const cat = CATEGORIES[ev.category] || CATEGORIES.other;
  const meetingUrl = ev.category === "meeting" ? getMeetingJoinUrl(ev.meta) : null;
  const didDrag = useRef(false);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        didDrag.current = true;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", ev.id);
        onDragStart?.(ev);
      }}
      onDragEnd={() => {
        if (!canDrag) return;
        onDragEnd?.(ev);
        // Swallow the click that browsers fire after a drag, then re-enable clicks
        setTimeout(() => {
          didDrag.current = false;
        }, 50);
      }}
      onClick={() => {
        if (didDrag.current) return;
        onClick(ev);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(ev);
        }
      }}
      className={`w-full text-left rounded-lg px-2.5 py-2 hover:brightness-[0.97] transition-[filter] shrink-0 ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
      style={{ backgroundColor: cat.bg, border: `1px solid ${cat.border}` }}
    >
      {!dense && (
        <p className="text-[11px] font-semibold" style={{ color: cat.text }}>
          {fmtTime(ev.startH)} - {fmtTime(ev.endH)}
        </p>
      )}
      {!dense && meetingUrl && (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="block text-[11px] font-semibold mt-0.5 hover:underline"
          style={{ color: cat.text }}
        >
          Join on Google Meet
        </a>
      )}
      <p className="text-[12.5px] font-bold leading-snug mt-0.5" style={{ color: cat.text }}>{ev.title}</p>
      {!dense && ev.meta?.location && (
        <p className="text-[11px] text-[#6B7280] mt-0.5">({ev.meta.location})</p>
      )}
    </div>
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

function ChipList({ items }) {
  if (!items?.length) return <span className="text-[#9CA3AF] font-medium">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F1F2F4] text-[12px] font-semibold text-[#374151]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function hourToTimeStr(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function eventToMeetingForm(ev) {
  const m = ev.meta || {};
  return {
    title: ev.title || "",
    inviteGroups: m.inviteGroups || (m.clientRelated ? ["client", "employees"] : ["employees"]),
    people: Array.isArray(m.people) ? m.people : Array.isArray(m.assignees) ? m.assignees : [],
    emailIds: m.emailIds || "team@mmlcompany.com;",
    specialInstructions: m.specialInstructions || "",
    notes: m.description && m.description !== (m.eventType || m.formDescription) ? m.description : "",
    description: m.eventType || m.formDescription || "",
    meetingTypes: m.meetingTypes?.length ? m.meetingTypes : ["video"],
    meetingLink: m.meetingLink || m.link || "",
    venue: m.venue || m.location || "",
    startDate: toDateInput(ev.date),
    endDate: toDateInput(m.dueDate || ev.date),
    startTime: m.startTime || hourToTimeStr(ev.startH),
    endTime: m.endTime || hourToTimeStr(ev.endH),
    duration: m.duration || "",
    attachment: m.attachment || "",
    requirements: m.requirements?.length ? m.requirements : ["Transcripts"],
    notesTo: m.notesTo || [],
  };
}

function eventToTaskForm(ev) {
  const m = ev.meta || {};
  return {
    title: ev.title || "",
    description: m.description || "",
    priority: m.priority || "Medium",
    assignees: Array.isArray(m.assignees) ? m.assignees : [],
    isClientRelated: Boolean(m.clientRelated),
    client: m.client || "",
    startDate: toDateInput(ev.date),
    dueDate: toDateInput(m.dueDate || addDays(ev.date, 3)),
    stars: m.stars ?? 7,
    stage: m.stage || "New",
  };
}

function eventToOtherForm(ev) {
  const m = ev.meta || {};
  return {
    title: ev.title || "",
    description: m.description || "",
    priority: m.priority || "Medium",
    assignees: Array.isArray(m.assignees) ? m.assignees : [],
    isClientRelated: Boolean(m.clientRelated),
    client: m.client || "",
    date: toDateInput(ev.date),
    startTime: m.startTime || hourToTimeStr(ev.startH),
    endTime: m.endTime || hourToTimeStr(ev.endH),
    stars: m.stars ?? 7,
  };
}

const MEETING_TYPE_LABELS = { video: "Virtual/Video", telephonic: "Telephonic", face: "Face to Face" };
const INVITE_GROUP_LABELS = { others: "Others/External", employees: "Employees", client: "Client" };

function CalendarItemDetails({ item }) {
  if (!item) return null;
  const cat = CATEGORIES[item.category] || CATEGORIES.other;
  const m = item.meta || {};
  const assignees = Array.isArray(m.assignees) ? m.assignees : [];
  const people = Array.isArray(m.people) ? m.people : assignees;
  const inviteLabels = (m.inviteGroups || []).map((k) => INVITE_GROUP_LABELS[k] || k);
  const meetingTypeLabels = (m.meetingTypes || []).map((t) => MEETING_TYPE_LABELS[t] || t);
  const priorityStyle = PRIORITY_STYLES[m.priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="flex flex-col gap-5">
      <div className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.dot }} />
        <span className="text-[13px] font-semibold" style={{ color: cat.text }}>{cat.label}</span>
      </div>

      {item.category === "event" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <DetailField label="Title">{item.title}</DetailField>
          <DetailField label="Event Type">{m.eventType || m.formDescription || item.title}</DetailField>
          <DetailField label="Date">{fmtDate(item.date)}</DetailField>
          <DetailField label="Time">{fmtTime(item.startH)} – {fmtTime(item.endH)}</DetailField>
          <DetailField label="Invite"><ChipList items={inviteLabels} /></DetailField>
          <DetailField label="People"><ChipList items={people} /></DetailField>
          <div className="sm:col-span-2">
            <DetailField label="Email Ids">{m.emailIds || "—"}</DetailField>
          </div>
          <DetailField label="Duration">{m.duration || "—"}</DetailField>
          <DetailField label="Venue">{m.venue || m.location || "—"}</DetailField>
          {m.link || m.meetingLink ? (
            <div className="sm:col-span-2">
              <DetailField label="Event Link">
                <span className="text-[#3B82F6]">{m.meetingLink || m.link}</span>
              </DetailField>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <DetailField label="Description">
              <span className="font-medium text-[#374151]">{m.specialInstructions || m.description || "No description added."}</span>
            </DetailField>
          </div>
        </div>
      )}

      {item.category === "meeting" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <DetailField label="Title">{item.title}</DetailField>
          <DetailField label="Description">{m.formDescription || m.description || item.title}</DetailField>
          <DetailField label="Invite"><ChipList items={inviteLabels} /></DetailField>
          <DetailField label="People"><ChipList items={people} /></DetailField>
          <div className="sm:col-span-2">
            <DetailField label="Email Ids">{m.emailIds || "—"}</DetailField>
          </div>
          <DetailField label="Meeting Type"><ChipList items={meetingTypeLabels} /></DetailField>
          <DetailField label="Duration">{m.duration || "—"}</DetailField>
          <DetailField label="Start Date">{fmtDate(item.date)}</DetailField>
          <DetailField label="End Date">{fmtDate(m.dueDate || item.date)}</DetailField>
          <DetailField label="Start Time">{fmtTime(item.startH)}</DetailField>
          <DetailField label="End Time">{fmtTime(item.endH)}</DetailField>
          {(m.meetingLink || m.link) && (
            <div className="sm:col-span-2">
              <DetailField label="Meeting Link">
                <span className="text-[#3B82F6]">{m.meetingLink || m.link}</span>
              </DetailField>
            </div>
          )}
          {(m.venue || m.location) && <DetailField label="Venue">{m.venue || m.location}</DetailField>}
          <DetailField label="Requirements"><ChipList items={m.requirements} /></DetailField>
          <DetailField label="Notes To"><ChipList items={m.notesTo} /></DetailField>
          <div className="sm:col-span-2">
            <DetailField label="Special Instructions">
              <span className="font-medium text-[#374151]">{m.specialInstructions || "—"}</span>
            </DetailField>
          </div>
        </div>
      )}

      {item.category === "task" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <DetailField label="Title">{item.title}</DetailField>
          <DetailField label="Priority">
            <span style={{ color: priorityStyle.color }}>{m.priority || "Medium"}</span>
          </DetailField>
          <DetailField label="Client Related">{m.clientRelated ? "Yes" : "No"}</DetailField>
          <DetailField label="Client">{m.clientRelated && m.client ? m.client : "—"}</DetailField>
          <DetailField label="Assignees"><ChipList items={assignees} /></DetailField>
          <DetailField label="Stage">{m.stage || "New"}</DetailField>
          <DetailField label="Start Date">{fmtDate(item.date)}</DetailField>
          <DetailField label="Due Date">{fmtDate(m.dueDate || addDays(item.date, 3))}</DetailField>
          <DetailField label="Stars (XP)">{m.stars ?? 10}</DetailField>
          <DetailField label="Scheduled Time">
            {fmtTime(item.startH)} – {fmtTime(item.endH)}
          </DetailField>
          <div className="sm:col-span-2">
            <DetailField label="Description">
              <span className="font-medium text-[#374151]">{m.description || "No description added."}</span>
            </DetailField>
          </div>
        </div>
      )}

      {(item.category === "other" || !["event", "meeting", "task"].includes(item.category)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <DetailField label="Title">{item.title}</DetailField>
          <DetailField label="Category">{cat.label}</DetailField>
          <DetailField label="Date">{fmtDate(item.date)}</DetailField>
          <DetailField label="Time">{fmtTime(item.startH)} – {fmtTime(item.endH)}</DetailField>
          <DetailField label="Assignees"><ChipList items={assignees} /></DetailField>
          <DetailField label="Priority">
            <span style={{ color: priorityStyle.color }}>{m.priority || "Medium"}</span>
          </DetailField>
          <div className="sm:col-span-2">
            <DetailField label="Description">
              <span className="font-medium text-[#374151]">{m.description || "No description added."}</span>
            </DetailField>
          </div>
        </div>
      )}
    </div>
  );
}

function EventDetailModal({ event, onClose, onEdit }) {
  if (!event) return null;
  const cat = CATEGORIES[event.category] || CATEGORIES.other;
  const titleMap = {
    event: "Event Details",
    meeting: "Meeting Details",
    task: "Task Details",
    other: "Others Details",
  };

  return (
    <Modal
      open={!!event}
      onClose={onClose}
      title={titleMap[event.category] || "Details"}
      subtitle={event.title}
      icon={
        event.category === "task" ? <CheckSquare size={16} />
          : event.category === "meeting" ? <Users2 size={16} />
            : event.category === "event" ? <CalendarDays size={16} />
              : <CircleDot size={16} />
      }
      iconBg={cat.bg}
      iconColor={cat.text}
      width="max-w-2xl"
      footer={
        <>
          {["event", "meeting", "task", "other"].includes(event.category) && (
            <button
              type="button"
              onClick={() => onEdit?.(event)}
              className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors inline-flex items-center gap-1.5"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
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
      <CalendarItemDetails item={event} />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("Week");
  const [viewOpen, setViewOpen] = useState(false);
  const [layout, setLayout] = useState("grid"); // "grid" | "list"
  const [anchorDate, setAnchorDate] = useState(ANCHOR);
  const [miniCursor, setMiniCursor] = useState(ANCHOR);
  const [activeCats, setActiveCats] = useState(new Set(Object.keys(CATEGORIES)));
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [unscheduled, setUnscheduled] = useState(INITIAL_UNSCHEDULED);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMeetingEvent, setSelectedMeetingEvent] = useState(null);
  const [selectedTaskEvent, setSelectedTaskEvent] = useState(null);
  const [selectedOtherEvent, setSelectedOtherEvent] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createOtherOpen, setCreateOtherOpen] = useState(false);
  const [taskPrefill, setTaskPrefill] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const dragPayloadRef = useRef(null);

  const beginDrag = (payload) => {
    dragPayloadRef.current = payload;
    setDragOverCell(payload);
  };

  const clearDrag = () => {
    dragPayloadRef.current = null;
    setDragOverCell(null);
  };

  const updateDragCell = (day, hour) => {
    setDragOverCell((c) => {
      const base = c || dragPayloadRef.current;
      if (!base) return c;
      const next = { ...base, day, hour };
      dragPayloadRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (searchParams.get("createTask") !== "1") return;
    const client = (searchParams.get("client") || "").trim();
    setEditingItem(null);
    setTaskPrefill(
      client
        ? {
            isClientRelated: true,
            client,
            title: `Follow up — ${client}`,
            description: `Follow-up task from pipeline for ${client}.`,
          }
        : { isClientRelated: true }
    );
    setCreateTaskOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("createTask");
    next.delete("client");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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
    const payload = dragPayloadRef.current || dragOverCell;
    if (!payload) return;

    // Reschedule an existing calendar event to a new day/time
    if (payload.eventId) {
      const event = events.find((e) => e.id === payload.eventId);
      if (!event) {
        clearDrag();
        return;
      }
      const duration = Math.max(1, (event.endH ?? hour + 1) - event.startH);
      const newStart = hour;
      const newEnd = newStart + duration;
      const sameSlot = sameDay(event.date, day) && event.startH === newStart;
      if (sameSlot) {
        clearDrag();
        return;
      }
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id !== event.id
            ? ev
            : {
                ...ev,
                date: day,
                startH: newStart,
                endH: newEnd,
                meta: {
                  ...ev.meta,
                  startTime: hourToTimeStr(newStart),
                  endTime: hourToTimeStr(newEnd),
                },
              }
        )
      );
      clearDrag();
      toast.success(`"${event.title}" moved to ${fmtTime(newStart)}.`);
      return;
    }

    if (!payload.itemId) {
      clearDrag();
      return;
    }
    const item = unscheduled.find((u) => u.id === payload.itemId);
    if (!item) {
      clearDrag();
      return;
    }
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
    clearDrag();
    toast.success(`"${item.title}" scheduled.`);
  };

  const eventsFor = (day) => visibleEvents.filter((ev) => sameDay(ev.date, day));

  const parseTimeHour = (time, fallback = 10) => {
    if (!time) return fallback;
    const [h] = String(time).split(":").map(Number);
    return Number.isFinite(h) ? h : fallback;
  };

  const parseIsoDate = (iso, fallback = anchorDate) => {
    if (!iso) return fallback;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return fallback;
    return new Date(y, m - 1, d);
  };

  const addCalendarItem = (item) => {
    setEvents((prev) => [...prev, item]);
    jumpTo(item.date);
  };

  const upsertCalendarItem = (item) => {
    setEvents((prev) => {
      const exists = prev.some((ev) => ev.id === item.id);
      return exists ? prev.map((ev) => (ev.id === item.id ? item : ev)) : [...prev, item];
    });
    jumpTo(item.date);
  };

  const buildMeetingOrEventItem = (form, category, existingId = null) => {
    const date = parseIsoDate(form.startDate);
    const startH = parseTimeHour(form.startTime, 10);
    let endH = parseTimeHour(form.endTime, startH + 1);
    if (endH <= startH) endH = Math.min(startH + 1, 18);
    const client = form.inviteGroups?.includes("client")
      ? form.people.find((p) => ["Sethi Family", "Agarwal Family", "Malhotra Family", "Kapoor Family", "Mehta Family"].includes(p)) || ""
      : "";
    return {
      id: existingId || `${category}-${Date.now()}`,
      date,
      startH,
      endH,
      title: form.title?.trim() || form.description || (category === "event" ? "New Event" : "New Meeting"),
      category,
      meta: {
        priority: "Medium",
        clientRelated: Boolean(client) || form.inviteGroups?.includes("client"),
        client,
        assignees: form.people?.length ? form.people : ["Priya Sharma"],
        people: form.people || [],
        inviteGroups: form.inviteGroups || [],
        stage: "New",
        dueDate: parseIsoDate(form.endDate || form.startDate, addDays(date, 1)),
        stars: 10,
        description:
          category === "event"
            ? form.notes || ""
            : form.specialInstructions || form.description || "",
        formDescription: form.description || "",
        eventType: category === "event" ? form.description : undefined,
        specialInstructions: form.specialInstructions || "",
        location: form.venue || "",
        venue: form.venue || "",
        link: form.meetingLink || "",
        meetingLink: form.meetingLink || "",
        meetingTypes: form.meetingTypes || [],
        emailIds: form.emailIds || "",
        duration: form.duration || "",
        requirements: form.requirements || [],
        notesTo: form.notesTo || [],
        attachment: form.attachment || "",
        startTime: form.startTime || "",
        endTime: form.endTime || "",
        attendeesList: form.people?.length
          ? form.people.join(", ")
          : (form.inviteGroups || [])
              .filter((k) => k !== "all")
              .map((k) => ({ others: "Others/External", employees: "Employees", client: "Client", all: "All" })[k] || k)
              .join(", "),
        meetingKind: form.people?.length > 1 ? "Group" : "Individual",
        activationStatus: "Active",
      },
    };
  };

  const handleCreateMeetingOrEvent = (form, category) => {
    addCalendarItem(buildMeetingOrEventItem(form, category));
  };

  const handleUpdateMeetingOrEvent = (form, category) => {
    if (!editingItem) return;
    upsertCalendarItem(buildMeetingOrEventItem(form, category, editingItem.id));
    setEditingItem(null);
  };

  const buildTaskItem = (form, existingId = null) => {
    const date = parseIsoDate(form.startDate);
    const existing = existingId ? events.find((e) => e.id === existingId) : null;
    const prevMeta = existing?.meta || {};
    return {
      id: existingId || `task-${Date.now()}`,
      date,
      startH: existing ? existing.startH : 9,
      endH: existing ? existing.endH : 10,
      title: form.title,
      category: "task",
      meta: {
        priority: form.priority || "Medium",
        clientRelated: Boolean(form.isClientRelated),
        client: form.client || "",
        assignees: form.assignees?.length ? form.assignees : ["Priya Sharma"],
        stage: form.stage || prevMeta.stage || "New",
        dueDate: parseIsoDate(form.dueDate, addDays(date, 3)),
        stars: form.stars ?? 7,
        description: form.description || "",
        project: prevMeta.project || "Sales Pipeline",
        milestone: prevMeta.milestone || "Planning",
        progress: prevMeta.progress ?? 20,
        acknowledgedAt: prevMeta.acknowledgedAt || date,
        assignedAt: prevMeta.assignedAt || date,
        comments: prevMeta.comments || [],
        checklist: prevMeta.checklist || [],
        attachments: prevMeta.attachments || [],
      },
    };
  };

  const handleCreateTask = (form) => {
    addCalendarItem(buildTaskItem(form));
  };

  const handleUpdateTask = (form) => {
    if (!editingItem) return;
    upsertCalendarItem(buildTaskItem(form, editingItem.id));
    setEditingItem(null);
  };

  const buildOtherItem = (form, existingId = null) => {
    const date = parseIsoDate(form.date);
    const startH = parseTimeHour(form.startTime, 10);
    let endH = parseTimeHour(form.endTime, startH + 1);
    if (endH <= startH) endH = Math.min(startH + 1, 18);
    return {
      id: existingId || `other-${Date.now()}`,
      date,
      startH,
      endH,
      title: form.title?.trim() || "New Item",
      category: "other",
      meta: {
        priority: form.priority || "Medium",
        clientRelated: Boolean(form.isClientRelated),
        client: form.client || "",
        assignees: form.assignees?.length ? form.assignees : ["Priya Sharma"],
        stage: "New",
        dueDate: date,
        stars: form.stars ?? 7,
        description: form.description || "",
        startTime: form.startTime || "",
        endTime: form.endTime || "",
      },
    };
  };

  const handleCreateOther = (form) => {
    addCalendarItem(buildOtherItem(form));
  };

  const handleUpdateOther = (form) => {
    if (!editingItem) return;
    upsertCalendarItem(buildOtherItem(form, editingItem.id));
    setEditingItem(null);
  };

  const openCalendarItem = (ev) => {
    if (ev?.category === "task") {
      setSelectedEvent(null);
      setSelectedMeetingEvent(null);
      setSelectedOtherEvent(null);
      setSelectedTaskEvent(ev);
      return;
    }
    if (ev?.category === "meeting" || ev?.category === "event") {
      setSelectedEvent(null);
      setSelectedTaskEvent(null);
      setSelectedOtherEvent(null);
      setSelectedMeetingEvent(ev);
      return;
    }
    setSelectedTaskEvent(null);
    setSelectedMeetingEvent(null);
    setSelectedEvent(null);
    setSelectedOtherEvent(ev);
  };

  const openEditItem = (item) => {
    setSelectedEvent(null);
    setSelectedMeetingEvent(null);
    setSelectedTaskEvent(null);
    setSelectedOtherEvent(null);
    setEditingItem(item);
    if (item.category === "event") setCreateEventOpen(true);
    else if (item.category === "meeting") setCreateMeetingOpen(true);
    else if (item.category === "task") setCreateTaskOpen(true);
    else setCreateOtherOpen(true);
  };

  const syncTaskViewToEvent = (taskView) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== taskView.id) return ev;
        return {
          ...ev,
          title: taskView.title,
          meta: {
            ...ev.meta,
            description: taskView.description,
            stage: taskView.stage,
            priority: taskView.priority,
            project: taskView.project,
            milestone: taskView.milestone,
            progress: taskView.progress,
            assignees: taskView.assignees,
            clientRelated: taskView.isClientRelated,
            client: taskView.client,
            dueDate: taskView.dueDate,
            stars: taskView.stars,
            acknowledgedAt: taskView.acknowledgedAt,
            assignedAt: taskView.assignedAt,
            comments: taskView.comments,
            checklist: taskView.checklist,
            attachments: taskView.attachments,
          },
        };
      })
    );
    setSelectedTaskEvent((prev) =>
      prev && prev.id === taskView.id
        ? {
            ...prev,
            title: taskView.title,
            meta: {
              ...prev.meta,
              description: taskView.description,
              stage: taskView.stage,
              priority: taskView.priority,
              project: taskView.project,
              milestone: taskView.milestone,
              progress: taskView.progress,
              assignees: taskView.assignees,
              clientRelated: taskView.isClientRelated,
              client: taskView.client,
              dueDate: taskView.dueDate,
              stars: taskView.stars,
              acknowledgedAt: taskView.acknowledgedAt,
              assignedAt: taskView.assignedAt,
              comments: taskView.comments,
              checklist: taskView.checklist,
              attachments: taskView.attachments,
            },
          }
        : prev
    );
  };

  const closeEventModal = () => {
    setCreateEventOpen(false);
    setEditingItem((prev) => (prev?.category === "event" ? null : prev));
  };

  const closeMeetingModal = () => {
    setCreateMeetingOpen(false);
    setEditingItem((prev) => (prev?.category === "meeting" ? null : prev));
  };

  const closeTaskModal = () => {
    setCreateTaskOpen(false);
    setTaskPrefill(null);
    setEditingItem((prev) => (prev?.category === "task" ? null : prev));
  };

  const closeOtherModal = () => {
    setCreateOtherOpen(false);
    setEditingItem((prev) => (prev?.category === "other" ? null : prev));
  };

  const listEvents = useMemo(() => {
    const inRange = visibleEvents.filter((ev) => {
      if (view === "Month") {
        return (
          ev.date.getFullYear() === anchorDate.getFullYear() &&
          ev.date.getMonth() === anchorDate.getMonth()
        );
      }
      return days.some((d) => sameDay(ev.date, d));
    });
    return [...inRange].sort((a, b) => {
      const as = new Date(a.date); as.setHours(a.startH, 0, 0, 0);
      const bs = new Date(b.date); bs.setHours(b.startH, 0, 0, 0);
      return as - bs;
    });
  }, [visibleEvents, days, view, anchorDate]);

  return (
    <div className="flex flex-1 min-h-0" style={{ height: "calc(100vh - 56px)" }}>
      {/* ── Left utility rail (page-local, sits beside the app sidebar) ── */}
      <aside className="w-[236px] shrink-0 border-r border-black/8 bg-white flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCreateMenuOpen((v) => !v)}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#7A0A17] text-white text-[13.5px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
          >
            <Plus size={16} /> Create <ChevronDown size={15} className={`transition-transform ${createMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {createMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-40 py-1 overflow-hidden">
              {[
                { label: "Event", icon: CalendarCheck2, color: "#A02868", onClick: () => { setEditingItem(null); setCreateEventOpen(true); } },
                { label: "Task", icon: ListTodo, color: "#7C6CB0", onClick: () => { setEditingItem(null); setTaskPrefill(null); setCreateTaskOpen(true); } },
                { label: "Meeting", icon: Users2, color: "#41703D", onClick: () => { setEditingItem(null); setCreateMeetingOpen(true); } },
                { label: "Others", icon: CircleDot, color: "#6F7886", onClick: () => { setEditingItem(null); setCreateOtherOpen(true); } },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    item.onClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
                >
                  <item.icon size={15} style={{ color: item.color }} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
            Free slots, reschedules, family visits, package progress.
          </p>
        </button>

        {upNext && (
          <div className="relative overflow-hidden rounded-2xl border border-[#7A0A17]/15 bg-gradient-to-br from-[#FFF5F6] to-[#FDECEE] p-3.5 shadow-[0_1px_2px_rgba(122,10,23,0.06)]">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#7A0A17]" />
            <div className="flex items-center justify-between pl-1.5">
              <p className="text-[10.5px] font-bold text-[#7A0A17] tracking-wide">
                UP NEXT · {fmtTime(upNext.startH).toUpperCase()}
              </p>
              <span className="text-[10px] font-bold text-white bg-[#7A0A17] px-1.5 py-0.5 rounded-md">
                {sameDay(upNext.date, TODAY) ? "Today" : upNext.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 pl-1.5">
              <p className="text-[13px] font-bold text-[#111] leading-snug">{upNext.title}</p>
              <button
                type="button"
                onClick={() => openCalendarItem(upNext)}
                className="text-[11.5px] font-semibold text-[#3B82F6] shrink-0 hover:underline"
              >
                Details
              </button>
            </div>
            <p className="inline-flex items-center mt-2 ml-1.5 text-[11.5px] font-semibold text-[#7A0A17] bg-white/70 border border-[#7A0A17]/12 px-2 py-0.5 rounded-md">
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
                onDragStart={() => beginDrag({ itemId: item.id })}
                onDragEnd={clearDrag}
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

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
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
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
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

            {/* View toggle — same control as Pipeline */}
            <div className="flex items-center h-10 rounded-xl border border-black/10 bg-white overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setLayout("list")}
                title="List view"
                aria-pressed={layout === "list"}
                aria-label="List view"
                className={`h-full px-3 flex items-center transition-colors ${
                  layout === "list" ? "bg-[#7A0A17] text-white" : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
                }`}
              >
                <LayoutList size={15} />
              </button>
              <span className="w-px h-5 bg-black/10" />
              <button
                type="button"
                onClick={() => setLayout("grid")}
                title="Grid view"
                aria-pressed={layout === "grid"}
                aria-label="Grid view"
                className={`h-full px-3 flex items-center transition-colors ${
                  layout === "grid" ? "bg-[#7A0A17] text-white" : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {layout === "list" ? (
          <EventListView
            events={listEvents}
            onEventClick={openCalendarItem}
            onEdit={openEditItem}
            onDelete={(ev) => {
              setEvents((prev) => prev.filter((e) => e.id !== ev.id));
              toast.error(`"${ev.title}" deleted.`);
            }}
          />
        ) : view === "Month" ? (
          <MonthGrid days={days} anchorDate={anchorDate} eventsFor={eventsFor} onEventClick={openCalendarItem} onDayClick={(d) => { jumpTo(d); setView("Day"); }} />
        ) : (
          <WeekDayGrid
            days={days}
            eventsFor={eventsFor}
            onEventClick={openCalendarItem}
            dragOverCell={dragOverCell}
            updateDragCell={updateDragCell}
            beginDrag={beginDrag}
            clearDrag={clearDrag}
            onDrop={handleDrop}
          />
        )}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={openEditItem}
      />
      <OthersDetailsModal
        open={!!selectedOtherEvent}
        item={calendarEventToOtherView(selectedOtherEvent)}
        onClose={() => setSelectedOtherEvent(null)}
        onEdit={() => selectedOtherEvent && openEditItem(selectedOtherEvent)}
      />
      <MeetingDetailsModal
        open={!!selectedMeetingEvent}
        meeting={calendarEventToMeetingView(selectedMeetingEvent)}
        entityLabel={selectedMeetingEvent?.category === "event" ? "Event" : "Meeting"}
        onClose={() => setSelectedMeetingEvent(null)}
        onEdit={() => selectedMeetingEvent && openEditItem(selectedMeetingEvent)}
      />
      <TaskDetailsModal
        open={!!selectedTaskEvent}
        task={calendarEventToTaskView(selectedTaskEvent)}
        onClose={() => setSelectedTaskEvent(null)}
        onEdit={() => selectedTaskEvent && openEditItem(selectedTaskEvent)}
        onUpdateTask={syncTaskViewToEvent}
      />
      <CreateMeetingEventModal
        open={createEventOpen}
        onClose={closeEventModal}
        entityLabel="Event"
        defaultDate={anchorDate}
        mode={editingItem?.category === "event" ? "edit" : "create"}
        initial={editingItem?.category === "event" ? eventToMeetingForm(editingItem) : null}
        onSave={(form) =>
          editingItem?.category === "event"
            ? handleUpdateMeetingOrEvent(form, "event")
            : handleCreateMeetingOrEvent(form, "event")
        }
      />
      <CreateMeetingEventModal
        open={createMeetingOpen}
        onClose={closeMeetingModal}
        entityLabel="Meeting"
        defaultDate={anchorDate}
        mode={editingItem?.category === "meeting" ? "edit" : "create"}
        initial={editingItem?.category === "meeting" ? eventToMeetingForm(editingItem) : null}
        onSave={(form) =>
          editingItem?.category === "meeting"
            ? handleUpdateMeetingOrEvent(form, "meeting")
            : handleCreateMeetingOrEvent(form, "meeting")
        }
      />
      <CreateTaskModal
        open={createTaskOpen}
        onClose={closeTaskModal}
        defaultDate={anchorDate}
        mode={editingItem?.category === "task" ? "edit" : "create"}
        initial={
          editingItem?.category === "task"
            ? eventToTaskForm(editingItem)
            : taskPrefill
        }
        onSave={(form) => {
          if (editingItem?.category === "task") {
            handleUpdateTask(form);
            setSelectedTaskEvent(null);
          } else {
            handleCreateTask(form);
          }
        }}
      />
      <CreateOtherModal
        open={createOtherOpen}
        onClose={closeOtherModal}
        defaultDate={anchorDate}
        mode={editingItem?.category === "other" ? "edit" : "create"}
        initial={editingItem?.category === "other" ? eventToOtherForm(editingItem) : null}
        onSave={(form) => {
          if (editingItem?.category === "other") {
            handleUpdateOther(form);
            setSelectedOtherEvent(null);
          } else {
            handleCreateOther(form);
          }
        }}
      />
    </div>
  );
}

/* ───────────────────────── List view ───────────────────────── */

function InitialsAvatar({ name, size = 26 }) {
  const initials = String(name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="rounded-full bg-[#FCF5F6] text-[#7A0A17] font-bold grid place-items-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

function EventListView({ events, onEventClick, onEdit, onDelete }) {
  if (events.length === 0) {
    return (
      <div className="flex-1 overflow-auto scrollbar-thin p-5">
        <div className="bg-white border border-black/8 rounded-2xl py-16 text-center text-[13px] text-[#9CA3AF]">
          No events in this range
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col p-5">
      <div className="bg-white border border-black/8 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-thin flex-1 min-h-0">
          <table className="w-full min-w-[980px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-black/8 bg-[#FAFAFB]">
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Event</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Time</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Priority</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Stage</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Due Date</th>
                <th className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Assignee</th>
                <th className="text-right text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6">
              {events.map((ev) => {
                const cat = CATEGORIES[ev.category] || CATEGORIES.other;
                const priority = ev.meta?.priority || "Medium";
                const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
                const assignees = Array.isArray(ev.meta?.assignees) ? ev.meta.assignees : [];
                const isToday = sameDay(ev.date, TODAY);
                const meetingUrl = ev.category === "meeting" ? getMeetingJoinUrl(ev.meta) : null;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="hover:bg-[#FAFAFB] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="size-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cat.dot }} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#111] line-clamp-2 leading-snug">{ev.title}</p>
                          {ev.meta?.client ? (
                            <p className="text-[11.5px] font-medium text-[#9CA3AF] mt-0.5 truncate">{ev.meta.client}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
                        style={{ color: cat.text, backgroundColor: cat.bg }}
                      >
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[12px] ${isToday ? "text-[#7A0A17] font-semibold" : "text-[#374151]"}`}>
                        {fmtDate(ev.date)}
                        {isToday ? " · Today" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] text-[#6B7280]">
                          {fmtTime(ev.startH)} – {fmtTime(ev.endH)}
                        </span>
                        {meetingUrl ? (
                          <a
                            href={meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-[#41703D] hover:underline"
                          >
                            Join Google Meet
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
                        style={{ color: priorityStyle.color, backgroundColor: priorityStyle.bg }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#374151] whitespace-nowrap">{ev.meta?.stage || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{fmtDate(ev.meta?.dueDate)}</td>
                    <td className="px-4 py-3">
                      {assignees.length ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <InitialsAvatar name={assignees[0]} size={22} />
                          <span className="text-[12px] text-[#374151]">
                            {assignees[0]}
                            {assignees.length > 1 ? ` +${assignees.length - 1}` : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onEventClick(ev)}
                          className="p-1 text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-md transition-colors"
                          aria-label="View event"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (["event", "meeting", "task", "other"].includes(ev.category) && onEdit) onEdit(ev);
                            else onEventClick(ev);
                          }}
                          className="p-1 text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-md transition-colors"
                          aria-label="Edit event"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(ev)}
                          className="p-1 text-[#E8395B] hover:bg-[#E8395B]/10 rounded-md transition-colors"
                          aria-label="Delete event"
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
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-black/8 bg-white shrink-0">
          <p className="text-[12px] text-[#9CA3AF] font-medium">
            Showing {events.length} event{events.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Slot overflow modal ───────────────────────── */

function SlotEventsModal({ slot, onClose, onEventClick }) {
  if (!slot) return null;
  const { day, hour, events } = slot;
  const dateLabel = day.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Modal
      open={!!slot}
      onClose={onClose}
      title={`${fmtTime(hour)} · ${dateLabel}`}
      subtitle={`${events.length} item${events.length === 1 ? "" : "s"} in this slot`}
      icon={<CalendarDays size={18} />}
      iconBg="#FCF5F6"
      iconColor="#7A0A17"
      width="max-w-md"
    >
      <div className="flex flex-col gap-2.5">
        {events.map((ev) => {
          const cat = CATEGORIES[ev.category] || CATEGORIES.other;
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => {
                onClose();
                onEventClick(ev);
              }}
              className="w-full text-left rounded-xl px-3.5 py-3 hover:brightness-[0.97] transition-[filter] border"
              style={{ backgroundColor: cat.bg, borderColor: cat.border }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold" style={{ color: cat.text }}>
                  {fmtTime(ev.startH)} – {fmtTime(ev.endH)}
                </p>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                  style={{ color: cat.text, backgroundColor: "rgba(255,255,255,0.65)" }}
                >
                  {cat.label}
                </span>
              </div>
              <p className="text-[13.5px] font-bold leading-snug mt-1" style={{ color: cat.text }}>
                {ev.title}
              </p>
              {ev.meta?.client && (
                <p className="text-[11.5px] text-[#6B7280] mt-1">{ev.meta.client}</p>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

/* ───────────────────────── Week / Day grid ───────────────────────── */

function WeekDayGrid({ days, eventsFor, onEventClick, dragOverCell, updateDragCell, beginDrag, clearDrag, onDrop }) {
  const [slotModal, setSlotModal] = useState(null);
  const MAX_VISIBLE = 2;

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
                const cellKey = `${d.toISOString()}-${h}`;
                const overflow = cellEvents.length - MAX_VISIBLE;
                const visibleEvents = overflow > 0 ? cellEvents.slice(0, MAX_VISIBLE) : cellEvents;
                return (
                  <div
                    key={cellKey}
                    onDragOver={(e) => { e.preventDefault(); updateDragCell(d, h); }}
                    onDrop={(e) => { e.preventDefault(); onDrop(d, h); }}
                    className={`relative border-r border-b border-black/8 last:border-r-0 min-h-[62px] px-1.5 py-1 flex flex-col gap-1 transition-colors ${
                      isDrag ? "bg-[#FCF5F6]" : "hover:bg-[#FAFAFB]"
                    }`}
                  >
                    {visibleEvents.map((ev) => (
                      <EventBlock
                        key={ev.id}
                        ev={ev}
                        onClick={onEventClick}
                        draggable
                        onDragStart={(event) => beginDrag({ eventId: event.id })}
                        onDragEnd={clearDrag}
                      />
                    ))}
                    {overflow > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlotModal({ day: d, hour: h, events: cellEvents });
                        }}
                        className="self-start text-[11px] font-bold text-[#7A0A17] px-1.5 py-0.5 rounded-md bg-[#FCF5F6] border border-[#7A0A17]/15 hover:bg-[#F8E8EB] transition-colors"
                      >
                        +{overflow} more
                      </button>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <SlotEventsModal
        slot={slotModal}
        onClose={() => setSlotModal(null)}
        onEventClick={onEventClick}
      />
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
