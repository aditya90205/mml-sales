import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCheck,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Gift,
  GraduationCap,
  Megaphone,
  MessageCircle,
  Monitor,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import SearchField from "../components/common/SearchField.jsx";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
import Modal from "../components/ui/Modal.jsx";
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_TYPES,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  readAnnouncements,
  subscribeAnnouncements,
} from "../utils/announcements.js";

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

const TYPE_STYLES = {
  "Policy Update": { Icon: FileText, bg: "bg-[#EEF2FF]", color: "text-[#4F46E5]", ring: "ring-[#C7D2FE]" },
  Holiday: { Icon: Calendar, bg: "bg-[#ECFDF5]", color: "text-[#059669]", ring: "ring-[#A7F3D0]" },
  Training: { Icon: GraduationCap, bg: "bg-[#EFF6FF]", color: "text-[#2563EB]", ring: "ring-[#BFDBFE]" },
  HR: { Icon: Users, bg: "bg-[#FDF2F8]", color: "text-[#DB2777]", ring: "ring-[#FBCFE8]" },
  IT: { Icon: Monitor, bg: "bg-[#F8FAFC]", color: "text-[#475569]", ring: "ring-[#CBD5E1]" },
  Benefits: { Icon: Gift, bg: "bg-[#FFFBEB]", color: "text-[#D97706]", ring: "ring-[#FDE68A]" },
  Shift: { Icon: Clock, bg: "bg-[#F0FDFA]", color: "text-[#0D9488]", ring: "ring-[#99F6E4]" },
  Event: { Icon: Sparkles, bg: "bg-[#F5F3FF]", color: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" },
  Contest: { Icon: Trophy, bg: "bg-[#FFF7ED]", color: "text-[#EA580C]", ring: "ring-[#FED7AA]" },
};

const PRIORITY_STYLES = {
  High: "text-[#E8395B] bg-[#FDECEE]",
  Medium: "text-[#D97706] bg-[#FEF3C7]",
  Low: "text-[#6B7280] bg-[#F3F4F6]",
};

function AnnouncementTypeIcon({ type, size = "md" }) {
  const style = TYPE_STYLES[type] || {
    Icon: Megaphone,
    bg: "bg-[#E8F2FE]",
    color: "text-[#3B82F6]",
    ring: "ring-[#BFDBFE]",
  };
  const box = size === "lg" ? "size-11" : "size-9";
  const iconSize = size === "lg" ? 18 : 16;
  const { Icon } = style;

  return (
    <span
      className={`${box} rounded-xl ${style.bg} ring-1 ${style.ring} grid place-items-center shrink-0`}
      aria-hidden
    >
      <Icon size={iconSize} className={style.color} strokeWidth={2.2} />
    </span>
  );
}

export default function AnnouncementsPage() {
  const filterRef = useRef(null);
  const [items, setItems] = useState(readAnnouncements);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [commentFor, setCommentFor] = useState(null);

  useEffect(() => subscribeAnnouncements(setItems), []);

  useEffect(() => {
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const unreadCount = items.filter((a) => a.unread).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      if (statusFilter === "unread" && !a.unread) return false;
      if (statusFilter === "read" && a.unread) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (periodFilter !== "all" && a.period !== periodFilter) return false;
      if (!q) return true;
      return [a.title, a.message, a.type, a.priority, a.actor].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [items, search, typeFilter, statusFilter, priorityFilter, periodFilter]);

  const extraFilterCount = [periodFilter !== "all", priorityFilter !== "all"].filter(Boolean).length;

  const openItem = (item) => {
    markAnnouncementRead(item.id);
    setActive(item);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Announcements</h1>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">
              {unreadCount} unread announcement{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => markAllAnnouncementsRead()}
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
                placeholder="Search announcements..."
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
                  <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[220px] bg-white border border-black/10 rounded-xl shadow-lg p-3 flex flex-col gap-3">
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
                    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Priority
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-black/10 text-[13px] font-medium text-[#374151] outline-none"
                      >
                        <option value="all">All priorities</option>
                        {ANNOUNCEMENT_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
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
                    {ANNOUNCEMENT_TYPES.map((type) => (
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
                  const activeTab = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`h-7 px-3 rounded-lg text-[12.5px] font-semibold transition-colors ${
                        activeTab
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
                No announcements match your filters.
              </p>
            ) : (
              filtered.map((a) => (
                <div
                  key={a.id}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 transition-colors ${
                    a.unread ? "bg-[#FDF6F7] hover:bg-[#F9ECEE]" : "bg-white hover:bg-[#FAFAFB]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openItem(a)}
                    className="flex items-start gap-3 min-w-0 flex-1 text-left"
                  >
                    <AnnouncementTypeIcon type={a.type} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] text-[#111] leading-snug font-semibold">{a.title}</p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5 leading-relaxed line-clamp-2">{a.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center h-[20px] px-2 rounded-md bg-[#E8F2FE] text-[11px] font-semibold text-[#3B82F6]">
                          {a.type}
                        </span>
                        <span className={`inline-flex items-center h-[20px] px-2 rounded-md text-[11px] font-semibold ${PRIORITY_STYLES[a.priority]}`}>
                          {a.priority}
                        </span>
                        {a.actor && <span className="text-[11px] text-[#9CA3AF]">by {a.actor}</span>}
                        <span className="text-[11px] text-[#9CA3AF]">{a.time}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        markAnnouncementRead(a.id);
                        setCommentFor(a);
                      }}
                      className="size-8 rounded-lg bg-[#FFF3E4] text-[#F59E0B] grid place-items-center hover:bg-[#FFE8CC] transition-colors"
                      aria-label={`Comment on ${a.title}`}
                    >
                      <MessageCircle size={14} />
                    </button>
                    {a.unread && <span className="size-2 rounded-full bg-[#E8395B] shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title || "Announcement"}
        subtitle={active ? `${active.type} · ${active.date}` : ""}
        icon={<Megaphone size={17} />}
        iconBg="#E8F2FE"
        iconColor="#3B82F6"
        width="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setCommentFor(active);
                setActive(null);
              }}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Comment
            </button>
          </>
        }
      >
        {active && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center h-[22px] px-2.5 rounded-md bg-[#E8F2FE] text-[11px] font-semibold text-[#3B82F6]">
                {active.type}
              </span>
              <span className={`inline-flex items-center h-[22px] px-2.5 rounded-md text-[11px] font-semibold ${PRIORITY_STYLES[active.priority]}`}>
                {active.priority}
              </span>
            </div>
            <p className="text-[13.5px] text-[#374151] leading-relaxed">{active.message}</p>
            <p className="text-[12px] text-[#9CA3AF]">
              Posted by {active.actor} · {active.time}
            </p>
          </div>
        )}
      </Modal>

      <SendMessageModal
        open={!!commentFor}
        onClose={() => setCommentFor(null)}
        title={commentFor ? `Comment · ${commentFor.title}` : "Comment"}
      />
    </div>
  );
}
