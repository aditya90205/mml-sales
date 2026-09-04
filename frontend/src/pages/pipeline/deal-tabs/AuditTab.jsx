import { toast } from "react-toastify";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import { maskAuditLog } from "./stageContent.jsx";

const AUDIT_LOG = [
  { timestamp: "28 Jul 09:14", actor: "Rohit Khanna", action: "Viewed masked mobile",     object: "Client contact", source: "CRM Web" },
  { timestamp: "26 Jul 17:02", actor: "Rohit Khanna", action: "Raised discount request",  object: "Quote v2",       source: "CRM Web" },
  { timestamp: "28 Jul 09:14", actor: "System",       action: "SLA breach — P4 at 7 days", object: "Stage timer",   source: "Workflow engine" },
  { timestamp: "28 Jul 09:14", actor: "System",       action: "Stage advanced P3 → P4",    object: "Deal",          source: "Workflow engine" },
  { timestamp: "28 Jul 09:14", actor: "Pooja Sharma", action: "Read RM flag",              object: "Notes",         source: "CRM Web" },
];

const COLUMNS = [
  { label: "Timestamp", key: "timestamp" },
  { label: "Actor", key: "actor" },
  { label: "Action", key: "action" },
  { label: "Object", key: "object" },
  { label: "Source", key: "source" },
];

export default function AuditTab({ currentStage = "P0" }) {
  const rows = maskAuditLog(currentStage, AUDIT_LOG);
  const { sorted, sort, toggle } = useTableSort(rows);

  return (
    <TableCard
      title="Audit"
      subtitle="Immutable log of every view, edit, export and approval"
      action={<TabHeaderButton onClick={() => toast.info("Audit log exported.")}>Export log</TabHeaderButton>}
      columns={COLUMNS}
      sort={sort}
      onSort={toggle}
    >
      {sorted.map((row, i) => (
        <tr key={i} className="border-b border-black/5 last:border-0">
          <td className="px-3 py-2.5 text-[12px] text-[#9CA3AF] whitespace-nowrap">{row.timestamp}</td>
          <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.actor}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.action}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.object}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.source}</td>
        </tr>
      ))}
    </TableCard>
  );
}
