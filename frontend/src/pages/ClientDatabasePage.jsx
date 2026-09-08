import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  Flag,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import ClientStatusBadge from "../components/common/ClientStatusBadge.jsx";
import SendEmailModal from "../components/common/SendEmailModal.jsx";
import SendMessageModal from "../components/common/SendMessageModal.jsx";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import ClientGroupsChart, { statsFromClients } from "../components/clients/ClientGroupsChart.jsx";
import { BRANCHES, CLIENTS, PROBABILITY_META } from "../utils/clientsData.js";
import { groupQuery, readSavedGroups, removeSavedGroup } from "../utils/clientGroups.js";
import { matchesAll } from "../utils/clientQuery.js";

const COLUMNS = [
  { label: "Client Name", key: "name" },
  { label: "Client ID", key: "clientId" },
  { label: "Phone", key: "phone" },
  { label: "Status", key: "status" },
  { label: "Address", key: "address" },
  { label: "Owner", key: "owner" },
  { label: "Branch", key: "branch" },
  { label: "Last Contact", key: "lastContact" },
  { label: "Reason", key: "reason" },
  { label: "Actions", key: "actions", unsortable: true },
];

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function NativeSelect({ value, onChange, options }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 pl-4 pr-9 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] outline-none cursor-pointer hover:bg-[#FAFAFB] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
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

function TablePagination({ page, totalPages, totalItems, pageSize, onChange }) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-t border-black/8">
      <p className="text-[12px] text-[#9CA3AF] font-medium">
        Showing {start}–{end} of {totalItems} clients
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`size-8 rounded-lg grid place-items-center text-[13px] ${
              n === page
                ? "font-bold bg-[#7A0A17] text-white"
                : "font-semibold bg-white border border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function ClientDatabasePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const filterRef = useRef(null);
  const perPageRef = useRef(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [savedGroups, setSavedGroups] = useState([]);
  const [activeGroupIds, setActiveGroupIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [grouping, setGrouping] = useState("none");
  const [branchFilter, setBranchFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState("all");
  const [probFilter, setProbFilter] = useState("all");
  const [marriedFilter, setMarriedFilter] = useState("all");
  const [messageFor, setMessageFor] = useState(null);
  const [emailFor, setEmailFor] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [perPageOpen, setPerPageOpen] = useState(false);
  const [scrollToChart, setScrollToChart] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const groups = readSavedGroups();
    setSavedGroups(groups);

    const selectId = location.state?.selectGroupId;
    const openChart = Boolean(location.state?.showChart);
    let cleared = false;

    if (selectId && groups.some((g) => g.id === selectId)) {
      setActiveGroupIds([selectId]);
      cleared = true;
    }
    if (openChart) {
      setScrollToChart(true);
      cleared = true;
    }
    if (cleared) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!scrollToChart || savedGroups.length === 0) return;
    const id = requestAnimationFrame(() => {
      chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollToChart(false);
    });
    return () => cancelAnimationFrame(id);
  }, [scrollToChart, savedGroups.length]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!filterRef.current?.contains(e.target)) setFilterOpen(false);
      if (!perPageRef.current?.contains(e.target)) setPerPageOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const extraFilterCount = [genderFilter, probFilter, marriedFilter].filter((v) => v !== "all").length;

  const filtered = useMemo(() => {
    let rows = CLIENTS;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) =>
        [c.name, c.clientId, c.phone, c.status, c.branch, c.reason, c.owner, c.address].some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }
    if (statusFilter !== "all") rows = rows.filter((c) => c.status === statusFilter);
    if (branchFilter !== "all") rows = rows.filter((c) => c.branch === branchFilter);
    if (genderFilter !== "all") rows = rows.filter((c) => c.gender === genderFilter);
    if (probFilter !== "all") rows = rows.filter((c) => c.probability === probFilter);
    if (marriedFilter === "married") rows = rows.filter((c) => c.married);
    if (marriedFilter === "unmarried") rows = rows.filter((c) => !c.married);

    if (activeGroupIds.length > 0) {
      const activeGroups = savedGroups.filter((g) => activeGroupIds.includes(g.id));
      if (activeGroups.length > 0) {
        rows = rows.filter((c) =>
          activeGroups.some((g) => {
            if (Array.isArray(g.clientIds) && g.clientIds.length > 0) {
              return g.clientIds.includes(c.id);
            }
            const { conditions, matchMode } = groupQuery(g);
            return matchesAll(c, conditions, matchMode);
          })
        );
      }
    }
    return rows;
  }, [query, statusFilter, branchFilter, genderFilter, probFilter, marriedFilter, activeGroupIds, savedGroups]);

  const { sorted, sort, toggle } = useTableSort(filtered, { defaultKey: null, defaultDir: "asc" });

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage) || 1);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, branchFilter, genderFilter, probFilter, marriedFilter, activeGroupIds, perPage, grouping]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, safePage, perPage]);

  const groups = useMemo(() => {
    if (grouping === "none") return [{ key: "all", label: null, rows: paged }];
    const map = new Map();
    for (const row of paged) {
      const label = row[grouping] || "Other";
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(row);
    }
    return [...map.entries()].map(([label, rows]) => ({ key: label, label, rows }));
  }, [paged, grouping]);

  const chartGroups = useMemo(() => {
    if (activeGroupIds.length > 0) {
      return savedGroups.filter((g) => activeGroupIds.includes(g.id));
    }
    return savedGroups;
  }, [savedGroups, activeGroupIds]);

  const chartData = useMemo(() => {
    return chartGroups.map((g) => {
      let clients;
      if (Array.isArray(g.clientIds) && g.clientIds.length > 0) {
        const idSet = new Set(g.clientIds);
        clients = CLIENTS.filter((c) => idSet.has(c.id));
      } else {
        const { conditions, matchMode } = groupQuery(g);
        clients = CLIENTS.filter((c) => matchesAll(c, conditions, matchMode));
      }
      // Pass clients so ClientGroupsChart can apply week/month period filters
      return { group: g.name, clients, ...statsFromClients(clients) };
    });
  }, [chartGroups]);

  const applySearch = () => setQuery(search);

  const toggleGroup = (id) => {
    setActiveGroupIds((prev) => (prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]));
  };

  const handleRemoveGroup = (id, name) => {
    setSavedGroups(removeSavedGroup(id));
    setActiveGroupIds((prev) => prev.filter((gid) => gid !== id));
    toast.error(`${name} group removed.`);
  };

  const renderRow = (c) => {
    const prob = PROBABILITY_META[c.probability] || PROBABILITY_META.medium;
    return (
      <tr key={c.id} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-2">
            <Flag size={12} style={{ color: prob.color }} fill={prob.color} strokeWidth={0} className="shrink-0" />
            <span className="text-[13px] font-bold text-[#111] whitespace-nowrap">{c.name}</span>
          </span>
        </td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.clientId}</td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.phone}</td>
        <td className="px-4 py-3">
          <div className="flex justify-center">
            <ClientStatusBadge status={c.status} married={c.married} />
          </div>
        </td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] max-w-[220px] truncate">{c.address}</td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.owner}</td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.branch}</td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.lastContact}</td>
        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] max-w-[200px]">{c.reason}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-0.5">
            <IconBtn label={`Call ${c.name}`} onClick={() => toast.info(`Calling ${c.name}...`)}>
              <Phone size={14} className="text-[#16A34A]" />
            </IconBtn>
            <IconBtn label={`Message ${c.name}`} onClick={() => setMessageFor(c)}>
              <MessageSquare size={14} className="text-[#D97706]" />
            </IconBtn>
            <IconBtn label={`Email ${c.name}`} onClick={() => setEmailFor(c)}>
              <Mail size={14} className="text-[#2563EB]" />
            </IconBtn>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Client Database</h1>
          <button
            type="button"
            onClick={() => toast.info("Exporting clients...")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            <Plus size={14} /> Export
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[360px] focus-within:border-[#7A0A17]/40 transition-colors">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search..."
              className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
            />
          </div>

          <button
            type="button"
            onClick={applySearch}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
          >
            <Search size={14} /> Search
          </button>

          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border text-[13px] font-medium transition-colors ${
                filterOpen || extraFilterCount
                  ? "border-[#7A0A17]/40 text-[#7A0A17]"
                  : "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]"
              }`}
            >
              <Filter size={14} /> Filter
              {extraFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#7A0A17] text-white text-[10px] font-bold">
                  {extraFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-[240px] bg-white border border-black/10 rounded-xl shadow-lg p-3 flex flex-col gap-2.5">
                <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                  Gender
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-black/10 text-[13px] font-medium text-[#374151] outline-none"
                  >
                    <option value="all">All</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                  Probability
                  <select
                    value={probFilter}
                    onChange={(e) => setProbFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-black/10 text-[13px] font-medium text-[#374151] outline-none"
                  >
                    <option value="all">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                  Marital status
                  <select
                    value={marriedFilter}
                    onChange={(e) => setMarriedFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-black/10 text-[13px] font-medium text-[#374151] outline-none"
                  >
                    <option value="all">All</option>
                    <option value="married">Married</option>
                    <option value="unmarried">Unmarried</option>
                  </select>
                </label>
                {extraFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setGenderFilter("all");
                      setProbFilter("all");
                      setMarriedFilter("all");
                    }}
                    className="text-[12px] font-bold text-[#7A0A17] self-start hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </div>

          <NativeSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />
          <NativeSelect
            value={grouping}
            onChange={setGrouping}
            options={[
              { value: "none", label: "No grouping" },
              { value: "branch", label: "By branch" },
              { value: "status", label: "By status" },
              { value: "owner", label: "By owner" },
            ]}
          />
          <NativeSelect
            value={branchFilter}
            onChange={setBranchFilter}
            options={[
              { value: "all", label: "All branches" },
              ...BRANCHES.map((b) => ({ value: b, label: b })),
            ]}
          />

          <div className="flex items-center gap-2.5 ml-auto shrink-0 flex-wrap justify-end">
            <div className="relative shrink-0" ref={perPageRef}>
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
                      onClick={() => {
                        setPerPage(n);
                        setPerPageOpen(false);
                      }}
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

            <button
              type="button"
              onClick={() => navigate("/clients/create-group")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
            >
              Create Client Groups
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#9CA3AF] shrink-0">Saved Groups:</p>
          {savedGroups.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">No saved groups yet — create one above.</p>
          ) : (
            <>
              {savedGroups.map((g) => {
                const active = activeGroupIds.includes(g.id);
                return (
                  <span
                    key={g.id}
                    className={`inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
                      active
                        ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                        : "bg-[#FCF5F6] text-[#7A0A17] border-[#7A0A17]/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className="hover:opacity-80"
                    >
                      {g.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(g.id, g.name)}
                      aria-label={`Remove ${g.name}`}
                      className={`grid place-items-center rounded-full size-5 ${active ? "hover:bg-white/20" : "hover:bg-[#7A0A17]/10"}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setActiveGroupIds(
                    activeGroupIds.length === savedGroups.length ? [] : savedGroups.map((g) => g.id)
                  )
                }
                className="ml-auto text-[13px] font-semibold text-[#7A0A17] hover:underline shrink-0"
              >
                {activeGroupIds.length === savedGroups.length ? "Unselect All" : "Select All"}
              </button>
            </>
          )}
        </div>

        {savedGroups.length > 0 && (
          <div ref={chartRef}>
            <ClientGroupsChart
              data={chartData}
              title={
                activeGroupIds.length > 0
                  ? "Selected Groups — Client Overview"
                  : "Saved Groups — Client Overview"
              }
            />
          </div>
        )}

        <div className="flex items-center gap-6 flex-wrap text-[13px] font-medium text-[#374151]">
          {Object.entries(PROBABILITY_META).map(([key, meta]) => (
            <span key={key} className="flex items-center gap-1.5">
              <Flag size={14} style={{ color: meta.color }} fill={meta.color} strokeWidth={0} />
              {meta.label}
            </span>
          ))}
        </div>

        <div className="border border-black/8 rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="border-b border-black/8 bg-[#FAFAFB]">
                  {COLUMNS.map((col) => (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sort={sort}
                      onSort={toggle}
                      unsortable={col.unsortable}
                      className={`px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap ${
                        col.key === "status" ? "text-center" : ""
                      }`}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF] font-medium">
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <FragmentGroup key={group.key} label={group.label} rows={group.rows} renderRow={renderRow} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={perPage}
            onChange={setPage}
          />
        </div>
      </div>

      <SendMessageModal open={Boolean(messageFor)} onClose={() => setMessageFor(null)} />
      <SendEmailModal
        open={Boolean(emailFor)}
        onClose={() => setEmailFor(null)}
        recipientName={emailFor?.name || "Client"}
      />
    </div>
  );
}

function FragmentGroup({ label, rows, renderRow }) {
  return (
    <>
      {label && (
        <tr className="bg-[#FAF3F2]">
          <td colSpan={10} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#7A0A17]">
            {label}
            <span className="ml-2 font-medium text-[#9CA3AF] normal-case tracking-normal">{rows.length}</span>
          </td>
        </tr>
      )}
      {rows.map(renderRow)}
    </>
  );
}
