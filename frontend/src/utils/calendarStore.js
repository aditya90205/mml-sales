const EVENTS_KEY = "mml_sales_calendar_extra_events";
const UNSCHEDULED_KEY = "mml_sales_calendar_unscheduled";
const EVENT = "mml-sales-calendar";

export const DEFAULT_UNSCHEDULED = [
  { id: "u1", title: "Call back Sethi", type: "Lead", duration: "30 min" },
  { id: "u2", title: "Draft Agarwal Package Quote", type: "Prospect", duration: "30 min" },
  { id: "u3", title: "Follow up with Mehta Family", type: "Prospect", duration: "30 min" },
  { id: "u4", title: "Prepare Sharma Match Shortlist", type: "Prospect", duration: "45 min" },
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toIsoDate(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return toIsoDate(new Date());
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDate(iso, fallback = new Date()) {
  if (iso instanceof Date && !Number.isNaN(iso.getTime())) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate());
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return fallback instanceof Date ? fallback : new Date();
  return new Date(y, m - 1, d);
}

function parseTimeHour(time, fallback = 10) {
  if (!time) return fallback;
  const [h] = String(time).split(":").map(Number);
  return Number.isFinite(h) ? h : fallback;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

function durationLabelToMinutes(duration) {
  const map = {
    "15 minutes": 15,
    "30 min": 30,
    "30 minutes": 30,
    "45 min": 45,
    "45 minutes": 45,
    "1 hour": 60,
    "1 hour 30 minutes": 90,
    "2 hours": 120,
    "3 hours": 180,
  };
  if (map[duration]) return map[duration];
  const n = parseInt(String(duration), 10);
  if (String(duration).includes("hour")) return Number.isFinite(n) ? n * 60 : 60;
  return Number.isFinite(n) ? n : 30;
}

function addMinutesToTime(time, minutes) {
  const [h, m] = String(time || "10:00").split(":").map(Number);
  const total = ((h || 0) * 60 + (m || 0) + minutes + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${pad2(nh)}:${pad2(nm)}`;
}

function peopleFromTitle(title) {
  const match = String(title || "").match(/^(?:call back|follow up with|follow up on|draft|prepare)\s+(.+)$/i);
  return [match ? match[1].trim() : String(title || "").trim()].filter(Boolean);
}

export function unscheduledToMeetingForm(item, date = new Date()) {
  const dateStr = toIsoDate(date);
  const mins = durationLabelToMinutes(item?.duration);
  const startTime = "10:00";
  const duration =
    mins <= 15 ? "15 minutes" : mins <= 30 ? "30 minutes" : mins <= 45 ? "45 minutes" : mins <= 60 ? "1 hour" : "1 hour 30 minutes";
  return {
    title: item?.title || "",
    meetingWith: "client",
    meetingWithTypes: ["client"],
    people: peopleFromTitle(item?.title),
    description: "Follow-up",
    meetingType: /call/i.test(item?.title || "") ? "telephonic" : "video",
    duration,
    startDate: dateStr,
    endDate: dateStr,
    startTime,
    endTime: addMinutesToTime(startTime, mins),
    priority: "High",
    reminderChannels: ["email"],
    reminderFrequency: ["on_day"],
  };
}

function displayName(label) {
  if (!label) return "";
  const parts = String(label).split(" · ");
  return parts.length > 1 ? parts.slice(1).join(" · ").trim() : String(label);
}

export function meetingFormToCalendarItem(form, category = "meeting", existingId = null) {
  const date = parseIsoDate(form.startDate);
  const startH = parseTimeHour(form.startTime, 10);
  let endH = parseTimeHour(form.endTime, startH + 1);
  if (endH <= startH) endH = Math.min(startH + 1, 18);
  const meetingWithTypes = Array.isArray(form.meetingWithTypes)
    ? form.meetingWithTypes
    : form.meetingWith
      ? String(form.meetingWith)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const meetingWith = meetingWithTypes.includes("client")
    ? "client"
    : meetingWithTypes[0] || form.meetingWith || "";
  const client =
    meetingWithTypes.includes("client") || meetingWith === "client"
      ? displayName(form.people?.find((p) => String(p).includes("MML-D-")) || form.people?.[0] || "")
      : displayName(form.people?.find((p) => String(p).includes("MML-D-")) || "");
  return {
    id: existingId || `${category}-${Date.now()}`,
    date,
    startH,
    endH,
    title: form.title?.trim() || form.description || (category === "event" ? "New Event" : "New Meeting"),
    category,
    meta: {
      priority: form.priority || "Medium",
      clientRelated:
        Boolean(client) ||
        meetingWith === "client" ||
        meetingWithTypes.includes("client") ||
        form.inviteGroups?.includes("client"),
      client,
      meetingWith,
      meetingWithTypes,
      assignees: form.people?.length ? form.people : ["Priya Sharma"],
      people: form.people || [],
      inviteGroups: form.inviteGroups || [],
      stage: "New",
      dueDate: parseIsoDate(form.endDate || form.startDate, addDays(date, 1)),
      stars: 10,
      description:
        category === "event" ? form.notes || "" : form.specialInstructions || form.description || "",
      formDescription: form.description || "",
      eventType: category === "event" ? form.description : undefined,
      specialInstructions: form.specialInstructions || "",
      location: form.venue || "",
      venue: form.venue || "",
      logisticsRequired: Boolean(form.logisticsRequired),
      link: form.meetingLink || "",
      meetingLink: form.meetingLink || "",
      meetingType: form.meetingType || form.meetingTypes?.[0] || "",
      meetingTypes: form.meetingTypes || (form.meetingType ? [form.meetingType] : []),
      emails: form.emails || [],
      emailIds: form.emailIds || "",
      duration: form.duration || "",
      reminderChannels: form.reminderChannels || [],
      messageTemplate: form.messageTemplate || "",
      messageBody: form.messageBody || "",
      reminderFrequency: form.reminderFrequency || [],
      customReminders: form.customReminders || [],
      referenceLink: form.referenceLink || "",
      referenceLinkDescription: form.referenceLinkDescription || "",
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
}

export function serializeCalendarItem(item) {
  return {
    ...item,
    date: toIsoDate(item.date),
    meta: {
      ...(item.meta || {}),
      dueDate: item.meta?.dueDate ? toIsoDate(item.meta.dueDate) : item.meta?.dueDate,
    },
  };
}

export function hydrateCalendarItem(item) {
  if (!item) return item;
  return {
    ...item,
    date: parseIsoDate(item.date),
    meta: {
      ...(item.meta || {}),
      dueDate: item.meta?.dueDate ? parseIsoDate(item.meta.dueDate) : item.meta?.dueDate,
    },
  };
}

export function mergeCalendarEvents(base, extra) {
  const ids = new Set((base || []).map((ev) => ev.id));
  return [...(base || []), ...(extra || []).filter((ev) => ev?.id && !ids.has(ev.id))];
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function readUnscheduled() {
  const list = readJson(UNSCHEDULED_KEY, null);
  if (!Array.isArray(list)) {
    try {
      localStorage.setItem(UNSCHEDULED_KEY, JSON.stringify(DEFAULT_UNSCHEDULED));
    } catch {
      /* ignore */
    }
    return DEFAULT_UNSCHEDULED;
  }
  return list;
}

function writeUnscheduled(list) {
  try {
    localStorage.setItem(UNSCHEDULED_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  emit();
}

export function removeUnscheduled(id) {
  writeUnscheduled(readUnscheduled().filter((item) => item.id !== id));
}

export function readExtraEvents() {
  const list = readJson(EVENTS_KEY, []);
  return Array.isArray(list) ? list.map(hydrateCalendarItem) : [];
}

function writeExtraEvents(list) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list.map(serializeCalendarItem)));
  } catch {
    /* ignore */
  }
  emit();
}

export function addExtraEvent(item) {
  const nextItem = item.date instanceof Date ? item : hydrateCalendarItem(item);
  const list = readExtraEvents();
  const exists = list.some((ev) => ev.id === nextItem.id);
  writeExtraEvents(exists ? list.map((ev) => (ev.id === nextItem.id ? nextItem : ev)) : [...list, nextItem]);
  return nextItem;
}

export function subscribeCalendar(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function sameCalendarDay(a, b) {
  if (!a || !b) return false;
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function formatHourTime(h, m = 0) {
  const hour = Number(h);
  if (!Number.isFinite(hour)) return "";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function findUpNextEvent(events, now = new Date()) {
  return (
    [...(events || [])]
      .filter((ev) => {
        if (ev?.startH == null || !ev.date) return false;
        const start = new Date(ev.date);
        if (Number.isNaN(start.getTime())) return false;
        start.setHours(ev.startH, 0, 0, 0);
        return start >= now;
      })
      .sort((a, b) => {
        const as = new Date(a.date);
        as.setHours(a.startH, 0, 0, 0);
        const bs = new Date(b.date);
        bs.setHours(b.startH, 0, 0, 0);
        return as - bs;
      })[0] || null
  );
}
