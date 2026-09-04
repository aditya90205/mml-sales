import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCheck,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  MailOpen,
  MousePointerClick,
  PlayCircle,
  Plus,
  Search,
  Send,
  StopCircle,
  Trash2,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import CampaignViewModal from "../components/campaign/CampaignViewModal.jsx";

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    name: "Search for Matrimony",
    tag: "UTM: gads_delhi_intent",
    target: "Common Pool",
    channel: "SMS",
    start: "Manual",
    end: "Manual",
    owner: "Nikhil Bansal",
    status: "Not Started",
  },
  {
    id: 2,
    name: "South Ex Hoarding · Cycle 4",
    tag: "Ring Road site",
    target: "Jalandhar",
    channel: "WhatsApp",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Pooja Sharma",
    status: "Active",
  },
  {
    id: 3,
    name: "30% Offer",
    tag: "dsp",
    target: "Doctors",
    channel: "Email, SMS",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Vinti Malhotra",
    status: "Completed",
  },
  {
    id: 4,
    name: "Community sabha · Rohini",
    tag: "On-ground stall",
    target: "IIT, IIM",
    channel: "Push",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Nikhil Bansal",
    status: "Active",
  },
  {
    id: 5,
    name: "Jul-26 Monsoon Offer",
    tag: "UTM: ig_jul26_monsoon",
    target: "P3 Pipeline",
    channel: "SMS",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Vinti Malhotra",
    status: "Scheduled",
  },
  {
    id: 6,
    name: "Sep-26 NRI Dubai teaser",
    tag: "Muslim matrimony pilot",
    target: "New Opportunity",
    channel: "WhatsApp, Push",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Nikhil Bansal",
    status: "Stop Manually",
  },
];

const LEADS_BY_CHANNEL = [
  { label: "Instagram Ads", value: 118, color: "#7A0A17" },
  { label: "Google Ads", value: 91, color: "#D6A419" },
  { label: "Website / SEO", value: 74, color: "#16A34A" },
  { label: "Outdoor board", value: 41, color: "#2563EB" },
  { label: "Newspaper", value: 24, color: "#8B5E3C" },
  { label: "Events", value: 19, color: "#A16207" },
  { label: "LinkedIn", value: 12, color: "#C08497" },
];

const STAT_CARDS = [
  { key: "leads", label: "Leads Generated", value: "412", note: "+10% vs Month", noteTone: "green", icon: Users, bg: "#FCE9EC", fg: "#E8395B" },
  { key: "active", label: "Active Campaigns", value: "07", note: "+10% Last Month", noteTone: "green", icon: UserRoundCheck, bg: "#EFEAFB", fg: "#7C3AED" },
  { key: "sent", label: "Sent", value: "25", note: "14 Calls | 12 Video Calls", noteTone: "muted", icon: Send, bg: "#FFF3E0", fg: "#F59E0B" },
  { key: "delivered", label: "Delivered", value: "20", note: "18.4% Conversion", noteTone: "green", icon: CheckCheck, bg: "#E7F8EF", fg: "#16A34A" },
  { key: "opened", label: "Opened", value: "14", note: "+15.3% this Month", noteTone: "green", icon: MailOpen, bg: "#E7EEFC", fg: "#2563EB" },
  { key: "clicked", label: "Clicked", value: "08", note: null, noteTone: "muted", icon: MousePointerClick, bg: "#FCE9EC", fg: "#E8395B" },
];

