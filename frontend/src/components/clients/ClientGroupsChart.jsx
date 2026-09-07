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

function parseLastContact(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.split("/").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [dd, mm, yy] = parts;
  return new Date(2000 + yy, mm - 1, dd);
}

function periodBounds(periodId, ref = PERIOD_REF) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  if (periodId === "this_week") {
    const start = new Date(y, m, ref.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(ref);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function previousBounds(periodId, ref = PERIOD_REF) {
  if (periodId === "this_week") {
    const end = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
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

function pctChange(current, previous) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function PeriodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PERIOD_OPTIONS.find((o) => o.id === value) ?? PERIOD_OPTIONS[1];

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

function GroupXAxisTick({ x, y, payload }) {
  const label = String(payload.value || "");
  const short = label.length > 16 ? `${label.slice(0, 14)}…` : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle">
        <tspan x={0} dy={16} fontSize={12} fontWeight={600} fill="#374151">
          {short}
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
      <p className="text-[11px] font-bold text-[#111] mb-1.5">{label}</p>
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

function sumField(data, key) {
  return data.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

/**
 * Grouped bar chart for client groups — styled like Dashboard LeadsConversionCard.
 * data: [{ group, total, active, commonPool, inactive }]  OR
 *       [{ group, clients: Client[] }]  (preferred — enables week/month filter)
 */
export default function ClientGroupsChart({ data = [], title = "Client Groups Overview" }) {
  const [period, setPeriod] = useState("this_month");

  const { chartRows, prevTotals } = useMemo(() => {
    if (!data.length) return { chartRows: [], prevTotals: null };
    const hasClients = data.some((row) => Array.isArray(row.clients));
    if (!hasClients) {
      return { chartRows: data, prevTotals: null };
    }

    const current = periodBounds(period);
    const previous = previousBounds(period);

    const rows = data.map((row) => {
      const filtered = (row.clients || []).filter((c) => inBounds(c, current));
      return { group: row.group, ...statsFromClients(filtered) };
    });

    const prevStats = data.reduce(
      (acc, row) => {
        const filtered = (row.clients || []).filter((c) => inBounds(c, previous));
        const s = statsFromClients(filtered);
        acc.total += s.total;
        acc.active += s.active;
        acc.commonPool += s.commonPool;
        acc.inactive += s.inactive;
        return acc;
      },
      { total: 0, active: 0, commonPool: 0, inactive: 0 }
    );

    return { chartRows: rows, prevTotals: prevStats };
  }, [data, period]);

  const hasAny = chartRows.some((r) => r.total > 0);

  if (!data.length) {
    return (
      <div className="bg-white border border-dashed border-black/15 rounded-2xl px-6 py-16 text-center">
        <span className="mx-auto size-12 rounded-2xl bg-[#EEF0FE] grid place-items-center mb-3">
          <BarChart3 size={22} className="text-[#6366F1]" strokeWidth={1.8} />
        </span>
        <p className="text-[15px] font-bold text-[#111]">No groups to chart yet</p>
        <p className="text-[13px] text-[#9CA3AF] mt-1 max-w-sm mx-auto">
          Create a client group, then open Graph view to compare totals, active, pool, and inactive clients.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(1, ...chartRows.flatMap((d) => [d.total, d.active, d.commonPool, d.inactive]));
  const yMax = Math.ceil(maxVal / 5) * 5 || 5;
  const step = Math.max(1, Math.ceil(yMax / 3));
  const yTicks = [0, step, step * 2, step * 3].filter((t, i, arr) => t <= yMax && (i === 0 || t !== arr[i - 1]));
  if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);

  const noteSuffix = period === "this_week" ? "vs last week" : "vs last month";
  const totals = CLIENT_CHART_LEGEND.map((f) => {
    const value = sumField(chartRows, f.key);
    const prev = prevTotals ? prevTotals[f.key] : null;
    const change = prev == null ? null : pctChange(value, prev);
    return { ...f, value, change };
  });

  const periodLabel = PERIOD_OPTIONS.find((o) => o.id === period)?.label ?? "This Month";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <Users size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">{title}</h2>
            <p className="text-[11px] text-[#9CA3AF]">
              {data.length} group{data.length === 1 ? "" : "s"} · {periodLabel.toLowerCase()}
            </p>
          </div>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {totals.map((s) => (
          <div key={s.key} className="border border-black/8 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-7 rounded-lg bg-[#EEF0FE] grid place-items-center shrink-0">
                <Users size={13} className="text-[#6366F1]" strokeWidth={1.8} />
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-snug">{s.label}</p>
            </div>
            <p className="text-[18px] font-bold text-[#111] leading-tight tabular-nums">{formatNum(s.value)}</p>
            <p
              className={`text-[10px] font-semibold mt-1 ${
                s.change == null ? "text-[#9CA3AF]" : s.change >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
              }`}
            >
              {s.change == null ? noteSuffix : `${s.change}% ${noteSuffix}`}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mb-1 px-1 flex-wrap">
        <p className="text-[12px] font-semibold text-[#4B5563]">
          {period === "this_week" ? "Weekly Client Group Progress" : "Monthly Client Group Progress"}
        </p>
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
        <div className="rounded-xl border border-black/8 bg-[#FAFBFC] px-4 py-14 text-center">
          <p className="text-[14px] font-semibold text-[#374151]">No client contacts in {periodLabel.toLowerCase()}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">Try switching the period filter above.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartRows}
                  margin={{ top: 36, right: 12, left: 4, bottom: 8 }}
                  barCategoryGap="36%"
                  barGap={6}
                >
                  <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="group"
                    axisLine={{ stroke: "rgba(0,0,0,0.12)" }}
                    tickLine={false}
                    tick={<GroupXAxisTick />}
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
        </div>
      )}
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
