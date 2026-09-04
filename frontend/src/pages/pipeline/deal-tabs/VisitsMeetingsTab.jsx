import { useState } from "react";
import { toast } from "react-toastify";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";
import { dashRows } from "./stageContent.jsx";

const INITIAL_ROWS = [
  {
    date: "02 Jul 2026", type: "Home visit", venue: "Greater Kailash",
    attendedBy: "Client + both parents", gps: "28.5621, 77.2410",
    capture: "4 of 4", captureTone: "green", outcome: "Premium pitched",
  },
  {
    date: "14 Jul 2026", type: "Office visit", venue: "Greater Kailash",
    attendedBy: "Client + father", gps: "-",
    capture: "2 of 2", captureTone: "green", outcome: "Price resistance raised",
  },
  {
    date: "30 Jul 2026", type: "Home visit", venue: "Greater Kailash",
    attendedBy: "Client + both parents", gps: "Pending",
    capture: "Not Started", captureTone: "gray", outcome: "Scheduled",
  },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Type", key: "type" },
  { label: "Venue", key: "venue" },
  { label: "Attended By", key: "attendedBy" },
  { label: "GPS", key: "gps" },
  { label: "Capture", key: "capture" },
  { label: "Outcome", key: "outcome" },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

export default function VisitsMeetingsTab({ empty = false }) {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const { sorted, sort, toggle } = useTableSort(dashRows(rows, empty), { defaultKey: "date" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Home visit", venue: "", attendedBy: "", outcome: "" });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.venue.trim() || !form.attendedBy.trim()) {
      toast.error("Please add venue and who attended.");
      return;
    }
    setRows((prev) => [
      {
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        type: form.type,
        venue: form.venue.trim(),
        attendedBy: form.attendedBy.trim(),
        gps: "Pending",
        capture: "Not Started",
        captureTone: "gray",
        outcome: form.outcome.trim() || "Scheduled",
      },
      ...prev,
    ]);
    toast.success("Visit logged.");
    setForm({ type: "Home visit", venue: "", attendedBy: "", outcome: "" });
    setOpen(false);
  };

  return (
    <>
      <TableCard
        title="Visits & Meetings"
        subtitle="Home and office visits with GPS, selfie and activity form"
        action={<TabHeaderButton onClick={() => setOpen(true)}>Log visit</TabHeaderButton>}
        columns={COLUMNS}
        sort={sort}
        onSort={toggle}
      >
        {sorted.map((row, i) => (
          <tr key={`${row.date}-${row.type}-${i}`} className="border-b border-black/5 last:border-0">
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.date}</td>
            <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.type}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.venue}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.attendedBy}</td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.gps}</td>
            <td className="px-3 py-2.5 whitespace-nowrap">
              {row.capture === "-" ? (
                <span className="text-[12px] text-[#9CA3AF]">-</span>
              ) : (
                <StatusPill tone={row.captureTone}>{row.capture}</StatusPill>
              )}
            </td>
            <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.outcome}</td>
          </tr>
        ))}
      </TableCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log visit"
        subtitle="Home visit, office visit or meeting"
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
              form="log-visit-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save visit
            </button>
          </>
        }
      >
        <form id="log-visit-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={FIELD}>
              <option>Home visit</option>
              <option>Office visit</option>
              <option>Meeting</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Venue</label>
            <input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder="Branch or locality" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Attended by</label>
            <input value={form.attendedBy} onChange={(e) => setForm((f) => ({ ...f, attendedBy: e.target.value }))} placeholder="Client + parents" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Outcome</label>
            <input value={form.outcome} onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))} placeholder="e.g. Premium pitched" className={FIELD} />
          </div>
        </form>
      </Modal>
    </>
  );
}
