import { useState } from "react";
import { toast } from "react-toastify";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";

const MISSING_SECTIONS = [
  { section: "1 · Who is the client",           fields: 6, filled: "-", status: "-" },
  { section: "2 · Family background",           fields: 4, filled: "-", status: "-" },
  { section: "3 · Profession & income",         fields: 3, filled: "-", status: "-" },
  { section: "4 · Area of house & lifestyle",   fields: 3, filled: "-", status: "-" },
  { section: "5 · Package interest",            fields: 2, filled: "-", status: "-" },
];

const COMPLETE_SECTIONS = [
  { section: "1 · Who is the client",           fields: 6, filled: 6, status: "Complete" },
  { section: "2 · Family background",           fields: 4, filled: 4, status: "Complete" },
  { section: "3 · Profession & income",         fields: 3, filled: 3, status: "Complete" },
  { section: "4 · Area of house & lifestyle",   fields: 3, filled: 3, status: "Complete" },
  { section: "5 · Package interest",            fields: 2, filled: 2, status: "Complete" },
];

const COLUMNS = [
  { label: "Section", key: "section" },
  { label: "Fields", key: "fields" },
  { label: "Filled", key: "filled" },
  { label: "Status", key: "status" },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

export default function IntakeFormTab({ empty = false }) {
  const [sections, setSections] = useState(empty ? MISSING_SECTIONS : COMPLETE_SECTIONS);
  const { sorted, sort, toggle } = useTableSort(sections, { defaultKey: "section" });
  const [open, setOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("");
  const [packageInterest, setPackageInterest] = useState("Premium");

  const handleSave = (e) => {
    e.preventDefault();
    if (!profession.trim()) {
      toast.error("Please fill profession.");
      return;
    }
    setSections((prev) =>
      prev.map((row) =>
        row.section.startsWith("3")
          ? { ...row, filled: row.fields, status: "Complete" }
          : row
      )
    );
    toast.success("Intake form saved.");
    setOpen(false);
  };

  return (
    <>
      <TableCard
        title="Client Intake Form"
        subtitle="Standardised across branches · locks P1 until complete"
        action={<TabHeaderButton onClick={() => setOpen(true)}>Open full form</TabHeaderButton>}
        columns={COLUMNS}
        sort={sort}
        onSort={toggle}
        footnote={empty ? "0 of 14 mandatory fields filled. P1 remains locked until all sections show Complete" : "14 of 14 mandatory fields filled."}
      >
        {sorted.map((row) => (
          <tr key={row.section} className="border-b border-black/5 last:border-0">
            <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.section}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.fields}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.filled}</td>
            <td className="px-3 py-2.5 whitespace-nowrap">
              {row.status === "-" ? (
                <span className="text-[12px] text-[#9CA3AF]">-</span>
              ) : (
                <StatusPill tone={row.status === "Complete" ? "green" : "amber"}>{row.status}</StatusPill>
              )}
            </td>
          </tr>
        ))}
      </TableCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Client Intake Form"
        subtitle="Complete missing fields to unlock P1"
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
              form="intake-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save form
            </button>
          </>
        }
      >
        <form id="intake-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Profession</label>
            <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Software engineer" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Family income band</label>
            <input value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 25–40 LPA" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Package interest</label>
            <select value={packageInterest} onChange={(e) => setPackageInterest(e.target.value)} className={FIELD}>
              <option>Basic</option>
              <option>Premium</option>
              <option>Exclusive</option>
            </select>
          </div>
        </form>
      </Modal>
    </>
  );
}
