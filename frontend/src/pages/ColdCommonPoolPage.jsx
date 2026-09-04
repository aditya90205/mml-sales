import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { toast } from "react-toastify";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import { AppPage, MetricCard, NativeSelect, OutlineBtn, Panel, PrimaryBtn, Td } from "../components/common/AppPage.jsx";

const INITIAL_POOL = [
  { id: "D-4821", client: "Aditi & Rohan", stage: "P4", reason: "No response 14 days", released: "02 Jul", days: 9, owner: "Nikhil Bansal", claimedBy: null },
  { id: "D-4760", client: "Priya Sharma", stage: "P2", reason: "Budget mismatch", released: "28 Jun", days: 13, owner: "Pooja Sharma", claimedBy: null },
  { id: "D-4712", client: "Sneha & Arjun", stage: "P3", reason: "Went cold after quote", released: "25 Jun", days: 16, owner: "Vinti Malhotra", claimedBy: "you" },
  { id: "D-4688", client: "Meera Kapoor", stage: "P1", reason: "Wrong number / bounced", released: "22 Jun", days: 19, owner: "Rohit Khanna", claimedBy: null },
  { id: "D-4611", client: "Ananya & Rahul", stage: "P4", reason: "Family postponed", released: "18 Jun", days: 23, owner: "Nikhil Bansal", claimedBy: null },
  { id: "D-4590", client: "Kavya Menon", stage: "P2", reason: "No response 14 days", released: "16 Jun", days: 25, owner: "Pooja Sharma", claimedBy: null },
  { id: "D-4522", client: "Ishaan & Diya", stage: "P3", reason: "Chose another vendor", released: "11 Jun", days: 30, owner: "Vinti Malhotra", claimedBy: null },
];

const STAGE_STYLE = {
  P1: "bg-[#E8F2FE] text-[#2563EB]",
  P2: "bg-[#EEF0FE] text-[#4F46E5]",
  P3: "bg-[#FFF3E4] text-[#D97706]",
  P4: "bg-[#FDECEE] text-[#E8395B]",
};

const COLUMNS = [
  { label: "", key: "select", unsortable: true },
  { label: "Deal", key: "id" },
  { label: "Client", key: "client" },
  { label: "Last stage", key: "stage" },
  { label: "Cold reason", key: "reason" },
  { label: "Released", key: "released" },
  { label: "Days in pool", key: "days" },
  { label: "Original owner", key: "owner" },
  { label: "Action", key: "action", unsortable: true },
];

