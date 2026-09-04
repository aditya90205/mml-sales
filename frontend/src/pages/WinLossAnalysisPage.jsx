import { useState } from "react";
import { AlertCircle, Download } from "lucide-react";
import { toast } from "react-toastify";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import { AppPage, MetricCard, NativeSelect, OutlineBtn, Panel, PrimaryBtn, Td } from "../components/common/AppPage.jsx";

const STATS = [
  { label: "Deals closed", value: "7", note: "▲ 2 vs June", noteTone: "green" },
  { label: "Closure rate", value: "11.4%", note: "▼ 4% — discounts", noteTone: "red" },
  { label: "Avg deal value", value: "₹44,200", note: "▼ ₹2,100 vs Classic mix", noteTone: "red" },
  { label: "Avg days to close", value: "38", note: "▼ 6 days vs June", noteTone: "green" },
  { label: "Lost revenue", value: "₹3.18 L", note: "11 losses · Classic 4", noteTone: "grey" },
];

const PACKAGES = [
  {
    id: "classic",
    name: "Classic — ₹25,000",
    note: "Lost on ticket size more often than any other tier.",
    reason: "Price",
    pct: 52,
    tone: { bg: "#FDECEE", fg: "#E8395B", bar: "#E8395B" },
  },
  {
    id: "gold",
    name: "Gold — ₹38,000",
    note: "Prospects stall after the second data-share round.",
    reason: "Data fatigue",
    pct: 44,
    tone: { bg: "#E8F2FE", fg: "#2563EB", bar: "#3B82F6" },
  },
  {
    id: "premium",
    name: "Premium — ₹51,000",
    note: "Match shortlists are not converting at this price band.",
    reason: "Match confidence",
    pct: 41,
    alert: true,
    tone: { bg: "#FFF3E4", fg: "#D97706", bar: "#F59E0B" },
  },
  {
    id: "platinum",
    name: "Platinum — ₹85,000",
    note: "Families want a faster close than the current SLA.",
    reason: "Timeline",
    pct: 38,
    tone: { bg: "#F3E8FF", fg: "#7C3AED", bar: "#8B5CF6" },
  },
  {
    id: "elite",
    name: "Elite — ₹1,20,000",
    note: "Objections come from parents more than the couple.",
    reason: "Family objection",
    pct: 33,
    tone: { bg: "#E7F8EF", fg: "#15803D", bar: "#16A34A" },
  },
];

const SOURCES = [
  { source: "Outdoor board", leads: 84, closed: 11, roi: "3.4x", rate: 13.1, revenue: "₹4.86 L", cost: "₹4,120", loss: "Price" },
  { source: "Reference", leads: 22, closed: 6, roi: "—", rate: 27.3, revenue: "₹2.65 L", cost: "—", loss: "Family" },
  { source: "Google Ads", leads: 61, closed: 5, roi: "1.8x", rate: 8.2, revenue: "₹2.21 L", cost: "₹8,900", loss: "Data" },
  { source: "Instagram", leads: 48, closed: 3, roi: "1.1x", rate: 6.3, revenue: "₹1.33 L", cost: "₹12,400", loss: "Timeline" },
  { source: "Community", leads: 19, closed: 2, roi: "—", rate: 10.5, revenue: "₹88k", cost: "—", loss: "Match" },
  { source: "Walk-in", leads: 14, closed: 1, roi: "—", rate: 7.1, revenue: "₹44k", cost: "—", loss: "Price" },
];

const SOURCE_COLS = [
  { label: "Source", key: "source" },
  { label: "Leads", key: "leads" },
  { label: "Closed", key: "closed" },
  { label: "Return of investment", key: "roi" },
  { label: "Closure rate", key: "rate" },
  { label: "Revenue", key: "revenue" },
  { label: "Cost / closed", key: "cost" },
  { label: "Top loss reason", key: "loss" },
];

function rateColor(pct) {
  if (pct >= 12) return "#16A34A";
  if (pct >= 9) return "#F59E0B";
  return "#E8395B";
}

