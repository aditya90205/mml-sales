import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import { AppPage, MetricCard, NativeSelect, OutlineBtn, Panel, PrimaryBtn, Td } from "../components/common/AppPage.jsx";
import StatusPill from "../components/common/StatusPill";

const STATS = [
  { label: "Deals closed", value: "7", note: "▲ 2 vs June", noteTone: "green" },
  { label: "Closure rate", value: "11.4%", note: "Branch avg 9.8%", noteTone: "grey" },
  { label: "Avg. deal value", value: "₹44,200", note: "▼ 4% — discounts", noteTone: "red" },
  { label: "Revenue closed", value: "₹5.2L", note: "118% of target", noteTone: "grey" },
  { label: "Lost to price", value: "46%", note: "Top loss reason", noteTone: "grey" },
];

const REASONS = [
  { id: "price", label: "Price / Budget / ROI", extra: "price" },
  { id: "nodeal", label: "No decision / Think about it", extra: "date" },
  { id: "competitor", label: "Competitor / Existing solution" },
  { id: "timing", label: "Timing / priorities changed", extra: "date" },
  { id: "trust", label: "Trust / Risk / Fit" },
  { id: "noresponse", label: "No Response / delayed follow-up / Not interested now" },
  { id: "decision", label: "Decision maker / internal dependency" },
  { id: "wrong", label: "No / Never enquired / Wrong enquiry" },
];

// Share of lost deals attributed to each reason above — the 46% for
// "Price / Budget / ROI" lines up with the "Lost to price" stat card.
const REASON_SHARE = {
  price: 46,
  nodeal: 34,
  competitor: 28,
  timing: 21,
  trust: 17,
  noresponse: 14,
  decision: 9,
  wrong: 6,
};

const REASON_STATS = REASONS.map((r) => ({ id: r.id, label: r.label, value: REASON_SHARE[r.id] ?? 0 }));
const REASON_MAX = Math.max(...REASON_STATS.map((r) => r.value));

