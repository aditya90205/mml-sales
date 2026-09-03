import TableCard from "../../../components/common/TableCard";

const AUDIT_LOG = [
  { timestamp: "28 Jul 09:14", actor: "Rohit Khanna", action: "Viewed masked mobile",     object: "Client contact", source: "CRM Web" },
  { timestamp: "26 Jul 17:02", actor: "Rohit Khanna", action: "Raised discount request",  object: "Quote v2",       source: "CRM Web" },
  { timestamp: "28 Jul 09:14", actor: "System",       action: "SLA breach — P4 at 7 days", object: "Stage timer",   source: "Workflow engine" },
  { timestamp: "28 Jul 09:14", actor: "System",       action: "Stage advanced P3 → P4",    object: "Deal",          source: "Workflow engine" },
  { timestamp: "28 Jul 09:14", actor: "Pooja Sharma", action: "Read RM flag",              object: "Notes",         source: "CRM Web" },
];

/** Audit tab — immutable log of every view, edit, export and approval on the deal. */
export default function AuditTab() {
  return (
    <TableCard
      title="Audit"
      subtitle="Immutable log of every view, edit, export and approval"
      columns={["Timestamp", "Actor", "Action", "Object", "Source"]}
    >
      {AUDIT_LOG.map((row, i) => (
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
