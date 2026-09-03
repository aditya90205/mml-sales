const STAGES = [
  { id: "P0", name: "Prospect" },
  { id: "P1", name: "Qualified" },
  { id: "P2", name: "Data Collection" },
  { id: "P3", name: "Visit / Video" },
  { id: "P4", name: "Negotiation" },
  { id: "P5", name: "Payment" },
  { id: "P6", name: "Handover" },
];

const STATUS_STYLES = {
  done:    { box: "bg-[#E7F8EF] border-l-[#16A34A]",      name: "text-[#16A34A]" },
  current: { box: "bg-[#FDECEE] border-l-[#E8395B]",       name: "text-[#E8395B]" },
  locked:  { box: "bg-[#FDECEE]/50 border-l-[#E8395B]/40", name: "text-[#E8395B]/50" },
};

/**
 * Full P0–P6 pipeline stage strip shared by the Move-to-Pn forms and the
 * deal detail screen. Stages before `activeStageId` render as "done"
 * (green), the current stage is highlighted (red), stages after it
 * render as "locked" (muted red) — each with a darker left-border accent
 * in the same hue, and stretched to fill the row's full width.
 */
export default function StageStepper({ activeStageId = "P0" }) {
  const activeIndex = STAGES.findIndex((s) => s.id === activeStageId);

  return (
    <div className="grid grid-cols-7 gap-3">
      {STAGES.map((stage, i) => {
        const status = i < activeIndex ? "done" : i === activeIndex ? "current" : "locked";
        const style = STATUS_STYLES[status];
        return (
          <div
            key={stage.id}
            className={`flex flex-col justify-center rounded-lg border-l-4 px-3.5 py-2.5 min-w-0 transition-colors ${style.box}`}
          >
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-[#6B7280]">{stage.id}</span>
            <span className={`text-[13px] font-bold leading-tight truncate ${style.name}`}>{stage.name}</span>
          </div>
        );
      })}
    </div>
  );
}
