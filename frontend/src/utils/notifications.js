const STORAGE_KEY = "mml_sales_notification_unread";
const EVENT = "mml-sales-notifications";

export const NOTIFICATION_TYPES = [
  "Lead",
  "Follow-up",
  "Approval",
  "Payment",
  "Meeting",
  "Task",
  "Client",
  "Campaign",
];

export const DEFAULT_NOTIFICATIONS = [
  {
    id: "n1",
    actor: "Rahul Sharma",
    title: "New lead assigned",
    message: "A high-value lead from Delhi has been assigned to you.",
    type: "Lead",
    time: "2 min ago",
    period: "today",
    unread: true,
    to: "/pipeline",
  },
  {
    id: "n2",
    actor: "Priya Verma",
    title: "Follow-up reminder",
    message: "You have a scheduled follow-up call with Ananya Gupta today.",
    type: "Follow-up",
    time: "15 min ago",
    period: "today",
    unread: true,
    to: "/calendar",
  },
  {
    id: "n3",
    actor: "Rahul Sharma",
    title: "New client registered",
    message: "A new client is registered and waiting for first contact.",
    type: "Client",
    time: "25 min ago",
    period: "today",
    unread: true,
    to: "/clients",
  },
  {
    id: "n4",
    actor: "Accounts",
    title: "Payment received",
    message: "Payment of ₹40,000 received from Neha Kapoor.",
    type: "Payment",
    time: "30 min ago",
    period: "today",
    unread: true,
    to: "/pipeline/contract-payment",
  },
  {
    id: "n5",
    actor: "System",
    title: "Approval required",
    message: "Discount request from Vikram Chawla is awaiting your approval.",
    type: "Approval",
    time: "1 hr ago",
    period: "today",
    unread: true,
    to: "/pipeline/discount-requests",
  },
  {
    id: "n6",
    actor: "Calendar",
    title: "Meeting scheduled",
    message: "Your Q2 review meeting with Ananya Iyer is scheduled for tomorrow at 11:00 AM.",
    type: "Meeting",
    time: "1 hr ago",
    period: "today",
    unread: true,
    to: "/calendar",
  },
  {
    id: "n7",
    actor: "Priya Sharma",
    title: "Task assigned",
    message: "Complete KYC documents for Ananya Iyer before the P3 visit.",
    type: "Task",
    time: "2 hr ago",
    period: "today",
    unread: false,
    to: "/tasks",
  },
  {
    id: "n8",
    actor: "Campaign",
    title: "Campaign completed",
    message: "July monsoon offer campaign has been marked completed for 48 leads.",
    type: "Campaign",
    time: "3 hr ago",
    period: "today",
    unread: false,
    to: "/campaign/management",
  },
  {
    id: "n9",
    actor: "Sneha Patel",
    title: "New candidate applied",
    message: "A new inbound enquiry from South Delhi has entered the common pool.",
    type: "Lead",
    time: "5 hr ago",
    period: "today",
    unread: false,
    to: "/cold-pool",
  },
  {
    id: "n10",
    actor: "Pipeline",
    title: "Stage moved",
    message: "Ananya Verma moved from P3 Video Call to P4 Negotiation.",
    type: "Lead",
    time: "Yesterday",
    period: "week",
    unread: false,
    to: "/pipeline?openLead=p4-1",
  },
  {
    id: "n11",
    actor: "Approvals",
    title: "Discount approved",
    message: "10% discount approved for Neha Kapoor.",
    type: "Approval",
    time: "1 day ago",
    period: "week",
    unread: false,
    to: "/pipeline/discount-requests",
  },
  {
    id: "n12",
    actor: "Pipeline",
    title: "Lead converted",
    message: "Rohit Sharma has been successfully converted into a client.",
    type: "Client",
    time: "2 days ago",
    period: "week",
    unread: false,
    to: "/clients",
  },
  {
    id: "n13",
    actor: "Documents",
    title: "Bio data received",
    message: "Bio data received from Amit Verma and filed to the deal.",
    type: "Client",
    time: "2 days ago",
    period: "week",
    unread: false,
    to: "/documents",
  },
  {
    id: "n14",
    actor: "Accounts",
    title: "Contract payment due",
    message: "Token payment for Vikram Chawla is pending before P5 handover.",
    type: "Payment",
    time: "3 days ago",
    period: "older",
    unread: false,
    to: "/pipeline/contract-payment",
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

export function readNotifications() {
  const unreadMap = readUnreadMap();
  return DEFAULT_NOTIFICATIONS.map((n) => ({
    ...n,
    unread: unreadMap[n.id] !== undefined ? Boolean(unreadMap[n.id]) : n.unread,
  }));
}

export function markNotificationRead(id) {
  const map = readUnreadMap();
  map[id] = false;
  writeUnreadMap(map);
  return readNotifications();
}

export function markAllNotificationsRead() {
  const map = {};
  DEFAULT_NOTIFICATIONS.forEach((n) => {
    map[n.id] = false;
  });
  writeUnreadMap(map);
  return readNotifications();
}

export function subscribeNotifications(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange(readNotifications());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
