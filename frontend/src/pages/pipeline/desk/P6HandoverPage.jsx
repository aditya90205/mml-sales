import { useMemo, useState } from "react";
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
  StepLabel,
  Td,
} from "../../../components/pipeline/deskUi";

const INITIAL_SECTIONS = [
  {
    n: 1,
    heading: "Identity & verification documents",
    items: [
      { title: "Aadhaar card", note: "Auto-verified via KYC API on 29 Jun.", status: "Verified", tone: "green", done: true },
      { title: "PAN card", note: "Auto-verified via KYC API on 29 Jun.", status: "Verified", tone: "green", done: true },
      { title: "Parent Aadhaar & PAN", note: "Father's documents received, mother's PAN missing.", status: "Pending", tone: "amber", done: false },
      { title: "Police verification", note: "Third-party request raised 24 Jul.", status: "In progress", tone: "blue", done: false },
    ],
  },
  {
    n: 2,
    heading: "In-person verified data — the MML USP",
    items: [
      { title: "House / GPS photo", note: "Captured at home visit, 02 Jul · GPS ±8m.", status: "Verified", tone: "green", done: true },
      { title: "Selfie with client", note: "Captured at home visit, 02 Jul.", status: "Verified", tone: "green", done: true },
      { title: "Staff activity form", note: "Completed by Rohit Khanna after the visit.", status: "Verified", tone: "green", done: true },
      { title: "Advance booking call log", note: "Logged 01 Jul, 6:14 PM.", status: "Verified", tone: "green", done: true },
    ],
  },
  {
    n: 3,
    heading: "Profile & data completeness",
    items: [
      { title: "Bio-data complete", note: "All mandatory fields filled.", status: "Verified", tone: "green", done: true },
      { title: "Photos & video", note: "Verified. Reshoot flagged by executive.", status: "Verified", tone: "green", done: true },
      { title: "Candidate preferences", note: "Profession, city and community locked.", status: "Verified", tone: "green", done: true },
      { title: "Parent preferences", note: "Questionnaire completed 14 Jul.", status: "Verified", tone: "green", done: true },
      { title: "Kundli / horoscope", note: "Uploaded and attached to the profile.", status: "Verified", tone: "green", done: true },
    ],
  },
  {
    n: 4,
    heading: "Commercial & consent",
    items: [
      { title: "Payment cleared in full", note: "₹18,100 balance outstanding.", status: "Pending", tone: "amber", done: false },
      { title: "Contract signed with OTP", note: "Signed 29 Jun, 6:18 PM.", status: "Verified", tone: "green", done: true },
      { title: "Client self-approval of visibility", note: "Client confirmed what may be shown to matches.", status: "Verified", tone: "green", done: true },
    ],
  },
];

const QUEUE = [
  { deal: "MML-D-10428", client: "Sanjay Mehta", pkg: "Premium", verified: "13/16", verifiedPct: 81, blocking: "Balance payment", owner: "Rohit Khanna", status: "Blocked", tone: "red", bar: "#E8395B" },
  { deal: "MML-D-10412", client: "Shalini Kapoor", pkg: "Exclusive Privé", verified: "15/16", verifiedPct: 94, blocking: "Police verification", owner: "Pooja Sharma", status: "Exception raised", tone: "amber", bar: "#F59E0B" },
  { deal: "MML-D-10388", client: "Aditya Verma", pkg: "Signature", verified: "16/16", verifiedPct: 100, blocking: "—", owner: "Nikhil Bansal", status: "Ready for RM", tone: "green", bar: "#16A34A" },
];

const COLUMNS = [
  { label: "Deal", key: "deal" },
  { label: "Client", key: "client" },
  { label: "Package", key: "pkg" },
  { label: "Verified", key: "verified" },
  { label: "Blocking item", key: "blocking" },
  { label: "Owner", key: "owner" },
  { label: "Status", key: "status" },
];

function VerifiedCell({ pct, label, color }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11.5px] font-semibold text-[#4B5563]">{label}</span>
    </div>
  );
}

export default function P6HandoverPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [sortMode, setSortMode] = useState("blocked");
  const [period, setPeriod] = useState("month");

  const allItems = sections.flatMap((s) => s.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const totalCount = allItems.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleItem = (title) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.title !== title) return item;
          const done = !item.done;
          return {
            ...item,
            done,
            status: done ? "Verified" : "Pending",
            tone: done ? "green" : "amber",
          };
        }),
      }))
    );
  };

  const verifyAll = () => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          done: true,
          status: "Verified",
          tone: "green",
        })),
      }))
    );
    toast.success("All documents marked verified.");
  };

  const rows = useMemo(() => {
    const list = [...QUEUE];
    if (sortMode === "blocked") list.sort((a, b) => a.verifiedPct - b.verifiedPct);
    else list.sort((a, b) => b.verifiedPct - a.verifiedPct);
    return list;
  }, [sortMode]);
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "deal" });

  return (
    <DeskPage
      title="P6 Handover Checklist"
      actions={
        <>
          <OutlineButton onClick={() => toast.info("Checklist template downloaded.")}>Checklist template</OutlineButton>
          <PrimaryButton onClick={verifyAll}>Verify all documents</PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="P6 Handover Checklist — Sanjay Mehta"
        subtitle="Service assignment stays blocked until every item is verified."
        action={<ProgressMeter label={`${doneCount} / ${totalCount} verified`} percent={percent} color={percent === 100 ? "#16A34A" : "#E8395B"} />}
      >
        {sections.map((section, si) => (
          <div key={section.heading} className={si > 0 ? "mt-5" : ""}>
            <StepLabel n={section.n}>{section.heading}</StepLabel>
            {section.items.map((item) => (
              <CheckRow
                key={item.title}
                {...item}
                onToggle={() => toggleItem(item.title)}
              />
            ))}
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Handover queue"
        subtitle="Your deals at P6"
        action={
          <>
            <FilterSelect
              value={sortMode}
              onChange={setSortMode}
              options={[
                { value: "blocked", label: "Blocked first" },
                { value: "ready", label: "Ready first" },
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
        footnote="A founder exception can release a deal to Service with items outstanding. Every exception is logged in the audit trail."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row) => (
            <tr key={row.deal} className="border-b border-black/5 last:border-0">
              <Td>{row.deal}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.pkg}</Td>
              <td className="px-3 py-3 whitespace-nowrap">
                <VerifiedCell pct={row.verifiedPct} label={row.verified} color={row.bar} />
              </td>
              <Td>{row.blocking}</Td>
              <Td>{row.owner}</Td>
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
