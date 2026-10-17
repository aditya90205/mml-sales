import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  Download,
  Eye,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import { markPaymentVerified } from "../../utils/paymentVerifyStore";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";
const BRAND = "#7A0A17";
const BRAND_SOFT = "#FDECEE";

const MODES = {
  UPI: {
    title: "UPI details",
    refLabel: "Transaction ID / UTR",
    placeholder: "e.g. 412345678901",
    proof: "payment screenshot",
  },
  "Bank transfer": {
    title: "Bank transfer details",
    refLabel: "UTR / Reference no.",
    placeholder: "e.g. HDFCN52026101612345",
    proof: "bank confirmation",
  },
  "Cheque / DD": {
    title: "Cheque / DD details",
    refLabel: "Cheque / DD no.",
    placeholder: "6 digits",
    proof: "cheque photo",
  },
  Cash: {
    title: "Cash details",
    refLabel: "Receipt no.",
    placeholder: "e.g. RCPT-MUM-00812",
    proof: "signed receipt",
  },
  "Payment gateway": {
    title: "",
    refLabel: "",
    placeholder: "",
    proof: "",
  },
};

const MODE_KEYS = Object.keys(MODES);
const DENOM_VALUES = [500, 200, 100, 50, 20, 10, 1];
const DENOM_LABELS = {
  500: "₹500",
  200: "₹200",
  100: "₹100",
  50: "₹50",
  20: "₹20",
  10: "₹10",
  1: "Coins (₹)",
};
const BANK_ACCOUNTS = [
  "HDFC Current · ••••4821 (Head office)",
  "Axis Current · ••••0937 (Mumbai)",
  "SBI Current · ••••6612 (Delhi)",
];
const DEPOSIT_ACCOUNTS = [
  "HDFC Current · ••••4821",
  "Axis Current · ••••0937",
  "Not deposited yet",
];
const RECEIVED_BY = ["Rahul Mehra (Sales)", "Anjali Rao (Branch manager)", "Front desk"];
const BRANCHES = ["Mumbai — Andheri", "Delhi — Saket", "Bengaluru — Indiranagar"];
const RELATIONS = ["Father", "Mother", "Sibling", "Relative", "Other"];
const CHQ_STATUSES = ["Received", "Deposited", "Cleared", "Bounced"];
const CHQ_HINTS = {
  Received: "Payment counts as verified only once the cheque clears",
  Deposited: "Awaiting clearance — usually 1–2 working days",
  Cleared: "Cleared — ready for Accounts to verify",
  Bounced: "Bounced — client will be notified and the deal flagged",
};
const BOUNCE_REASONS = [
  "Insufficient funds",
  "Signature mismatch",
  "Stale / post-dated",
  "Account closed",
  "Other",
];

