import { Clock } from "lucide-react";

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

/** Deal overview row — P0 New, P0 Contacted, then P1–P6. */
const OVERVIEW_STAGES = [
  { id: "P0-new", code: "P0", name: "New", bg: "#E7F8EF", color: "#16A34A" },
  { id: "P0-contacted", code: "P0", name: "Contacted", bg: "#E8F2FE", color: "#3B6CB5" },
  { id: "P1", code: "P1", name: "Qualified", bg: "#E7F8EF", color: "#15803D" },
  { id: "P2", code: "P2", name: "Profile creation", bg: "#F3E8FF", color: "#7C3AED" },
  { id: "P3", code: "P3", name: "Video call/visit", bg: "#FDECEE", color: "#E11D48" },
  { id: "P4", code: "P4", name: "Negotiation", bg: "#FDE8F3", color: "#DB2777" },
  { id: "P5", code: "P5", name: "Payment Done", bg: "#FFFFFF", color: "#6B7280" },
  { id: "P6", code: "P6", name: "Handover", bg: "#FFFFFF", color: "#6B7280" },
];

function overviewIndex(activeStageId) {
  if (activeStageId === "P0" || activeStageId === "P0-new") return 0;
  if (activeStageId === "P0-contacted") return 1;
  const index = OVERVIEW_STAGES.findIndex((stage) => stage.id === activeStageId);
  return index < 0 ? 0 : index;
}

function OverviewStageRow({ activeStageId = "P0-new", durations = {} }) {
  const activeIndex = overviewIndex(activeStageId);

  return (
    <div className="grid min-w-0 grid-cols-8 gap-2">
      {OVERVIEW_STAGES.map((stage, i) => {
        const status = i < activeIndex ? "done" : i === activeIndex ? "current" : "upcoming";
        const tone =
          status === "done"
            ? { color: "#16A34A", bg: "#E7F8EF", accent: "#16A34A" }
            : status === "current"
              ? { color: "#E8395B", bg: "#FDECEE", accent: "#E8395B" }
              : { color: "#9CA3AF", bg: "#FFFFFF", accent: "#E5E7EB" };
        const duration = status === "upcoming" ? "" : durations[stage.id];
        return (
          <div
            key={stage.id}
            className="min-w-0 rounded-xl border border-black/6 border-l-4 px-2.5 py-2"
            style={{
              backgroundColor: tone.bg,
              borderLeftColor: tone.accent,
              borderTopColor: status === "current" ? tone.accent : undefined,
              borderRightColor: status === "current" ? tone.accent : undefined,
              borderBottomColor: status === "current" ? tone.accent : undefined,
            }}
          >
            <p className="text-[10px] font-bold leading-none text-[#9CA3AF]">{stage.code}</p>
            <p className="mt-1 text-[12.5px] font-bold leading-tight" style={{ color: tone.color }}>
              {stage.name}
            </p>
            {duration ? (
              <p
                className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium leading-none"
                style={{ color: tone.color }}
              >
                <Clock size={11} strokeWidth={2.2} className="shrink-0" />
                avg - {duration}
              </p>
            ) : (
              <p className="mt-1.5 h-[11px]" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * P0 New and P0 Contacted are separate KPIs, then P1–P6.
 * Same card chrome as the pipeline board stage cards; only the stage name
 * color changes: green (done), red (current), grey (next).
 */
export default function StageStepper({ activeStageId = "P0-new", variant = "kpi", durations = {} }) {
  if (variant === "overview") {
    return <OverviewStageRow activeStageId={activeStageId} durations={durations} />;
  }

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
