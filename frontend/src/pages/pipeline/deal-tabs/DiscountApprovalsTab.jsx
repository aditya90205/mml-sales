import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";

const APPROVALS = [
  { raised: "28 July", requested: "₹51,000", discount: "14.7%", approver: "Pooja Sharma", level: "Branch Head", status: "Pending" },
  { raised: "v2",      requested: "₹48,000", discount: "5.9%",  approver: "Vinay Gupta",  level: "Team Lead",   status: "Approved" },
];

const STATUS_TONES = { Pending: "amber", Approved: "green" };

/** Discount Approvals tab — requests routed through the team-level authority matrix. */
export default function DiscountApprovalsTab() {
  return (
    <TableCard
      title="Discount Approvals"
      subtitle="Routed by the authority matrix — team level, not individual"
      columns={["Raised", "Requested", "Discount", "Approver", "Level", "Status"]}
      footnote="Up to 10% — Team Lead. 10-20% — Branch Head. Above 20% — Founder."
    >
      {APPROVALS.map((row, i) => (
        <tr key={i} className="border-b border-black/5 last:border-0">
          <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.raised}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.requested}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.discount}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.approver}</td>
          <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.level}</td>
          <td className="px-3 py-2.5 whitespace-nowrap">
            <StatusPill tone={STATUS_TONES[row.status] || "gray"}>{row.status}</StatusPill>
          </td>
        </tr>
      ))}
    </TableCard>
  );
}
