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
import { Database } from "lucide-react";

export const CLIENT_CHART_LEGEND = [
  { key: "total", label: "Total client", color: "#2A78D6" },
  { key: "active", label: "Active client", color: "#1BAF7A" },
  { key: "commonPool", label: "Common pool", color: "#4A3AA7" },
  { key: "inactive", label: "Inactive clients", color: "#9CA3AF" },
];

function BarLabel({ x, y, width, value }) {
  if (value == null) return null;
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
    <div className="bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 min-w-[160px]">
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

/**
 * Grouped bar chart for client groups — same visual style as Dashboard funnel.
 * data: [{ group, total, active, commonPool, inactive }]
 */
export default function ClientGroupsChart({ data = [], title = "Client Group Overview" }) {
  if (!data.length) return null;

  const maxVal = Math.max(1, ...data.flatMap((d) => [d.total, d.active, d.commonPool, d.inactive]));
  const yMax = Math.ceil(maxVal / 5) * 5 || 5;
  const step = Math.max(1, Math.ceil(yMax / 3));
  const yTicks = [0, step, step * 2, step * 3].filter((t, i, arr) => t <= yMax && (i === 0 || t !== arr[i - 1]));
  if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-xl bg-[#EEF0FE] grid place-items-center shrink-0">
            <Database size={17} className="text-[#6366F1]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[17px] font-bold text-[#111] leading-tight">{title}</h2>
            <p className="text-[11px] text-[#9CA3AF]">By saved group</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {CLIENT_CHART_LEGEND.map((f) => (
            <span key={f.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
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
                  height={44}
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
                  <Bar key={f.key} dataKey={f.key} fill={f.color} barSize={22} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey={f.key} content={BarLabel} />
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

/** Derive chart metrics from a list of clients. */
export function statsFromClients(clients = []) {
  const total = clients.length;
  const active = clients.filter((c) => c.status === "Active").length;
  const inactive = clients.filter((c) => c.status === "Inactive").length;
  // Common pool: cold / low-probability clients (shared pool proxy in mock data)
  const commonPool = clients.filter((c) => c.probability === "low").length;
  return { total, active, commonPool, inactive };
}
