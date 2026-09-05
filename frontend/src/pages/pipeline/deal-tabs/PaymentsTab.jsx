import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  CheckRow,
  DeskTable,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  ProgressMeter,
  SectionCard,
  Td,
  TimelineItem,
} from "../../../components/pipeline/deskUi";
import { dashRow, dashRows } from "./stageContent.jsx";

const CONSENTS = [
  { title: "Data privacy notification", note: "Accepted by the client on 29 Jun, 4:02 PM. Copy filed to the deal.", status: "Accepted", tone: "green", done: true },
  { title: "Profile sharing consent", note: "Client allowed photo and basic details to be shown to matches.", status: "Accepted", tone: "green", done: true },
  { title: "Marketing consent", note: "Opted in to WhatsApp and email · opted out of SMS.", status: "Partial", tone: "blue", done: false, pending: true },
];

const PAYMENTS = [
  { date: "29 Jun 2026", mode: "UPI", reference: "MML-R-88213", amount: "₹15,000", collectedBy: "Payment link", status: "Received", tone: "green" },
  { date: "12 Jul 2026", mode: "Cheque", reference: "MML-R-88407", amount: "₹20,000", collectedBy: "Rohit Khanna", status: "Cleared", tone: "green" },
  { date: "Due 02 Aug", mode: "Payment link", reference: "MML-R-88512", amount: "₹18,100", collectedBy: "—", status: "Awaiting", tone: "amber" },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Mode", key: "mode" },
  { label: "Reference", key: "reference" },
  { label: "Amount", key: "amount" },
  { label: "Collected by", key: "collectedBy" },
  { label: "Status", key: "status" },
];

const CONTRACT_TIMELINE = [
  { tone: "gray", title: "Handwritten annexure — OCR pending", note: "Scanned page uploaded. AI extraction queued for RM validation. 2 pages.", time: "Queued — 2 pages" },
  { tone: "green", title: "OTP verified & signed", note: "OTP sent to +91 98•• •• 4412. Verified from IP 49.36.xx.xx.", time: "29 Jun 2026, 6:18 PM — client" },
  { tone: "green", title: "Sent to client by email + app", note: "Delivered to sanjay.mehta@email.com. Signed copy auto-filed to admin.", time: "29 Jun 2026, 5:41 PM — system" },
  { tone: "green", title: "Contract generated from quote v2", note: "Premium package — ₹53,100 after approved discount and GST.", time: "29 Jun 2026, 5:40 PM — you" },
];

/** Same design and data as the standalone "Contract, E-Signature & Payment" page. */
export default function PaymentsTab({ locked = true, empty = false }) {
  const [dealFilter, setDealFilter] = useState("deal");
  const [modeFilter, setModeFilter] = useState("all");
  const [consents, setConsents] = useState(CONSENTS);

  const consentItems = empty ? consents.map((item) => dashRow({ ...item, done: false, tone: "gray" }, ["title", "note"])) : consents;
  const consentDone = consentItems.filter((i) => i.done).length;
  const consentTotal = consentItems.length;

  const toggleConsent = (title) => {
    if (empty) return;
    setConsents((prev) =>
      prev.map((item) => {
        if (item.title !== title) return item;
        const done = !item.done;
        return { ...item, done, status: done ? "Accepted" : "Pending", tone: done ? "green" : "amber" };
      })
    );
  };

  const rows = useMemo(
    () => PAYMENTS.filter((r) => modeFilter === "all" || r.mode === modeFilter),
    [modeFilter]
  );
  const { sorted, sort, toggle } = useTableSort(dashRows(rows, empty, ["mode"]), { defaultKey: "date" });
  const timeline = empty ? CONTRACT_TIMELINE.map((item) => dashRow({ ...item, tone: "gray" }, ["title"])) : CONTRACT_TIMELINE;

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-[16px] font-bold text-[#111]">Contract, E-Signature & Payment</h2>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={() => toast.info("Opening payment history...")}>Payment history</OutlineButton>
          <PrimaryButton onClick={() => toast.info("P6 stays locked until the ₹18,100 balance clears.")}>
            Advance to P6
          </PrimaryButton>
        </div>
      </div>

      <SectionCard
        title="Consent & compliance"
        subtitle="Mandatory before any data is processed (BRD 3.6)"
        action={<ProgressMeter label={`${consentDone} of ${consentTotal}`} percent={consentTotal ? (consentDone / consentTotal) * 100 : 0} color={consentDone === consentTotal ? "#16A34A" : "#F59E0B"} />}
      >
        {consentItems.map((item, i) => (
          <CheckRow key={`${item.title}-${i}`} {...item} onToggle={() => toggleConsent(item.title)} />
        ))}
      </SectionCard>

      <SectionCard
        title="Payments"
        subtitle="Part payment is allowed. P6 cannot open until the balance clears."
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
          {sorted.map((row, i) => (
            <tr key={`${row.reference}-${i}`} className="border-b border-black/5 last:border-0">
              <Td muted>{row.date}</Td>
              <Td strong>{row.mode}</Td>
              <Td>{row.reference}</Td>
              <Td>{row.amount}</Td>
              <Td>{row.collectedBy}</Td>
              <Td>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
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
        {timeline.map((item, i) => (
          <TimelineItem key={`${item.title}-${i}`} {...item} last={i === timeline.length - 1} />
        ))}
      </SectionCard>
    </div>
  );

  if (locked) {
    return (
      <LockedTabOverlay title="Payment is locked." message="This screen will open at P5 stage.">
        {content}
      </LockedTabOverlay>
    );
  }
  return content;
}
