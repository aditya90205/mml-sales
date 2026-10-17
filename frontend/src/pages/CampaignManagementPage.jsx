import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Copy,
  Download,
  Eye,
  Filter,
  MessageSquareReply,
  Plus,
  Trash2,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import CampaignViewModal from "../components/campaign/CampaignViewModal.jsx";
import CampaignEditModal from "../components/campaign/CampaignEditModal.jsx";
import CampaignResponseModal from "../components/campaign/CampaignResponseModal.jsx";
import SearchField from "../components/common/SearchField.jsx";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import biPlayCircle from "../assets/bi_play-circle.png";
import biStopCircle from "../assets/bi_stop-circle.png";
import hugeiconsSent from "../assets/hugeicons_sent.png";
import charmTickDouble from "../assets/charm_tick-double.png";
import biEnvelopeOpen from "../assets/bi_envelope-open.png";
import {
  buildCampaignPageKpis,
  campaignHasResponses,
  campaignResponseCount,
  effectiveCampaignSent,
  resolveCampaignResponseRows,
} from "../utils/campaignMetrics.js";
import { readCampaigns, removeCampaign, saveCampaigns } from "../utils/campaignsStore.js";
import { pipelineOverviewPath } from "../utils/pipelineStore.js";
import { WHATSAPP_GREEN } from "../components/common/WhatsAppIcon.jsx";
import CreateCampaignPage from "./CreateCampaignPage.jsx";

const LEADS_BY_CHANNEL = [
  { label: "SMS", value: 142, color: "#7A0A17" },
  { label: "WhatsApp", value: 118, color: WHATSAPP_GREEN },
  { label: "App Notifications", value: 86, color: "#2563EB" },
  { label: "Email", value: 66, color: "#D6A419" },
];

const STAT_CARD_DEFS = [
  { key: "leads", label: "Leads Generated", noteTone: "muted", icon: Users, bg: "#FCE9EC", fg: "#E8395B" },
  { key: "active", label: "Active Campaigns", noteTone: "muted", icon: UserRoundCheck, bg: "#EFEAFB", fg: "#7C3AED" },
  { key: "sent", label: "Sent", noteTone: "muted", img: hugeiconsSent, bg: "#FFF3E0" },
  { key: "delivered", label: "Delivered", noteTone: "muted", img: charmTickDouble, bg: "#E7F8EF" },
  { key: "opened", label: "Opened", noteTone: "muted", img: biEnvelopeOpen, bg: "#E7EEFC" },
  { key: "responses", label: "No. of Responses", noteTone: "muted", icon: MessageSquareReply, bg: "#FCE9EC", fg: "#E8395B" },
];

const STATUS_STYLES = {
  "Not Started": "bg-[#DCFCE7] text-[#15803D]",
  Active: "bg-[#DCFCE7] text-[#15803D]",
  Completed: "bg-[#DBEAFE] text-[#2563EB]",
  Scheduled: "bg-[#FEF3C7] text-[#D97706]",
  "Stop Manually": "bg-[#FEE2E2] text-[#DC2626]",
};

/** Match a campaign row to a KPI card filter (same pattern as telecaller). */
function matchesKpiFilter(row, key, allRows = []) {
  if (!key || key === "leads") return true;
  const status = row.status;
  const replyCount = campaignResponseCount(allRows, row.id);
  const sentCount = effectiveCampaignSent(row, replyCount);
  switch (key) {
    case "active":
      return status === "Active";
    case "sent":
      return sentCount > 0;
    case "delivered":
      return (
        sentCount > 0 &&
        (status === "Active" || status === "Completed" || status === "Stop Manually")
      );
    case "opened":
      return replyCount > 0 && (status === "Completed" || status === "Active");
    case "responses":
      return campaignHasResponses(row, allRows);
    default:
      return true;
  }
}

function StatCard({ stat, active, onSelect }) {
  const Icon = stat.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect?.(stat.key)}
      title={`Filter campaigns by ${stat.label}`}
      aria-pressed={active}
      className="bg-white border border-black/8 rounded-2xl px-3.5 py-3 flex items-center gap-3 min-w-0 text-left transition-[border-color,box-shadow,background-color] hover:border-black/15 hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      style={{
        backgroundColor: active ? "#FCF5F6" : "#FFFFFF",
        borderColor: active ? "rgba(122,10,23,0.25)" : undefined,
      }}
    >
      <span className="size-10 rounded-[10px] grid place-items-center shrink-0" style={{ backgroundColor: stat.bg }}>
        {stat.img ? (
          <img src={stat.img} alt="" width={18} height={18} className="object-contain" />
        ) : (
          <Icon size={18} style={{ color: stat.fg }} strokeWidth={1.7} />
        )}
      </span>
      <div className="min-w-0">
        <p
          className="text-[13px] font-bold leading-tight truncate"
          style={{ color: active ? "#7A0A17" : "#111" }}
        >
          {stat.label}
        </p>
        <p
          className="text-[20px] font-bold leading-tight tabular-nums mt-0.5"
          style={{ color: active ? "#7A0A17" : "#111" }}
        >
          {stat.value}
        </p>
        {stat.note && (
          <p className={`text-[10px] mt-0.5 leading-tight ${
            stat.noteTone === "green"
              ? "text-[#16A34A] font-medium"
              : stat.noteTone === "red"
                ? "text-[#E8395B] font-semibold"
                : "text-[#6B7280]"
          }`}>
            {stat.note}
          </p>
        )}
      </div>
    </button>
  );
}

