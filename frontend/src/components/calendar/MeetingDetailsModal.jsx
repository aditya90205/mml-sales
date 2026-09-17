import { CalendarDays, Pencil, Users2 } from "lucide-react";
import Modal from "../ui/Modal";

const MEETING_TYPE_LABELS = {
  video: "Virtual / Online",
  telephonic: "Telephone",
  face: "Face to Face",
};

const MEETING_WITH_LABELS = {
  employee: "Employee",
  client: "Client",
  others: "Others",
};

const REMINDER_CHANNEL_LABELS = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  inapp: "In-app",
};

const REMINDER_FREQUENCY_LABELS = {
  every_day: "Every day till meeting",
  on_day: "On day of meeting",
  hour_before: "1 hour before",
  every_15: "Every 15 minutes",
};

const INVITE_GROUP_LABELS = {
  all: "All",
  others: "Others/External",
  employees: "Employees",
  client: "Client",
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

/** Normalize calendar event → meeting/event view model */
export function calendarEventToMeetingView(ev) {
  if (!ev) return null;
  const m = ev.meta || {};
  const people = Array.isArray(m.people) && m.people.length
    ? m.people
    : Array.isArray(m.assignees)
      ? m.assignees
      : [];
  const inviteLabels = (m.inviteGroups || []).map((k) => INVITE_GROUP_LABELS[k] || k);
  const modeLabels = (m.meetingTypes || []).map((t) => MEETING_TYPE_LABELS[t] || t);
  const endDate = m.dueDate || ev.date;
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  const eventType = m.eventCategory || m.eventType || m.formDescription || "";
  const bodyDescription =
    m.notes ||
    (m.description && m.description !== eventType && m.description !== m.specialInstructions
      ? m.description
      : "") ||
    "";

  return {
    id: ev.id,
    category: ev.category,
    title: ev.title,
    eventTitle: ev.title,
    eventType: eventType || ev.title || "—",
    meetDescription: m.formDescription || m.description || ev.title || "—",
    type: m.meetingKind || (people.length > 1 ? "Group" : "Individual"),
    attendeesList: m.attendeesList || (people.length ? people.join(", ") : inviteLabels.join(", ")) || "—",
    activationStatus: m.activationStatus || (endDay >= today ? "Active" : "Inactive"),
    startDate: ev.date,
    endDate,
    status: m.stage || "New",
    duration: m.duration || "",
    startTime: fmtClock(m.startTime, ev.startH),
    endTime: fmtClock(m.endTime, ev.endH),
    people,
    modes: modeLabels,
    meetingTypes: modeLabels.length ? modeLabels : ["Virtual / Online"],
    meetingWith: Array.isArray(m.meetingWithTypes) && m.meetingWithTypes.length
      ? m.meetingWithTypes.map((k) => MEETING_WITH_LABELS[k] || k).join(", ")
      : MEETING_WITH_LABELS[m.meetingWith] || m.meetingWith || "",
    priority: m.priority || "—",
    reminderChannels: (m.reminderChannels || []).map((k) => REMINDER_CHANNEL_LABELS[k] || k),
    reminderFrequency: [
      ...(m.reminderFrequency || []).map((k) => REMINDER_FREQUENCY_LABELS[k] || k),
      ...(m.customReminders || []),
    ],
    referenceLink: m.referenceLink || "",
    referenceLinkDescription: m.referenceLinkDescription || "",
    attachment: m.attachment || "",
    emailIds: m.emailIds || "—",
    link: m.meetingLink || m.link || "",
    meetingLink: m.meetingLink || m.link || "",
    requirements: Array.isArray(m.requirements) ? m.requirements : [],
    notesTo: Array.isArray(m.notesTo) ? m.notesTo : [],
    specialInstructions: m.specialInstructions || "",
    description: bodyDescription,
    venue: m.venue || m.location || "",
    priority: m.priority || "",
    eventMode: m.eventMode || (modeLabels.length ? modeLabels.join(", ") : ""),
    visibility: m.visibility || "",
    branches: Array.isArray(m.branches) ? m.branches : [],
    clients: Array.isArray(m.clients) ? m.clients : [],
    logisticsRequired: Boolean(m.logisticsRequired),
    reminderChannels: Array.isArray(m.reminderChannels) ? m.reminderChannels : [],
    reminderFrequency: m.reminderFrequency || "",
    messageTemplate: m.messageTemplate || "",
    vendors: Array.isArray(m.vendors) ? m.vendors : [],
    referenceLink: m.referenceLink || "",
  };
}

function EventDetailsBody({ meeting }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
      <DetailItem label="Event Title">{meeting.eventTitle}</DetailItem>
      <DetailItem label="Event Category">{meeting.eventType}</DetailItem>

      <DetailItem label="Priority">{meeting.priority || "—"}</DetailItem>
      <DetailItem label="Event Mode">{meeting.eventMode || "—"}</DetailItem>

      <DetailItem label="Visibility">{meeting.visibility || "—"}</DetailItem>
      <DetailItem label="Activation Status">{meeting.activationStatus}</DetailItem>

      <DetailItem label="Start Date">{fmtDate(meeting.startDate)}</DetailItem>
      <DetailItem label="End Date">{fmtDate(meeting.endDate)}</DetailItem>

      <DetailItem label="Start Time">{meeting.startTime}</DetailItem>
      <DetailItem label="End Time">{meeting.endTime}</DetailItem>

      <DetailItem label="Duration">{meeting.duration || "—"}</DetailItem>
      <DetailItem label="Venue">{meeting.venue || "—"}</DetailItem>

      <DetailItem label="Branches">
        <ChipList items={meeting.branches} />
      </DetailItem>
      <DetailItem label="Company Vehicle / Logistics">{meeting.logisticsRequired ? "Required" : "Not required"}</DetailItem>

      <DetailItem label="Employees Invited">
        <ChipList items={meeting.people} />
      </DetailItem>
      <DetailItem label="Clients / Families Invited">
        <ChipList items={meeting.clients} />
      </DetailItem>

      <DetailItem label="Send Reminders Via">
        <ChipList items={meeting.reminderChannels} />
      </DetailItem>
      <DetailItem label="Reminder Frequency">{meeting.reminderFrequency || "—"}</DetailItem>

      <DetailItem label="Message Template">{meeting.messageTemplate || "—"}</DetailItem>
      <DetailItem label="Vendors & Arrangements">
        <ChipList items={meeting.vendors} />
      </DetailItem>

      <DetailItem label="Reference Link" className="sm:col-span-2">
        <LinkValue href={meeting.referenceLink} />
      </DetailItem>

      <DetailItem label="Special Instructions" className="sm:col-span-2">
        {meeting.specialInstructions || "—"}
      </DetailItem>
    </div>
  );
}

