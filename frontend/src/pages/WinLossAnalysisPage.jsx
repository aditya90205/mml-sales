import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import { AppPage, MetricCard, NativeSelect, OutlineBtn, Panel, PrimaryBtn, Td } from "../components/common/AppPage.jsx";

const STATS = [
  { label: "Deals closed", value: "7", note: "▲ 2 vs June", noteTone: "green" },
  { label: "Closure rate", value: "11.4%", note: "Branch avg 9.8%", noteTone: "grey" },
  { label: "Avg. deal value", value: "₹44,200", note: "▼ 4% — discounts", noteTone: "red" },
  { label: "Revenue closed", value: "₹5.2L", note: "118% of target", noteTone: "grey" },
  { label: "Lost to price", value: "46%", note: "Top loss reason", noteTone: "grey" },
];

const REASONS = [
  { id: "price", label: "Price / Budget / ROI" },
  { id: "nodeal", label: "No decision / Think about it" },
  { id: "competitor", label: "Competitor / Existing solution" },
  { id: "timing", label: "Timing / priorities changed" },
  { id: "trust", label: "Trust / Risk / Fit" },
  { id: "noresponse", label: "No Response / delayed follow-up / Not interested now" },
  { id: "decision", label: "Decision maker / internal dependency" },
  { id: "wrong", label: "No / Never enquired / Wrong enquiry" },
];

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

const reasonLabel = (id) => REASONS.find((r) => r.id === id)?.label ?? id;
const reasonLabels = (...ids) => ids.map(reasonLabel);

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
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="h-1.5 w-[72px] rounded-full bg-[#F1F2F4] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct * 2.4)}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-semibold text-[#111] tabular-nums">{pct}%</span>
    </div>
  );
}

const POPOVER_WIDTH = 280;

function ReasonsHoverIcon({ reasons, label }) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    let left = r.left + r.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - POPOVER_WIDTH - 12));
    const below = r.bottom + 8;
    const placeAbove = below + 160 > window.innerHeight;
    setPos({ anchorTop: r.top, top: below, left, placeAbove });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 120);
  };

  return (
    <span ref={ref} onMouseEnter={open} onMouseLeave={scheduleClose} className="inline-flex">
      <button
        type="button"
        className="size-8 grid place-items-center rounded-lg hover:bg-black/4 transition-colors"
        title={`View top reasons for ${label}`}
        aria-label={`View top reasons for ${label}`}
      >
        <Eye size={16} className="text-[#CA8A04]" />
      </button>

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] w-[280px] max-w-[calc(100vw-24px)] bg-white border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-3.5 overflow-hidden"
            style={{
              top: pos.placeAbove ? undefined : pos.top,
              bottom: pos.placeAbove ? window.innerHeight - pos.anchorTop + 8 : undefined,
              left: pos.left,
            }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2.5 break-words">
              Top 3 reasons · {label}
            </p>
            <div className="flex flex-col gap-2 min-w-0">
              {(reasons || []).map((reason, i) => (
                <div key={reason} className="flex items-start gap-2.5 min-w-0">
                  <span className="size-5 rounded-full bg-[#FCF5F6] text-[#7A0A17] text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[11.5px] font-semibold leading-snug text-[#6B7280] bg-[#F1F2F4] px-2.5 py-1.5 rounded-md break-words whitespace-normal">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}

export default function WinLossAnalysisPage() {
  const [month, setMonth] = useState("july");
  const [scope, setScope] = useState("mine");

  const { sorted, sort, toggle } = useTableSort(SOURCES, { defaultKey: null });
  const { sorted: sortedFunnel, sort: funnelSort, toggle: toggleFunnel } = useTableSort(FUNNEL_ROWS, { defaultKey: null });

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
        <div className="xl:col-span-3 min-w-0">
          <Panel
            title="Win / loss by stage"
            subtitle="Funnel drop-off from P0 New through P6 Post Sale Onboarding"
          >
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left border-collapse">
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
                        className="px-3 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
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
                        <ReasonsHoverIcon reasons={row.reasons} label={`${row.stage} ${row.name}`} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

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
          <table className="w-full text-left border-collapse">
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
                  <Td>
                    <RateBar pct={row.rate} />
                  </Td>
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
