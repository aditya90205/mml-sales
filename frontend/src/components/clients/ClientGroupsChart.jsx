import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList,
} from "recharts";
import { BarChart3, ChevronDown, Users } from "lucide-react";

/** Matches Dashboard "Leads to Conversion" funnel palette. */
export const CLIENT_CHART_LEGEND = [
  { key: "total", label: "Total clients", color: "#2A78D6" },
  { key: "active", label: "Active", color: "#1BAF7A" },
  { key: "commonPool", label: "Common pool", color: "#4A3AA7" },
  { key: "inactive", label: "Inactive", color: "#9CA3AF" },
];

const PERIOD_OPTIONS = [
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
];

/** Mock data is concentrated in Aug 2026 — anchor filters there so week/month work. */
const PERIOD_REF = new Date(2026, 7, 28); // 28 Aug 2026

function monthWeekBuckets(ref = PERIOD_REF) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const monthName = ref.toLocaleString("en-IN", { month: "long" });
  const lastDay = new Date(y, m + 1, 0).getDate();
  const spans = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, Math.min(28, lastDay)],
  ];
  return spans.map(([from, to], i) => {
    const start = new Date(y, m, from, 0, 0, 0, 0);
    const end = new Date(y, m, to, 23, 59, 59, 999);
    return {
      week: `Week ${i + 1}`,
      range: `${from}-${to} ${monthName}`,
      start,
      end,
    };
  });
}

const WEEK_BUCKETS = monthWeekBuckets(PERIOD_REF);

function parseLastContact(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.split("/").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [dd, mm, yy] = parts;
  return new Date(2000 + yy, mm - 1, dd);
}

