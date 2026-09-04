import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  DeskPage,
  DeskTable,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  SectionCard,
  Td,
} from "../../../components/pipeline/deskUi";

const FLAGS = [
  { raised: "26 Jul", deal: "MML-D-10428", client: "Sanjay Mehta", ourBranch: "South Ex", quotedBranch: "Rajouri", pkg: "Premium", gap: "₹0 — same list", gapTone: "green", status: "Discount raised", statusTone: "amber" },
  { raised: "18 Jul", deal: "MML-D-10412", client: "Shalini Kapoor", ourBranch: "South Ex", quotedBranch: "GK-2", pkg: "Classic", gap: "₹3,000 lower", gapTone: "red", status: "Under review", statusTone: "amber" },
  { raised: "09 Jul", deal: "MML-D-10388", client: "Aditya Verma", ourBranch: "South Ex", quotedBranch: "Rajouri", pkg: "Exclusive", gap: "₹0 — same list", gapTone: "green", status: "Closed — explained", statusTone: "green" },
  { raised: "02 Jul", deal: "MML-D-10361", client: "Priya Raheja", ourBranch: "Jalandhar", quotedBranch: "South Ex", pkg: "Premium", gap: "₹5,000 lower", gapTone: "red", status: "Under review", statusTone: "amber" },
];

const COLUMNS = [
  { label: "Raised", key: "raised" },
  { label: "Deal", key: "deal" },
  { label: "Client", key: "client" },
  { label: "Our branch", key: "ourBranch" },
  { label: "Quoted branch", key: "quotedBranch" },
  { label: "Package", key: "pkg" },
  { label: "Gap", key: "gap" },
  { label: "Status", key: "status" },
];

export default function CrossBranchFlagsPage() {
  const [period, setPeriod] = useState("quarter");
  const [branch, setBranch] = useState("all");

  const rows = useMemo(
    () => FLAGS.filter((r) => branch === "all" || r.quotedBranch === branch || r.ourBranch === branch),
    [branch]
  );
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "raised" });

  return (
    <DeskPage
      title="Cross-Branch Price Enquiry Flags"
      actions={
        <>
          <OutlineButton onClick={() => toast.info("Flags exported.")}>Export</OutlineButton>
          <PrimaryButton onClick={() => toast.success("Escalated to Sales Head.")}>Escalate to Sales Head</PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="Cross-branch price enquiry flags"
        subtitle="Raised automatically when a client cites another branch's price."
        action={
          <>
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "quarter", label: "This quarter" },
                { value: "month", label: "This month" },
              ]}
            />
            <FilterSelect
              value={branch}
              onChange={setBranch}
              options={[
                { value: "all", label: "Branch: All" },
                { value: "South Ex", label: "South Ex" },
                { value: "Rajouri", label: "Rajouri" },
                { value: "GK-2", label: "GK-2" },
                { value: "Jalandhar", label: "Jalandhar" },
              ]}
            />
          </>
        }
        footnote="A non-zero gap means a branch has quoted off-catalogue. Those cases route to the Sales Head, not to a discount request."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row) => (
            <tr key={row.deal} className="border-b border-black/5 last:border-0">
              <Td muted>{row.raised}</Td>
              <Td>{row.deal}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.ourBranch}</Td>
              <Td>{row.quotedBranch}</Td>
              <Td>{row.pkg}</Td>
              <Td>
                <StatusPill tone={row.gapTone}>{row.gap}</StatusPill>
              </Td>
              <Td>
                <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>
    </DeskPage>
  );
}
