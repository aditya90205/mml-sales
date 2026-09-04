import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Clock, Bell, ArrowUpRight, CheckCheck, User, LogOut, Search, CircleDot, ChevronRight } from "lucide-react";
import Avatar from "../ui/Avatar";
import TimesheetDetailsModal from "../hrms/TimesheetDetailsModal";


const USER = {
  name: "Ankur Sharma",
  role: "Sales Manager",
  email: "ankur@makemylagan.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
};

const SESSION = {
  loginTime: "10:24 AM",
  idle: "12m",
  active: "4H 32M",
};

const PRESENCE_STATUSES = [
  { id: "online", label: "Online", color: "#16A34A" },
  { id: "offline", label: "Offline", color: "#9CA3AF" },
  { id: "in_meeting", label: "In Meeting", color: "#E8395B" },
  { id: "break", label: "Break", color: "#EAB308" },
  { id: "leave", label: "Leave", color: "#8B5CF6" },
];

const STATUS_KEY = "mml_sales_presence_status";

function getPresenceMeta(statusId) {
  return PRESENCE_STATUSES.find((s) => s.id === statusId) ?? PRESENCE_STATUSES[0];
}

function readStoredStatus() {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    if (PRESENCE_STATUSES.some((s) => s.id === raw)) return raw;
  } catch {
    /* ignore */
  }
  return "online";
}