function currentBounds(periodId, ref = PERIOD_REF) {
  if (periodId === "this_week") {
    return WEEK_BUCKETS.find((b) => ref >= b.start && ref <= b.end) || WEEK_BUCKETS[WEEK_BUCKETS.length - 1];
  }
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function previousBounds(periodId, ref = PERIOD_REF) {
  if (periodId === "this_week") {
    const current = currentBounds("this_week", ref);
    const idx = WEEK_BUCKETS.findIndex((b) => b.week === current.week);
    if (idx > 0) return WEEK_BUCKETS[idx - 1];
    const end = new Date(current.start);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  const start = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const end = new Date(ref.getFullYear(), ref.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

function inBounds(client, { start, end }) {
  const d = parseLastContact(client.lastContact);
  if (!d) return false;
  return d >= start && d <= end;
}

function uniqueClients(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    for (const c of row.clients || []) {
      if (c == null || seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}

function sumRowStats(rows) {
  return rows.reduce(
    (acc, row) => ({
      total: acc.total + (Number(row.total) || 0),
      active: acc.active + (Number(row.active) || 0),
      commonPool: acc.commonPool + (Number(row.commonPool) || 0),
      inactive: acc.inactive + (Number(row.inactive) || 0),
    }),
    { total: 0, active: 0, commonPool: 0, inactive: 0 }
  );
}

function weeksFromClients(clients) {
  return WEEK_BUCKETS.map((b) => ({
    week: b.week,
    range: b.range,
    ...statsFromClients(clients.filter((c) => inBounds(c, b))),
  }));
}

function pctChange(current, previous) {
  if (previous == null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function PeriodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PERIOD_OPTIONS.find((o) => o.id === value) ?? PERIOD_OPTIONS[0];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
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
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
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

function BarLabel({ x, y, width, value }) {
  if (value == null || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">
      {value}
    </text>
  );
}

function WeekXAxisTick({ x, y, payload }) {
  const row = WEEK_BUCKETS.find((d) => d.week === payload.value);
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

function ChartTooltip({ active, payload, label }) {
  const row = payload?.[0]?.payload;
  if (!active || !payload?.length || !row) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[140px]">
      <p className="text-[11px] font-bold text-[#111] mb-0.5">{label}</p>
      {row.range ? <p className="text-[10px] text-[#9CA3AF] mb-1.5">{row.range}</p> : null}
      <div className="flex flex-col gap-1">
        {CLIENT_CHART_LEGEND.map((f) => (
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

function formatNum(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

/**
 * Left: KPI status grid · Right: week-wise chart (Dashboard style).
 * data: [{ group, total, active, commonPool, inactive }]  OR
 *       [{ group, clients: Client[] }]  (preferred — scales weeks from group clients)
 */
export default function ClientGroupsChart({
  data = [],
  title = "Client Overview",
  sourceLabel,
}) {
  const [period, setPeriod] = useState("this_month");

  const { weekRows, prevTotals, kpiStats, clientCount } = useMemo(() => {
    const hasClientLists = data.some((row) => Array.isArray(row.clients));
    const allClients = hasClientLists ? uniqueClients(data) : [];
    const weeks = hasClientLists
      ? weeksFromClients(allClients)
      : WEEK_BUCKETS.map((b) => ({ week: b.week, range: b.range, ...sumRowStats(data) }));

    const current = currentBounds(period);
    const previous = previousBounds(period);
    const kpis = hasClientLists
      ? statsFromClients(allClients.filter((c) => inBounds(c, current)))
      : sumRowStats(data);
    const prev = hasClientLists
      ? statsFromClients(allClients.filter((c) => inBounds(c, previous)))
      : { total: 0, active: 0, commonPool: 0, inactive: 0 };

    return { weekRows: weeks, prevTotals: prev, kpiStats: kpis, clientCount: allClients.length || kpis.total };
  }, [data, period]);

  if (!data.length) {
    return (
      <div className="bg-white border border-dashed border-black/15 rounded-2xl px-6 py-16 text-center">
        <span className="mx-auto size-12 rounded-2xl bg-[#EEF0FE] grid place-items-center mb-3">
          <BarChart3 size={22} className="text-[#6366F1]" strokeWidth={1.8} />
        </span>
        <p className="text-[15px] font-bold text-[#111]">No clients to chart yet</p>
        <p className="text-[13px] text-[#9CA3AF] mt-1 max-w-sm mx-auto">
          Clients from the database appear here with totals, active, pool, and inactive counts.
        </p>
      </div>
    );
  }

  const chartRows = weekRows;
  const hasAny = chartRows.some((r) => r.total > 0);
  const maxVal = Math.max(1, ...chartRows.flatMap((d) => [d.total, d.active, d.commonPool, d.inactive]));
  const yMax = Math.ceil(maxVal / 5) * 5 || 5;
  const step = Math.max(1, Math.ceil(yMax / 3));
  const yTicks = [0, step, step * 2, step * 3].filter((t, i, arr) => t <= yMax && (i === 0 || t !== arr[i - 1]));
  if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);

  const noteSuffix = period === "this_week" ? "vs last week" : "vs last month";
  const totals = CLIENT_CHART_LEGEND.map((f) => {
    const value = Number(kpiStats?.[f.key]) || 0;
    const prev = prevTotals ? prevTotals[f.key] : null;
    const change = prev == null ? null : pctChange(value, prev);
    return { ...f, value, change };
  });

  const periodLabel = PERIOD_OPTIONS.find((o) => o.id === period)?.label ?? "This Week";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-3.5 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <Users size={15} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-[#111] leading-tight">{title}</h2>
            <p className="text-[11px] text-[#9CA3AF]">
              {sourceLabel || "All clients"} · {formatNum(clientCount)} client{clientCount === 1 ? "" : "s"} · {periodLabel.toLowerCase()}
            </p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,0.75fr)_1.4fr] gap-3 items-stretch">
        {/* Left: KPI status grid */}
        <div className="grid grid-cols-2 gap-2.5 min-w-0 content-start">
          {totals.map((s) => (
            <div key={s.key} className="border border-black/8 rounded-xl px-3 py-2.5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="size-6 rounded-md grid place-items-center shrink-0"
                  style={{ backgroundColor: `${s.color}1A` }}
                >
                  <Users size={12} style={{ color: s.color }} strokeWidth={1.8} />
                </span>
                <p className="text-[11px] text-[#9CA3AF] leading-none">{s.label}</p>
              </div>
              <p className="text-[16px] font-bold text-[#111] leading-tight tabular-nums">{formatNum(s.value)}</p>
              <p
                className={`text-[10px] font-semibold mt-0.5 leading-tight ${
                  s.change == null ? "text-[#9CA3AF]" : s.change >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                }`}
              >
                {s.change == null ? `No prior ${period === "this_week" ? "week" : "month"}` : `${s.change}% ${noteSuffix}`}
              </p>
            </div>
          ))}
        </div>

        {/* Right: week-wise chart (Dashboard style) */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-1 px-1 flex-wrap">
            <p className="text-[12px] font-semibold text-[#4B5563]">Weekly Client Group Progress</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {CLIENT_CHART_LEGEND.map((f) => (
                <span key={f.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
                  <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: f.color }} />
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          {!hasAny ? (
            <div className="rounded-xl border border-black/8 bg-[#FAFBFC] px-4 py-10 text-center grid place-items-center min-h-[240px]">
              <div>
                <p className="text-[14px] font-semibold text-[#374151]">No client contacts in {periodLabel.toLowerCase()}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">Try switching the period filter above.</p>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[520px] h-[240px]">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart
                    data={chartRows}
                    margin={{ top: 28, right: 12, left: 4, bottom: 4 }}
                    barCategoryGap="36%"
                    barGap={6}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                      dataKey="week"
                      axisLine={{ stroke: "rgba(0,0,0,0.12)" }}
                      tickLine={false}
                      tick={<WeekXAxisTick />}
                      interval={0}
                      height={52}
                      tickMargin={6}
                      padding={{ left: 18, right: 18 }}
                    />
                    <YAxis
                      domain={[0, yMax]}
                      ticks={yTicks}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      width={44}
                      label={{ value: "Count", position: "top", offset: 18, fontSize: 11, fill: "#9CA3AF" }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    {CLIENT_CHART_LEGEND.map((f) => (
                      <Bar
                        key={f.key}
                        dataKey={f.key}
                        fill={f.color}
                        barSize={22}
                        radius={[4, 4, 0, 0]}
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey={f.key} content={BarLabel} />
                      </Bar>
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Derive chart metrics from a list of clients. */
export function statsFromClients(clients = []) {
  const total = clients.length;
  const active = clients.filter((c) => c.status === "Active").length;
  const inactive = clients.filter((c) => c.status === "Inactive").length;
  // Common pool: cold / low-probability clients (shared pool proxy in mock data)
  const commonPool = clients.filter((c) => c.probability === "low").length;
  return { total, active, commonPool, inactive };
}
