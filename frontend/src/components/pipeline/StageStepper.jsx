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
  done:    "bg-white border-black/10 text-[#16A34A]",
  current: "bg-white border-[#E8395B] border-2 text-[#E8395B]",
  locked:  "bg-[#FAFAFB] border-black/6 text-[#C2C5CB]",
};

/**
 * Full P0–P6 pipeline stage strip shared by the Move-to-Pn forms and the
 * deal detail screen. Stages before `activeStageId` render as "done"
 * (green), the current stage is highlighted (red), stages after it
 * render as "locked" (gray).
 */
export default function StageStepper({ activeStageId = "P0" }) {
  const activeIndex = STAGES.findIndex((s) => s.id === activeStageId);

  return (
    <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-thin">
      {STAGES.map((stage, i) => {
        const status = i < activeIndex ? "done" : i === activeIndex ? "current" : "locked";
        return (
          <div
            key={stage.id}
            className={`flex flex-col justify-center rounded-xl border px-4 py-2.5 min-w-[135px] shrink-0 transition-colors ${STATUS_STYLES[status]}`}
          >
            <span className="text-[10.5px] font-bold uppercase tracking-wide">{stage.id}</span>
            <span className={`text-[13px] leading-tight ${status === "locked" ? "font-medium" : "font-bold"}`}>
              {stage.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
