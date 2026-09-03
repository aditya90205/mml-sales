import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";

const VISITS = [
  {
    date: "02 Jul 2026", type: "Home visit", venue: "Greater Kailash",
    attendedBy: "Client + both parents", gps: "28.5621, 77.2410",
    capture: "4 of 4", captureTone: "green", outcome: "Premium pitched",
  },
  {
    date: "14 Jul 2026", type: "Office visit", venue: "Greater Kailash",
    attendedBy: "Client + father", gps: "-",
    capture: "2 of 2", captureTone: "green", outcome: "Price resistance raised",
  },
  {
    date: "30 Jul 2026", type: "Home visit", venue: "Greater Kailash",
    attendedBy: "Client + both parents", gps: "Pending",
    capture: "Not Started", captureTone: "gray", outcome: "Scheduled",
  },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Type", key: "type" },
  { label: "Venue", key: "venue" },
  { label: "Attended By", key: "attendedBy" },
  { label: "GPS", key: "gps" },
  { label: "Capture", key: "capture" },
  { label: "Outcome", key: "outcome" },
];

export default function VisitsMeetingsTab() {
  const { sorted, sort, toggle } = useTableSort(VISITS, { defaultKey: "date" });

  return (
    <TableCard
      title="Visits"
      subtitle="Home and office visits with GPS, selfie and activity form"
      columns={COLUMNS}
      sort={sort}
      onSort={toggle}
    >
      {sorted.map((row, i) => (
        <tr key={i} className="border-b border-black/5 last:border-0">
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.date}</td>
          <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.type}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.venue}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.attendedBy}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.gps}</td>
          <td className="px-3 py-2.5 whitespace-nowrap">
            <StatusPill tone={row.captureTone}>{row.capture}</StatusPill>
          </td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.outcome}</td>
        </tr>
      ))}
    </TableCard>
  );
}
