import { Check, Download } from "lucide-react";
import { toast } from "react-toastify";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import { MetricCard, PrimaryBtn, Td } from "../components/common/AppPage.jsx";

const SLABS = [
  { label: "Upto ₹2,00,000", rate: "3%" },
  { label: "₹2L – ₹3,50,000", rate: "4%" },
  { label: "₹3.5L – ₹5,00,000", rate: "5%" },
  { label: "Above ₹5,00,000", rate: "6%" },
];

const REGISTRATION_ROWS = [
  { client: "Aditi & Rohan", registration: "₹85,000", net: "₹72,034", slab: "3%", incentive: "₹2,161" },
  { client: "Priya & Karan", registration: "₹1,20,000", net: "₹1,01,695", slab: "3%", incentive: "₹3,051" },
  { client: "Sneha & Arjun", registration: "₹2,40,000", net: "₹2,03,390", slab: "4%", incentive: "₹8,136" },
  { client: "Meera & Vikram", registration: "₹3,80,000", net: "₹3,22,034", slab: "5%", incentive: "₹16,102" },
  { client: "Ananya & Rahul", registration: "₹5,60,000", net: "₹4,74,576", slab: "6%", incentive: "₹28,475" },
];

const MEETING_ROWS = [
  { item: ">30 meetings", count: "42", rate: "₹50", amount: "₹2,100" },
  { item: ">50 meetings", count: "—", rate: "₹100", amount: "—" },
];

const PERFORMANCE_ROWS = [
  { item: "Google Reviews", rule: ">5 — ₹70 each", count: "6", rate: "₹70", amount: "₹420", tone: "" },
  { item: "Testimonial videos", rule: "₹150 each", count: "6", rate: "₹150", amount: "₹900", tone: "" },
  { item: "Wedding photos published", rule: "₹50 per case", count: "4", rate: "₹50", amount: "₹200", tone: "" },
  { item: "Negative review", rule: "−₹100 penalty", count: "1", rate: "−₹100", amount: "−₹100", tone: "text-[#DC2626]" },
];

const MEETING_RULES = [
  "Only outstation client video calls counted",
  "Only new-client meetings counted",
];

function SectionHead({ title, aside }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <h2 className="text-[16px] font-bold text-[#111]">{title}</h2>
      {aside && <p className="text-[12px] text-[#9CA3AF] text-right max-w-[320px] leading-snug">{aside}</p>}
    </div>
  );
}

