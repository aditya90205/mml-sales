import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ReferenceLine,
  LabelList,
  Label,
  useYAxisScale,
  useOffset,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronDown,
  Users,
  Globe,
  Share2,
  Smartphone,
  Store,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { SortableTh, useTableSort } from "../common/useTableSort.jsx";

const PERIOD_OPTIONS = [
  { id: "this_week",    label: "This Week" },
  { id: "this_month",   label: "This Month" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "this_year",    label: "This Year" },
];

const GOALS_STATS = [
  { label: "Actual Revenue",    value: "₹1.63 Cr", note: "65% of Target",  noteColor: "#3B82F6" },
  { label: "Projected Revenue", value: "₹1.55 Cr", note: "102% of Target", noteColor: "#8B5CF6" },
  { label: "Target (4 Weeks)",  value: "₹2.50 Cr", note: "Total Target",   noteColor: "#0D9488" },
  { label:  "Incentive (till 4 week)", value: "₹12 Lakh", note: "Total Incentive", noteColor: "#F59E0B" },
  { label: "Total pack sold",   value: "15",        note: "Subscription Sold", noteColor: "#F59E0B" },
];

const TIER_COLORS = {
  basic: "#3B82F6",
  standard: "#14B8A6",
  premium: "#8B5CF6",
  superPremium: "#F59E0B",
};

const TARGET_LINE_VALUE = 5.9;

/**
 * Weeks 1-4 are closed weeks (actual tier mix); weeks 5-8 are the
 * forward pipeline, drawn as flat grey bars with a dashed projection
 * line layered on top. Segment heights are split evenly per bar —
 * only the printed count label differs — since the source design
 * uses the stack purely to show tier mix, not unit-accurate height.
 */
const REVENUE_WEEKS = [
  { week: "Week 1", weekLabel: "Week 1",                current: false, totalLabel: "₹4.8 Lakh",  height: 1.6, counts: { basic: 2, standard: 2, premium: 1, superPremium: 1 } },
  { week: "Week 2", weekLabel: "Week 2",                current: false, totalLabel: "₹6.0 Lakh",  height: 2.0, counts: { basic: 1, standard: 1, premium: 1, superPremium: 2 } },
  { week: "Week 3", weekLabel: "Week 3",                current: false, totalLabel: "₹8.0 Lakh",  height: 2.7, counts: { basic: 3, standard: 3, premium: 1, superPremium: 2 } },
  { week: "Week 4", weekLabel: "Week 4 (Current Week)", current: true,  totalLabel: "₹12.0 Lakh", height: 4.0, counts: { basic: 2, standard: 1, premium: 3, superPremium: 4 } },
];

const PROJECTED_WEEKS = [
  { week: "Week 5", barLabel: "₹12.0 Lakh", pipelineLabel: "₹12 Lakh", height: 4.0 },
  { week: "Week 6", barLabel: "₹15.0 Lakh", pipelineLabel: "₹15 Lakh", height: 4.6 },
  { week: "Week 7", barLabel: "₹20.0 Lakh", pipelineLabel: "₹20 Lakh", height: 5.2 },
  { week: "Week 8", barLabel: "₹25.0 Lakh", pipelineLabel: "₹25 Lakh", height: 5.8 },
];

