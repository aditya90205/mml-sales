import { useState } from "react";
import { toast } from "react-toastify";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";

const INITIAL_APPROVALS = [
  { raised: "28 July", requested: "₹51,000", discount: "14.7%", approver: "Pooja Sharma", level: "Branch Head", status: "Pending" },
  { raised: "v2",      requested: "₹48,000", discount: "5.9%",  approver: "Vinay Gupta",  level: "Team Lead",   status: "Approved" },
];

const STATUS_TONES = { Pending: "amber", Approved: "green" };

const COLUMNS = [
  { label: "Raised", key: "raised" },
  { label: "Requested", key: "requested" },
  { label: "Discount", key: "discount" },
  { label: "Approver", key: "approver" },
  { label: "Level", key: "level" },
  { label: "Status", key: "status" },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

export default function DiscountApprovalsTab() {
  const [rows, setRows] = useState(INITIAL_APPROVALS);
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "raised" });
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState("");
  const [discount, setDiscount] = useState("");
  const [level, setLevel] = useState("Team Lead");

  const handleSave = (e) => {
    e.preventDefault();
    if (!requested.trim() || !discount.trim()) {
      toast.error("Please add requested amount and discount.");
      return;
    }
    setRows((prev) => [
      {
        raised: "Just now",
        requested: requested.trim().startsWith("₹") ? requested.trim() : `₹${requested.trim()}`,
        discount: discount.includes("%") ? discount : `${discount}%`,
        approver: level === "Founder" ? "Founder desk" : level === "Branch Head" ? "Pooja Sharma" : "Vinay Gupta",
        level,
        status: "Pending",
      },
      ...prev,
    ]);
    toast.success("Discount request raised.");
    setRequested("");
    setDiscount("");
    setLevel("Team Lead");
    setOpen(false);
  };

  return (
    <>
      <TableCard
        title="Discount Approvals"
        subtitle="Routed by the authority matrix — team level, not individual"
        action={<TabHeaderButton onClick={() => setOpen(true)}>Request discount</TabHeaderButton>}
        columns={COLUMNS}
        sort={sort}
        onSort={toggle}
        footnote="Up to 10% — Team Lead. 10-20% — Branch Head. Above 20% — Founder."
      >
        {sorted.map((row, i) => (
          <tr key={`${row.raised}-${i}`} className="border-b border-black/5 last:border-0">
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request discount"
        subtitle="Routed by the authority matrix"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="discount-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Submit request
            </button>
          </>
        }
      >
        <form id="discount-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Requested amount</label>
            <input value={requested} onChange={(e) => setRequested(e.target.value)} placeholder="51000" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Discount %</label>
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Approval level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={FIELD}>
              <option>Team Lead</option>
              <option>Branch Head</option>
              <option>Founder</option>
            </select>
          </div>
        </form>
      </Modal>
    </>
  );
}
