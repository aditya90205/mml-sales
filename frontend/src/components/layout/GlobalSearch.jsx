import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  KanbanSquare,
  Database,
  Megaphone,
  BarChart3,
  PackageSearch,
  FileText,
  Bell,
  User,
  Upload,
  Trophy,
  Snowflake,
  Handshake,
  Home,
  GitBranch,
  Receipt,
  Percent,
  FileSignature,
  ArrowRightLeft,
  Volume2,
  X,
} from "lucide-react";
import {
  formatDisplayId,
  formatDisplayMobile,
  searchContactsByQuery,
} from "../../utils/contactSearch.js";
import { readTasks } from "../../utils/tasksStore.js";

const PAGE_CATALOG = [
  { label: "Dashboard", path: "/dashboard", keywords: ["home", "overview", "stats"], icon: LayoutDashboard, group: "Pages" },
  { label: "Calendar & Meetings", path: "/calendar", keywords: ["calendar", "meetings", "schedule"], icon: CalendarDays, group: "Pages" },
  { label: "Tasks", path: "/tasks", keywords: ["todo", "work"], icon: CheckSquare, group: "Pages" },
  { label: "Sales Pipeline", path: "/pipeline", keywords: ["pipeline", "leads", "deals", "p0", "p1", "p2", "p3", "p4", "p5", "p6"], icon: KanbanSquare, group: "Pages" },
  { label: "Home & Office Visits", path: "/pipeline/visits", keywords: ["visit", "home", "office"], icon: Home, group: "Pages" },
  { label: "Cross Branch Flags", path: "/pipeline/cross-branch", keywords: ["cross", "branch", "flag"], icon: GitBranch, group: "Pages" },
  { label: "Quotations", path: "/pipeline/quotations", keywords: ["quote", "quotation"], icon: Receipt, group: "Pages" },
  { label: "Discount Requests", path: "/pipeline/discount-requests", keywords: ["discount", "approval"], icon: Percent, group: "Pages" },
  { label: "Contract & Payment", path: "/pipeline/contract-payment", keywords: ["contract", "payment"], icon: FileSignature, group: "Pages" },
  { label: "P6 Handover", path: "/pipeline/p6-handover", keywords: ["handover", "p6"], icon: ArrowRightLeft, group: "Pages" },
  { label: "Campaign Management", path: "/campaign/management", keywords: ["campaign", "marketing"], icon: Megaphone, group: "Pages" },
  { label: "All Campaigns", path: "/campaign/create", keywords: ["campaign", "create"], icon: Megaphone, group: "Pages" },
  { label: "Client Database", path: "/clients", keywords: ["clients", "crm", "contacts"], icon: Database, group: "Pages" },
  { label: "Create Group", path: "/clients/create-group", keywords: ["group", "segment"], icon: Users, group: "Pages" },
  { label: "Packages & Plans", path: "/packages", keywords: ["package", "plan", "pricing"], icon: PackageSearch, group: "Pages" },
  { label: "Reports and Analytics", path: "/win-loss", keywords: ["win", "loss", "reports", "analytics"], icon: BarChart3, group: "Pages" },
  { label: "Cold & Common Pool", path: "/cold-pool", keywords: ["cold", "pool", "common"], icon: Snowflake, group: "Pages" },
  { label: "Post Sales", path: "/post-sales", keywords: ["post", "after sales"], icon: Handshake, group: "Pages" },
  { label: "HRMS", path: "/hrms", keywords: ["hr", "employee", "attendance", "leave"], icon: Users, group: "Pages" },
  { label: "Resignations", path: "/hrms/resignations", keywords: ["resign", "exit"], icon: Users, group: "Pages" },
  { label: "Bulk Import", path: "/bulk-upload", keywords: ["import", "upload", "csv"], icon: Upload, group: "Pages" },
  { label: "Leaderboard", path: "/leaderboard", keywords: ["rank", "score", "trophy"], icon: Trophy, group: "Pages" },
  { label: "Announcements", path: "/announcements", keywords: ["news", "notice"], icon: Volume2, group: "Pages" },
  { label: "Documents & Media", path: "/documents", keywords: ["documents", "media", "files"], icon: FileText, group: "Pages" },
  { label: "Notifications", path: "/notifications", keywords: ["alerts", "bell"], icon: Bell, group: "Pages" },
  { label: "Profile", path: "/profile", keywords: ["account", "settings", "me"], icon: User, group: "Pages" },
];

