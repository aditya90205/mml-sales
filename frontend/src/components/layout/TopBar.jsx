import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Bell, ArrowUpRight, CheckCheck, User, Settings, LogOut, Search } from "lucide-react";


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
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-black/4 transition-colors"
      >
        <img src={USER.avatar} alt={USER.name} className="size-8 rounded-full object-cover" />
        <div className="text-left hidden sm:block leading-none">
          <p className="text-[13px] font-semibold text-[#111]">{USER.name}</p>
          <p className="text-[10px] mt-1">
            <span className="text-[#16A34A] font-medium">Online</span>
            <span className="text-[#9CA3AF]"> · Idle for {SESSION.idle}in</span>
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8">
            <p className="text-sm font-semibold text-[#111]">{USER.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 truncate">{USER.email}</p>
          </div>
          <button type="button" onClick={() => { setOpen(false); navigate("/profile"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111] hover:bg-[#FAFAFB] transition-colors">
            <User size={15} /> Profile
          </button>
          <button type="button" onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111] hover:bg-[#FAFAFB] transition-colors">
            <Settings size={15} /> Settings
          </button>
          <button type="button" onClick={() => { setOpen(false); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#DC2626] border-t border-black/8 hover:bg-[#FEF2F2] transition-colors">
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
  return (
    <header className="h-[56px] bg-white border-b border-black/8 flex items-center justify-between gap-4 px-5 shrink-0">
      {/* Left: breadcrumb + session meta */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[13px] font-bold text-[#E8395B] whitespace-nowrap">{page}</span>

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

        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] whitespace-nowrap">
          <span className="size-1.5 rounded-full bg-[#3B82F6]" />
          Active: {SESSION.active}
          <ArrowUpRight size={12} />
        </span>
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
    </header>
  );
}

export { USER, SESSION };