const REVENUE_CHART_DATA = [
  ...REVENUE_WEEKS.map((w) => ({
    week: w.week,
    weekLabel: w.weekLabel,
    current: w.current,
    totalLabel: w.totalLabel,
    basic: w.height * (w.counts.basic / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    standard: w.height * (w.counts.standard / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    premium: w.height * (w.counts.premium / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    superPremium: w.height * (w.counts.superPremium / (w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium)),
    basicCount: w.counts.basic,
    standardCount: w.counts.standard,
    premiumCount: w.counts.premium,
    superPremiumCount: w.counts.superPremium,
    packTotal: w.counts.basic + w.counts.standard + w.counts.premium + w.counts.superPremium,
    pipeline: null,
  })),
  ...PROJECTED_WEEKS.map((w) => ({
    week: w.week,
    weekLabel: w.week,
    projected: w.height,
    barLabel: w.barLabel,
    pipeline: w.height + 0.35,
    pipelineLabel: w.pipelineLabel,
  })),
];

const REVENUE_Y_TICKS = [0, 1, 2, 3, 4, 5, 6];
const revenueYTickFormatter = (v) => (v === 0 ? "₹0" : `₹${(v * 0.5).toFixed(1)} Cr`);

const CONVERSION_STATS = [
  { label: "Total Leads",     value: "2,842", note: "18.6% vs last 8 weeks" },
  { label: "Total Calls",     value: "1,896", note: "18.6% vs last 8 weeks" },
  { label: "Total Converted", value: "642",   note: "18.6% vs last 8 weeks" },
];

const FUNNEL_LEGEND = [
  { key: "prospects",      label: "Prospects",       color: "#2A78D6" },
  { key: "qualifiedLeads", label: "Qualified Leads", color: "#1BAF7A" },
  { key: "contacted",      label: "Contacted",       color: "#4A3AA7" },
  { key: "converted",      label: "Converted",       color: "#9CA3AF" },
];

const WEEKLY_FUNNEL_DATA = [
  { week: "Week 1", range: "1-7 August",   prospects: 245, qualifiedLeads: 162, contacted: 98,  converted: 41 },
  { week: "Week 2", range: "8-14 August",  prospects: 318, qualifiedLeads: 228, contacted: 156, converted: 72 },
  { week: "Week 3", range: "15-21 August", prospects: 268, qualifiedLeads: 195, contacted: 168, converted: 94 },
  { week: "Week 4", range: "22-28 August", prospects: 392, qualifiedLeads: 305, contacted: 224, converted: 128 },
];

const ACQUISITION_SOURCES = [
  { source: "Website",          totalLeads: 3596, conversion: "2%", color: "#6C93D6", icon: "website",   pct: 28 },
  { source: "Referral",         totalLeads: 2570, conversion: "1%", color: "#26437A", icon: "referral",  pct: 20 },
  { source: "Mobile App",       totalLeads: 2056, conversion: "3%", color: "#D8BD93", icon: "mobile",    pct: 16 },
  { source: "Facebook Ads",     totalLeads: 1799, conversion: "2%", color: "#BA6A38", icon: "facebook",  pct: 14 },
  { source: "Instagram Ads",    totalLeads: 1285, conversion: "1%", color: "#9AA0AC", icon: "instagram", pct: 10 },
  { source: "Google Ads",       totalLeads: 899,  conversion: "2%", color: "#7A0A17", icon: "google",    pct: 7 },
  { source: "Walk-in / Others", totalLeads: 640,  conversion: "1%", color: "#26262A", icon: "walkin",    pct: 5 },
];

const ACQUISITION_TOTAL_LEADS = "12,845";

function PeriodSelect({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PERIOD_OPTIONS.find((o) => o.id === value) ?? PERIOD_OPTIONS[1];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors ${
          compact ? "h-9" : "h-[38px]"
        }`}
      >
        {selected.label}
        <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-40 py-1 overflow-hidden">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                opt.id === value ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function ReferenceLineTag({ viewBox, text, bg, color, dy = -14 }) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <foreignObject x={x + 8} y={y + dy - 14} width={360} height={32} style={{ overflow: "visible" }}>
      <div
        className="inline-flex items-center h-[26px] px-3 rounded-lg text-[13px] font-bold whitespace-nowrap shadow-sm"
        style={{ backgroundColor: bg, color, border: `1.5px solid ${color}` }}
      >
        {text}
      </div>
    </foreignObject>
  );
}

/** Week-4 incentive chip, positioned at the current-week bar without a ReferenceLine. */
function IncentiveWeekTag() {
  const yScale = useYAxisScale();
  const offset = useOffset();
  const week4 = REVENUE_WEEKS.find((w) => w.current);
  if (!yScale || !offset || !week4) return null;
  const y = yScale(week4.height);
  if (y == null) return null;
  return (
    <ReferenceLineTag
      viewBox={{ x: offset.left, y }}
      text={`Incentive (till 4 week) ${week4.totalLabel}`}
      bg="#FFF3E4"
      color="#F59E0B"
      dy={-4}
    />
  );
}

function TierCountLabel({ x, y, width, height, value }) {
  if (!value || height < 12) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#fff">
      {value}
    </text>
  );
}

function TotalAboveBarLabel({ x, y, width, value, payload, index }) {
  if (!value) return null;
  const cx = x + width / 2;
  const pack = payload?.packTotal ?? payload?.payload?.packTotal ?? REVENUE_CHART_DATA[index]?.packTotal;
  return (
    <g>
      <text x={cx} y={y - 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
        {value}
      </text>
      {pack != null && (
        <text x={cx} y={y - 5} textAnchor="middle" fontSize={9} fontWeight={500} fill="#9CA3AF">
          {`(Total pack = ${pack})`}
        </text>
      )}
    </g>
  );
}

function GreyBarCenterLabel({ x, y, width, height, value }) {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#4B5563">
      {value}
    </text>
  );
}

function PipelinePointLabel({ x, y, value }) {
  if (!value) return null;
  return (
    <text x={x} y={y - 14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7C3AED">
      {value}
    </text>
  );
}

function PipelineDot({ cx, cy, payload }) {
  if (payload.pipeline == null) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#fff" stroke="#8B5CF6" strokeWidth={2} />;
}

function RevenueXAxisTick({ x, y, payload }) {
  const week = REVENUE_CHART_DATA.find((d) => d.week === payload.value);
  const isCurrent = week?.current;
  const [line1, line2] = (week?.weekLabel || payload.value).split(" (");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fontSize={11} fontWeight={isCurrent ? 700 : 500} fill={isCurrent ? "#111" : "#6B7280"}>
        {line1}
      </text>
      {line2 && (
        <text x={0} y={0} dy={27} textAnchor="middle" fontSize={9} fill="#9CA3AF">
          ({line2}
        </text>
      )}
    </g>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const isProjected = row?.projected != null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[150px]">
      <p className="text-[11px] font-bold text-[#111] mb-1.5">{label}</p>
      {isProjected ? (
        <p className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
          Pipeline value <span className="font-bold text-[#111]">{row.barLabel}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {[
            { key: "basicCount", name: "Basic", color: TIER_COLORS.basic },
            { key: "standardCount", name: "Standard", color: TIER_COLORS.standard },
            { key: "premiumCount", name: "Premium", color: TIER_COLORS.premium },
            { key: "superPremiumCount", name: "Super Premium", color: TIER_COLORS.superPremium },
          ].map((t) => (
            <p key={t.key} className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
              <span className="font-semibold text-[#111]">{row[t.key]}</span>
            </p>
          ))}
          <p className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280] mt-1 pt-1 border-t border-black/6">
            Revenue <span className="font-bold text-[#111]">{row.totalLabel}</span>
          </p>
        </div>
      )}
    </div>
  );
}

const REVENUE_LEGEND = [
  { label: "Basic", type: "swatch", color: TIER_COLORS.basic },
  { label: "Standard", type: "swatch", color: TIER_COLORS.standard },
  { label: "Premium", type: "swatch", color: TIER_COLORS.premium },
  { label: "Super Premium", type: "swatch", color: TIER_COLORS.superPremium },
  { label: "Projected Revenue Pipeline", type: "line", color: "#8B5CF6", dashed: true },
  { label: "Target", type: "line", color: "#0D9488", dashed: false },
];

export function GoalsPerformanceCard() {
  const [period, setPeriod] = useState("this_month");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center">
            <Users size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">My Goals &amp; Performance</h2>
            <p className="text-[11px] text-[#9CA3AF]">Total Leads</p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} compact />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {GOALS_STATS.map((s) => (
          <div key={s.label} className="border border-black/8 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center shrink-0">
                <Users size={13} className="text-[#6366F1]" strokeWidth={1.8} />
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-snug">{s.label}</p>
            </div>
            <p className="text-[16px] font-bold text-[#111] leading-tight">{s.value}</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: s.noteColor }}>{s.note}</p>
          </div>
        ))}
      </div>

      <p className="text-[12px] font-semibold text-[#4B5563] mb-1 px-1">Revenue (INR)</p>
      <div className="h-[380px] w-full overflow-x-auto">
      <div className="h-full min-w-[720px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={REVENUE_CHART_DATA} margin={{ top: 48, right: 16, left: 0, bottom: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="week" axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} tick={<RevenueXAxisTick />} interval={0} />
            <YAxis
              domain={[0, 6.4]}
              ticks={REVENUE_Y_TICKS}
              tickFormatter={revenueYTickFormatter}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={56}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

            <Bar dataKey="basic" stackId="tier" fill={TIER_COLORS.basic} barSize={44}>
              <LabelList dataKey="basicCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="standard" stackId="tier" fill={TIER_COLORS.standard} barSize={44}>
              <LabelList dataKey="standardCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="premium" stackId="tier" fill={TIER_COLORS.premium} barSize={44}>
              <LabelList dataKey="premiumCount" content={TierCountLabel} />
            </Bar>
            <Bar dataKey="superPremium" stackId="tier" fill={TIER_COLORS.superPremium} barSize={44} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="superPremiumCount" content={TierCountLabel} />
              <LabelList dataKey="totalLabel" content={TotalAboveBarLabel} />
            </Bar>

            <Bar dataKey="projected" stackId="tier" fill="#D1D5DB" barSize={44} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="barLabel" content={GreyBarCenterLabel} />
            </Bar>

            <ReferenceLine y={TARGET_LINE_VALUE} stroke="#0D9488" strokeWidth={2}>
              <Label content={(p) => <ReferenceLineTag viewBox={p.viewBox} text="Target ₹2.50 Cr" bg="#E7F8EF" color="#0D9488" dy={-4} />} />
            </ReferenceLine>
            <IncentiveWeekTag />

            <Line
              type="monotone"
              dataKey="pipeline"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={<PipelineDot />}
              activeDot={{ r: 6, fill: "#8B5CF6" }}
              connectNulls={false}
              isAnimationActive={false}
            >
              <LabelList dataKey="pipelineLabel" content={PipelinePointLabel} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 px-1">
        {REVENUE_LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
            {l.type === "swatch" ? (
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: l.color }} />
            ) : (
              <svg width="16" height="8" viewBox="0 0 16 8">
                <line x1="0" y1="4" x2="16" y2="4" stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? "4 3" : undefined} />
              </svg>
            )}
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const FUNNEL_Y_TICKS = [0, 150, 300, 450];
const FUNNEL_Y_MAX = 450;

function FunnelBarLabel({ x, y, width, value }) {
  if (value == null) return null;
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
      {value}
    </text>
  );
}

function FunnelXAxisTick({ x, y, payload }) {
  const row = WEEKLY_FUNNEL_DATA.find((d) => d.week === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle">
        <tspan x={0} dy={16} fontSize={12} fontWeight={600} fill="#374151">
          {payload.value}
        </tspan>
        <tspan x={0} dy={15} fontSize={10} fill="#9CA3AF">
          {row?.range}
        </tspan>
      </text>
    </g>
  );
}

function FunnelTooltip({ active, payload, label }) {
  const row = payload?.[0]?.payload;
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[140px]">
      <p className="text-[11px] font-bold text-[#111] mb-1.5">{label}</p>
      <div className="flex flex-col gap-1">
        {FUNNEL_LEGEND.map((f) => (
          <p key={f.key} className="flex items-center justify-between gap-4 text-[11px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
            <span className="font-semibold text-[#111]">{row[f.key]}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function LeadsConversionCard() {
  const [period, setPeriod] = useState("this_month");

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <Users size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">Leads to Conversion Overview</h2>
            <p className="text-[11px] text-[#9CA3AF]">Total Leads</p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} compact />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {CONVERSION_STATS.map((s) => (
          <div key={s.label} className="border border-black/8 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center shrink-0">
                <Users size={13} className="text-[#6366F1]" strokeWidth={1.8} />
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-snug">{s.label}</p>
            </div>
            <p className="text-[18px] font-bold text-[#111] leading-tight">{s.value}</p>
            <p className="text-[10px] font-semibold text-[#16A34A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mb-1 px-1 flex-wrap">
        <p className="text-[12px] font-semibold text-[#4B5563]">Weekly Lead Funnel Progress</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {FUNNEL_LEGEND.map((f) => (
            <span key={f.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={WEEKLY_FUNNEL_DATA}
            margin={{ top: 36, right: 12, left: 4, bottom: 8 }}
            barCategoryGap="36%"
            barGap={6}
          >
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="week"
              axisLine={{ stroke: "rgba(0,0,0,0.12)" }}
              tickLine={false}
              tick={<FunnelXAxisTick />}
              interval={0}
              height={52}
              tickMargin={6}
              padding={{ left: 18, right: 18 }}
            />
            <YAxis
              domain={[0, FUNNEL_Y_MAX]}
              ticks={FUNNEL_Y_TICKS}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              width={44}
              label={{ value: "Count", position: "top", offset: 18, fontSize: 11, fill: "#9CA3AF" }}
            />
            <Tooltip content={<FunnelTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

            {FUNNEL_LEGEND.map((f) => (
              <Bar
                key={f.key}
                dataKey={f.key}
                fill={f.color}
                barSize={22}
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey={f.key} content={FunnelBarLabel} />
              </Bar>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  );
}

/* Small brand-style glyphs for source identity (lucide has no brand marks). */
function FacebookGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path d="M15.5 8.5h-1.4c-.5 0-.6.2-.6.7v1.3h2l-.3 2.3h-1.7V19h-2.4v-6.2H9.5v-2.3h1.6V8.9c0-1.9 1-2.9 2.9-2.9h1.5v2.5Z" fill="#fff" />
    </svg>
  );
}

function InstagramGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="igGrad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#D62976" />
          <stop offset="0.7" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="7" fill="url(#igGrad)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="#fff" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="3.1" stroke="#fff" strokeWidth="1.6" fill="none" />
      <circle cx="17" cy="7" r="1" fill="#fff" />
    </svg>
  );
}

function GoogleGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.04 5.04 0 0 1-2.19 3.31v2.75h3.54c2.07-1.9 3.35-4.71 3.35-8.07Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.54H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.65-2.84Z" />
      <path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1a11 11 0 0 0-9.82 6.06l3.65 2.84C6.7 7.3 9.13 5.36 12 5.36Z" />
    </svg>
  );
}

const ACQUISITION_ICONS = {
  website: (props) => <Globe {...props} />,
  referral: (props) => <Share2 {...props} />,
  mobile: (props) => <Smartphone {...props} />,
  facebook: ({ size }) => <FacebookGlyph size={size} />,
  instagram: ({ size }) => <InstagramGlyph size={size} />,
  google: ({ size }) => <GoogleGlyph size={size} />,
  walkin: (props) => <Store {...props} />,
};

function AcquisitionDonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const px = cx + r * Math.cos(-midAngle * RAD);
  const py = cy + r * Math.sin(-midAngle * RAD);
  if (percent < 0.04) return null;
  return (
    <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#fff">
      {Math.round(percent * 100)}%
    </text>
  );
}

export function ClientAcquisitionCard() {
  const [period, setPeriod] = useState("this_month");
  const { sorted, sort, toggle } = useTableSort(ACQUISITION_SOURCES, { defaultKey: "source" });

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <PieChartIcon size={16} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">Client Acquisition</h2>
            <p className="text-[11px] text-[#9CA3AF]">Leads by Source</p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} compact />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full max-w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ACQUISITION_SOURCES}
                dataKey="pct"
                nameKey="source"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="100%"
                paddingAngle={1.5}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
                label={AcquisitionDonutLabel}
                labelLine={false}
              >
                {ACQUISITION_SOURCES.map((s) => (
                  <Cell key={s.source} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <p className="text-[17px] font-bold text-[#111] leading-tight">{ACQUISITION_TOTAL_LEADS}</p>
              <p className="text-[9px] text-[#9CA3AF]">Total Leads</p>
              <p className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#16A34A] mt-1 whitespace-nowrap">
                <ArrowUpRight size={10} /> 18.4%
              </p>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/8">
                {[
                  { label: "Source", key: "source" },
                  { label: "Leads", key: "totalLeads" },
                  { label: "Conv.", key: "conversion" },
                ].map((h) => (
                  <SortableTh
                    key={h.key}
                    label={h.label}
                    sortKey={h.key}
                    sort={sort}
                    onSort={toggle}
                    className="text-[10px] font-semibold text-[#9CA3AF] uppercase px-2 py-2 whitespace-nowrap"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const Icon = ACQUISITION_ICONS[s.icon];
                return (
                  <tr key={s.source} className="border-b border-black/6 last:border-0">
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-2 text-[11.5px] font-medium text-[#374151] whitespace-nowrap">
                        <span
                          className="size-5 rounded-md grid place-items-center shrink-0 overflow-hidden"
                          style={{ backgroundColor: `${s.color}1A` }}
                        >
                          <Icon size={12} style={{ color: s.color }} strokeWidth={1.8} />
                        </span>
                        {s.source}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[11.5px] text-[#374151] whitespace-nowrap">{s.totalLeads.toLocaleString("en-IN")}</td>
                    <td className="px-2 py-2 text-[11.5px] text-[#374151] whitespace-nowrap">{s.conversion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-[#F6F5FF] border border-[#E5E2FB] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
        <Info size={14} className="text-[#6366F1] shrink-0" strokeWidth={1.8} />
        <p className="text-[11px] text-[#4B5563]">Showing total leads &amp; lead conversion percentage by source.</p>
      </div>
    </div>
  );
}