function matchesPage(page, q) {
  const hay = `${page.label} ${page.path} ${(page.keywords || []).join(" ")}`.toLowerCase();
  return hay.includes(q);
}

function pathForContact(row) {
  if (row.type === "lead" && row.recordId) {
    return `/pipeline?openLead=${encodeURIComponent(row.recordId)}`;
  }
  if (row.linkedLeadId) {
    return `/pipeline?openLead=${encodeURIComponent(row.linkedLeadId)}`;
  }
  const q = row.name || row.mmlId || "";
  return q ? `/clients?q=${encodeURIComponent(q)}` : "/clients";
}

function useOutsideClose(ref, close) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, close]);
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useOutsideClose(rootRef, () => setOpen(false));

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q.length < 1) return [];

    const pages = PAGE_CATALOG.filter((p) => matchesPage(p, q)).slice(0, 6).map((p) => ({
      id: `page:${p.path}`,
      kind: "page",
      label: p.label,
      meta: p.path,
      path: p.path,
      icon: p.icon,
    }));

    const { results: contacts } = searchContactsByQuery(query);
    const people = contacts.slice(0, 8).map((row) => ({
      id: row.id,
      kind: row.type === "lead" ? "lead" : "client",
      label: row.name || "Unnamed",
      meta: [
        row.type === "lead" ? `Lead · ${row.stageId || "—"}` : "Client",
        formatDisplayId(row),
        formatDisplayMobile(row.mobile),
      ]
        .filter(Boolean)
        .join(" · "),
      path: pathForContact(row),
      icon: row.type === "lead" ? KanbanSquare : Database,
    }));

    const tasks = readTasks()
      .filter((t) => {
        const hay = `${t.title || ""} ${t.project || ""} ${t.client || ""} ${t.assignee || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 5)
      .map((t) => ({
        id: `task:${t.id}`,
        kind: "task",
        label: t.title,
        meta: [t.stage, t.project, t.client].filter(Boolean).join(" · "),
        path: "/tasks",
        icon: CheckSquare,
      }));

    return [...pages, ...people, ...tasks];
  }, [q, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const go = (item) => {
    if (!item?.path) return;
    setOpen(false);
    setQuery("");
    navigate(item.path);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter") && results.length) {
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[activeIdx] || results[0]);
    }
  };

  const showDropdown = open && q.length >= 1;

  const groups = useMemo(() => {
    const order = ["page", "lead", "client", "task"];
    const labels = { page: "Pages", lead: "Pipeline leads", client: "Clients", task: "Tasks" };
    return order
      .map((kind) => ({
        kind,
        label: labels[kind],
        items: results.filter((r) => r.kind === kind),
      }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  let flatIndex = -1;

  return (
    <div className="relative w-[260px] sm:w-[300px]" ref={rootRef}>
      <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#F7F8FA] border border-black/8 focus-within:border-[#7A0A17]/35 focus-within:bg-white transition-colors">
        <Search size={14} className="text-[#9CA3AF] shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search pages, leads, clients..."
          className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
          aria-label="Global search"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="size-5 rounded-full grid place-items-center text-[#9CA3AF] hover:text-[#4B5563] hover:bg-black/5 shrink-0"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[min(380px,calc(100vw-80px))] bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-50 overflow-hidden max-h-[420px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#6B7280] text-center">No results for “{query.trim()}”</p>
          ) : (
            groups.map((group) => (
              <div key={group.kind}>
                <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  const Icon = item.icon;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => go(item)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors ${
                        active ? "bg-[#FCF5F6]" : "hover:bg-[#FAFAFB]"
                      }`}
                    >
                      <span className="size-8 rounded-lg bg-black/[0.04] grid place-items-center shrink-0 text-[#7A0A17]">
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-[#111] truncate">{item.label}</span>
                        <span className="block text-[11px] text-[#6B7280] truncate mt-0.5">{item.meta}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
