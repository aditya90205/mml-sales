import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, ChevronDown, Filter, Search } from "lucide-react";
import SearchField from "../components/common/SearchField.jsx";
import NotificationTypeIcon from "../components/common/NotificationTypeIcon.jsx";
import {
  NOTIFICATION_TYPES,
  markAllNotificationsRead,
  markNotificationRead,
  readNotifications,
  subscribeNotifications,
} from "../utils/notifications.js";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

const PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "older", label: "Older" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [items, setItems] = useState(readNotifications);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => subscribeNotifications(setItems), []);

  useEffect(() => {
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const unreadCount = items.filter((n) => n.unread).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (statusFilter === "unread" && !n.unread) return false;
      if (statusFilter === "read" && n.unread) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (periodFilter !== "all" && n.period !== periodFilter) return false;
      if (!q) return true;
      return [n.actor, n.title, n.message, n.type].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [items, search, typeFilter, statusFilter, periodFilter]);

  const extraFilterCount = periodFilter !== "all" ? 1 : 0;

  const openItem = (n) => {
    markNotificationRead(n.id);
    if (n.to) navigate(n.to);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Notifications</h1>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => markAllNotificationsRead()}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-[#7A0A17]/25 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FDF2F3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>

        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search notifications..."
                className="flex-1 min-w-[220px] max-w-[320px] !rounded-full"
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
              >
                <Search size={14} />
                Search
              </button>
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white border text-[13px] font-semibold transition-colors ${
                    filterOpen || extraFilterCount
                      ? "border-[#7A0A17]/40 text-[#7A0A17]"
                      : "border-[#7A0A17]/30 text-[#7A0A17] hover:bg-[#FDF2F3]"
                  }`}
                >
                  <Filter size={14} />
                  Filters
                  {extraFilterCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#7A0A17] text-white text-[10px] font-bold">
                      {extraFilterCount}
                    </span>
                  )}
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[220px] bg-white border border-black/10 rounded-xl shadow-lg p-3">
                    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Period
                      <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-black/10 text-[13px] font-medium text-[#374151] outline-none"
                      >
                        {PERIOD_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280]">
                Type
                <span className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-white border border-black/10 text-[13px] font-medium text-[#374151] outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {NOTIFICATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                  />
                </span>
              </label>

              <div className="inline-flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-[#6B7280] mr-1">Status</span>
                {STATUS_TABS.map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`h-7 px-3 rounded-lg text-[12.5px] font-semibold transition-colors ${
                        active
                          ? "bg-[#7A0A17] text-white"
                          : "text-[#6B7280] hover:bg-black/4"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="divide-y divide-black/6">
            {filtered.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
                No notifications match your filters.
              </p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                    n.unread ? "bg-[#FDF6F7] hover:bg-[#F9ECEE]" : "bg-white hover:bg-[#FAFAFB]"
                  }`}
                >
                  <NotificationTypeIcon type={n.type} title={n.title} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-[#111] leading-snug font-semibold">
                      {n.title}
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center h-[20px] px-2 rounded-md bg-[#EEF2FF] text-[11px] font-semibold text-[#4F46E5]">
                        {n.type}
                      </span>
                      {n.actor && (
                        <span className="text-[11px] text-[#9CA3AF]">by {n.actor}</span>
                      )}
                      <span className="text-[11px] text-[#9CA3AF]">{n.time}</span>
                    </div>
                  </div>
                  {n.unread && (
                    <span className="size-2 rounded-full bg-[#E8395B] shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
