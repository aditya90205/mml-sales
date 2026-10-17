import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import ClientNameHoverTip from "../common/ClientNameHoverTip.jsx";
import { SortableTh, useTableSort } from "../common/useTableSort.jsx";

const TEMPERATURE_STYLES = {
  Hot: { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
};

const RESPONSE_TABLE_COLS = [
  { label: "Name", key: "name", width: "16%" },
  { label: "Campaign name", key: "campaignName", width: "16%" },
  { label: "Campaign id", key: "campaignId", width: "10%" },
  { label: "Source", key: "source", width: "12%" },
  { label: "Stage", key: "stage", width: "14%" },
  { label: "Response", key: "response", width: "32%" },
];

export default function CampaignResponseModal({
  open,
  onClose,
  rows = [],
  onOpenLead,
  title = "Campaign responses",
  zClass = "z-[80]",
}) {
  const tableRows = useMemo(
    () =>
      (rows || []).map((row) => ({
        ...row,
        name: row.lead?.name || "",
        source: row.lead?.source || row.channel || "",
        stage: row.stageLabel || row.stageId || "",
        response: row.reply || "",
      })),
    [rows]
  );
  const { sorted, sort, toggle } = useTableSort(tableRows, {
    defaultKey: "name",
    getValue: (row, key) => {
      if (key === "campaignId") return Number(row.campaignId) || 0;
      return row?.[key];
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={`${rows.length} lead${rows.length === 1 ? "" : "s"} replied`}
      width="max-w-5xl"
      icon={<MessageSquare size={18} />}
      iconBg="#EEF0FE"
      iconColor="#6366F1"
      zClass={zClass}
    >
      {rows.length === 0 ? (
        <p className="text-[13px] text-[#9CA3AF] text-center py-8">
          No responses yet. Run a campaign to see lead replies here.
        </p>
      ) : (
        <div className="border border-black/8 rounded-xl overflow-x-auto -mx-1">
          <table className="w-full min-w-[720px] text-left border-collapse table-fixed">
            <colgroup>
              {RESPONSE_TABLE_COLS.map((col) => (
                <col key={col.key} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-black/6 bg-[#FAFAFB]/80">
                {RESPONSE_TABLE_COLS.map((h) => (
                  <SortableTh
                    key={h.key}
                    label={h.label}
                    sortKey={h.key}
                    sort={sort}
                    onSort={toggle}
                    dense
                    className="px-2.5 py-2.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-tight align-bottom"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const lead = row.lead || {};
                const temp = TEMPERATURE_STYLES[lead.temperature] || { color: "#6B7280", bg: "#F3F4F6" };
                return (
                  <tr
                    key={`${row.leadId}-${row.campaignId}-${row.respondedAtLabel}`}
                    onClick={() => onOpenLead?.(lead)}
                    className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB] transition-colors cursor-pointer"
                    title="Open lead overview"
                  >
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <ClientNameHoverTip name={lead.name} temperature={lead.temperature} mmlId={lead.mmlId}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: temp.color }} />
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-[#111] truncate hover:text-[#7A0A17] hover:underline">
                              {lead.name || "—"}
                            </p>
                            {lead.temperature ? (
                              <span
                                className="text-[10px] font-bold rounded px-1 py-px"
                                style={{ backgroundColor: temp.bg, color: temp.color }}
                              >
                                {lead.temperature}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </ClientNameHoverTip>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <p className="text-[12px] text-[#374151] truncate">{row.campaignName || "—"}</p>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <p className="text-[12px] font-semibold text-[#111] tabular-nums">{row.campaignId ?? "—"}</p>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <p className="text-[12px] text-[#374151] truncate">{lead.source || row.channel || "—"}</p>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <p className="text-[12px] text-[#374151] truncate">{row.stageLabel || row.stageId || "—"}</p>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle overflow-hidden">
                      <p className="text-[12px] text-[#111] leading-snug line-clamp-2">{row.reply || "—"}</p>
                      {row.respondedAtLabel ? (
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">{row.respondedAtLabel}</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
