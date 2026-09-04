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
  TimelineItem,
} from "../../../components/pipeline/deskUi";

const QUOTES = [
  { quote: "MML-Q-2211 v2", client: "Sanjay Mehta", pkg: "Premium", list: "₹51,000", quoted: "₹43,500", discount: "14.7%", valid: "05 Aug", status: "Awaiting approval", tone: "amber" },
  { quote: "MML-Q-2188 v1", client: "Shalini Kapoor", pkg: "Classic", list: "₹25,000", quoted: "₹25,000", discount: "0%", valid: "12 Aug", status: "Sent", tone: "blue" },
  { quote: "MML-Q-2140 v3", client: "Aditya Verma", pkg: "Exclusive", list: "₹1,25,000", quoted: "₹1,25,000", discount: "0%", valid: "28 Jul", status: "Accepted", tone: "green" },
  { quote: "MML-Q-2094 v1", client: "Priya Raheja", pkg: "Premium", list: "₹51,000", quoted: "₹51,000", discount: "0%", valid: "18 Jul", status: "Expired", tone: "red" },
];

const COLUMNS = [
  { label: "Quote", key: "quote" },
  { label: "Client", key: "client" },
  { label: "Package", key: "pkg" },
  { label: "List price", key: "list" },
  { label: "Quoted", key: "quoted" },
  { label: "Discount", key: "discount" },
  { label: "Valid till", key: "valid" },
  { label: "Status", key: "status" },
];

const HISTORY = [
  { tone: "amber", title: "v2 held for discount approval", note: "Quoted ₹43,500 against list ₹51,000. Document locked until Branch Head signs the 14.7% request.", time: "26 Jul 2026, 5:04 PM — system" },
  { tone: "red", title: "Client cited Rajouri branch price", note: "Same Premium list was quoted at Rajouri. Cross-branch flag raised; quote cannot undercut catalogue.", time: "26 Jul 2026, 4:51 PM — you" },
  { tone: "green", title: "v1 sent to client", note: "Premium package at list ₹51,000. Valid till 05 Aug. PDF filed to the deal.", time: "22 Jul 2026, 11:18 AM — you" },
];

export default function QuotationsPage() {
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("month");

  const rows = useMemo(
    () => QUOTES.filter((r) => status === "all" || r.status === status),
    [status]
  );
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "quote" });

  return (
    <DeskPage
      title="Quotations & Proposals"
      actions={
        <>
          <OutlineButton onClick={() => toast.info("Generating PDF preview...")}>Preview PDF</OutlineButton>
          <PrimaryButton onClick={() => toast.info("Quote is held until the matching discount is approved.")}>
            Send to client
          </PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="Quotations"
        subtitle="List price is catalogue. Anything below list waits on an approved discount request."
        action={
          <>
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Status: All" },
                { value: "Awaiting approval", label: "Awaiting approval" },
                { value: "Sent", label: "Sent" },
                { value: "Accepted", label: "Accepted" },
                { value: "Expired", label: "Expired" },
              ]}
            />
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "month", label: "This month" },
                { value: "quarter", label: "This quarter" },
              ]}
            />
          </>
        }
        footnote="A quote below list price cannot be sent until the matching discount request is approved."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row) => (
            <tr key={row.quote} className="border-b border-black/5 last:border-0">
              <Td strong>{row.quote}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.pkg}</Td>
              <Td>{row.list}</Td>
              <Td>{row.quoted}</Td>
              <Td>{row.discount}</Td>
              <Td muted>{row.valid}</Td>
              <Td>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>

      <SectionCard title="MML-Q-2211 — history" subtitle="Sanjay Mehta · Premium">
        {HISTORY.map((item, i) => (
          <TimelineItem key={item.title} {...item} last={i === HISTORY.length - 1} />
        ))}
      </SectionCard>
    </DeskPage>
  );
}