function MeetingDetailsBody({ meeting }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
      <DetailItem label="Meet Description">{meeting.meetDescription}</DetailItem>
      <DetailItem label="Type">{meeting.type}</DetailItem>

      <DetailItem label="Meeting With">{meeting.meetingWith || "—"}</DetailItem>
      <DetailItem label="Priority">{meeting.priority}</DetailItem>

      <DetailItem label="Attendees List">{meeting.attendeesList}</DetailItem>
      <DetailItem label="Activation Status">{meeting.activationStatus}</DetailItem>

      <DetailItem label="Start Date">{fmtDate(meeting.startDate)}</DetailItem>
      <DetailItem label="End Date">{fmtDate(meeting.endDate)}</DetailItem>

      <DetailItem label="Meeting Status">{meeting.status}</DetailItem>
      <DetailItem label="Duration">{meeting.duration || "—"}</DetailItem>

      <DetailItem label="Start Time">{meeting.startTime}</DetailItem>
      <DetailItem label="End Time">{meeting.endTime}</DetailItem>

      <DetailItem label="People">
        <ChipList items={meeting.people} />
      </DetailItem>
      <DetailItem label="Meeting Type">
        <ChipList items={meeting.meetingTypes} />
      </DetailItem>

      <DetailItem label="Email Ids" className="sm:col-span-2">
        {meeting.emailIds}
      </DetailItem>

      <DetailItem label="Meeting Link" className="sm:col-span-2">
        <LinkValue href={meeting.meetingLink} />
      </DetailItem>

      {meeting.venue ? (
        <DetailItem label="Venue" className="sm:col-span-2">
          {meeting.venue}
        </DetailItem>
      ) : null}

      <DetailItem label="Requirements">
        <ChipList items={meeting.requirements} />
      </DetailItem>
      <DetailItem label="Notes To">
        <ChipList items={meeting.notesTo} />
      </DetailItem>

      <DetailItem label="Reminders Via">
        <ChipList items={meeting.reminderChannels} />
      </DetailItem>
      <DetailItem label="Reminder Frequency">
        <ChipList items={meeting.reminderFrequency} />
      </DetailItem>

      {meeting.attachment ? <DetailItem label="Attachment">{meeting.attachment}</DetailItem> : null}
      {meeting.referenceLink ? (
        <DetailItem label="Reference Link" className={meeting.attachment ? "" : "sm:col-span-2"}>
          <LinkValue href={meeting.referenceLink} />
          {meeting.referenceLinkDescription ? (
            <p className="text-[12px] text-[#6B7280] mt-1 font-normal">{meeting.referenceLinkDescription}</p>
          ) : null}
        </DetailItem>
      ) : null}

      <DetailItem label="Special Instructions" className="sm:col-span-2">
        {meeting.specialInstructions || "—"}
      </DetailItem>
    </div>
  );
}

export default function MeetingDetailsModal({
  open,
  meeting,
  onClose,
  onEdit,
  entityLabel = "Meeting",
}) {
  if (!open || !meeting) return null;

  const isEvent = entityLabel === "Event" || meeting.category === "event";
  const label = isEvent ? "Event" : "Meeting";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${label} Details`}
      subtitle={meeting.title}
      icon={isEvent ? <CalendarDays size={16} /> : <Users2 size={16} />}
      iconBg={isEvent ? "#FDECF3" : "#F6FFF5"}
      iconColor={isEvent ? "#A02868" : "#41703D"}
      width="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={() => onEdit?.(meeting)}
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
      {isEvent ? <EventDetailsBody meeting={meeting} /> : <MeetingDetailsBody meeting={meeting} />}
    </Modal>
  );
}