export default function ColdCommonPoolPage() {
  const [rows, setRows] = useState(INITIAL_POOL);
  const [selected, setSelected] = useState([]);
  const [sortMode, setSortMode] = useState("unclaimed");
  const [reason, setReason] = useState("all");
  const [rulesOpen, setRulesOpen] = useState(false);

  const reasons = useMemo(
    () => ["all", ...[...new Set(INITIAL_POOL.map((r) => r.reason))]],
    []
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (reason !== "all") list = list.filter((r) => r.reason === reason);
    if (sortMode === "unclaimed") {
      list = [...list].sort((a, b) => Number(Boolean(a.claimedBy)) - Number(Boolean(b.claimedBy)));
    } else if (sortMode === "oldest") {
      list = [...list].sort((a, b) => b.days - a.days);
    } else if (sortMode === "newest") {
      list = [...list].sort((a, b) => a.days - b.days);
    }
    return list;
  }, [rows, reason, sortMode]);

  const { sorted, sort, toggle } = useTableSort(filtered, { defaultKey: null });

  const unclaimedIds = sorted.filter((r) => !r.claimedBy).map((r) => r.id);
  const allChecked = unclaimedIds.length > 0 && unclaimedIds.every((id) => selected.includes(id));

  const toggleAll = () => {
    setSelected(allChecked ? [] : unclaimedIds);
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const claimIds = (ids) => {
    if (!ids.length) {
      toast.info("Select at least one unclaimed deal.");
      return;
    }
    setRows((prev) => prev.map((r) => (ids.includes(r.id) && !r.claimedBy ? { ...r, claimedBy: "you" } : r)));
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    toast.success(ids.length === 1 ? `${ids[0]} claimed.` : `${ids.length} deals claimed.`);
  };

  return (
    <AppPage
      title="Cold & Common Pool"
      actions={
        <>
          <OutlineBtn onClick={() => setRulesOpen((v) => !v)}>Release rules</OutlineBtn>
          <PrimaryBtn onClick={() => claimIds(selected)}>Claim selected</PrimaryBtn>
        </>
      }
    >
      <div className="flex items-start justify-between gap-3 flex-wrap rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3">
        <p className="text-[13px] text-[#1E40AF] font-medium leading-relaxed flex items-start gap-2 min-w-0">
          <Info size={15} className="mt-0.5 shrink-0" />
          Unclaimed deals auto-release to common pool after the cooling window. Claimed deals move back to your pipeline.
        </p>
        <button
          type="button"
          onClick={() => setRulesOpen(true)}
          className="text-[12px] font-bold text-[#2563EB] hover:underline shrink-0"
        >
          Release rules
        </button>
      </div>

      {rulesOpen && (
        <div className="bg-white border border-black/8 rounded-2xl p-5 text-[13px] text-[#374151] leading-relaxed">
          <p className="font-bold text-[#111] mb-2">Release rules</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Deals with no activity for 14 days move to common pool automatically.</li>
            <li>Original owner keeps a 48-hour exclusive reclaim window.</li>
            <li>A claimed deal cannot be re-claimed by another RM for 7 days.</li>
            <li>Next auto-release run: Monday 9:00 AM.</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard label="In common pool" value="31" note="▲ 4 vs June" noteTone="green" />
        <MetricCard label="Recovered this month" value="9" note="₹76,000 recovered" noteTone="green" />
        <MetricCard label="Your claims" value="3" note="2 converted · 1 still open" />
        <MetricCard label="Auto-release pending" value="6" note="next run Mon 9 AM" noteTone="amber" />
      </div>

      <Panel
        title="Common pool"
        subtitle="Unclaimed cold deals anyone on the floor can pick up"
        action={
          <>
            <NativeSelect
              value={sortMode}
              onChange={setSortMode}
              options={[
                { value: "unclaimed", label: "Unclaimed first" },
                { value: "oldest", label: "Oldest first" },
                { value: "newest", label: "Newest first" },
              ]}
            />
            <NativeSelect
              value={reason}
              onChange={setReason}
              options={reasons.map((r) => ({ value: r, label: r === "all" ? "Reason: All" : r }))}
            />
          </>
        }
        footnote="Claimed deals trigger an automated WhatsApp to the original owner. Auto-release does not fire on Sundays."
      >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB]">
                {COLUMNS.map((col) =>
                  col.key === "select" ? (
                    <th key="select" className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        className="size-4 accent-[#7A0A17]"
                        aria-label="Select all unclaimed"
                      />
                    </th>
                  ) : (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sort={sort}
                      onSort={toggle}
                      unsortable={col.unsortable}
                      className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                    />
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const claimed = Boolean(row.claimedBy);
                return (
                  <tr key={row.id} className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB]">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        disabled={claimed}
                        onChange={() => toggleOne(row.id)}
                        className="size-4 accent-[#7A0A17] disabled:opacity-40"
                        aria-label={`Select ${row.id}`}
                      />
                    </td>
                    <Td muted>{row.id}</Td>
                    <Td strong>{row.client}</Td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center h-6 px-2 rounded-md text-[11px] font-bold ${STAGE_STYLE[row.stage]}`}>
                        {row.stage}
                      </span>
                    </td>
                    <Td>{row.reason}</Td>
                    <Td muted>{row.released}</Td>
                    <Td>{row.days}</Td>
                    <Td>{row.owner}</Td>
                    <td className="px-4 py-3">
                      {claimed ? (
                        <span className="inline-flex items-center h-8 px-3 rounded-lg bg-[#E7F8EF] text-[#15803D] text-[12px] font-bold">
                          Claimed by you
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => claimIds([row.id])}
                          className="inline-flex items-center h-8 px-3 rounded-lg border border-[#93C5FD] text-[#2563EB] text-[12px] font-bold hover:bg-[#EFF6FF] transition-colors"
                        >
                          Claim
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppPage>
  );
}
