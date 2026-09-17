export const KPI_STAGES = [
  { id: "P0-new",       code: "P0", name: "New",                    color: "#E8395B" },
  { id: "P0-contacted", code: "P0", name: "Contacted",              color: "#6394D7" },
  { id: "P1",           code: "P1", name: "Qualified",               color: "#F59E0B" },
  { id: "P2",           code: "P2", name: "Profile Creation",        color: "#8B5CF6" },
  { id: "P3",           code: "P3", name: "Video Call/Visit",        color: "#7C3AED" },
  { id: "P4",           code: "P4", name: "Negotiation",             color: "#6366F1" },
  { id: "P5",           code: "P5", name: "Closed - Payment Done",   color: "#16A34A" },
  { id: "P6",           code: "P6", name: "Handover to services",   color: "#EAB308" },
];

// Name text only — left accent keeps each stage's pipeline color.
const STATUS_TEXT = {
  done: "text-[#16A34A]",
  current: "text-[#E8395B]",
  locked: "text-[#9CA3AF]",
};

function resolveKpiId(activeStageId) {
  if (activeStageId === "P0-contacted") return "P0-contacted";
  if (activeStageId === "P0" || activeStageId === "P0-new") return "P0-new";
  return activeStageId;
}

/**
 * P0 New and P0 Contacted are separate KPIs, then P1–P6.
 * Same card chrome as the pipeline board stage cards; only the stage name
 * color changes: green (done), red (current), grey (next).
 */
export default function StageStepper({ activeStageId = "P0-new" }) {
  const activeIndex = KPI_STAGES.findIndex((s) => s.id === resolveKpiId(activeStageId));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {KPI_STAGES.map((stage, i) => {
        const status = i < activeIndex ? "done" : i === activeIndex ? "current" : "locked";
        const nameColor = STATUS_TEXT[status];
        return (
          <div
            key={stage.id}
            className="flex items-center justify-between gap-2 bg-white border rounded-xl border-l-4 px-3.5 py-2.5 min-w-0"
            style={{
              borderLeftColor: stage.color,
              borderTopColor: "rgba(0,0,0,0.08)",
              borderRightColor: "rgba(0,0,0,0.08)",
              borderBottomColor: "rgba(0,0,0,0.08)",
            }}
          >
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                {stage.code}
              </p>
              <p className={`text-[13px] font-bold leading-tight truncate ${nameColor}`}>
                {stage.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