function fmtInr(n) {
  const num = Number(n) || 0;
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatPiDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function parseAmount(text) {
  const n = parseInt(String(text).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function formatAmountInput(n) {
  if (!n && n !== 0) return "";
  return Number(n).toLocaleString("en-IN");
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-[10px] border text-[13px] font-semibold whitespace-nowrap transition-colors ${
        active
          ? "border-[#7A0A17] bg-[#FDECEE] text-[#7A0A17]"
          : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#FAFAFB]"
      }`}
    >
      {children}
    </button>
  );
}

const fieldClass =
  "w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111] bg-white outline-none focus:border-[#7A0A17] focus:shadow-[0_0_0_3px_rgba(122,10,23,0.08)]";
const labelClass = "block text-[13px] font-semibold text-[#111] mb-1.5";

export default function VerifyPaymentModal({
  open,
  onClose,
  dealId,
  clientName = "",
  clientId = "",
  formId = "",
  packageName = "",
  packageMonths = null,
  amount = null,
  amountPaid = 0,
  proformaNo = "",
  proformaDate = "",
  gatewayPaid = true,
  zClass = "z-[120]",
  onVerified,
}) {
  const formKey = `verify-payment-${useId().replace(/:/g, "")}`;
  const fileRef = useRef(null);

  const totalPayable = Number(amount) || 0;
  const paidSoFar = Number(amountPaid) || 0;
  const balanceDue = Math.max(totalPayable - paidSoFar, 0);

  const piNo = proformaNo || `PI/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;
  const piDateIso = proformaDate || todayIso();
  const piDateLabel = formatPiDate(piDateIso);
  const packageLabel = [packageName, packageMonths ? `${packageMonths} months` : ""]
    .filter(Boolean)
    .join(" · ");

  const [mode, setMode] = useState("UPI");
  const [payType, setPayType] = useState("Full");
  const [amountText, setAmountText] = useState("");
  const [date, setDate] = useState(todayIso());
  const [ref, setRef] = useState("");
  const [payerUpi, setPayerUpi] = useState("");
  const [transferType, setTransferType] = useState("NEFT");
  const [senderBank, setSenderBank] = useState("");
  const [senderLast4, setSenderLast4] = useState("");
  const [creditedTo, setCreditedTo] = useState(BANK_ACCOUNTS[0]);
  const [chqDate, setChqDate] = useState(todayIso());
  const [chqBank, setChqBank] = useState("");
  const [chqBranch, setChqBranch] = useState("");
  const [depositedOn, setDepositedOn] = useState("");
  const [depositedTo, setDepositedTo] = useState(DEPOSIT_ACCOUNTS[0]);
  const [chqStatus, setChqStatus] = useState("Received");
  const [bounceReason, setBounceReason] = useState(BOUNCE_REASONS[0]);
  const [receivedBy, setReceivedBy] = useState(RECEIVED_BY[0]);
  const [collectedAt, setCollectedAt] = useState(BRANCHES[0]);
  const [denoms, setDenoms] = useState(() =>
    Object.fromEntries(DENOM_VALUES.map((v) => [v, ""]))
  );
  const [payerPan, setPayerPan] = useState("");
  const [byThird, setByThird] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [showPI, setShowPI] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (!open) return;
    setMode("UPI");
    setPayType("Full");
    setAmountText("");
    setDate(todayIso());
    setRef("");
    setPayerUpi("");
    setTransferType("NEFT");
    setSenderBank("");
    setSenderLast4("");
    setCreditedTo(BANK_ACCOUNTS[0]);
    setChqDate(todayIso());
    setChqBank("");
    setChqBranch("");
    setDepositedOn("");
    setDepositedTo(DEPOSIT_ACCOUNTS[0]);
    setChqStatus("Received");
    setBounceReason(BOUNCE_REASONS[0]);
    setReceivedBy(RECEIVED_BY[0]);
    setCollectedAt(BRANCHES[0]);
    setDenoms(Object.fromEntries(DENOM_VALUES.map((v) => [v, ""])));
    setPayerPan("");
    setByThird(false);
    setPayerName(clientName || "");
    setRelation(RELATIONS[0]);
    setRemarks("");
    setFile(null);
    setShowPI(false);
    setSubmitted(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, clientName]);

  const isFull = payType === "Full";
  const isGateway = mode === "Payment gateway";
  const meta = MODES[mode];
  const receivedAmt = isFull ? balanceDue : parseAmount(amountText);

  const amtMsg = useMemo(() => {
    if (isFull) return "";
    if (!receivedAmt) return "Enter the amount received";
    if (receivedAmt >= balanceDue) return "For the full balance choose “Full payment”";
    return "";
  }, [isFull, receivedAmt, balanceDue]);

  const refMsg = useMemo(() => {
    const r = ref.trim();
    if (!r) return "";
    if (mode === "UPI" && !/^\d{12}$/.test(r)) return "UTR must be 12 digits";
    if (mode === "Cheque / DD" && !/^\d{6}$/.test(r)) return "Cheque number must be 6 digits";
    return "";
  }, [ref, mode]);

  const denomTotal = useMemo(
    () => DENOM_VALUES.reduce((sum, v) => sum + v * (parseInt(denoms[v], 10) || 0), 0),
    [denoms]
  );
  const denomDiff = receivedAmt - denomTotal;
  const needPan = mode === "Cash" && receivedAmt >= 200000;
  const postDated = chqDate > todayIso();

  const blocked = isGateway
    ? !gatewayPaid
    : !ref.trim() ||
      !!refMsg ||
      !file ||
      !receivedAmt ||
      !!amtMsg ||
      (mode === "Cash" && denomDiff !== 0) ||
      (needPan && !payerPan.trim()) ||
      !payerName.trim() ||
      (mode === "Cheque / DD" && !chqBank.trim());

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const pickMode = (next) => {
    setMode(next);
    setRef("");
    clearFile();
  };

  const blockReason = useMemo(() => {
    if (isGateway) return gatewayPaid ? "" : "Verification unlocks once the client pays.";
    if (!receivedAmt || amtMsg) return amtMsg || "Enter the amount received.";
    if (!ref.trim()) return `Enter ${meta.refLabel || "reference"}.`;
    if (refMsg) return refMsg;
    if (!file) return `Upload ${meta.proof || "proof"} (required).`;
    if (mode === "Cash" && denomDiff !== 0) return "Denominations must match the amount received.";
    if (needPan && !payerPan.trim()) return "Enter payer PAN for cash of ₹2,00,000 or more.";
    if (!payerName.trim()) return "Enter payer name.";
    if (mode === "Cheque / DD" && !chqBank.trim()) return "Enter bank name on the cheque.";
    return "";
  }, [
    isGateway,
    gatewayPaid,
    receivedAmt,
    amtMsg,
    ref,
    meta.refLabel,
    meta.proof,
    refMsg,
    file,
    mode,
    denomDiff,
    needPan,
    payerPan,
    payerName,
    chqBank,
  ]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (blocked) {
      toast.error(blockReason || "Complete the required payment details.");
      return;
    }

    const record = markPaymentVerified(dealId, {
      transactionId: isGateway ? `GW-${Date.now().toString().slice(-8)}` : ref.trim(),
      screenshotName: file?.name || (isGateway ? "gateway_receipt" : ""),
      amount: isGateway ? balanceDue : receivedAmt,
      packageName,
      clientName,
      months: packageMonths,
      paymentMode: mode,
      paymentDate: date,
      remarks: remarks.trim(),
      payerName: payerName.trim(),
    });

    setSubmitted(isGateway ? "verified" : "sent");
    toast.success(
      isGateway ? "Payment verified. Invoice is ready." : "Submitted for Accounts verification."
    );
    if (isGateway) {
      onVerified?.(record);
    } else {
      // Sales offline path still marks verified in this demo store so package unlocks.
      onVerified?.(record);
    }
  };

  if (!open) return null;

  if (submitted) {
    const copy = {
      sent: {
        title: "Submitted for verification",
        body: `${fmtInr(receivedAmt)} via ${mode} is with Accounts. You’ll be notified once it’s verified.`,
        tag: "Pending verification",
      },
      verified: {
        title: "Payment verified",
        body: `${fmtInr(isGateway ? balanceDue : receivedAmt)} via ${mode} is confirmed against ${piNo}.`,
        tag: "Verified",
      },
    }[submitted];

    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Verify payment"
        subtitle="Confirm the payment received against the proforma invoice"
        icon={<ShieldCheck size={18} />}
        iconBg={BRAND_SOFT}
        iconColor={BRAND}
        width="max-w-[580px]"
        zClass={zClass}
        footer={
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-5 rounded-[10px] bg-white border border-[#E5E7EB] text-[14px] font-semibold text-[#111] hover:bg-[#F9FAFB]"
          >
            Close
          </button>
        }
      >
        <div className="py-8 flex flex-col items-center gap-2.5 text-center">
          <span className="size-[52px] rounded-full bg-[#E7F8EF] text-[#16A34A] grid place-items-center">
            <Check size={24} strokeWidth={2.2} />
          </span>
          <p className="text-[17px] font-semibold text-[#111]">{copy.title}</p>
          <p className="text-[14px] text-[#6B7280] max-w-[40ch] text-pretty">{copy.body}</p>
          <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
            {copy.tag}
          </span>
        </div>
      </Modal>
    );
  }

  if (showPI) {
    const taxable = Math.round(totalPayable / 1.18);
    const cgst = Math.round((totalPayable - taxable) / 2);
    const sgst = totalPayable - taxable - cgst;
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Proforma invoice"
        subtitle={`${piNo} · ${piDateLabel}`}
        icon={<FileText size={18} />}
        iconBg={BRAND_SOFT}
        iconColor={BRAND}
        width="max-w-[580px]"
        zClass={zClass}
        headerActions={
          <button
            type="button"
            onClick={() => setShowPI(false)}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-[12px] font-semibold text-[#111] hover:bg-black/5"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        }
        footer={
          <button
            type="button"
            onClick={() => toast.success(`Downloading ${piNo}...`)}
            className="h-[42px] px-5 rounded-[10px] bg-[#7A0A17] text-white text-[14px] font-semibold hover:bg-[#640712] inline-flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </button>
        }
      >
        <div className="border border-[#EEF1F4] rounded-xl p-5 grid gap-4">
          <div className="flex justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[16px] font-bold text-[#7A0A17]">MatchMakers Lounge</p>
              <p className="text-[12px] text-[#6B7280]">
                Andheri West, Mumbai 400058
                <br />
                GSTIN 27AABCM1234F1Z5
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#6B7280]">Billed to</p>
              <p className="text-[13px] font-semibold">{clientName || "—"}</p>
              <p className="text-[12px] text-[#6B7280]">
                {[clientId, formId].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
          <div className="border border-[#EEF1F4] rounded-[10px] overflow-hidden text-[13px]">
            <div className="grid grid-cols-[1fr_auto] px-3 py-2 bg-[#F9FAFB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#F3F4F6]">
              <span>{packageLabel || "Package"}</span>
              <span className="tabular-nums">{fmtInr(taxable)}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#F3F4F6] text-[#6B7280]">
              <span>CGST 9%</span>
              <span className="tabular-nums">{fmtInr(cgst)}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#F3F4F6] text-[#6B7280]">
              <span>SGST 9%</span>
              <span className="tabular-nums">{fmtInr(sgst)}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#EEF1F4] font-semibold">
              <span>Total payable</span>
              <span className="tabular-nums">{fmtInr(totalPayable)}</span>
            </div>
            {paidSoFar > 0 && (
              <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#F3F4F6] text-[#16A34A]">
                <span>Paid</span>
                <span className="tabular-nums">− {fmtInr(paidSoFar)}</span>
              </div>
            )}
            <div className="grid grid-cols-[1fr_auto] px-3 py-2.5 border-t border-[#EEF1F4] font-semibold text-[#7A0A17] bg-[#FFF8F8]">
              <span>Balance due</span>
              <span className="tabular-nums">{fmtInr(balanceDue)}</span>
            </div>
          </div>
          <p className="text-[12px] text-[#6B7280]">
            This is a proforma invoice, not a tax invoice.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify payment"
      subtitle="Confirm the payment received against the proforma invoice"
      icon={<ShieldCheck size={18} />}
      iconBg={BRAND_SOFT}
      iconColor={BRAND}
      width="max-w-[580px]"
      zClass={zClass}
      footer={
        <>
          <p className="flex-1 min-w-[180px] text-[12px] text-[#6B7280] mr-auto">
            {blocked && blockReason
              ? blockReason
              : isGateway
                ? gatewayPaid
                  ? "Pre-filled from the gateway — just confirm"
                  : "Verification unlocks once the client pays"
                : "Goes to Accounts for verification"}
          </p>
          {!isGateway || gatewayPaid ? null : (
            <button
              type="button"
              onClick={() => toast.info("Payment link resent.")}
              className="h-[42px] px-4 rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#7A0A17] hover:bg-[#FFF8F8]"
            >
              Resend link
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] px-5 rounded-[10px] bg-white border border-[#E5E7EB] text-[14px] font-semibold text-[#111] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formKey}
            className={`h-[42px] px-5 rounded-[10px] text-white text-[14px] font-semibold transition-opacity ${
              blocked ? "bg-[#7A0A17]/50 hover:bg-[#7A0A17]/60" : "bg-[#7A0A17] hover:bg-[#640712]"
            }`}
          >
            {isGateway ? "Verify" : "Submit & Verify"}
          </button>
        </>
      }
    >
      <form id={formKey} onSubmit={handleSubmit} className="grid gap-[18px] content-start">
        {/* Proforma summary */}
        <div className="border border-[#EEF1F4] rounded-xl overflow-hidden shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FFF8F8] border-b border-[#EEF1F4]">
            <FileText size={16} className="text-[#7A0A17] shrink-0" />
            <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
              <span className="text-[12px] text-[#6B7280]">Proforma invoice</span>
              <span className="text-[14px] font-semibold tabular-nums">{piNo}</span>
              <span className="text-[12px] text-[#6B7280]">· {piDateLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPI(true)}
              className="h-[30px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#7A0A17] hover:border-[#7A0A17]"
            >
              <Eye size={14} />
              View
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3.5 gap-y-2.5 px-3.5 py-3 border-b border-[#EEF1F4]">
            <div>
              <p className="text-[11px] text-[#6B7280]">Client</p>
              <p className="text-[13px] font-semibold truncate">{clientName || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#6B7280]">Client ID</p>
              <p className="text-[13px] font-semibold tabular-nums">{clientId || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#6B7280]">Form ID</p>
              <p className="text-[13px] font-semibold tabular-nums">{formId || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#6B7280]">Package</p>
              <p className="text-[13px] font-semibold truncate">{packageLabel || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 bg-[#F9FAFB]">
            <div className="px-3.5 py-2.5 border-r border-[#EEF1F4]">
              <p className="text-[11px] text-[#6B7280]">Total payable</p>
              <p className="text-[15px] font-semibold tabular-nums">{fmtInr(totalPayable)}</p>
            </div>
            <div className="px-3.5 py-2.5 border-r border-[#EEF1F4]">
              <p className="text-[11px] text-[#6B7280]">Amount paid</p>
              <p className="text-[15px] font-semibold text-[#16A34A] tabular-nums">
                {fmtInr(paidSoFar)}
              </p>
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#6B7280]">Balance due</p>
              <p className="text-[15px] font-semibold text-[#7A0A17] tabular-nums">
                {fmtInr(balanceDue)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment mode */}
        <div>
          <label className={labelClass}>
            Payment mode <span className="text-[#DC2626]">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MODE_KEYS.map((key) => (
              <Chip key={key} active={mode === key} onClick={() => pickMode(key)}>
                {key}
              </Chip>
            ))}
          </div>
        </div>

        {isGateway ? (
          <div className="flex items-center gap-3.5 p-4 border border-[#EEF1F4] rounded-xl bg-[#FCFCFD]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold">Razorpay payment link</span>
                <span
                  className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${
                    gatewayPaid
                      ? "bg-[#E7F8EF] text-[#15803D]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                  }`}
                >
                  {gatewayPaid ? "Paid" : "Not paid yet"}
                </span>
              </div>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                {gatewayPaid
                  ? "Details captured automatically from the gateway"
                  : "Link sent — no payment received yet"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-[#6B7280]">Balance due</p>
              <p
                className={`text-[20px] font-semibold tabular-nums ${
                  gatewayPaid ? "text-[#16A34A]" : "text-[#7A0A17]"
                }`}
              >
                {fmtInr(gatewayPaid ? 0 : balanceDue)}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3.5">
            <div>
              <label className={labelClass}>
                Form of payment <span className="text-[#DC2626]">*</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                <Chip active={isFull} onClick={() => setPayType("Full")}>
                  Full payment
                </Chip>
                <Chip active={!isFull} onClick={() => setPayType("Partial")}>
                  Partial payment
                </Chip>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelClass}>
                  Amount received <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">
                    ₹
                  </span>
                  <input
                    inputMode="numeric"
                    readOnly={isFull}
                    value={isFull ? formatAmountInput(balanceDue) : amountText}
                    onChange={(e) => {
                      const n = parseAmount(e.target.value);
                      setAmountText(n ? formatAmountInput(n) : "");
                    }}
                    className={`${fieldClass} pl-[26px] font-semibold tabular-nums ${
                      amtMsg ? "!border-[#DC2626]" : ""
                    } ${isFull ? "bg-[#F9FAFB]" : ""}`}
                  />
                </div>
                {amtMsg ? (
                  <p className="text-[12px] mt-1.5 text-[#DC2626]">{amtMsg}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>
                  Payment date <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              {!isFull && (
                <div>
                  <label className={labelClass}>Balance due</label>
                  <div className="h-10 flex items-center px-3 rounded-[10px] bg-[#FEF3C7] text-[#92400E] text-[14px] font-semibold tabular-nums">
                    {fmtInr(Math.max(balanceDue - receivedAmt, 0))}
                  </div>
                </div>
              )}
            </div>

            {/* Mode details */}
            <div className="grid gap-3.5 p-4 border border-[#EEF1F4] rounded-xl bg-[#FCFCFD]">
              <p className="text-[13px] font-semibold text-[#7A0A17]">{meta.title}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    {meta.refLabel} <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder={meta.placeholder}
                      maxLength={mode === "Cheque / DD" ? 6 : undefined}
                      className={`${fieldClass} flex-1 min-w-0 ${
                        refMsg ? "!border-[#DC2626]" : ""
                      }`}
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept={ACCEPT}
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <button
                      type="button"
                      title={file ? "Proof attached" : `Upload ${meta.proof}`}
                      aria-label={file ? "Proof attached" : `Upload ${meta.proof}`}
                      onClick={() => (file ? clearFile() : fileRef.current?.click())}
                      className={`size-10 shrink-0 grid place-items-center rounded-[10px] border ${
                        file
                          ? "border-[#86EFAC] bg-[#E7F8EF] text-[#16A34A]"
                          : "border-[#E5E7EB] bg-[#FDECEE] text-[#7A0A17]"
                      }`}
                    >
                      {file ? <Check size={16} strokeWidth={2.2} /> : <Upload size={16} />}
                    </button>
                  </div>
                  {refMsg ? (
                    <p className="text-[12px] mt-1.5 text-[#DC2626]">{refMsg}</p>
                  ) : null}
                  {file ? (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[#16A34A]">
                      <span className="truncate min-w-0 flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-[#6B7280] underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <p className="text-[12px] mt-1.5 text-[#9CA3AF]">
                      Upload {meta.proof} (required)
                    </p>
                  )}
                </div>

                {mode === "UPI" && (
                  <div>
                    <label className={labelClass}>Payer UPI ID</label>
                    <input
                      value={payerUpi}
                      onChange={(e) => setPayerUpi(e.target.value)}
                      placeholder="name@bank"
                      className={fieldClass}
                    />
                  </div>
                )}

                {mode === "Bank transfer" && (
                  <>
                    <div>
                      <label className={labelClass}>Transfer type</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {["NEFT", "RTGS", "IMPS"].map((t) => (
                          <Chip key={t} active={transferType === t} onClick={() => setTransferType(t)}>
                            {t}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Sender&apos;s bank</label>
                      <input
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        placeholder="e.g. ICICI Bank"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Sender a/c last 4 digits</label>
                      <input
                        value={senderLast4}
                        onChange={(e) => setSenderLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        placeholder="XXXX"
                        className={fieldClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Credited to <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        value={creditedTo}
                        onChange={(e) => setCreditedTo(e.target.value)}
                        className={fieldClass}
                      >
                        {BANK_ACCOUNTS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {mode === "Cheque / DD" && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Date on cheque <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="date"
                        value={chqDate}
                        onChange={(e) => setChqDate(e.target.value)}
                        className={fieldClass}
                      />
                      {postDated ? (
                        <p className="text-[12px] mt-1.5 text-[#B45309]">
                          Post-dated — can&apos;t be deposited before this date
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Bank name <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        value={chqBank}
                        onChange={(e) => setChqBank(e.target.value)}
                        placeholder="e.g. Kotak Mahindra Bank"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Branch</label>
                      <input
                        value={chqBranch}
                        onChange={(e) => setChqBranch(e.target.value)}
                        placeholder="e.g. Andheri West"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Deposited on</label>
                      <input
                        type="date"
                        value={depositedOn}
                        onChange={(e) => setDepositedOn(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Deposited to</label>
                      <select
                        value={depositedTo}
                        onChange={(e) => setDepositedTo(e.target.value)}
                        className={fieldClass}
                      >
                        {DEPOSIT_ACCOUNTS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Clearance status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CHQ_STATUSES.map((s) => (
                          <Chip key={s} active={chqStatus === s} onClick={() => setChqStatus(s)}>
                            {s}
                          </Chip>
                        ))}
                      </div>
                      <p className="text-[12px] mt-1.5 text-[#6B7280]">{CHQ_HINTS[chqStatus]}</p>
                    </div>
                    {chqStatus === "Bounced" && (
                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          Bounce reason <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                          value={bounceReason}
                          onChange={(e) => setBounceReason(e.target.value)}
                          className={fieldClass}
                        >
                          {BOUNCE_REASONS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {mode === "Cash" && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Received by <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        className={fieldClass}
                      >
                        {RECEIVED_BY.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Collected at</label>
                      <select
                        value={collectedAt}
                        onChange={(e) => setCollectedAt(e.target.value)}
                        className={fieldClass}
                      >
                        {BRANCHES.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Denominations <span className="text-[#DC2626]">*</span>
                      </label>
                      <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-white">
                        <div className="grid grid-cols-[1fr_96px_1fr] gap-2.5 px-3 py-2 bg-[#F9FAFB] border-b border-[#EEF1F4] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                          <span>Note</span>
                          <span>Count</span>
                          <span className="text-right">Amount</span>
                        </div>
                        {DENOM_VALUES.map((v) => (
                          <div
                            key={v}
                            className="grid grid-cols-[1fr_96px_1fr] gap-2.5 items-center px-3 py-1.5 border-b border-[#F3F4F6]"
                          >
                            <span className="text-[13px] font-semibold tabular-nums">
                              {DENOM_LABELS[v]}
                            </span>
                            <input
                              inputMode="numeric"
                              value={denoms[v]}
                              placeholder="0"
                              onChange={(e) =>
                                setDenoms((prev) => ({
                                  ...prev,
                                  [v]: e.target.value.replace(/\D/g, ""),
                                }))
                              }
                              className="w-full h-8 px-2.5 border border-[#E5E7EB] rounded-lg text-[13px] tabular-nums outline-none focus:border-[#7A0A17]"
                            />
                            <span className="text-[13px] text-right text-[#374151] tabular-nums">
                              {fmtInr(v * (parseInt(denoms[v], 10) || 0))}
                            </span>
                          </div>
                        ))}
                        <div className="grid grid-cols-[1fr_auto] gap-2.5 items-center px-3 py-2.5 bg-[#F9FAFB]">
                          <span
                            className={`text-[12px] font-semibold ${
                              denomDiff === 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                            }`}
                          >
                            {denomDiff === 0
                              ? "Matches amount received"
                              : denomDiff > 0
                                ? `Short by ${fmtInr(denomDiff)}`
                                : `Excess of ${fmtInr(-denomDiff)}`}
                          </span>
                          <span className="text-[14px] font-semibold tabular-nums">
                            Total {fmtInr(denomTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {needPan && (
                      <div>
                        <label className={labelClass}>
                          Payer PAN <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          value={payerPan}
                          onChange={(e) => setPayerPan(e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          className={`${fieldClass} uppercase`}
                        />
                        <p className="text-[12px] mt-1.5 text-[#B45309]">
                          Required for cash of ₹2,00,000 or more
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Paid by */}
            <div className="grid gap-3">
              <div>
                <label className={labelClass}>Paid by</label>
                <div className="flex gap-2">
                  <Chip
                    active={!byThird}
                    onClick={() => {
                      setByThird(false);
                      setPayerName(clientName || "");
                    }}
                  >
                    Client
                  </Chip>
                  <Chip
                    active={byThird}
                    onClick={() => {
                      setByThird(true);
                      setPayerName("");
                    }}
                  >
                    Someone else
                  </Chip>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Payer name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Full name"
                    className={fieldClass}
                  />
                </div>
                {byThird && (
                  <div>
                    <label className={labelClass}>
                      Relation to client <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className={fieldClass}
                    >
                      {RELATIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Anything Accounts should know"
                className="w-full min-h-[64px] px-3 py-2.5 border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111] bg-white resize-y outline-none focus:border-[#7A0A17] focus:shadow-[0_0_0_3px_rgba(122,10,23,0.08)]"
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
