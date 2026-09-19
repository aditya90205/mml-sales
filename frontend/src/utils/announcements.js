const STORAGE_KEY = "mml_sales_announcement_unread";
const EVENT = "mml-sales-announcements";

export const ANNOUNCEMENT_TYPES = [
  "Policy Update",
  "Holiday",
  "Training",
  "HR",
  "IT",
  "Benefits",
  "Shift",
  "Event",
  "Contest",
];

export const ANNOUNCEMENT_PRIORITIES = ["High", "Medium", "Low"];

export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "New Leave Policy Update",
    message: "Updated leave policy effective from June 2026. Please review accrual, carry-forward and encashment rules before applying leave.",
    type: "Policy Update",
    priority: "High",
    actor: "HR Team",
    time: "2 hr ago",
    date: "19 Sep 2026",
    period: "today",
    unread: true,
  },
  {
    id: "a2",
    title: "Office closed on 15 August",
    message: "The office will remain closed on Independence Day. Please plan client follow-ups a day in advance.",
    type: "Holiday",
    priority: "Medium",
    actor: "Admin",
    time: "4 hr ago",
    date: "19 Sep 2026",
    period: "today",
    unread: true,
  },
  {
    id: "a3",
    title: "Mandatory POSH training",
    message: "All employees must complete the POSH refresher module this week. Attendance will be marked in HRMS.",
    type: "Training",
    priority: "High",
    actor: "L&D",
    time: "6 hr ago",
    date: "19 Sep 2026",
    period: "today",
    unread: true,
  },
  {
    id: "a4",
    title: "Salary processing date change",
    message: "September salary will be processed on the 28th instead of the 30th due to a banking holiday.",
    type: "HR",
    priority: "High",
    actor: "Payroll",
    time: "8 hr ago",
    date: "19 Sep 2026",
    period: "today",
    unread: true,
  },
  {
    id: "a5",
    title: "VPN maintenance tonight",
    message: "IT will take VPN offline from 11:00 PM to 1:00 AM. Remote access will be unavailable during this window.",
    type: "IT",
    priority: "High",
    actor: "IT Desk",
    time: "Yesterday",
    date: "18 Sep 2026",
    period: "week",
    unread: true,
  },
  {
    id: "a6",
    title: "Diwali bonus declared",
    message: "Festival bonus for eligible employees has been approved and will reflect in the October payslip.",
    type: "Benefits",
    priority: "Medium",
    actor: "Finance",
    time: "Yesterday",
    date: "18 Sep 2026",
    period: "week",
    unread: true,
  },
  {
    id: "a7",
    title: "New night shift roster",
    message: "Updated shift roster for October is live. Raise a shift-change request from HRMS if you need an exception.",
    type: "Shift",
    priority: "Medium",
    actor: "Operations",
    time: "2 days ago",
    date: "17 Sep 2026",
    period: "week",
    unread: false,
  },
  {
    id: "a8",
    title: "Townhall this Friday",
    message: "Leadership townhall at 4:00 PM in the main conference room. Hybrid link will be shared on the day.",
    type: "Event",
    priority: "Low",
    actor: "Internal Comms",
    time: "3 days ago",
    date: "16 Sep 2026",
    period: "week",
    unread: false,
  },
  {
    id: "a9",
    title: "Q2 sales contest results",
    message: "Q2 contest winners have been published. Certificates and gifts will be issued from the Awards & Contest tab.",
    type: "Contest",
    priority: "Medium",
    actor: "Sales Ops",
    time: "4 days ago",
    date: "15 Sep 2026",
    period: "week",
    unread: false,
  },
  {
    id: "a10",
    title: "Updated WFH policy",
    message: "Work-from-home is now limited to 4 days a month unless approved by your reporting manager.",
    type: "Policy Update",
    priority: "Medium",
    actor: "HR Team",
    time: "1 week ago",
    date: "12 Sep 2026",
    period: "older",
    unread: false,
  },
  {
    id: "a11",
    title: "Health checkup camp",
    message: "Annual health checkup camp will run on 24–25 September. Book your slot from HRMS Assets / HR desk.",
    type: "HR",
    priority: "Low",
    actor: "HR Team",
    time: "1 week ago",
    date: "11 Sep 2026",
    period: "older",
    unread: false,
  },
  {
    id: "a12",
    title: "PF contribution revision",
    message: "Statutory PF contribution slabs have been revised. Updated breakup will show on the next payslip.",
    type: "HR",
    priority: "High",
    actor: "Payroll",
    time: "2 weeks ago",
    date: "5 Sep 2026",
    period: "older",
    unread: false,
  },
  {
    id: "a13",
    title: "Leave encashment window",
    message: "Annual leave encashment window is open till 30 September. Apply from Attendance & Timesheet.",
    type: "Policy Update",
    priority: "Medium",
    actor: "HR Team",
    time: "2 weeks ago",
    date: "4 Sep 2026",
    period: "older",
    unread: false,
  },
  {
    id: "a14",
    title: "New biometric devices",
    message: "Biometric devices on floor 2 have been replaced. Re-register your punch if login fails twice.",
    type: "IT",
    priority: "Low",
    actor: "IT Desk",
    time: "3 weeks ago",
    date: "29 Aug 2026",
    period: "older",
    unread: false,
  },
];

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

function readUnreadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeUnreadMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  emit();
}

export function readAnnouncements() {
  const unreadMap = readUnreadMap();
  return DEFAULT_ANNOUNCEMENTS.map((a) => ({
    ...a,
    unread: unreadMap[a.id] !== undefined ? Boolean(unreadMap[a.id]) : a.unread,
  }));
}

export function markAnnouncementRead(id) {
  const map = readUnreadMap();
  map[id] = false;
  writeUnreadMap(map);
  return readAnnouncements();
}

export function markAllAnnouncementsRead() {
  const map = {};
  DEFAULT_ANNOUNCEMENTS.forEach((a) => {
    map[a.id] = false;
  });
  writeUnreadMap(map);
  return readAnnouncements();
}

export function subscribeAnnouncements(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange(readAnnouncements());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
