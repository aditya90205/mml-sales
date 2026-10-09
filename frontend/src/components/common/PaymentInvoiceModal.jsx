import { FileText } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

function formatInr(amount) {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function PaymentInvoiceModal({ open, onClose, invoice, zClass = "z-[80]" }) {
  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invoice"
      subtitle={invoice.invoiceNo || "Payment invoice"}
      icon={<FileText size={18} />}
      iconBg="#FDF2F3"
      iconColor="#7A0A17"
      width="max-w-lg"
      zClass={zClass}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => toast.success(`Downloading ${invoice.invoiceNo || "invoice"}...`)}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Download PDF
          </button>
        </>
      }
    >
      <div className="rounded-2xl border border-black/8 overflow-hidden">
        <div className="bg-[#FDF2F3] px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A0A17]">MatchMakers Lounge</p>
            <p className="text-[16px] font-bold text-[#111] mt-0.5 truncate">{invoice.invoiceNo}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Verified · {formatWhen(invoice.verifiedAt)}</p>
          </div>
          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#E7F8EF] text-[#16A34A]">
            Paid
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#6B7280]">Client</span>
            <span className="font-semibold text-[#111] text-right">{invoice.clientName || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#6B7280]">Package</span>
            <span className="font-semibold text-[#111] text-right">{invoice.packageName || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#6B7280]">Amount</span>
            <span className="font-semibold text-[#111] text-right">{formatInr(invoice.amount)}</span>
          </div>
          <div className="h-px bg-black/6" />
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#6B7280]">Transaction ID</span>
            <span className="font-semibold text-[#111] text-right break-all">{invoice.transactionId || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#6B7280]">Screenshot</span>
            <span className="font-medium text-[#16A34A] text-right truncate max-w-[55%]" title={invoice.screenshotName}>
              {invoice.screenshotName || "—"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
