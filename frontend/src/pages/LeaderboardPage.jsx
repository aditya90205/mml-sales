import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Filter, Search, Star } from "lucide-react";
import { toast } from "react-toastify";
import { useTableSort } from "../components/common/useTableSort.jsx";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
import emailLightIcon from "../assets/email-light.png";
import tablerMessageIcon from "../assets/tabler_message.png";
import tblDeleteIcon from "../assets/tbl_delete.png";
import eyeIcon from "../assets/eye.png";

const PER_PAGE_OPTIONS = [10, 25, 50];

const INITIAL_GLOBAL_LEADERBOARD = [
  { id: 1, rank: 1, name: "Sachin Pilot",   taskScore: 50, contestScore: 70, warningScore: 5, complaints: 11, xp: 104 },
  { id: 2, rank: 2, name: "Anil Rastogi",   taskScore: 50, contestScore: 66, warningScore: 5, complaints: 9,  xp: 98 },
  { id: 3, rank: 3, name: "Sunil Bajaj",    taskScore: 40, contestScore: 60, warningScore: 5, complaints: 5,  xp: 90 },
  { id: 4, rank: 4, name: "Rojalin Mishra", taskScore: 30, contestScore: 50, warningScore: 4, complaints: 4,  xp: 72 },
  { id: 5, rank: 5, name: "Narendra Nayak", taskScore: 20, contestScore: 40, warningScore: 3, complaints: 3,  xp: 54 },
  { id: 6, rank: 6, name: "Akshay Kumar",   taskScore: 40, contestScore: 44, warningScore: 1, complaints: 0,  xp: 83 },
  { id: 7, rank: 7, name: "Kuhu Sharma",    taskScore: 38, contestScore: 42, warningScore: 0, complaints: 0,  xp: 80 },
  { id: 8, rank: 8, name: "Satish Pal",     taskScore: 36, contestScore: 40, warningScore: 3, complaints: 2,  xp: 71 },
  { id: 9, rank: 9, name: "Ankur Sharma",   taskScore: 34, contestScore: 38, warningScore: 1, complaints: 1,  xp: 70 },
];

const MY_CONTESTS = [
  { id: 1, name: "Logging Framework",          type: "Individual", description: "Problem Solving",   activation: "Inactive", startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 2, name: "API Development",            type: "Team",       description: "Team Contribution", activation: "Active",   startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 3, name: "API Development",            type: "Individual", description: "Problem Solving",   activation: "Inactive", startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 4, name: "Microservices Architecture", type: "Team",       description: "Team Contribution", activation: "Active",   startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 5, name: "Logging Framework",          type: "Individual", description: "Problem Solving",   activation: "Inactive", startDate: "20-05-26", endDate: "20-05-26", status: "Completed" },
  { id: 6, name: "API Development",            type: "Team",       description: "Team Contribution", activation: "Active",   startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 7, name: "Logging Framework",          type: "Individual", description: "Problem Solving",   activation: "Inactive", startDate: "20-05-26", endDate: "20-05-26", status: "Completed" },
  { id: 8, name: "Microservices Architecture", type: "Team",       description: "Team Contribution", activation: "Active",   startDate: "20-05-26", endDate: "20-05-26", status: "In Progress" },
  { id: 9, name: "API Development",            type: "Individual", description: "Problem Solving",   activation: "Inactive", startDate: "20-05-26", endDate: "20-05-26", status: "Completed" },
];

const LEADERBOARD_COLS = [
  { label: "Rank", key: "rank" },
  { label: "Name", key: "name" },
  { label: "Task Score", key: "taskScore" },
  { label: "Contest Score", key: "contestScore" },
  { label: "Warning Score", key: "warningScore" },
  { label: "Complaints", key: "complaints" },
  { label: "Total XP", key: "xp" },
  { label: "Action", key: "action", unsortable: true },
];

const CONTEST_COLS = [
  { label: "Name", key: "name" },
  { label: "Type", key: "type" },
  { label: "Short Description", key: "description" },
  { label: "Activation Status", key: "activation" },
  { label: "Start Date", key: "startDate" },
  { label: "End Date", key: "endDate" },
  { label: "Contest Status", key: "status" },
  { label: "Action", key: "action", unsortable: true },
];

const LEADERBOARD_SEARCH_KEYS = ["name"];
const CONTEST_SEARCH_KEYS = ["name", "type", "description", "activation", "status"];

function AssetIcon({ src, alt = "", size = 16 }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain shrink-0"
    />
  );
}