const SOURCES = [
  { source: "Outdoor board", leads: 84, closed: 11, roi: 11, rate: 13.1, revenue: "₹4.8L", cost: "₹4,400", loss: "Package mismatch" },
  { source: "Reference", leads: 22, closed: 6, roi: 6, rate: 27.3, revenue: "₹2.6L", cost: "—", loss: "Family" },
  { source: "Sabha & events", leads: 31, closed: 4, roi: 4, rate: 12.9, revenue: "₹1.8L", cost: "₹6,200", loss: "Price" },
  { source: "Google Ads", leads: 61, closed: 5, roi: 5, rate: 8.2, revenue: "₹2.2L", cost: "₹8,900", loss: "Price" },
  { source: "Instagram Ads", leads: 48, closed: 3, roi: 3, rate: 6.3, revenue: "₹1.3L", cost: "₹12,400", loss: "Low intent at entry" },
  { source: "Newspaper", leads: 19, closed: 2, roi: 2, rate: 10.5, revenue: "₹88k", cost: "₹5,100", loss: "Price" },
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

const reasonLabel = (id) => REASONS.find((r) => r.id === id)?.label ?? id;
const reasonLabels = (...ids) => ids.map(reasonLabel);

const FUNNEL_RAW = [
  { stage: "P0", name: "New", count: 1248, avgTime: "1.2 days", reasons: reasonLabels("wrong", "noresponse", "trust") },
  { stage: "P1", name: "Qualified", count: 842, avgTime: "2.4 days", reasons: reasonLabels("price", "nodeal", "trust") },
  { stage: "P2", name: "Profile Creation", count: 421, avgTime: "4.1 days", reasons: reasonLabels("timing", "nodeal", "decision") },
  { stage: "P3", name: "Video call / Visit", count: 218, avgTime: "3.6 days", reasons: reasonLabels("noresponse", "competitor", "timing") },
  { stage: "P4", name: "Negotiation", count: 96, avgTime: "5.8 days", reasons: reasonLabels("price", "decision", "competitor") },
  { stage: "P5", name: "Closed — Payment Done", count: 42, avgTime: "2.1 days", reasons: reasonLabels("timing", "trust", "nodeal") },
  { stage: "P6", name: "Post Sale Onboarding", count: 24, avgTime: "3.0 days", reasons: reasonLabels("decision", "timing", "noresponse") },
];

const FUNNEL_ROWS = FUNNEL_RAW.map((row, i) => {
  const prev = FUNNEL_RAW[i - 1];
  const convPct = Math.round((row.count / FUNNEL_RAW[0].count) * 100);
  const dropped = prev ? prev.count - row.count : 0;
  const lossPct = prev ? Math.round((dropped / prev.count) * 100) : 0;
  return {
    ...row,
    convPct,
    dropped,
    lossPct,
    dropFrom: prev ? `${prev.count.toLocaleString("en-IN")} − ${row.count.toLocaleString("en-IN")}` : "—",
  };
});

const FUNNEL_COLS = [
  { label: "Stage", key: "stage" },
  { label: "Priority", key: "name" },
  { label: "Conversion", key: "convPct" },
  { label: "Loss %", key: "lossPct" },
  { label: "Avg. time at stage", key: "avgTime" },
  { label: "Top 3 reasons", key: "reasons", unsortable: true },
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

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#E8395B]"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default function WinLossAnalysisPage() {
  const [month, setMonth] = useState("july");
  const [scope, setScope] = useState("mine");
  const [selected, setSelected] = useState(["nodeal", "competitor"]);
  const [extras, setExtras] = useState({ price: "", nodeal: "", timing: "" });
  const [others, setOthers] = useState("");
  const [note, setNote] = useState("");

  const { sorted, sort, toggle } = useTableSort(SOURCES, { defaultKey: null });
  const { sorted: sortedFunnel, sort: funnelSort, toggle: toggleFunnel } = useTableSort(FUNNEL_ROWS, { defaultKey: null });

  const toggleReason = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const saveReasons = () => {
    if (!selected.length) {
      toast.error("Select at least one win / loss reason.");
      return;
    }
    if (!others.trim() || !note.trim()) {
      toast.error("Others and Brief comment are required.");
      return;
    }
    toast.success("Win / loss reasons saved.");
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
          <MetricCard key={s.label} compact className="shadow-[0_1px_2px_rgba(0,0,0,0.04)]" {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 items-stretch">
        <section className="xl:col-span-3 bg-white border border-black/8 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-w-0">
          <h2 className="text-[15px] font-bold text-[#111] mb-3">Win / Loss Analysis — Reasons</h2>
          <div className="flex flex-col gap-2.5">
            {REASONS.map((reason) => {
              const on = selected.includes(reason.id);
              return (
                <div key={reason.id} className="min-w-0">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleReason(reason.id)}
                      className="size-4 mt-0.5 accent-[#7A0A17] shrink-0"
                    />
                    <span className="text-[13px] font-medium text-[#374151] leading-snug">{reason.label}</span>
                  </label>
                  {reason.extra === "price" && on && (
                    <input
                      value={extras.price}
                      onChange={(e) => setExtras((f) => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. Target Price or discount"
                      className="mt-1.5 ml-[26px] w-[min(100%,280px)] h-9 px-3 rounded-lg border border-black/10 text-[12.5px] outline-none focus:border-[#7A0A17]/40"
                    />
                  )}
                  {reason.extra === "date" && on && (
                    <input
                      type="date"
                      value={extras[reason.id] || ""}
                      onChange={(e) => setExtras((f) => ({ ...f, [reason.id]: e.target.value }))}
                      aria-label="Next follow up date"
                      className="mt-1.5 ml-[26px] w-[min(100%,220px)] h-9 px-3 rounded-lg border border-black/10 text-[12.5px] text-[#6B7280] outline-none focus:border-[#7A0A17]/40"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Field label="Others" required>
              <textarea
                value={others}
                onChange={(e) => setOthers(e.target.value)}
                placeholder="Write Comment"
                rows={3}
                className="mt-1.5 w-full px-3 py-2 rounded-xl border border-black/10 text-[13px] outline-none resize-none focus:border-[#7A0A17]/40"
              />
            </Field>
            <Field label="Brief Comment / Note" required>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write Comment"
                rows={3}
                className="mt-1.5 w-full px-3 py-2 rounded-xl border border-black/10 text-[13px] outline-none resize-none focus:border-[#7A0A17]/40"
              />
            </Field>
          </div>

          <div className="flex justify-end mt-4 pt-1">
            <PrimaryBtn onClick={saveReasons}>Save & Update</PrimaryBtn>
          </div>
        </section>

        <section className="xl:col-span-2 bg-white border border-black/8 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-w-0">
          <div className="mb-4">
            <h2 className="text-[15px] font-bold text-[#111]">Loss reasons breakdown</h2>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Share of lost deals, month to date</p>
          </div>
          <div className="flex flex-col justify-between gap-3 flex-1">
            {REASON_STATS.map((r) => (
              <div key={r.id} className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#374151] leading-snug">{r.label}</span>
                  <span className="shrink-0 text-[12px] font-bold text-[#111] tabular-nums">{r.value}%</span>
                </div>
                <span className="h-2.5 rounded-full bg-[#F1F2F4] overflow-hidden min-w-0">
                  <span
                    className="block h-full rounded-full bg-[#7A0A17]"
                    style={{ width: `${(r.value / REASON_MAX) * 100}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Panel
        title="Win / loss by stage"
        subtitle="Funnel drop-off from P0 New through P6 Post Sale Onboarding"
      >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB]">
                {FUNNEL_COLS.map((col) => (
                  <SortableTh
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    sort={funnelSort}
                    onSort={toggleFunnel}
                    unsortable={col.unsortable}
                    className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedFunnel.map((row) => (
                <tr key={row.stage} className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB]">
                  <Td strong>{row.stage}</Td>
                  <Td>{row.name}</Td>
                  <Td>
                    <span className="font-semibold text-[#111]">{row.count.toLocaleString("en-IN")}</span>
                    <span className="text-[#9CA3AF] font-medium"> · {row.convPct}%</span>
                  </Td>
                  <Td>
                    {row.dropped ? (
                      <span>
                        <span className="text-[#6B7280]">{row.dropFrom}</span>
                        <span className="font-semibold text-[#E8395B]"> · {row.lossPct}%</span>
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </Td>
                  <Td>{row.avgTime}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {row.reasons.map((reason) => (
                        <StatusPill key={reason} tone="gray">
                          {reason}
                        </StatusPill>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Win / loss by source"
        subtitle="Closure rate and cost per closed deal, for ROI on every channel (BRD 1.2)"
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
        footnote="Instagram leads carry a Low Intent warning at entry, and the numbers here are why (BRD 5.1.1)."
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
                  <Td>{row.roi}</Td>
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
