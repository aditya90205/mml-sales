import { useState } from "react";
import { toast } from "react-toastify";
import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";

const INITIAL_PAYMENTS = [
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

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

export default function PaymentsTab({ locked = true }) {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const { sorted, sort, toggle } = useTableSort(payments, { defaultKey: "date" });
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("UPI");
  const [amount, setAmount] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast.error("Please add an amount.");
      return;
    }
    setPayments((prev) => [
      {
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        method,
        reference: `MML-R-${Math.floor(80000 + Math.random() * 9999)}`,
        amount: amount.trim().startsWith("₹") ? amount.trim() : `₹${amount.trim()}`,
        status: "Awaiting",
        tone: "amber",
      },
      ...prev,
    ]);
    toast.success("Payment recorded.");
    setAmount("");
    setMethod("UPI");
    setOpen(false);
  };

  const table = (
        <TableCard
          title="Payments"
          subtitle="Part payments, receipts and reconciliation"
          action={<TabHeaderButton onClick={() => setOpen(true)}>Record payment</TabHeaderButton>}
          columns={COLUMNS}
          sort={sort}
          onSort={toggle}
          footnote="Prices are standardised across branches. A quoted price below list requires an approved discount request."
        >
          {sorted.map((row, i) => (
            <tr key={`${row.date}-${row.method}-${i}`} className="border-b border-black/5 last:border-0">
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
  );

  return (
    <>
      {locked ? (
        <LockedTabOverlay title="Payment is locked." message="This screen will open at P6 stage.">
          {table}
        </LockedTabOverlay>
      ) : (
        table
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record payment"
        subtitle="Part payment, cheque or payment link"
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
              form="payment-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save payment
            </button>
          </>
        }
      >
        <form id="payment-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={FIELD}>
              <option>UPI</option>
              <option>Cheque</option>
              <option>Payment Link</option>
              <option>NEFT</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15000" className={FIELD} />
          </div>
        </form>
      </Modal>
    </>
  );
}