function RateBar({ pct }) {
  const color = rateColor(pct);
  return (
    <div className="flex items-center gap-2.5 min-w-[140px]">
      <div className="h-1.5 w-[88px] rounded-full bg-[#F1F2F4] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 2.4)}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-semibold text-[#111] tabular-nums">{pct}%</span>
    </div>
  );
}

export default function WinLossAnalysisPage() {
  const [month, setMonth] = useState("july");
  const [scope, setScope] = useState("mine");
  const [selected, setSelected] = useState(["classic", "gold", "premium", "platinum", "elite"]);

  const { sorted, sort, toggle } = useTableSort(SOURCES, { defaultKey: null });

  const allChecked = PACKAGES.every((p) => selected.includes(p.id));

  const toggleAll = () => {
    setSelected(allChecked ? [] : PACKAGES.map((p) => p.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <AppPage
      title="Win / Loss Analysis"
      actions={
        <>
          <OutlineBtn onClick={() => toast.info("Exporting win / loss report...")}>
            <Download size={14} /> Export
          </OutlineBtn>
          <PrimaryBtn onClick={() => toast.success("Monthly report scheduled.")}>Schedule report</PrimaryBtn>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {STATS.map((s) => (
          <MetricCard key={s.label} {...s} />
        ))}
      </div>

      <Panel
        title="Loss reasons by package"
        subtitle="Where each tier is losing, and to what"
        action={<NativeSelect value={month} onChange={setMonth} options={[{ value: "july", label: "July 2026" }, { value: "june", label: "June 2026" }]} />}
      >
        <div className="flex flex-col">
          <label className="flex items-center gap-3 px-1 pb-2 text-[12px] font-semibold text-[#9CA3AF]">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} className="size-4 accent-[#7A0A17]" />
            Compare selected packages
          </label>
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className="flex items-center gap-3 py-3.5 border-b border-black/6 last:border-0">
              <input
                type="checkbox"
                checked={selected.includes(pkg.id)}
                onChange={() => toggleOne(pkg.id)}
                className="size-4 accent-[#7A0A17] shrink-0"
              />
              {pkg.alert && <AlertCircle size={16} className="text-[#E8395B] shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#111]">{pkg.name}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">{pkg.note}</p>
              </div>
              <span
                className="inline-flex items-center gap-2 h-8 pl-3 pr-3 rounded-full text-[12px] font-bold shrink-0"
                style={{ backgroundColor: pkg.tone.bg, color: pkg.tone.fg }}
              >
                <span className="w-10 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${pkg.tone.bar}33` }}>
                  <span className="block h-full rounded-full" style={{ width: `${pkg.pct}%`, backgroundColor: pkg.tone.bar }} />
                </span>
                {pkg.reason} {pkg.pct}%
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Win / loss by source"
        subtitle="Where spend is converting, and where it is leaking"
        action={
          <>
            <NativeSelect
              value={month}
              onChange={setMonth}
              options={[
                { value: "july", label: "July 2026" },
                { value: "june", label: "June 2026" },
              ]}
            />
            <NativeSelect
              value={scope}
              onChange={setScope}
              options={[
                { value: "mine", label: "My deals" },
                { value: "team", label: "Team deals" },
                { value: "branch", label: "Branch" },
              ]}
            />
          </>
        }
        footnote="ROI is blank where source cost is not tagged. Closure rate uses leads created in the selected month."
      >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB]">
                {SOURCE_COLS.map((col) => (
                  <SortableTh
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    sort={sort}
                    onSort={toggle}
                    className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.source} className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB]">
                  <Td strong>{row.source}</Td>
                  <Td>{row.leads}</Td>
                  <Td>{row.closed}</Td>
                  <Td muted={row.roi === "—"}>{row.roi}</Td>
                  <td className="px-4 py-3">
                    <RateBar pct={row.rate} />
                  </td>
                  <Td strong>{row.revenue}</Td>
                  <Td muted={row.cost === "—"}>{row.cost}</Td>
                  <Td>{row.loss}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppPage>
  );
}
