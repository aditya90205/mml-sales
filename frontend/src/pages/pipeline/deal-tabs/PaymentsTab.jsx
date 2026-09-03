import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import TableCard from "../../../components/pipeline/TableCard";
import StatusPill from "../../../components/pipeline/StatusPill";

const PAYMENTS = [
  { date: "29 Jun 2026",  method: "UPI",          reference: "XXXX-8073", amount: "₹15,000", status: "Received", tone: "green" },
  { date: "29 Jun 2026",  method: "Cheque",       reference: "XXXX-8073", amount: "₹15,000", status: "Cleared",  tone: "green" },
  { date: "Due 05 Aug",   method: "Payment link", reference: "XXXX-8073", amount: "₹15,000", status: "Pending",  tone: "amber" },
];

/** Payments tab — locked until the deal reaches P5, shown as a blurred preview. */
export default function PaymentsTab() {
  return (
    <LockedTabOverlay title="Payment is locked." message="This screen will open at P5 stage.">
      <TableCard
        title="Payments"
        subtitle="Net payments, receipts and reconciliation"
        columns={["Date", "Method", "Reference", "Amount", "Status"]}
        footnote="Prices are standardised across branches. A quoted price below this requires an approved discount request."
      >
        {PAYMENTS.map((row, i) => (
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
