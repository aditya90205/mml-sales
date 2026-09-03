import { useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";

const SLA_STATUS_STYLES = {
  "Within SLA":         { color: "#16A34A", bg: "#E7F8EF" },
  "Breached":            { color: "#E8395B", bg: "#FDECEE" },
  "Breached - escalated": { color: "#E8395B", bg: "#FDECEE" },
};

const RM_FLAG_TONES = {
  amber: { color: "#F59E0B", bg: "#FFF3E4" },
  red:   { color: "#E8395B", bg: "#FDECEE" },
  blue:  { color: "#3B82F6", bg: "#E8F2FE" },
};

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-[#111] mt-1">{value || "—"}</p>
    </div>
  );
}

function DealDetailsCard({ deal }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111] mb-4">Deal details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
        <DetailField label="Deal code" value={deal.dealCode} />
        <DetailField label="Stage" value={deal.stageLabel} />
        <DetailField label="Package interest" value={deal.packageInterest} />

        <DetailField label="Deal value" value={deal.dealValue} />
        <DetailField label="Lead source" value={deal.leadSource} />
        <DetailField label="Lead score" value={deal.leadScore} />

        <DetailField label="Enquiry made by" value={deal.enquiryBy} />
        <DetailField label="Looking for" value={deal.lookingFor} />
        <DetailField label="Area of house" value={deal.areaOfHouse} />

        <DetailField label="Profession" value={deal.profession} />
        <DetailField label="Family income band" value={deal.familyIncomeBand} />
        <DetailField label="Next action" value={deal.nextAction} />
      </div>
    </div>
  );
}

function AskAICard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="size-9 rounded-xl bg-[#FFF1F2] text-[#7A0A17] grid place-items-center shrink-0">
            <Sparkles size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-bold text-[#111]">Ask AI</span>
            <span className="block text-[12px] text-[#9CA3AF]">Get the summary of this client</span>
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[#9CA3AF] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-black/6">
          <p className="text-[12.5px] text-[#4B5563] leading-relaxed pt-4">
            AI summary isn't wired up yet — this panel will surface a generated client summary here.
          </p>
        </div>
      )}
    </div>
  );
}

function StageHistoryCard({ rows, footnote }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">Stage History &amp; SLA</h3>
      <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-4">Every transition is timestamped and SLA-checked</p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-black/8">
              {["Stage", "Entered", "Exited", "Duration", "SLA", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-2.5 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = SLA_STATUS_STYLES[row.status] || SLA_STATUS_STYLES["Within SLA"];
              return (
                <tr key={row.stage} className="border-b border-black/5 last:border-0">
                  <td className="px-2.5 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.stage}</td>
                  <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.entered}</td>
                  <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.exited}</td>
                  <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.duration}</td>
                  <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.sla}</td>
                  <td className="px-2.5 py-2.5 whitespace-nowrap">
                    <span
                      className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {footnote && (
        <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3.5 py-2.5 mt-4">
          {footnote}
        </p>
      )}
    </div>
  );
}

function StageGateCard({ items }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111] mb-3.5">Stage gate</h3>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span
              className={`size-[18px] rounded-full grid place-items-center shrink-0 ${
                item.done ? "bg-[#16A34A]" : "bg-white border border-black/15"
              }`}
            >
              {item.done && <Check size={12} className="text-white" strokeWidth={3} />}
            </span>
            <span className={`text-[12.5px] ${item.done ? "text-[#111] font-medium" : "text-[#9CA3AF]"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeightedValueCard({ label, value, note }) {
  return (
    <div className="bg-[#7A0A17] rounded-2xl p-5 text-white">
      <p className="text-[12px] text-white/75">{label}</p>
      <p className="text-[26px] font-bold mt-1">{value}</p>
      <p className="text-[12px] text-white/80 leading-relaxed mt-2.5">{note}</p>
    </div>
  );
}

function RmFlagsCard({ flags }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">RM flags</h3>
      <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 mb-3.5">Visible to the service team at handover (BRD S3.10)</p>
      <div className="grid grid-cols-2 gap-2">
        {flags.map((flag) => {
          const tone = RM_FLAG_TONES[flag.tone] || RM_FLAG_TONES.amber;
          return (
            <span
              key={flag.label}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-center"
              style={{ color: tone.color, backgroundColor: tone.bg }}
            >
              {flag.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Overview tab for the deal detail screen — deal fields, AI summary,
 * stage history/SLA on the left; stage gate, weighted value and RM flags
 * on the right.
 */
export default function OverviewTab({ deal }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <DealDetailsCard deal={deal} />
        <AskAICard />
        <StageHistoryCard rows={deal.stageHistory} footnote={deal.fieldsFilledNote} />
      </div>

      <div className="flex flex-col gap-5 min-w-0">
        <StageGateCard items={deal.stageGate} />
        <WeightedValueCard
          label={deal.weightedValueLabel}
          value={deal.weightedValue}
          note={deal.weightedValueNote}
        />
        <RmFlagsCard flags={deal.rmFlags} />
      </div>
    </div>
  );
}