function DualSortTh({ label, sortKey, sort, onSort, unsortable = false }) {
  const canSort = !unsortable && Boolean(sortKey);
  const active = sort?.key === sortKey;

  return (
    <th
      onClick={() => canSort && onSort(sortKey)}
      className={`px-4 py-3 whitespace-nowrap select-none ${canSort ? "cursor-pointer" : ""}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {canSort && (
          <span className="inline-flex flex-col leading-none -space-y-1">
            <ChevronUp size={10} className={active && sort.dir === "asc" ? "text-[#7A0A17]" : "text-[#D1D5DB]"} />
            <ChevronDown size={10} className={active && sort.dir === "desc" ? "text-[#7A0A17]" : "text-[#D1D5DB]"} />
          </span>
        )}
      </span>
    </th>
  );
}

function ListToolbar({ search, onSearchChange, perPage, onPerPageChange, onSearch }) {
  const [perPageOpen, setPerPageOpen] = useState(false);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[520px] focus-within:border-[#7A0A17]/40 transition-colors">
        <Search size={15} className="text-[#9CA3AF] shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          placeholder="Search..."
          className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
        />
      </div>

      <button
        type="button"
        onClick={() => onSearch?.()}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
      >
        <Search size={14} /> Search
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
      >
        <Filter size={14} /> Filter
      </button>

      <div className="relative shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => setPerPageOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
        >
          Per Page: {perPage}
          <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${perPageOpen ? "rotate-180" : ""}`} />
        </button>
        {perPageOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] min-w-[100px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 overflow-hidden">
            {PER_PAGE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { onPerPageChange(n); setPerPageOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                  n === perPage ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, pageSize, itemLabel, onChange }) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Math.max(totalPages, 2);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-semibold text-[#6B7280]">
      <p>
        Showing {start} to {end} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={n > totalPages}
            onClick={() => n <= totalPages && onChange(n)}
            className={`size-7 rounded-lg font-bold ${
              n === page
                ? "bg-[#16A34A] text-white"
                : "border border-black/10 bg-white hover:bg-[#FAFAFB] text-[#374151] disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ label }) {
  const styles = {
    Active: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
    Inactive: "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20",
    "In Progress": "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
    Completed: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${styles[label] || "bg-[#F1F2F4] text-[#6B7280] border-black/10"}`}>
      {label}
    </span>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="size-7 grid place-items-center rounded-lg hover:bg-black/4 transition-colors"
    >
      {children}
    </button>
  );
}

function usePagedTable(rows, searchKeys, defaultKey) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  const { sorted, sort, toggle } = useTableSort(filtered, { defaultKey });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const applySearch = () => {
    setQuery(search);
    setPage(1);
  };

  return {
    search,
    setSearch,
    applySearch,
    perPage,
    setPerPage: (n) => { setPerPage(n); setPage(1); },
    page: safePage,
    setPage,
    totalPages,
    totalItems: sorted.length,
    paged,
    sort,
    toggle,
  };
}

function useLiveLeaderboard(initialRows, intervalMs = 4500) {
  const [rows, setRows] = useState(initialRows);
  const [activeId, setActiveId] = useState(null);
  const clearRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const changedId = prev[idx].id;
        const taskBump = Math.floor(Math.random() * 4) + 1;
        const contestBump = Math.floor(Math.random() * 3);

        const bumped = prev.map((row, i) =>
          i === idx
            ? {
                ...row,
                taskScore: row.taskScore + taskBump,
                contestScore: row.contestScore + contestBump,
                xp: row.xp + taskBump * 2 + contestBump,
              }
            : row
        );
        bumped.sort((a, b) => b.xp - a.xp);
        const ranked = bumped.map((row, i) => ({ ...row, rank: i + 1 }));

        setActiveId(changedId);
        return ranked;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  useEffect(() => {
    if (activeId == null) return undefined;
    clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setActiveId(null), 1600);
    return () => clearTimeout(clearRef.current);
  }, [activeId]);

  return { rows, activeId };
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] border border-[#16A34A]/25 text-[#15803D] text-[10px] font-bold uppercase tracking-wide">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75 animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[#16A34A]" />
      </span>
      Live
    </span>
  );
}