const STATUS_STYLES = {
  "Not Started": "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  Active: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  Completed: "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20",
  Scheduled: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
  "Stop Manually": "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20",
};

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="bg-white border border-black/8 rounded-2xl px-4 py-3.5 flex items-center gap-3.5">
      <span className="size-11 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: stat.bg }}>
        <Icon size={21} style={{ color: stat.fg }} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#6B7280] leading-snug">{stat.label}</p>
        <p className="text-[22px] font-bold text-[#111] leading-tight mt-0.5">{stat.value}</p>
        {stat.note && (
          <p className={`text-[10px] mt-0.5 leading-tight ${stat.noteTone === "green" ? "text-[#16A34A] font-medium" : "text-[#6B7280]"}`}>
            {stat.note}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ label }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${STATUS_STYLES[label] || "bg-[#F1F2F4] text-[#6B7280] border-black/10"}`}>
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

function LeadsByChannelModal({ open, onClose }) {
  const max = Math.max(...LEADS_BY_CHANNEL.map((c) => c.value));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <div>
            <p className="text-base font-bold text-[#111]">Leads by channel</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">August to date</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6f7886] hover:bg-black/5 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-3">
          {LEADS_BY_CHANNEL.map((c) => (
            <div key={c.label} className="flex items-center gap-3 text-xs">
              <span className="w-[100px] shrink-0 text-[#374151] font-medium truncate">{c.label}</span>
              <span className="flex-1 h-2.5 rounded-full bg-black/6 overflow-hidden">
                <span
                  className="block h-full rounded-full transition-all duration-500"
                  style={{ width: `${(c.value / max) * 100}%`, backgroundColor: c.color }}
                />
              </span>
              <span className="w-7 shrink-0 text-right font-bold text-[#111]">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function usePagedTable(rows, searchKeys) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    search,
    setSearch,
    applySearch: () => { setQuery(search); setPage(1); },
    perPage,
    setPerPage: (n) => { setPerPage(n); setPage(1); },
    page: safePage,
    setPage,
    totalPages,
    totalItems: filtered.length,
    paged,
  };
}

export default function CampaignManagementPage() {
  const [rows, setRows] = useState(INITIAL_CAMPAIGNS);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const table = usePagedTable(rows, ["name", "tag", "target", "channel", "owner", "status"]);

  const toggleStatus = (id) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = row.status === "Active" ? "Stop Manually" : "Active";
        toast.success(`${row.name} ${next === "Active" ? "started" : "stopped"}.`);
        return { ...row, status: next };
      })
    );
  };

  const duplicateRow = (row) => {
    setRows((prev) => {
      const id = Math.max(...prev.map((r) => r.id)) + 1;
      return [...prev, { ...row, id, name: `${row.name} (Copy)`, status: "Not Started" }];
    });
    toast.info(`${row.name} duplicated.`);
  };

  const deleteRow = (row) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast.error(`${row.name} deleted.`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Campaign Management</h1>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toast.info("Exporting campaigns...")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              <Filter size={14} /> Export
            </button>
            <Link
              to="/campaign/create"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              <Plus size={15} /> New Campaign
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map((stat) => (
            <StatCard key={stat.key} stat={stat} />
          ))}
        </div>

        <section className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[520px] focus-within:border-[#7A0A17]/40 transition-colors">
              <Search size={15} className="text-[#9CA3AF] shrink-0" />
              <input
                value={table.search}
                onChange={(e) => table.setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && table.applySearch()}
                placeholder="Search..."
                className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
              />
            </div>

            <button
              type="button"
              onClick={table.applySearch}
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

            <button
              type="button"
              onClick={() => setChannelModalOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0 ml-auto"
            >
              Leads by Channel
              <ChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
          </div>

          <div className="overflow-x-auto border border-black/8 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold tracking-wide">
                  <th className="px-4 py-3 whitespace-nowrap">Campaign</th>
                  <th className="px-4 py-3 whitespace-nowrap">Target Group</th>
                  <th className="px-4 py-3 whitespace-nowrap">Channel</th>
                  <th className="px-4 py-3 whitespace-nowrap">Start Date &amp; Time</th>
                  <th className="px-4 py-3 whitespace-nowrap">End Date &amp; Time</th>
                  <th className="px-4 py-3 whitespace-nowrap">Owner</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {table.paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  table.paged.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-bold text-[#111] whitespace-nowrap">{row.name}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{row.tag}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.target}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.channel}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.start}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.end}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{row.owner}</td>
                      <td className="px-4 py-3.5"><StatusBadge label={row.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5">
                          <IconBtn label={`View ${row.name}`} onClick={() => setViewCampaign(row)}>
                            <Eye size={15} className="text-[#CA8A04]" />
                          </IconBtn>
                          <IconBtn label={`Start ${row.name}`} onClick={() => toggleStatus(row.id)}>
                            <PlayCircle size={15} className="text-[#16A34A]" />
                          </IconBtn>
                          <IconBtn label={`Stop ${row.name}`} onClick={() => toggleStatus(row.id)}>
                            <StopCircle size={15} className="text-[#DC2626]" />
                          </IconBtn>
                          <IconBtn label={`Duplicate ${row.name}`} onClick={() => duplicateRow(row)}>
                            <Copy size={14} className="text-[#2563EB]" />
                          </IconBtn>
                          <IconBtn label={`Delete ${row.name}`} onClick={() => deleteRow(row)}>
                            <Trash2 size={14} className="text-[#DC2626]" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-semibold text-[#6B7280]">
            <p>
              Showing {table.totalItems === 0 ? 0 : (table.page - 1) * table.perPage + 1} to{" "}
              {Math.min(table.page * table.perPage, table.totalItems)} of {table.totalItems} Campaigns
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={table.page <= 1}
                onClick={() => table.setPage(table.page - 1)}
                className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: table.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => table.setPage(n)}
                  className={`size-7 rounded-lg font-bold ${
                    n === table.page ? "bg-[#16A34A] text-white" : "border border-black/10 bg-white hover:bg-[#FAFAFB] text-[#374151]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={table.page >= table.totalPages}
                onClick={() => table.setPage(table.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      <LeadsByChannelModal open={channelModalOpen} onClose={() => setChannelModalOpen(false)} />
      <CampaignViewModal open={Boolean(viewCampaign)} campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
    </div>
  );
}
