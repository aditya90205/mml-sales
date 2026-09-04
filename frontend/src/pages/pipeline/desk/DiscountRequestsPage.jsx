import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  DeskPage,
  DeskTable,
  FIELD,
  Field,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  ProgressMeter,
  SectionCard,
  StepLabel,
  Td,
} from "../../../components/pipeline/deskUi";

const REQUESTS = [
  { raised: "26 Jul", deal: "MML-D-10428", client: "Sanjay Mehta", list: "₹51,000", requested: "₹43,500", discount: "14.7%", discountTone: "amber", approver: "Pooja Sharma", status: "Pending", tone: "amber" },
  { raised: "18 Jul", deal: "MML-D-10412", client: "Shalini Kapoor", list: "₹25,000", requested: "₹22,500", discount: "10%", discountTone: "green", approver: "Vinay Gupta", status: "Approved", tone: "green" },
  { raised: "04 Jul", deal: "MML-D-10388", client: "Aditya Verma", list: "₹1,25,000", requested: "₹95,000", discount: "24%", discountTone: "red", approver: "Founder desk", status: "Rejected", tone: "red" },
];

const COLUMNS = [
  { label: "Raised", key: "raised" },
  { label: "Deal", key: "deal" },
  { label: "Client", key: "client" },
  { label: "List", key: "list" },
  { label: "Requested", key: "requested" },
  { label: "Discount", key: "discount" },
  { label: "Approver", key: "approver" },
  { label: "Status", key: "status" },
];

const JUSTIFICATION =
  "Client compared Premium at Rajouri and is holding on ₹43,500. Family will close this week if we match that figure. List is the same across branches — this is price resistance, not an off-catalogue quote.";

export default function DiscountRequestsPage() {
  const [listPrice] = useState("₹51,000");
  const [requested, setRequested] = useState("₹43,500");
  const [reason, setReason] = useState("Price resistance");
  const [competitor, setCompetitor] = useState("Rajouri branch — ₹51,000");
  const [confidence, setConfidence] = useState("High — closing this week");
  const [justification, setJustification] = useState(JUSTIFICATION);
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("quarter");

  const rows = useMemo(
    () => REQUESTS.filter((r) => status === "all" || r.status === status),
    [status]
  );
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "raised" });

  const handleSubmit = () => {
    if (!justification.trim()) {
      toast.error("Add a justification for the approver.");
      return;
    }
    toast.success("Discount request submitted to Branch Head.");
  };

  return (
    <DeskPage
      title="Discount Requests"
      actions={
        <>
          <OutlineButton onClick={() => toast.info("Up to 10% Team Lead · 10–20% Branch Head · above 20% Founder.")}>
            Authority matrix
          </OutlineButton>
          <PrimaryButton onClick={handleSubmit}>New request</PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="New discount request"
        meta="MML-D-10428 · Sanjay Mehta · Premium"
        action={<ProgressMeter label="Ready to submit" percent={92} color="#16A34A" />}
      >
        <StepLabel n={1}>Pricing</StepLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="List price" required>
            <input value={listPrice} readOnly className={`${FIELD} bg-[#FAFAFB]`} />
          </Field>
          <Field label="Requested price" required>
            <input value={requested} onChange={(e) => setRequested(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Discount" required>
            <input value="14.7% — ₹7,500" readOnly className={`${FIELD} bg-[#FAFAFB]`} />
          </Field>
          <Field label="Reason" required>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={FIELD}>
              <option>Price resistance</option>
              <option>Competitor quote</option>
              <option>Referral / relationship</option>
              <option>Package downgrade risk</option>
            </select>
          </Field>
          <Field label="Competitor / branch quoted" required>
            <input value={competitor} onChange={(e) => setCompetitor(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Closure confidence" required>
            <select value={confidence} onChange={(e) => setConfidence(e.target.value)} className={FIELD}>
              <option>High — closing this week</option>
              <option>Medium — this month</option>
              <option>Low — still exploring</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Justification for approver" required>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              className={`${FIELD} h-auto py-2.5 resize-y`}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="My requests"
        subtitle="Raised in the last 60 days"
        action={
          <>
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Status: All" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "quarter", label: "This quarter" },
                { value: "month", label: "This month" },
              ]}
            />
          </>
        }
        footnote="Up to 10% — Team Lead · 10–20% — Branch Head · above 20% — Founder. Authority sits with the level, never the individual."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row) => (
            <tr key={row.deal} className="border-b border-black/5 last:border-0">
              <Td muted>{row.raised}</Td>
              <Td>{row.deal}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.list}</Td>
              <Td>{row.requested}</Td>
              <Td>
                <StatusPill tone={row.discountTone}>{row.discount}</StatusPill>
              </Td>
              <Td>{row.approver}</Td>
              <Td>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>
    </DeskPage>
  );
}
