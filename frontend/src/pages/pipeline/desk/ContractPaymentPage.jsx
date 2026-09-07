import { useMemo, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  CheckRow,
  DeskPage,
  DeskTable,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  ProgressMeter,
  SectionCard,
  Td,
  TimelineItem,
} from "../../../components/pipeline/deskUi";
import fileIcon from "../../../assets/file.png";

const CONSENTS = [
  { title: "Data privacy notification", note: "Accepted by the client on 29 Jun, 4:02 PM. Copy filed to the deal.", status: "Accepted", tone: "green", done: true },
  { title: "Profile sharing consent", note: "Client allowed photo and basic details to be shown to matches.", status: "Accepted", tone: "green", done: true },
  { title: "Marketing consent", note: "Opted in to WhatsApp and email · opted out of SMS.", status: "Partial", tone: "blue", done: false, pending: true },
];

const PAYMENTS = [
  {
    date: "29 Jun 2026",
    mode: "UPI",
    reference: "MML-R-88213",
    amount: "₹15,000",
    collectedBy: "Payment link",
    status: "Received",
    tone: "green",
    invoice: { name: "Invoice-MML-R-88213.pdf", shared: true, sharedNote: "Sent by Rohit K. · 29 Jun, 4:18 PM" },
  },
  {
    date: "12 Jul 2026",
    mode: "Cheque",
    reference: "MML-R-88407",
    amount: "₹20,000",
    collectedBy: "Rohit Khanna",
    status: "Cleared",
    tone: "green",
    invoice: { name: "Invoice-MML-R-88407.pdf", shared: true, sharedNote: "Shared on WhatsApp · 12 Jul, 11:05 AM" },
  },
  {
    date: "Due 02 Aug",
    mode: "Payment link",
    reference: "MML-R-88512",
    amount: "₹18,100",
    collectedBy: "—",
    status: "Awaiting",
    tone: "amber",
    invoice: { name: "Invoice-MML-R-88512.pdf", shared: false, sharedNote: "Not shared yet" },
  },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Mode", key: "mode" },
  { label: "Reference", key: "reference" },
  { label: "Amount", key: "amount" },
  { label: "Collected by", key: "collectedBy" },
  { label: "Status", key: "status" },
  { label: "Invoice", key: "invoice", unsortable: true },
];

const CONTRACT_TIMELINE = [
  { tone: "gray", title: "Handwritten annexure — OCR pending", note: "Scanned page uploaded. AI extraction queued for RM validation. 2 pages.", time: "Queued — 2 pages" },
  { tone: "green", title: "OTP verified & signed", note: "OTP sent to +91 98•• •• 4412. Verified from IP 49.36.xx.xx.", time: "29 Jun 2026, 6:18 PM — client" },
  { tone: "green", title: "Sent to client by email + app", note: "Delivered to sanjay.mehta@email.com. Signed copy auto-filed to admin.", time: "29 Jun 2026, 5:41 PM — system" },
  { tone: "green", title: "Contract generated from quote v2", note: "Premium package — ₹53,100 after approved discount and GST.", time: "29 Jun 2026, 5:40 PM — you" },
];

