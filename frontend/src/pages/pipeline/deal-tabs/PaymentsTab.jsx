import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";

const PAYMENTS = [
  { date: "29 Jun 2026", method: "UPI",          reference: "MML-R-88213", amount: "₹15,000", status: "Received", tone: "green" },
  { date: "29 Jun 2026", method: "Cheque",       reference: "MML-R-88213", amount: "₹15,000", status: "Cleared",  tone: "green" },
  { date: "Due 02 Aug",  method: "Payment Link", reference: "MML-R-88213", amount: "₹15,000", status: "Awaiting", tone: "amber" },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Method", key: "method" },
  { label: "Reference", key: "reference" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
];

export default function PaymentsTab() {
  const { sorted, sort, toggle } = useTableSort(PAYMENTS, { defaultKey: "date" });

  return (
    <LockedTabOverlay title="Payment is locked." message="This screen will open at P5 stage.">
      <TableCard
        title="Payments"
        subtitle="Part payments, receipts and reconciliation"
        columns={COLUMNS}
        sort={sort}
        onSort={toggle}
        footnote="Prices are standardised across branches. A quoted price below list requires an approved discount request."
      >
        {sorted.map((row, i) => (
          <tr key={i} className="border-b border-black/5 last:border-0">
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.date}</td>
            <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.method}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.reference}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.amount}</td>
            <td className="px-3 py-2.5 whitespace-nowrap">
              <StatusPill tone={row.tone}>{row.status}</StatusPill>
            </td>
          </tr>
        ))}
      </TableCard>
    </LockedTabOverlay>
  );
}