function GlobalLeaderboardSection({ onMessage }) {
  const { rows: liveRows, activeId } = useLiveLeaderboard(INITIAL_GLOBAL_LEADERBOARD);
  const table = usePagedTable(liveRows, LEADERBOARD_SEARCH_KEYS, "rank");

  return (
    <section className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-bold text-[#111] tracking-tight">Global Leaderboard</h2>
        <LiveBadge />
      </div>

      <ListToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        onSearch={table.applySearch}
        perPage={table.perPage}
        onPerPageChange={table.setPerPage}
      />

      <div className="overflow-x-auto border border-black/8 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold tracking-wide">
              {LEADERBOARD_COLS.map((col) => (
                <DualSortTh
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  sort={table.sort}
                  onSort={table.toggle}
                  unsortable={col.unsortable}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/6">
            {table.paged.length === 0 ? (
              <tr>
                <td colSpan={LEADERBOARD_COLS.length} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                  No leaderboard entries found.
                </td>
              </tr>
            ) : (
              table.paged.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-700 ${
                    row.id === activeId ? "bg-[#FCF5F6]" : "hover:bg-[#FAFAFB]"
                  }`}
                >
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#374151]">{row.rank}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111] whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#111]">{row.taskScore}</td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#111]">{row.contestScore}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#E8395B]">{row.warningScore}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#E8395B]">{row.complaints}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111] whitespace-nowrap">
                    {row.xp} XP
                    {row.id === activeId && (
                      <span className="ml-2 text-[10px] font-bold text-[#16A34A] align-middle">▲ live</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5">
                      <IconBtn label={`Email ${row.name}`} onClick={() => toast.info(`Emailing ${row.name}`)}>
                        <AssetIcon src={emailLightIcon} alt="mail" />
                      </IconBtn>
                      <IconBtn label={`Message ${row.name}`} onClick={() => onMessage(row.name)}>
                        <AssetIcon src={tablerMessageIcon} alt="message" />
                      </IconBtn>
                      <IconBtn label={`Remove ${row.name}`} onClick={() => toast.error(`${row.name} removed from leaderboard.`)}>
                        <AssetIcon src={tblDeleteIcon} alt="delete" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.perPage}
        itemLabel="Leaderboard"
        onChange={table.setPage}
      />
    </section>
  );
}

function MyContestsSection() {
  const table = usePagedTable(MY_CONTESTS, CONTEST_SEARCH_KEYS, null);

  return (
    <section className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <h2 className="text-[22px] font-bold text-[#111] tracking-tight">My Contests</h2>

      <ListToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        onSearch={table.applySearch}
        perPage={table.perPage}
        onPerPageChange={table.setPerPage}
      />

      <div className="overflow-x-auto border border-black/8 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold tracking-wide">
              {CONTEST_COLS.map((col) => (
                <DualSortTh
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  sort={table.sort}
                  onSort={table.toggle}
                  unsortable={col.unsortable}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/6">
            {table.paged.length === 0 ? (
              <tr>
                <td colSpan={CONTEST_COLS.length} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                  No contests found.
                </td>
              </tr>
            ) : (
              table.paged.map((row) => {
                const canManage = row.status === "In Progress";
                return (
                  <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111] whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151]">{row.type}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151]">{row.description}</td>
                    <td className="px-4 py-3.5"><StatusBadge label={row.activation} /></td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.startDate}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.endDate}</td>
                    <td className="px-4 py-3.5"><StatusBadge label={row.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <IconBtn label={`Favorite ${row.name}`} onClick={() => toast.success(`${row.name} marked as favorite.`)}>
                          <Star size={15} className="text-[#F59E0B]" />
                        </IconBtn>
                        <IconBtn label={`View ${row.name}`} onClick={() => toast.info(`Viewing ${row.name}`)}>
                          <AssetIcon src={eyeIcon} alt="view" />
                        </IconBtn>
                        {canManage && (
                          <>
                            <IconBtn label={`Edit ${row.name}`} onClick={() => toast.info(`Editing ${row.name}`)}>
                              <Edit2 size={14} className="text-[#2563EB]" />
                            </IconBtn>
                            <IconBtn label={`Delete ${row.name}`} onClick={() => toast.error(`${row.name} deleted.`)}>
                              <AssetIcon src={tblDeleteIcon} alt="delete" />
                            </IconBtn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.perPage}
        itemLabel="Contests"
        onChange={table.setPage}
      />
    </section>
  );
}

export default function LeaderboardPage() {
  const [messageOpen, setMessageOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-6 min-w-0">
        <GlobalLeaderboardSection onMessage={() => setMessageOpen(true)} />
        <MyContestsSection />
      </div>

      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} />
    </div>
  );
}