function StatusToggle({ checked, color }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "" : "bg-black/15"
      }`}
      style={checked ? { backgroundColor: color } : undefined}
      aria-hidden
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </span>
  );
}

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    actor: "Rahul Sharma",
    title: "New lead assigned",
    message: "A high-value lead from Delhi has been assigned to you.",
    time: "2 min ago",
    unread: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 2,
    actor: "Priya Verma",
    title: "Follow-up reminder",
    message: "You have a scheduled follow-up call with Ananya Gupta today.",
    time: "15 min ago",
    unread: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 3,
    actor: "System",
    title: "Approval required",
    message: "Discount request from Vikram Chawla is awaiting your approval.",
    time: "1 hr ago",
    unread: false,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
  },
];

function useOutsideClose(ref, close) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, close]);
}

function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));
  const unread = items.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-1.5 rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/8 transition-colors"
      >
        <Bell size={19} strokeWidth={1.7} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[13px] h-[13px] px-[3px] rounded-[4px] bg-[#3B82F6] text-white text-[8px] font-bold grid place-items-center ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[350px] bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
            <p className="text-sm font-semibold text-[#111]">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => setItems((p) => p.map((n) => ({ ...n, unread: false })))}
                className="flex items-center gap-1 text-xs font-medium text-[#7A0A17] hover:underline"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-black/5">
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setItems((p) => p.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  n.unread ? "bg-[#FCF5F6] hover:bg-[#F9ECEE]" : "hover:bg-[#FAFAFB]"
                }`}
              >
                <img src={n.avatar} alt="" className="size-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#111] leading-snug">
                    <span className="font-semibold">{n.actor}</span>
                    <span className="text-[#555]"> · {n.title}</span>
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">{n.time}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate("/notifications"); }}
            className="w-full py-3 text-sm font-semibold text-[#7A0A17] border-t border-black/8 hover:bg-[#FCF5F6] transition-colors"
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState(readStoredStatus);
  const ref = useRef(null);
  const statusMeta = getPresenceMeta(presenceStatus);

  useOutsideClose(ref, () => {
    setOpen(false);
    setStatusOpen(false);
  });

  const closeMenu = () => {
    setOpen(false);
    setStatusOpen(false);
  };

  const handleStatusSelect = (statusId) => {
    if (!PRESENCE_STATUSES.some((s) => s.id === statusId)) return;
    try {
      localStorage.setItem(STATUS_KEY, statusId);
    } catch {
      /* ignore */
    }
    setPresenceStatus(statusId);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setStatusOpen(false);
        }}
        className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-black/4 transition-colors"
      >
        <Avatar src={USER.avatar} name={USER.name} size="sm" statusColor={statusMeta.color} />
        <div className="text-left hidden sm:block leading-none">
          <p className="text-[13px] font-semibold text-[#111]">Profile</p>
          <p className="text-[10px] mt-1">
            <span className="font-medium" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
            <span className="text-[#9CA3AF]"> · Idle for {SESSION.idle}in</span>
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-50 overflow-visible">
          <div className="px-4 py-3 border-b border-black/8 rounded-t-2xl overflow-hidden">
            <div className="flex items-center gap-3">
              <Avatar src={USER.avatar} name={USER.name} size="md" statusColor={statusMeta.color} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">{USER.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 truncate">{USER.email}</p>
                <p className="text-[11px] mt-0.5 flex items-center gap-1.5 text-[#6B7280]">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: statusMeta.color }} />
                  {statusMeta.label}
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setStatusOpen(true)}
            onMouseLeave={() => setStatusOpen(false)}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#111] hover:bg-[#FAFAFB] transition-colors"
            >
              <span className="flex items-center gap-3">
                <CircleDot size={15} style={{ color: statusMeta.color }} />
                Status
              </span>
              <ChevronRight size={15} className="text-[#9CA3AF]" />
            </button>

            {statusOpen && (
              <div className="absolute right-full top-0 pr-1 w-56 z-[60]">
                <div className="bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] py-2">
                  <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Set status
                  </p>
                  {PRESENCE_STATUSES.map((s) => {
                    const checked = presenceStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleStatusSelect(s.id)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#111] hover:bg-[#FAFAFB] transition-colors"
                      >
                        <span className="text-left">{s.label}</span>
                        <StatusToggle checked={checked} color={s.color} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => { closeMenu(); navigate("/profile"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111] hover:bg-[#FAFAFB] transition-colors"
          >
            <User size={15} /> Profile
          </button>
          <button
            type="button"
            onClick={() => { closeMenu(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#DC2626] border-t border-black/8 hover:bg-[#FEF2F2] transition-colors rounded-b-2xl"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Session bar: breadcrumb + login / idle / active session meta on the left,
 * notifications + profile on the right.
 */
export default function TopBar({ page = "Dashboard" }) {
  const location = useLocation();
  const [regularizeOpen, setRegularizeOpen] = useState(false);

  const pathname = location?.pathname || "/dashboard";
  const pathnames = pathname.split("/").filter(Boolean);

  const routeNameMap = {
    dashboard: "Dashboard",
    hrms: "HRMS",
    pipeline: "Pipeline Board",
    visits: "Home & Office Visits",
    "cross-branch": "Cross Branch Flags",
    quotations: "Quotations",
    "discount-requests": "Discount Requests",
    "contract-payment": "Contract & Payment",
    "p6-handover": "P6 Handover",
    clients: "Client Database",
    "create-group": "Create Group",
    sales: "Sales",
    funnel: "Sales Funnel",
    leads: "Lead Management",
    proposals: "Proposals",
    "follow-ups": "Follow-Ups",
    profiles: "Profiles",
    matches: "Matches",
    calendar: "Calendar",
    tasks: "Tasks",
    "bulk-upload": "Bulk Upload",
    leaderboard: "Leaderboard",
    contest: "Contest",
    campaign: "Campaign",
    management: "Campaign Management",
    create: "All Campaigns",
    meetings: "Meetings",
    announcements: "Announcements",
    reports: "Reports",
    targets: "Targets",
    reviews: "Reviews",
    media: "Media Library",
    documents: "Documents",
    settings: "Settings",
    support: "Help & Support",
    profile: "Profile",
    notifications: "Notifications",
  };

  const breadcrumbs = pathnames.length && pathnames[0] !== "dashboard"
    ? [
        { to: "/dashboard", name: routeNameMap.dashboard },
        ...pathnames.map((seg, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const name = routeNameMap[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return { to, name };
        }),
      ]
    : [{ to: "/dashboard", name: routeNameMap.dashboard }];

  return (
    <header className="fixed left-[58px] right-0 top-0 z-50 h-[56px] bg-white border-b border-black/8 flex items-center justify-between gap-4 px-5 shrink-0">
      {/* Left: breadcrumb + session meta */}
      <div className="flex items-center gap-3 min-w-0">
        <nav className="flex items-center gap-2 min-w-0">
          {breadcrumbs.map((b, i) => (
            <span key={b.to} className="flex items-center gap-2 min-w-0">
              {i < breadcrumbs.length - 1 ? (
                <Link to={b.to} className="text-[13px] font-semibold text-[#7A0A17] hover:underline truncate">
                  {b.name}
                </Link>
              ) : (
                <span className="text-[13px] font-bold text-[#E8395B] truncate">{b.name}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="text-[#9CA3AF]">›</span>}
            </span>
          ))}
        </nav>

        <span className="w-px h-4 bg-black/12" />

        <span className="flex items-center gap-1.5 text-xs text-[#6B7280] whitespace-nowrap">
          <Clock size={13} className="text-[#9CA3AF]" />
          Logged in at {SESSION.loginTime}
        </span>

        <span className="w-px h-4 bg-black/12" />

        <span className="flex items-center gap-1.5 text-xs text-[#6B7280] whitespace-nowrap">
          <span className="size-1.5 rounded-full bg-[#F59E0B]" />
          Idle: {SESSION.idle}
        </span>

        <button
          type="button"
          onClick={() => setRegularizeOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] whitespace-nowrap hover:underline underline-offset-2"
        >
          <span className="size-1.5 rounded-full bg-[#3B82F6]" />
          Active: {SESSION.active}
          <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Right: search + bell + profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search bar — same design as Dashboard */}
        <div className="flex items-center gap-2 h-[38px] px-3.5 rounded-xl bg-white border border-black/10 w-[230px] focus-within:border-[#7A0A17]/40 transition-colors">
          <Search size={15} className="text-[#9CA3AF] shrink-0" />
          <input
            placeholder="Search here..."
            className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full"
          />
        </div>

        <NotificationBell />
        <ProfileMenu />
      </div>

      <TimesheetDetailsModal
        open={regularizeOpen}
        onClose={() => setRegularizeOpen(false)}
        mode="edit"
        employee={{
          name: USER.name,
          role: USER.role || "Relationship Manager",
          id: "EMP00116",
          avatar: USER.avatar,
        }}
      />
    </header>
  );
}

export { USER, SESSION };