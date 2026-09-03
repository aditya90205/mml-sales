import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";

const SECTIONS = [
  { section: "1 · Who is the client",           fields: 6, filled: 6, status: "Complete" },
  { section: "2 · Family background",           fields: 4, filled: 4, status: "2 missing" },
  { section: "3 · Profession & income",         fields: 3, filled: 1, status: "Complete" },
  { section: "4 · Area of house & lifestyle",   fields: 3, filled: 2, status: "2 missing" },
  { section: "5 · Package interest",            fields: 2, filled: 2, status: "Complete" },
];

const COLUMNS = [
  { label: "Section", key: "section" },
  { label: "Fields", key: "fields" },
  { label: "Filled", key: "filled" },
  { label: "Status", key: "status" },
];

export default function IntakeFormTab() {
  const { sorted, sort, toggle } = useTableSort(SECTIONS, { defaultKey: "section" });

  return (
    <TableCard
      title="Client Intake Form"
      subtitle="Standardised across branches · locks P1 until complete"
      columns={COLUMNS}
      sort={sort}
      onSort={toggle}
      footnote="11 of 14 mandatory fields filled. P1 remains locked until all sections show Complete"
    >
      {sorted.map((row) => (
        <tr key={row.section} className="border-b border-black/5 last:border-0">
          <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.section}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.fields}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.filled}</td>
          <td className="px-3 py-2.5 whitespace-nowrap">
            <StatusPill tone={row.status === "Complete" ? "green" : "amber"}>{row.status}</StatusPill>
          </td>
        </tr>
      ))}
    </TableCard>
  );
}