function StatusBadge({ label }) {
  return (
    <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${STATUS_STYLES[label] || "bg-[#F3F4F6] text-[#6B7280]"}`}>
      {label}
    </span>
  );
}

function IconBtn({ label, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1 rounded-lg transition-colors ${className || "hover:bg-black/5"}`}
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

const CAMPAIGN_COLS = [
  { label: "Campaign", key: "name" },
  { label: "Target Group", key: "target" },
  { label: "Channel", key: "channel" },
  { label: "Start Date & Time", key: "start" },
  { label: "End Date & Time", key: "end" },
  { label: "Owner", key: "owner" },
  { label: "No. of Responses", key: "responseCount" },
  { label: "Status", key: "status" },
  { label: "Actions", key: "actions", unsortable: true },
];

function usePagedTable(rows, searchKeys) {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)));
  }, [rows, search, searchKeys]);

  const { sorted, sort, toggle } = useTableSort(filtered, { defaultKey: "name" });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    search,
    setSearch: (v) => { setSearch(v); setPage(1); },
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

export default function CampaignManagementPage({ embedded = false, onClose }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(() => readCampaigns());
  const [kpiFilter, setKpiFilter] = useState("leads");
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [editCampaign, setEditCampaign] = useState(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [responseModal, setResponseModal] = useState(null);

  const kpiTotals = useMemo(() => buildCampaignPageKpis(rows), [rows]);

  const responseModalRows = useMemo(() => {
    if (!responseModal) return [];
    if (responseModal.campaignId == null) {
      return resolveCampaignResponseRows(rows);
    }
    return resolveCampaignResponseRows(rows, { campaignId: responseModal.campaignId });
  }, [responseModal, rows]);

  const statCards = useMemo(() => {
    const notes = {
      leads: kpiTotals.leads ? "From campaign sends & replies" : "No leads linked yet",
      active: `${rows.length} total campaigns`,
      sent: kpiTotals.sent ? "From send history & replies" : "No sends yet",
      delivered: kpiTotals.delivered ? "Active / completed sends" : "No deliveries yet",
      opened: kpiTotals.opened ? "Based on replies received" : "No opens tracked yet",
      responses: kpiTotals.responses ? "Lead replies received" : "No responses yet",
    };
    return STAT_CARD_DEFS.map((def) => ({
      ...def,
      value: kpiTotals.labels[def.key] ?? "0",
      note: notes[def.key] || null,
    }));
  }, [kpiTotals, rows.length]);

  const kpiFilteredRows = useMemo(
    () =>
      rows
        .filter((row) => matchesKpiFilter(row, kpiFilter, rows))
        .map((row) => ({
          ...row,
          responseCount: campaignResponseCount(rows, row.id),
        })),
    [rows, kpiFilter]
  );

  const table = usePagedTable(kpiFilteredRows, ["name", "tag", "target", "channel", "owner", "status"]);

  const selectKpiFilter = (key) => {
    if (key === "responses") {
      setResponseModal({ campaignId: null, title: "Campaign responses" });
    }
    setKpiFilter((prev) => (key === "leads" ? "leads" : prev === key ? "leads" : key));
    table.setPage(1);
  };

  const closeCreateCampaign = () => {
    setCreateCampaignOpen(false);
    setRows(readCampaigns());
  };

  const persistRows = (next) => {
    setRows(next);
    saveCampaigns(next);
  };

  const handleEditCampaign = (campaign) => {
    setViewCampaign(null);
    setEditCampaign(campaign);
  };

  const handleSaveEdit = (updated) => {
    persistRows(rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setEditCampaign(null);
    setViewCampaign(updated);
    toast.success(`Campaign "${updated.name}" updated.`);
  };

  const toggleStatus = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const nextStatus = row.status === "Active" ? "Stop Manually" : "Active";
    persistRows(rows.map((r) => (r.id !== id ? r : { ...r, status: nextStatus })));
    toast.success(`${row.name} ${nextStatus === "Active" ? "started" : "stopped"}.`);
  };

  const duplicateRow = (row) => {
    const id = Math.max(0, ...rows.map((r) => Number(r.id) || 0)) + 1;
    persistRows([...rows, { ...row, id, name: `${row.name} (Copy)`, status: "Not Started" }]);
    toast.info(`${row.name} duplicated.`);
  };

  const deleteRow = (row) => {
    persistRows(removeCampaign(row.id));
    toast.error(`${row.name} deleted.`);
  };

  return (
    <div className={embedded ? "flex flex-col" : "flex flex-col flex-1 min-h-0"}>
      <div className={`${embedded ? "px-5 pt-5 pb-6" : "px-5 pt-5 pb-8"} flex flex-col gap-5 min-w-0`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {embedded ? (
              <button
                type="button"
                onClick={() => onClose?.()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={15} />
                Close
              </button>
            ) : null}
            <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Campaign Management</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toast.info("Exporting campaigns...")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              <Download size={14} /> Export
            </button>
            <button
              type="button"
              onClick={() => setCreateCampaignOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              <Plus size={15} /> New Campaign
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((stat) => (
            <StatCard
              key={stat.key}
              stat={stat}
              active={kpiFilter === stat.key}
              onSelect={selectKpiFilter}
            />
          ))}
        </div>

        <section className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SearchField
              value={table.search}
              onChange={table.setSearch}
              className="w-full max-w-[280px]"
            />

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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-[#FAFAFB]">
                  {CAMPAIGN_COLS.map((col) => (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sort={table.sort}
                      onSort={table.toggle}
                      unsortable={col.unsortable}
                      className="px-3 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap align-bottom"
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {table.paged.length === 0 ? (
                  <tr>
                    <td colSpan={CAMPAIGN_COLS.length} className="px-3 py-10 text-center text-[12px] text-[#9CA3AF] font-medium">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  table.paged.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.name}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{row.tag}</p>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#374151] whitespace-nowrap">{row.target}</td>
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#374151] whitespace-nowrap">{row.channel}</td>
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#374151] whitespace-nowrap">{row.start}</td>
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#374151] whitespace-nowrap">{row.end}</td>
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#374151] whitespace-nowrap">{row.owner}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setResponseModal({
                              campaignId: row.id,
                              title: `${row.name} — responses`,
                            })
                          }
                          title={
                            Number(row.responseCount) > 0
                              ? `View ${row.responseCount} response${Number(row.responseCount) === 1 ? "" : "s"}`
                              : "No responses yet"
                          }
                          className={`text-[12.5px] font-bold tabular-nums transition-colors ${
                            Number(row.responseCount) > 0
                              ? "text-[#7A0A17] hover:underline"
                              : "text-[#9CA3AF] hover:text-[#6B7280]"
                          }`}
                        >
                          {Number(row.responseCount) || 0}
                        </button>
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge label={row.status} /></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <IconBtn label={`View ${row.name}`} onClick={() => setViewCampaign(row)} className="text-[#D97706] hover:bg-[#FEF3C7]">
                            <Eye size={14} />
                          </IconBtn>
                          <IconBtn label={`Start ${row.name}`} onClick={() => toggleStatus(row.id)}>
                            <img src={biPlayCircle} alt="Start" width={14} height={14} className="object-contain" />
                          </IconBtn>
                          <IconBtn label={`Stop ${row.name}`} onClick={() => toggleStatus(row.id)}>
                            <img src={biStopCircle} alt="Stop" width={14} height={14} className="object-contain" />
                          </IconBtn>
                          <IconBtn label={`Duplicate ${row.name}`} onClick={() => duplicateRow(row)} className="text-[#2563EB] hover:bg-[#E8F2FE]">
                            <Copy size={14} />
                          </IconBtn>
                          <IconBtn label={`Delete ${row.name}`} onClick={() => deleteRow(row)} className="text-[#7A0A17] hover:bg-[#FDF2F3]">
                            <Trash2 size={14} />
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
      <CampaignResponseModal
        open={Boolean(responseModal)}
        onClose={() => setResponseModal(null)}
        rows={responseModalRows}
        title={responseModal?.title || "Campaign responses"}
        onOpenLead={(lead) => {
          setResponseModal(null);
          if (lead?.id) navigate(pipelineOverviewPath(lead.id));
        }}
      />
      <CampaignViewModal
        open={Boolean(viewCampaign)}
        campaign={viewCampaign}
        campaigns={rows}
        onClose={() => setViewCampaign(null)}
        onEdit={handleEditCampaign}
      />
      <CampaignEditModal
        open={Boolean(editCampaign)}
        campaign={editCampaign}
        onClose={() => setEditCampaign(null)}
        onBack={() => {
          setViewCampaign(editCampaign);
          setEditCampaign(null);
        }}
        onSave={handleSaveEdit}
      />
      {createCampaignOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Create New Campaign"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeCreateCampaign}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-[#F7F8FA] shadow-xl">
              <div className="max-h-[92vh] overflow-y-auto scrollbar-thin">
                <CreateCampaignPage embedded onClose={closeCreateCampaign} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