function DataTable({ columns, sort, onSort, children }) {
  return (
    <div className="w-full overflow-x-auto border border-black/8 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-black/8 bg-[#FAFAFB]">
            {columns.map((col) => (
              <SortableTh
                key={col.key}
                label={col.label}
                sortKey={col.key}
                sort={sort}
                onSort={onSort}
                className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
              />
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function SubtotalRow({ cols, value }) {
  return (
    <tr className="bg-[#FAFAFB] font-extrabold">
      <td className="px-4 py-3 text-[13px] text-[#111]" colSpan={cols}>
        Subtotal
      </td>
      <td className="px-4 py-3 text-[13px] text-[#7A0A17] whitespace-nowrap text-right">{value}</td>
    </tr>
  );
}

export default function IncentiveStatementPage() {
  const reg = useTableSort(REGISTRATION_ROWS, { defaultKey: "client" });
  const meet = useTableSort(MEETING_ROWS, { defaultKey: "item" });
  const perf = useTableSort(PERFORMANCE_ROWS, { defaultKey: "item" });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 min-w-0">
        <div className="w-full bg-white border border-black/8 rounded-2xl p-5 sm:p-6 flex flex-col gap-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-[26px] font-bold text-[#111] tracking-tight">My Incentive Statement</h1>
            <PrimaryBtn onClick={() => toast.success("Incentive statement downloaded.")}>
              <Download size={14} /> Download statement
            </PrimaryBtn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <MetricCard label="1. Registration incentive" value="₹67,924" note="5 deals • slab 3–6% • net of GST" />
            <MetricCard label="2. Meetings incentive" value="₹2,100" note="42 meetings • ₹50 tier" />
            <MetricCard label="3. Performance bonuses" value="₹1,420" note="reviews, videos, photos • net of 1 penalty" />
            <MetricCard label="Net payable" value="₹71,444" note="paid with July salary" highlight />
          </div>

          <section className="w-full">
            <SectionHead title="1. Incentive on registration amount" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {SLABS.map((s) => (
                <div key={s.label} className="w-full bg-[#FAF7F7] border border-black/8 rounded-xl px-4 py-3 text-left">
                  <p className="text-[12px] text-[#6B7280] font-medium">{s.label}</p>
                  <p className="text-[20px] font-bold text-[#7A0A17] mt-1 leading-none">{s.rate}</p>
                </div>
              ))}
            </div>
            <DataTable
              columns={[
                { label: "Client Name", key: "client" },
                { label: "Registration", key: "registration" },
                { label: "Net of GST", key: "net" },
                { label: "Slab", key: "slab" },
                { label: "Incentive", key: "incentive" },
              ]}
              sort={reg.sort}
              onSort={reg.toggle}
            >
              {reg.sorted.map((row) => (
                <tr key={row.client} className="border-b border-black/6 last:border-0">
                  <Td strong>{row.client}</Td>
                  <Td>{row.registration}</Td>
                  <Td muted>{row.net}</Td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#7A0A17]">{row.slab}</td>
                  <Td strong className="text-right">{row.incentive}</Td>
                </tr>
              ))}
              <SubtotalRow cols={4} value="₹67,924" />
            </DataTable>
          </section>

          <section className="w-full">
            <SectionHead
              title="2. Meetings incentive (monthly)"
              aside={
                <>
                  Rate applies to <span className="font-semibold text-[#6B7280]">total</span> qualifying meetings once a tier is crossed
                </>
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
              <div className="min-w-0 w-full">
                <p className="text-[36px] font-black text-[#111] leading-none tracking-tight">
                  42 <span className="text-[14px] font-medium text-[#6B7280]">qualifying meetings</span>
                </p>

                <div className="mt-5 w-full">
                  <div className="relative h-2.5 w-full bg-[#ECECEE] rounded-full">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[#7A0A17]" style={{ width: "84%" }} />
                    <span
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#7A0A17] rounded-full"
                      style={{ left: "84%" }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#6B7280] mt-2">
                    <span>30 — ₹50 tier</span>
                    <span>50 — ₹100 tier</span>
                  </div>

                  <div className="bg-[#FFF4E5] border border-[#F5D0A9] rounded-lg px-3.5 py-2.5 mt-4 text-[12.5px] text-[#9A3412] font-semibold leading-snug w-full">
                    8 more meetings unlocks the ₹100 tier → ₹4,200 for the month.
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {MEETING_RULES.map((rule) => (
                      <span
                        key={rule}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#F3EEF7] text-[#6D28D9] text-[12px] font-semibold"
                      >
                        <Check size={13} strokeWidth={2.5} />
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <DataTable
                columns={[
                  { label: "Item", key: "item" },
                  { label: "Count", key: "count" },
                  { label: "Rate", key: "rate" },
                  { label: "Amount", key: "amount" },
                ]}
                sort={meet.sort}
                onSort={meet.toggle}
              >
                {meet.sorted.map((row) => (
                  <tr key={row.item} className="border-b border-black/6 last:border-0">
                    <Td strong>{row.item}</Td>
                    <Td muted={row.count === "—"}>{row.count}</Td>
                    <Td>{row.rate}</Td>
                    <Td strong={row.amount !== "—"} muted={row.amount === "—"} className="text-right">
                      {row.amount}
                    </Td>
                  </tr>
                ))}
                <SubtotalRow cols={3} value="₹2,100" />
              </DataTable>
            </div>
          </section>

          <section className="w-full">
            <SectionHead title="3. Additional performance incentives" aside="Flat rewards · penalties deducted" />
            <DataTable
              columns={[
                { label: "Item", key: "item" },
                { label: "Rule", key: "rule" },
                { label: "Count", key: "count" },
                { label: "Rate", key: "rate" },
                { label: "Amount", key: "amount" },
              ]}
              sort={perf.sort}
              onSort={perf.toggle}
            >
              {perf.sorted.map((row) => (
                <tr key={row.item} className="border-b border-black/6 last:border-0">
                  <Td strong>{row.item}</Td>
                  <Td muted>{row.rule}</Td>
                  <Td>{row.count}</Td>
                  <td className={`px-4 py-3 text-[13px] font-medium ${row.tone || "text-[#374151]"}`}>{row.rate}</td>
                  <td className={`px-4 py-3 text-[13px] font-bold text-right ${row.tone || "text-[#111]"}`}>{row.amount}</td>
                </tr>
              ))}
              <SubtotalRow cols={4} value="₹1,420" />
            </DataTable>
          </section>

          <section className="w-full border-t border-black/8 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed max-w-2xl">
              Registration slabs are applied to values net of GST. Meeting and bonus rewards are flat. All figures are indicative and settle with the July payroll cycle.
            </p>
            <div className="flex items-end gap-8 shrink-0">
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#9CA3AF]">Gross incentive</p>
                <p className="text-[16px] font-bold text-[#111] mt-0.5">₹71,444</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#9CA3AF]">Net payable (post-GST)</p>
                <p className="text-[22px] font-black text-[#7A0A17] mt-0.5">₹71,444</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