function InvoiceCell({ invoice, onShared }) {
  if (!invoice) return <span className="text-[#9CA3AF]">—</span>;

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <div className="inline-flex items-center gap-1.5 min-w-0">
        <img src={fileIcon} alt="" className="size-4 shrink-0 object-contain" />
        <span className="text-[12px] font-semibold text-[#111] truncate" title={invoice.name}>
          {invoice.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => toast.success(`Downloading ${invoice.name}...`)}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-black/10 text-[11px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          title="Download invoice PDF"
        >
          <Download size={12} />
          Download
        </button>
        <button
          type="button"
          onClick={() => {
            onShared?.(invoice.name);
            toast.success(invoice.shared ? `${invoice.name} re-shared with client.` : `${invoice.name} sent & shared with client.`);
          }}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-[#7A0A17]/25 text-[11px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
          title="Send & share invoice PDF"
        >
          <Share2 size={12} />
          {invoice.shared ? "Reshare" : "Send"}
        </button>
      </div>
      <p className={`text-[10px] ${invoice.shared ? "text-[#16A34A]" : "text-[#9CA3AF]"}`}>
        {invoice.sharedNote}
      </p>
    </div>
  );
}

export default function ContractPaymentPage() {
  const [dealFilter, setDealFilter] = useState("deal");
  const [modeFilter, setModeFilter] = useState("all");
  const [consents, setConsents] = useState(CONSENTS);
  const [payments, setPayments] = useState(PAYMENTS);

  const consentDone = consents.filter((i) => i.done).length;
  const consentTotal = consents.length;

  const toggleConsent = (title) => {
    setConsents((prev) =>
      prev.map((item) => {
        if (item.title !== title) return item;
        const done = !item.done;
        return { ...item, done, status: done ? "Accepted" : "Pending", tone: done ? "green" : "amber" };
      })
    );
  };

  const markInvoiceShared = (fileName) => {
    setPayments((prev) =>
      prev.map((row) =>
        row.invoice?.name === fileName
          ? {
              ...row,
              invoice: {
                ...row.invoice,
                shared: true,
                sharedNote: "Sent & shared by sales · just now",
              },
            }
          : row
      )
    );
  };

  const rows = useMemo(
    () => payments.filter((r) => modeFilter === "all" || r.mode === modeFilter),
    [modeFilter, payments]
  );
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "date" });

  return (
    <DeskPage
      title="Contract, E-Signature & Payment"
      actions={
        <>
          <OutlineButton onClick={() => toast.success("Downloading consolidated invoice PDF...")}>
            <img src={fileIcon} alt="" className="size-3.5 object-contain" />
            Invoice PDF
          </OutlineButton>
          <OutlineButton onClick={() => toast.info("Opening payment history...")}>Payment history</OutlineButton>
          <PrimaryButton onClick={() => toast.info("P6 stays locked until the ₹18,100 balance clears.")}>
            Advance to P6
          </PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="Consent & compliance"
        subtitle="Mandatory before any data is processed (BRD 3.6)"
        action={<ProgressMeter label={`${consentDone} of ${consentTotal}`} percent={consentTotal ? (consentDone / consentTotal) * 100 : 0} color={consentDone === consentTotal ? "#16A34A" : "#F59E0B"} />}
      >
        {consents.map((item) => (
          <CheckRow key={item.title} {...item} onToggle={() => toggleConsent(item.title)} />
        ))}
      </SectionCard>

      <SectionCard
        title="Payments"
        subtitle="Part payment is allowed. P6 cannot open until the balance clears. Invoice PDFs can be downloaded or sent & shared by sales."
        action={
          <>
            <FilterSelect
              value={dealFilter}
              onChange={setDealFilter}
              options={[
                { value: "deal", label: "This deal" },
                { value: "all", label: "All deals" },
              ]}
            />
            <FilterSelect
              value={modeFilter}
              onChange={setModeFilter}
              options={[
                { value: "all", label: "All modes" },
                { value: "UPI", label: "UPI" },
                { value: "Cheque", label: "Cheque" },
                { value: "Payment link", label: "Payment link" },
              ]}
            />
          </>
        }
        footnote="₹53,100 total including 18% GST · ₹35,000 collected · ₹18,100 outstanding · maker-checker cleared by Accounts."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row) => (
            <tr key={row.reference} className="border-b border-black/5 last:border-0">
              <Td muted>{row.date}</Td>
              <Td strong>{row.mode}</Td>
              <Td>{row.reference}</Td>
              <Td>{row.amount}</Td>
              <Td>{row.collectedBy}</Td>
              <Td>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </Td>
              <Td>
                <InvoiceCell invoice={row.invoice} onShared={markInvoiceShared} />
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>

      <SectionCard
        title="Contract & e-signature"
        subtitle="Sanjay Mehta · MML-D-10428 · signed copy filed to the admin dashboard (BRD 3.5)"
        divided
      >
        {CONTRACT_TIMELINE.map((item, i) => (
          <TimelineItem key={item.title} {...item} last={i === CONTRACT_TIMELINE.length - 1} />
        ))}
      </SectionCard>
    </DeskPage>
  );
}
